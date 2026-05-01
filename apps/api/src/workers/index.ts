import { Worker } from 'bullmq';
import { Op } from 'sequelize';

import { logger } from '../config/logger.js';
import {
  Alocacao,
  ContratoProfessor,
  HistoricoAtuacao,
  Professor,
  Turma,
  Usuario,
} from '../db/models/index.js';
import { sendEmail } from '../integrations/email.js';
import { getPresignedGetUrl, uploadBuffer } from '../integrations/storage.js';
import { renderContratoPdf } from '../modules/contratos/ContratoPdfRenderer.js';

import {
  QUEUE_NAMES,
  documentExpiryQueue,
  enqueueNotification,
  redisConnection,
} from './queues.js';

if (!redisConnection) {
  logger.warn('Workers not started — Redis unavailable');
  process.exit(0);
}

const CEBEES_EMPRESA = {
  razaoSocial: 'CEBEES - Centro Brasileiro de Ensino Especializado',
  cnpj: '00.000.000/0001-00',
  endereco: 'Rua da Educação, 100 - Brasília/DF',
};

const workers: Worker[] = [];

// ---------------------------------------------------------------------------
// Contract generation worker: render PDF → upload S3 → update pdfUrl → notify
// ---------------------------------------------------------------------------
const contractWorker = new Worker<{ contratoId: number }>(
  QUEUE_NAMES.contractGeneration,
  async (job) => {
    const { contratoId } = job.data;
    logger.info({ jobId: job.id, contratoId }, 'generating contract PDF');

    const contrato = await ContratoProfessor.findByPk(contratoId, {
      include: [
        { model: Alocacao, as: 'alocacao', include: [{ model: Turma, as: 'turma' }] },
        { model: Professor, as: 'professor' },
      ],
    });
    if (!contrato) throw new Error(`Contrato ${contratoId} not found`);

    const professor = (contrato as unknown as { professor: Professor }).professor;
    const alocacao = (contrato as unknown as { alocacao: Alocacao & { turma: Turma } }).alocacao;
    const turma = alocacao.turma;

    const pdf = await renderContratoPdf({
      numero: contrato.numero,
      professor: {
        nomeCompleto: professor.nomeCompleto,
        cpf: professor.cpf,
        email: professor.email,
      },
      turma: {
        codigo: turma.codigo,
        nome: turma.nome,
        dataInicio: turma.dataInicio,
        dataFim: turma.dataFim,
        cargaHoraria: turma.cargaHorariaTotal,
      },
      valorHora: Number(contrato.valorHora),
      valorTotal: Number(contrato.valorTotal),
      emissao: new Date(),
      empresa: CEBEES_EMPRESA,
    });

    const key = `contratos/${new Date().getFullYear()}/${contrato.numero}.pdf`;
    const s3Url = await uploadBuffer({
      key,
      body: pdf,
      contentType: 'application/pdf',
      metadata: { contratoId: String(contratoId), numero: contrato.numero },
    });

    contrato.pdfUrl = s3Url;
    // status stays RASCUNHO until it is sent to the signature provider
    // (ContratoService.marcarEnviado transitions it to ENVIADO).
    await contrato.save();

    const presigned = await getPresignedGetUrl(key, 60 * 60 * 24);
    await enqueueNotification({
      to: professor.email,
      subject: `Contrato ${contrato.numero} gerado`,
      body:
        `Olá ${professor.nomeCompleto},\n\n` +
        `Seu contrato ${contrato.numero} para a turma ${turma.codigo} foi gerado.\n` +
        `Acesse: ${presigned}\n\nCEBEES Secretaria Educacional.`,
    });

    return { ok: true, pdfUrl: s3Url };
  },
  { connection: redisConnection, concurrency: 2 },
);
workers.push(contractWorker);

// ---------------------------------------------------------------------------
// Document expiry cron: daily sweep for professors whose docs expire in ≤30d
// ---------------------------------------------------------------------------
const docExpiryWorker = new Worker(
  QUEUE_NAMES.documentExpiry,
  async (job) => {
    logger.info({ jobId: job.id }, 'document-expiry daily sweep');

    // TODO (Fase 1.8 — módulo de documentos): quando a tabela `documento`
    // existir (hoje os arquivos ficam apenas em S3 via presigned), iterar
    // documentos com `data_validade BETWEEN now AND now+30d` e disparar alerta.
    // Por enquanto fazemos um sanity check em professores ATIVO e saímos — o
    // job roda diariamente e fica pronto para quando o schema for estendido.
    const ativos = await Professor.count({ where: { status: 'ATIVO' } });
    logger.info({ ativos }, 'document-expiry placeholder — documentos table pendente');
    return { ok: true, notified: 0, ativos };
  },
  { connection: redisConnection },
);
workers.push(docExpiryWorker);

// ---------------------------------------------------------------------------
// Performance recalc: recompute professor.score_desempenho from historicos
// ---------------------------------------------------------------------------
const perfWorker = new Worker<{ professorId: number }>(
  QUEUE_NAMES.performanceRecalc,
  async (job) => {
    const { professorId } = job.data;
    logger.info({ jobId: job.id, professorId }, 'performance recalc');

    const historicos = await HistoricoAtuacao.findAll({
      where: {
        professorId,
        [Op.or]: [
          { avaliacaoCoordenacao: { [Op.ne]: null } },
          { avaliacaoAlunos: { [Op.ne]: null } },
        ],
      },
      order: [['dataFim', 'DESC']],
      limit: 50,
    });
    if (historicos.length === 0) return { ok: true, score: null };

    // Weighted mean by recency bucket ({<6m:1, 6-12m:0.8, 1-2y:0.6, >2y:0.4}).
    // Combine coord + alunos (if both present) with a simple average of the two.
    const now = Date.now();
    let numer = 0;
    let denom = 0;
    for (const h of historicos) {
      const parts: number[] = [];
      if (h.avaliacaoCoordenacao != null) parts.push(Number(h.avaliacaoCoordenacao));
      if (h.avaliacaoAlunos != null) parts.push(Number(h.avaliacaoAlunos));
      if (parts.length === 0) continue;
      const rating = parts.reduce((a, b) => a + b, 0) / parts.length;
      const months = h.dataFim
        ? (now - new Date(h.dataFim).getTime()) / (1000 * 60 * 60 * 24 * 30.44)
        : 0;
      const w = months < 6 ? 1.0 : months < 12 ? 0.8 : months < 24 ? 0.6 : 0.4;
      numer += rating * 20 * w; // rating 0-5 → 0-100
      denom += w;
    }
    const score = denom > 0 ? Math.round((numer / denom) * 100) / 100 : null;

    // score_desempenho isn't in the Professor model columns (computed on the fly),
    // but we cache it if the column exists via raw query. Otherwise just log.
    // For now we log — the ScoreCalculator uses historicos directly.
    logger.info({ professorId, score, samples: historicos.length }, 'desempenho recalculated');

    return { ok: true, score, samples: historicos.length };
  },
  { connection: redisConnection },
);
workers.push(perfWorker);

// ---------------------------------------------------------------------------
// Notification worker: send email via nodemailer (MailHog in dev)
// ---------------------------------------------------------------------------
const notifWorker = new Worker<{ to: string; subject: string; body: string; html?: string }>(
  QUEUE_NAMES.notification,
  async (job) => {
    await sendEmail(job.data);
    return { ok: true };
  },
  { connection: redisConnection, concurrency: 5 },
);
workers.push(notifWorker);

// ---------------------------------------------------------------------------
// Cron scheduling: document expiry runs daily at 07:00
// ---------------------------------------------------------------------------
async function scheduleCrons(): Promise<void> {
  if (!documentExpiryQueue) return;
  await documentExpiryQueue.add(
    'daily-sweep',
    {},
    {
      repeat: { pattern: '0 7 * * *' },
      removeOnComplete: 30,
      removeOnFail: 100,
    },
  );
  logger.info('cron scheduled: document-expiry 07:00 daily');
}

void scheduleCrons().catch((err) => logger.error({ err }, 'failed to schedule crons'));

// ---------------------------------------------------------------------------
// Common wiring
// ---------------------------------------------------------------------------
for (const w of workers) {
  w.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, queue: w.name, err }, 'worker job failed');
  });
  w.on('completed', (job) => {
    logger.debug({ jobId: job.id, queue: w.name }, 'worker job completed');
  });
}

logger.info(`Workers started: ${workers.map((w) => w.name).join(', ')}`);

// Silence unused-import warning — Usuario is imported for future use (notification
// targeted at usuario.email when professor-less). Explicit noop reference avoids
// tree-shaking removing the import in downstream bundlers.
void Usuario;

async function shutdown(): Promise<void> {
  logger.info('Shutting down workers...');
  await Promise.all(workers.map((w) => w.close()));
  await redisConnection?.quit();
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
