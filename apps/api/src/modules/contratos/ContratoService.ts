import { ContratoStatus } from '@cebees/shared-types';

import { NotFoundError } from '../../config/errors.js';
import { logger } from '../../config/logger.js';
import { ContratoProfessor } from '../../db/models/index.js';
import { enqueueContractGeneration } from '../../workers/queues.js';

export async function getContractPdfUrlQueueJob(contratoId: number): Promise<void> {
  const contrato = await ContratoProfessor.findByPk(contratoId);
  if (!contrato) throw new NotFoundError('Contrato', contratoId);
  await enqueueContractGeneration(contrato.id);
  logger.info({ contratoId }, 'contract generation enqueued');
}

export async function marcarEnviado(contratoId: number, envelopeId: string, provider: string): Promise<void> {
  const c = await ContratoProfessor.findByPk(contratoId);
  if (!c) throw new NotFoundError('Contrato', contratoId);
  c.status = ContratoStatus.ENVIADO;
  c.envelopeAssinaturaId = envelopeId;
  c.providerAssinatura = provider;
  c.dataEnvio = new Date();
  await c.save();
}

export async function marcarAssinado(contratoId: number): Promise<void> {
  const c = await ContratoProfessor.findByPk(contratoId);
  if (!c) throw new NotFoundError('Contrato', contratoId);
  c.status = ContratoStatus.ASSINADO;
  c.dataAssinatura = new Date();
  await c.save();
}
