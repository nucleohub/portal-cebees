import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ContratoDto } from '@cebees/shared-types';

import { client } from '../client.js';

export function useContratos(filters: { professorId?: number; status?: string } = {}) {
  return useQuery({
    queryKey: ['contratos', filters],
    queryFn: async () => {
      const { data } = await client.get<ContratoDto[]>('/contratos', { params: filters });
      return data;
    },
  });
}

export function useContrato(id: number | undefined) {
  return useQuery({
    queryKey: ['contratos', id],
    queryFn: async () => {
      const { data } = await client.get<ContratoDto>(`/contratos/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useContratoPdfUrl(id: number | undefined) {
  return useQuery({
    queryKey: ['contratos', id, 'pdf'],
    queryFn: async () => {
      const { data } = await client.get<{ pdfUrl: string }>(`/contratos/${id}/pdf`);
      return data.pdfUrl;
    },
    enabled: !!id,
    retry: false,
  });
}

export function useSendSignature() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => client.post(`/contratos/${id}/send-signature`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contratos'] }),
  });
}
