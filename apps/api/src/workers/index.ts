/**
 * workers/index.ts — Register pg-boss workers.
 *
 * Export a single `registerWorkers(boss)` function.  The caller (app.ts) is
 * responsible for starting pg-boss and passing the instance here.  Workers run
 * in-process, so they work both in long-lived servers AND in Vercel serverless
 * functions (pg-boss polls the DB on each invocation — no persistent process
 * required).
 *
 * pg-boss v10 delivers jobs in batches (Job<T>[]). With default options each
 * batch contains one job, so we process them in a simple for-loop.
 */
import { Op } from 'sequelize';
import type { Job, PgBoss } from 'pg-boss';

import { logger } from '../config/logger.js';
import {
  Alocacao,
  ContratoProfessor,
  HistoricoAtuacao,
  Professor,
  Turma,
} from '../db/models/index.js';
import { sendEmail } from '../integrations/email.js';
import { getPresignedGetUrl, uploadBuffer } from '../integrations/storage.js';
import { renderContratoPdf } from '../modules/contratos/ContratoPdfRenderer.js';

import { QUEUE_NAMES, enqueueNotification, setBoss } from './queues.js';

const CEBEES_EMPRESA = {
  razaoSocial: 'CEBEES - Centro Brasileiro de Ensino Especializado',
  cnpj: '00.000.000/0001-00',
  endereco: 'Rua da Educação, 100 - Brasília/DF',
};

// ---------------------------------------------------------------------------
// Contract generation: render PDF → upload S3 → update pdfUrl → notify
// ---------------------------------------------------------------------------
async function handleContractGeneration(
  jobs: Job<{ contratoId: number }>[],
): Promise<void> {
  for (const job of jobs) {
    const { contratoId } = job.data;
    logger.info({ jobId: job.id, contratoId }, 'generating contract PDF');

    const contrato = await ContratoProfessor.findByPk(contratoId, {
      include: [
        { model: Alocacao, as: 'alocacao', include: [{ model: Turma, as: 'turma' }] },
        { model: Professor, as: 'professor' },
      ],
    });
    if (!contrato) {
      logger.error({ contratoId }, 'Contrato not found — skipping');
      continue;
    }

    const professor = (contrato as unknown as { professor: Professor }).professor;
    const alocacao = (
      contrato as unknown as { alocacao: Alocacao & { turma: Turma } }
    ).alocacao;
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
    // status stays RASCUNHO until sent to signature provider
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
  }
}

// ---------------------------------------------------------------------------
// Document expiry: daily sweep for documents expiring in ≤30 days
// ---------------------------------------------------------------------------
async function handleDocumentExpiry(_jobs: Job[]): Promise<void> {
  logger.info('document-expiry daily sweep');

  // TODO (BLOCO 5 — módulo de documentos): quando a tabela `documento` existir,
  // iterar documentos com data_validade BETWEEN now AND now+30d e disparar alertas.
  const ativos = await Professor.count({ where: { status: 'ATIVO' } });
  logger.info({ ativos }, 'document-expiry placeholder — tabela documento pendente');
}

// ---------------------------------------------------------------------------
// Performance recalc: recompute desempenho score from historicos
// ---------------------------------------------------------------------------
async function handlePerformanceRecalc(
  jobs: Job<{ professorId: number }>[],
): Promise<void> {
  for (const job of jobs) {
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
    if (historicos.length === 0) continue;

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
      numer += rating * 20 * w; // 0-5 → 0-100
      denom += w;
    }
    const score = denom > 0 ? Math.round((numer / denom) * 100) / 100 : null;
    logger.info({ professorId, score, samples: historicos.length }, 'desempenho recalculated');
  }
}

// ---------------------------------------------------------------------------
// Email notification
// ---------------------------------------------------------------------------
async function handleNotification(
  jobs: Job<{ to: string; subject: string; body: string; html?: string }>[],
): Promise<void> {
  for (const job of jobs) {
    await sendEmail(job.data);
  }
}

// ---------------------------------------------------------------------------
// Public registration function
// ---------------------------------------------------------------------------
export async function registerWorkers(b: PgBoss): Promise<void> {
  // Make the boss instance available to queue helpers
  setBoss(b);

  await b.work<{ contratoId: number }>(
    QUEUE_NAMES.contractGeneration,
    { localConcurrency: 2 },
    handleContractGeneration,
  );

  await b.work(QUEUE_NAMES.documentExpiry, handleDocumentExpiry);

  await b.work<{ professorId: number }>(
    QUEUE_NAMES.performanceRecalc,
    handlePerformanceRecalc,
  );

  await b.work<{ to: string; subject: string; body: string; html?: string }>(
    QUEUE_NAMES.notification,
    { localConcurrency: 5 },
    handleNotification,
  );

  // Cron: document-expiry daily at 07:00
  await b.schedule(QUEUE_NAMES.documentExpiry, '0 7 * * *', {});

  logger.info(
    `pg-boss workers registered: ${Object.values(QUEUE_NAMES).join(', ')}`,
  );
}
