import type { AlocacaoStatus } from '../enums.js';
import type { ScoreBreakdown } from '../scoring.js';

export interface AlocacaoDto {
  id: number;
  turmaId: number;
  turmaCodigo: string;
  turmaNome: string;
  professorId: number;
  professorNome: string;
  status: AlocacaoStatus;
  score?: ScoreBreakdown;
  dataSugestao: string;
  dataConfirmacao?: string;
  dataInicio?: string;
  dataFim?: string;
  justificativa?: string;
  motivoCancelamento?: string;
  contratoId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ConfirmAlocacaoDto {
  justificativa?: string;
}

export interface CancelAlocacaoDto {
  motivo: string;
}

export interface ManualSearchFilters {
  especialidadeId?: number;
  nivelProficienciaMin?: number;
  diaSemana?: number;
  periodo?: string;
  disponibilidadeMinHoras?: number;
  nomeQuery?: string;
}
