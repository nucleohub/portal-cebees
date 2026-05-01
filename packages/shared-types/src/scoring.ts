import type { NivelProficiencia, TipoCurso } from './enums.js';

export const SCORE_WEIGHTS = {
  especialidade: 0.3,
  proficiencia: 0.2,
  disponibilidade: 0.2,
  desempenho: 0.15,
  feedback: 0.1,
  tipoCurso: 0.05,
} as const;

export const PROFICIENCY_POINTS: Record<NivelProficiencia, number> = {
  1: 20,
  2: 40,
  3: 70,
  4: 90,
  5: 100,
};

export const RECENCY_WEIGHTS = [
  { maxMonths: 6, weight: 1.0 },
  { maxMonths: 12, weight: 0.8 },
  { maxMonths: 24, weight: 0.6 },
  { maxMonths: Infinity, weight: 0.4 },
] as const;

export const MIN_AUTO_CONFIRM_SCORE = 60;
export const TOP_N_SUGGESTIONS = 5;

export interface ScoreBreakdown {
  especialidade: number;
  proficiencia: number;
  disponibilidade: number;
  desempenho: number;
  feedback: number;
  tipoCurso: number;
  total: number;
}

export interface MatchSuggestion {
  professorId: number;
  nome: string;
  score: ScoreBreakdown;
  explicacao: string[];
}

export interface CourseTypeRule {
  tipo: TipoCurso;
  nivelMinimoProficiencia: NivelProficiencia;
  formacaoMinima?: string;
  experienciaMinimaAnos: number;
}

export const COURSE_TYPE_RULES: Record<TipoCurso, CourseTypeRule> = {
  CURSO_LIVRE: {
    tipo: 'CURSO_LIVRE',
    nivelMinimoProficiencia: 1,
    experienciaMinimaAnos: 0,
  },
  CBMF: {
    tipo: 'CBMF',
    nivelMinimoProficiencia: 2,
    experienciaMinimaAnos: 2,
  },
  FORMACAO_PROFISSIONAL: {
    tipo: 'FORMACAO_PROFISSIONAL',
    nivelMinimoProficiencia: 2,
    experienciaMinimaAnos: 2,
  },
  TECNOLOGO: {
    tipo: 'TECNOLOGO',
    nivelMinimoProficiencia: 3,
    formacaoMinima: 'GRADUACAO',
    experienciaMinimaAnos: 3,
  },
  POS_GRADUACAO: {
    tipo: 'POS_GRADUACAO',
    nivelMinimoProficiencia: 4,
    formacaoMinima: 'MESTRADO',
    experienciaMinimaAnos: 5,
  },
};
