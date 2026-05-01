import {
  SCORE_WEIGHTS,
  type HorarioTurmaDto,
  type NivelProficiencia,
  type ScoreBreakdown,
  type TipoCurso,
} from '@cebees/shared-types';

import { courseTypePoints, professorAtendeTipoCurso } from './CourseTypeRules.js';
import { proficiencyPoints } from './ProficiencyMapper.js';
import { recencyWeight } from './RecencyWeights.js';

export interface EspecialidadeAderencia {
  peso: number;
  nivelProfessor: NivelProficiencia | null;
}

export interface HistoricoPonto {
  dataFim: Date;
  avaliacaoCoordenacao: number | null;
}

export interface FeedbackPonto {
  dataFim: Date;
  avaliacaoAlunos: number | null;
}

export interface ScoreInput {
  especialidadesDaDisciplina: EspecialidadeAderencia[];
  nivelProficienciaPrincipal: NivelProficiencia;
  coberturaHoraria: {
    disponivel: Array<{ diaSemana: number; horaInicio: string; horaFim: string }>;
    requerido: HorarioTurmaDto[];
  };
  historicos: HistoricoPonto[];
  feedbacks: FeedbackPonto[];
  tipoCurso: TipoCurso;
  experienciaAnos: number;
  nivelMaxProficiencia: NivelProficiencia;
  formacaoMaisAlta?: string;
}

export function calcEspecialidade(ader: EspecialidadeAderencia[]): number {
  if (ader.length === 0) return 0;
  const totalPeso = ader.reduce((s, a) => s + a.peso, 0);
  if (totalPeso === 0) return 0;
  const soma = ader.reduce((s, a) => {
    if (a.nivelProfessor === null) return s;
    return s + a.peso * proficiencyPoints(a.nivelProfessor);
  }, 0);
  return clamp(soma / totalPeso);
}

export function calcProficiencia(nivel: NivelProficiencia): number {
  return proficiencyPoints(nivel);
}

export function calcDisponibilidade(input: ScoreInput['coberturaHoraria']): number {
  if (input.requerido.length === 0) return 100;
  let cobertos = 0;
  for (const req of input.requerido) {
    const cobre = input.disponivel.some(
      (d) =>
        d.diaSemana === req.diaSemana &&
        d.horaInicio <= req.horaInicio &&
        d.horaFim >= req.horaFim,
    );
    if (cobre) cobertos++;
  }
  return clamp((cobertos / input.requerido.length) * 100);
}

export function calcDesempenho(historicos: HistoricoPonto[], now: Date = new Date()): number {
  const pontos = historicos.filter((h) => h.avaliacaoCoordenacao !== null);
  if (pontos.length === 0) return 50;
  let somaPesada = 0;
  let pesoTotal = 0;
  for (const h of pontos) {
    const w = recencyWeight(h.dataFim, now);
    somaPesada += (h.avaliacaoCoordenacao as number) * w;
    pesoTotal += w;
  }
  if (pesoTotal === 0) return 50;
  const mediaEstrelas = somaPesada / pesoTotal;
  return clamp((mediaEstrelas / 5) * 100);
}

export function calcFeedback(feedbacks: FeedbackPonto[], now: Date = new Date()): number {
  const pontos = feedbacks.filter((f) => f.avaliacaoAlunos !== null);
  if (pontos.length === 0) return 50;
  let somaPesada = 0;
  let pesoTotal = 0;
  for (const f of pontos) {
    const w = recencyWeight(f.dataFim, now);
    somaPesada += (f.avaliacaoAlunos as number) * w;
    pesoTotal += w;
  }
  if (pesoTotal === 0) return 50;
  const mediaEstrelas = somaPesada / pesoTotal;
  return clamp((mediaEstrelas / 5) * 100);
}

export function calcTipoCurso(
  tipo: TipoCurso,
  fit: { nivelMaxProficiencia: NivelProficiencia; experienciaAnos: number; formacaoMaisAlta?: string },
): number {
  const res = professorAtendeTipoCurso(tipo, fit);
  return courseTypePoints(res.atende);
}

export function computeScore(input: ScoreInput, now: Date = new Date()): ScoreBreakdown {
  const especialidade = calcEspecialidade(input.especialidadesDaDisciplina);
  const proficiencia = calcProficiencia(input.nivelProficienciaPrincipal);
  const disponibilidade = calcDisponibilidade(input.coberturaHoraria);
  const desempenho = calcDesempenho(input.historicos, now);
  const feedback = calcFeedback(input.feedbacks, now);
  const tipoCurso = calcTipoCurso(input.tipoCurso, {
    nivelMaxProficiencia: input.nivelMaxProficiencia,
    experienciaAnos: input.experienciaAnos,
    formacaoMaisAlta: input.formacaoMaisAlta,
  });

  const total =
    especialidade * SCORE_WEIGHTS.especialidade +
    proficiencia * SCORE_WEIGHTS.proficiencia +
    disponibilidade * SCORE_WEIGHTS.disponibilidade +
    desempenho * SCORE_WEIGHTS.desempenho +
    feedback * SCORE_WEIGHTS.feedback +
    tipoCurso * SCORE_WEIGHTS.tipoCurso;

  return {
    especialidade: round2(especialidade),
    proficiencia: round2(proficiencia),
    disponibilidade: round2(disponibilidade),
    desempenho: round2(desempenho),
    feedback: round2(feedback),
    tipoCurso: round2(tipoCurso),
    total: round2(total),
  };
}

function clamp(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
