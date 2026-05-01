import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AlocacaoDto } from '@cebees/shared-types';

import { client } from '../client.js';

export function useAlocacoesTurma(turmaId: number | undefined) {
  return useQuery({
    queryKey: ['alocacoes', 'turma', turmaId],
    queryFn: async () => {
      const { data } = await client.get<AlocacaoDto[]>(`/alocacoes/turmas/${turmaId}`);
      return data;
    },
    enabled: !!turmaId,
  });
}

export function useCancelAlocacao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, motivo }: { id: number; motivo: string }) =>
      client.post(`/alocacoes/${id}/cancel`, { motivo }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alocacoes'] }),
  });
}
