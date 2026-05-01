import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ScoreBreakdown } from '@cebees/shared-types';

import { client } from '../client.js';

export interface MatchSuggestion {
  alocacaoId: number;
  professorId: number;
  professorNome: string;
  scoreTotal: number;
  scoreBreakdown: ScoreBreakdown;
  filtrado?: boolean;
  motivo?: string;
}

export function useSuggest(turmaId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (): Promise<MatchSuggestion[]> => {
      const { data } = await client.post(`/alocacoes/turmas/${turmaId}/suggest`);
      // API returns { turmaId, sugestoes: [{ professorId, nome, score, alocacaoId }], filtrados }
      const raw: Array<{ professorId: number; nome: string; score: { total: number; especialidade: number; proficiencia: number; disponibilidade: number; desempenho: number; feedback: number; tipoCurso: number }; alocacaoId?: number }> =
        Array.isArray(data) ? data : (data.sugestoes ?? []);
      return raw.map((s) => ({
        alocacaoId: s.alocacaoId ?? 0,
        professorId: s.professorId,
        professorNome: s.nome,
        scoreTotal: s.score.total,
        scoreBreakdown: s.score,
      }));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['alocacoes', 'turma', turmaId] });
    },
  });
}

export function useConfirmAlocacao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      justificativa,
      valorHora,
    }: {
      id: number;
      justificativa?: string;
      valorHora?: number;
    }) => client.post(`/alocacoes/${id}/confirm`, { justificativa, valorHora }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['alocacoes'] });
      qc.invalidateQueries({ queryKey: ['contratos'] });
    },
  });
}
