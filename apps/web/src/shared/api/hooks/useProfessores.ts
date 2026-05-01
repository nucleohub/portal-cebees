import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ProfessorDto } from '@cebees/shared-types';

import { client } from '../client.js';

interface ProfessoresFilter {
  status?: string;
  nome?: string;
  especialidadeId?: number;
  page?: number;
  pageSize?: number;
}

export function useProfessores(filters: ProfessoresFilter = {}) {
  return useQuery({
    queryKey: ['professores', filters],
    queryFn: async () => {
      const { data } = await client.get<ProfessorDto[]>('/professores', { params: filters });
      return data;
    },
  });
}

export function useProfessor(id: number | undefined) {
  return useQuery({
    queryKey: ['professores', id],
    queryFn: async () => {
      const { data } = await client.get<ProfessorDto>(`/professores/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useProfessorMutations() {
  const qc = useQueryClient();

  const create = useMutation({
    mutationFn: (body: Partial<ProfessorDto>) => client.post('/professores', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['professores'] }),
  });

  const update = useMutation({
    mutationFn: ({ id, ...body }: Partial<ProfessorDto> & { id: number }) =>
      client.patch(`/professores/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['professores'] }),
  });

  const remove = useMutation({
    mutationFn: (id: number) => client.delete(`/professores/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['professores'] }),
  });

  const addEspecialidade = useMutation({
    mutationFn: ({ professorId, ...body }: { professorId: number; especialidadeId: number; nivelProficiencia: number; desdeAno: number }) =>
      client.post(`/professores/${professorId}/especialidades`, body),
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ['professores', v.professorId] }),
  });

  const removeEspecialidade = useMutation({
    mutationFn: ({ professorId, espId }: { professorId: number; espId: number }) =>
      client.delete(`/professores/${professorId}/especialidades/${espId}`),
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ['professores', v.professorId] }),
  });

  return { create, update, remove, addEspecialidade, removeEspecialidade };
}
