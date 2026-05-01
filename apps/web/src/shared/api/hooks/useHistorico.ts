import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateHistoricoDto, HistoricoAtuacaoDto } from '@cebees/shared-types';

import { client } from '../client.js';

export function useHistoricoProfessor(professorId: number | undefined) {
  return useQuery({
    queryKey: ['historico', 'professor', professorId],
    queryFn: async () => {
      const { data } = await client.get<HistoricoAtuacaoDto[]>(
        `/historico/professor/${professorId}`,
      );
      return data;
    },
    enabled: !!professorId,
  });
}

export function useHistorico(filters: { professorId?: number } = {}) {
  return useQuery({
    queryKey: ['historico', filters],
    queryFn: async () => {
      const { data } = await client.get<HistoricoAtuacaoDto[]>('/historico', { params: filters });
      return data;
    },
  });
}

export function useCreateHistorico() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateHistoricoDto) => client.post('/historico', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['historico'] }),
  });
}
