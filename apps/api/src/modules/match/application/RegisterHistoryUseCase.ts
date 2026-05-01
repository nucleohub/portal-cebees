import type { CreateHistoricoDto } from '@cebees/shared-types';

import { BusinessRuleViolation, NotFoundError } from '../../../config/errors.js';
import { HistoricoAtuacao, Professor, Turma } from '../../../db/models/index.js';

export async function registerHistory(input: CreateHistoricoDto): Promise<HistoricoAtuacao> {
  const [professor, turma] = await Promise.all([
    Professor.findByPk(input.professorId),
    Turma.findByPk(input.turmaId),
  ]);
  if (!professor) throw new NotFoundError('Professor', input.professorId);
  if (!turma) throw new NotFoundError('Turma', input.turmaId);

  if (input.dataInicio > input.dataFim) {
    throw new BusinessRuleViolation(
      'RN-040',
      'Data de início deve ser anterior ou igual à data de fim',
    );
  }
  if (input.cargaHorariaCumprida < 0) {
    throw new BusinessRuleViolation('RN-040', 'Carga horária cumprida não pode ser negativa');
  }
  if (input.avaliacaoCoordenacao !== undefined && (input.avaliacaoCoordenacao < 0 || input.avaliacaoCoordenacao > 5)) {
    throw new BusinessRuleViolation('RN-040', 'Avaliação coordenação deve estar entre 0 e 5');
  }
  if (input.avaliacaoAlunos !== undefined && (input.avaliacaoAlunos < 0 || input.avaliacaoAlunos > 5)) {
    throw new BusinessRuleViolation('RN-041', 'Avaliação alunos deve estar entre 0 e 5');
  }

  return HistoricoAtuacao.create({
    professorId: input.professorId,
    turmaId: input.turmaId,
    alocacaoId: null,
    dataInicio: input.dataInicio,
    dataFim: input.dataFim,
    cargaHorariaCumprida: input.cargaHorariaCumprida,
    avaliacaoCoordenacao: input.avaliacaoCoordenacao ?? null,
    avaliacaoAlunos: input.avaliacaoAlunos ?? null,
    observacoes: input.observacoes ?? null,
  });
}
