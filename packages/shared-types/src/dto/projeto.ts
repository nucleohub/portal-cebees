import type { ProjetoStatus, ProjetoTipo } from '../enums.js';

export interface ProjetoDto {
  id: number;
  nome: string;
  codigo: string;
  tipo: ProjetoTipo;
  ambientePaiId: number | null;
  corTema: string;
  logoUrl: string | null;
  regrasEspecificas: Record<string, unknown>;
  status: ProjetoStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjetoDto {
  nome: string;
  codigo: string;
  tipo: ProjetoTipo;
  ambientePaiId?: number | null;
  corTema?: string;
  logoUrl?: string | null;
  regrasEspecificas?: Record<string, unknown>;
}

export type UpdateProjetoDto = Partial<CreateProjetoDto> & {
  status?: ProjetoStatus;
};
