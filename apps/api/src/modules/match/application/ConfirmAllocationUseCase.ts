import { AlocacaoStatus, MIN_AUTO_CONFIRM_SCORE } from '@cebees/shared-types';

import { BusinessRuleViolation, NotFoundError } from '../../../config/errors.js';
import { Alocacao, ContratoProfessor, Professor, Turma } from '../../../db/models/index.js';
import { sequelize } from '../../../db/sequelize.js';
import { assertTransicaoValida, podeConfirmar } from '../domain/Alocacao.js';
import { calcularValorTotal, proximoNumeroContrato } from '../domain/Contrato.js';

export interface ConfirmInput {
  alocacaoId: number;
  usuarioId: number;
  justificativa?: string;
  valorHora?: number;
}

export interface ConfirmResult {
  alocacao: Alocacao;
  contrato: ContratoProfessor;
}

/** Fallback hourly rate when professor has no valorHora set and caller doesn't override. */
const VALOR_HORA_PADRAO = 120;

export async function confirmAllocation(input: ConfirmInput): Promise<ConfirmResult> {
  return sequelize.transaction(async (tx) => {
    const alocacao = await Alocacao.findByPk(input.alocacaoId, { transaction: tx, lock: tx.LOCK.UPDATE });
    if (!alocacao) throw new NotFoundError('Alocacao', input.alocacaoId);
    if (!podeConfirmar(alocacao.status)) {
      assertTransicaoValida(alocacao.status, AlocacaoStatus.CONFIRMADA);
    }

    const scoreTotal = alocacao.scoreTotal !== null ? Number(alocacao.scoreTotal) : 0;

    if (scoreTotal < MIN_AUTO_CONFIRM_SCORE) {
      if (!input.justificativa || input.justificativa.trim().length < 10) {
        throw new BusinessRuleViolation(
          'RN-018',
          `Alocação com score ${scoreTotal.toFixed(1)} (<${MIN_AUTO_CONFIRM_SCORE}) requer justificativa (≥10 caracteres)`,
          { scoreTotal, minRequired: MIN_AUTO_CONFIRM_SCORE },
        );
      }
    }

    const turma = await Turma.findByPk(alocacao.turmaId, { transaction: tx });
    if (!turma) throw new NotFoundError('Turma', alocacao.turmaId);

    // Resolve professor to use their default valorHora as fallback (BLOCO 1 / TASK-019)
    const professor = await Professor.findByPk(alocacao.professorId, { transaction: tx });

    alocacao.status = AlocacaoStatus.CONFIRMADA;
    alocacao.dataConfirmacao = new Date();
    alocacao.justificativa = input.justificativa ?? alocacao.justificativa;
    alocacao.confirmadoPor = input.usuarioId;
    await alocacao.save({ transaction: tx });

    await Alocacao.destroy({
      where: {
        turmaId: alocacao.turmaId,
        status: AlocacaoStatus.SUGERIDA,
      },
      transaction: tx,
    });

    // Precedence: caller override → professor.valorHora → hardcoded default
    const valorHora =
      input.valorHora ??
      (professor && Number(professor.valorHora) > 0 ? Number(professor.valorHora) : VALOR_HORA_PADRAO);
    const cargaHoraria = turma.cargaHorariaTotal;
    const numero = await proximoNumeroContrato(sequelize);

    const contrato = await ContratoProfessor.create(
      {
        numero,
        alocacaoId: alocacao.id,
        professorId: alocacao.professorId,
        projetoId: alocacao.projetoId,
        valorHora,
        cargaHoraria,
        valorTotal: calcularValorTotal(valorHora, cargaHoraria),
        status: 'RASCUNHO',
        pdfUrl: null,
        envelopeAssinaturaId: null,
        providerAssinatura: null,
        dataEnvio: null,
        dataAssinatura: null,
      },
      { transaction: tx },
    );

    return { alocacao, contrato };
  });
}
