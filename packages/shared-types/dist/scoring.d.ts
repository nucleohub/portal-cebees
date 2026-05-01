import type { NivelProficiencia, TipoCurso } from './enums.js';
export declare const SCORE_WEIGHTS: {
    readonly especialidade: 0.3;
    readonly proficiencia: 0.2;
    readonly disponibilidade: 0.2;
    readonly desempenho: 0.15;
    readonly feedback: 0.1;
    readonly tipoCurso: 0.05;
};
export declare const PROFICIENCY_POINTS: Record<NivelProficiencia, number>;
export declare const RECENCY_WEIGHTS: readonly [{
    readonly maxMonths: 6;
    readonly weight: 1;
}, {
    readonly maxMonths: 12;
    readonly weight: 0.8;
}, {
    readonly maxMonths: 24;
    readonly weight: 0.6;
}, {
    readonly maxMonths: number;
    readonly weight: 0.4;
}];
export declare const MIN_AUTO_CONFIRM_SCORE = 60;
export declare const TOP_N_SUGGESTIONS = 5;
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
export declare const COURSE_TYPE_RULES: Record<TipoCurso, CourseTypeRule>;
//# sourceMappingURL=scoring.d.ts.map