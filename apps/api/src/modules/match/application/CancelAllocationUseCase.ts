import { AlocacaoStatus } from '@cebees/shared-types';

import { BusinessRuleViolation, NotFoundError } from '../../../config/errors.js';
import { Alocacao } from '../../../db/models/index.js';
import { podeCancelar } from '../domain/Alocacao.js';

export interface CancelInput {
  alocacaoId: number;
  usuarioId: number;
  motivo: string;
}

export async function cancelAllocation(input: CancelInput): Promise<Alocacao> {
  const alocacao = await Alocacao.findByPk(input.alocacaoId);
  if (!alocacao) throw new NotFoundError('Alocacao', input.alocacaoId);

  if (!podeCancelar(alocacao.status)) {
    throw new BusinessRuleViolation(
      'RN-020',
      `Alocação em status ${alocacao.status} não pode ser cancelada`,
    );
  }
  if (!input.motivo || input.motivo.trim().length < 5) {
    throw new BusinessRuleViolation('RN-020', 'Motivo obrigatório (≥5 caracteres) para cancelamento');
  }

  alocacao.status = AlocacaoStatus.CANCELADA;
  alocacao.motivoCancelamento = input.motivo;
  await alocacao.save();
  return alocacao;
}
