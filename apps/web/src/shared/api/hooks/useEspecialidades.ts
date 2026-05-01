import { useQuery } from '@tanstack/react-query';
import type { EspecialidadeDto } from '@cebees/shared-types';

import { client } from '../client.js';

export function useEspecialidades() {
  return useQuery({
    queryKey: ['especialidades'],
    queryFn: async () => {
      const { data } = await client.get<EspecialidadeDto[]>('/especialidades');
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}
