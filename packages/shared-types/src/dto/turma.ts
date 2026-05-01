import type { DiaSemana, DisponibilidadePeriodo, TipoCurso, TurmaStatus } from '../enums.js';

export interface HorarioTurmaDto {
  diaSemana: DiaSemana;
  periodo: DisponibilidadePeriodo;
  horaInicio: string;
  horaFim: string;
}

export interface TurmaDto {
  id: number;
  codigo: string;
  nome: string;
  disciplinaId: number;
  disciplinaNome: string;
  tipoCurso: TipoCurso;
  cargaHorariaTotal: number;
  dataInicio: string;
  dataFim: string;
  horarios: HorarioTurmaDto[];
  vagas: number;
  vagasOcupadas: number;
  status: TurmaStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTurmaDto {
  codigo: string;
  nome: string;
  disciplinaId: number;
  tipoCurso: TipoCurso;
  cargaHorariaTotal: number;
  dataInicio: string;
  dataFim: string;
  horarios: HorarioTurmaDto[];
  vagas: number;
}

export type UpdateTurmaDto = Partial<CreateTurmaDto> & {
  status?: TurmaStatus;
};

export interface DisciplinaDto {
  id: number;
  codigo: string;
  nome: string;
  ementa?: string;
  cargaHoraria: number;
  especialidadesRequeridas: number[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateDisciplinaDto {
  codigo: string;
  nome: string;
  ementa?: string;
  cargaHoraria: number;
  especialidadesRequeridas: number[];
}
