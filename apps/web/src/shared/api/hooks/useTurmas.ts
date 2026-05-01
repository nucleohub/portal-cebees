import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { TurmaDto } from '@cebees/shared-types';

import { client } from '../client.js';

interface TurmasFilter {
  status?: string;
  tipoCurso?: string;
}

export function useTurmas(filters: TurmasFilter = {}) {
  return useQuery({
    queryKey: ['turmas', filters],
    queryFn: async () => {
      const { data } = await client.get<TurmaDto[]>('/turmas', { params: filters });
      return data;
    },
  });
}

export function useTurma(id: number | undefined) {
  return useQuery({
    queryKey: ['turmas', id],
    queryFn: async () => {
      const { data } = await client.get<TurmaDto>(`/turmas/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useTurmaMutations() {
  const qc = useQueryClient();

  const create = useMutation({
    mutationFn: (body: Partial<TurmaDto>) => client.post('/turmas', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['turmas'] }),
  });

  const update = useMutation({
    mutationFn: ({ id, ...body }: Partial<TurmaDto> & { id: number }) =>
      client.patch(`/turmas/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['turmas'] }),
  });

  return { create, update };
}
