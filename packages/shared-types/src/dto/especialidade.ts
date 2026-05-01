import type { NivelProficiencia } from '../enums.js';

export interface EspecialidadeDto {
  id: number;
  nome: string;
  area: string;
  descricao?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEspecialidadeDto {
  nome: string;
  area: string;
  descricao?: string;
}

export interface ProfessorEspecialidadeDto {
  professorId: number;
  especialidadeId: number;
  nome: string;
  area: string;
  nivelProficiencia: NivelProficiencia;
  desdeAno: number;
  comprovacao?: string;
}

export interface AssignEspecialidadeDto {
  especialidadeId: number;
  nivelProficiencia: NivelProficiencia;
  desdeAno: number;
  comprovacao?: string;
}
