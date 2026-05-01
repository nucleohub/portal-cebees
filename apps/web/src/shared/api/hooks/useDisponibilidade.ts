import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { DisponibilidadeDto } from '@cebees/shared-types';

import { client } from '../client.js';

export function useDisponibilidade(professorId: number | undefined) {
  return useQuery({
    queryKey: ['disponibilidade', professorId],
    queryFn: async () => {
      const { data } = await client.get<DisponibilidadeDto[]>(
        `/professores/${professorId}/disponibilidade`,
      );
      return data;
    },
    enabled: !!professorId,
  });
}

export function useDisponibilidadeMutation(professorId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (disponibilidades: DisponibilidadeDto[]) =>
      client.put(`/professores/${professorId}/disponibilidade`, disponibilidades),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['disponibilidade', professorId] }),
  });
}
