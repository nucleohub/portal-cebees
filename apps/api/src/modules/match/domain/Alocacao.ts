import { AlocacaoStatus } from '@cebees/shared-types';

import { BusinessRuleViolation } from '../../../config/errors.js';

const TRANSITIONS: Record<AlocacaoStatus, AlocacaoStatus[]> = {
  SUGERIDA: ['CONFIRMADA', 'CANCELADA'],
  CONFIRMADA: ['ATIVA', 'CANCELADA'],
  ATIVA: ['CONCLUIDA', 'CANCELADA'],
  CONCLUIDA: [],
  CANCELADA: [],
};

export function assertTransicaoValida(from: AlocacaoStatus, to: AlocacaoStatus): void {
  if (!TRANSITIONS[from].includes(to)) {
    throw new BusinessRuleViolation(
      'RN-019',
      `Transição inválida de ${from} para ${to}`,
      { from, to, allowed: TRANSITIONS[from] },
    );
  }
}

export function podeCancelar(status: AlocacaoStatus): boolean {
  return TRANSITIONS[status].includes(AlocacaoStatus.CANCELADA);
}

export function podeConfirmar(status: AlocacaoStatus): boolean {
  return status === AlocacaoStatus.SUGERIDA;
}

export function podeAtivar(status: AlocacaoStatus): boolean {
  return status === AlocacaoStatus.CONFIRMADA;
}

export function podeConcluir(status: AlocacaoStatus): boolean {
  return status === AlocacaoStatus.ATIVA;
}
