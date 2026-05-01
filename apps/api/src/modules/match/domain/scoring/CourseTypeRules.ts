import {
  COURSE_TYPE_RULES,
  type NivelProficiencia,
  type TipoCurso,
  type CourseTypeRule,
} from '@cebees/shared-types';

export interface ProfessorCourseFit {
  nivelMaxProficiencia: NivelProficiencia;
  experienciaAnos: number;
  formacaoMaisAlta?: string;
}

export function getCourseTypeRule(tipo: TipoCurso): CourseTypeRule {
  return COURSE_TYPE_RULES[tipo];
}

export function professorAtendeTipoCurso(
  tipo: TipoCurso,
  fit: ProfessorCourseFit,
): { atende: boolean; motivos: string[] } {
  const rule = getCourseTypeRule(tipo);
  const motivos: string[] = [];

  if (fit.nivelMaxProficiencia < rule.nivelMinimoProficiencia) {
    motivos.push(
      `Nível de proficiência ${fit.nivelMaxProficiencia} abaixo do mínimo ${rule.nivelMinimoProficiencia} para ${tipo}`,
    );
  }
  if (fit.experienciaAnos < rule.experienciaMinimaAnos) {
    motivos.push(
      `Experiência ${fit.experienciaAnos}a abaixo do mínimo ${rule.experienciaMinimaAnos}a para ${tipo}`,
    );
  }
  if (rule.formacaoMinima && !isFormacaoSuficiente(fit.formacaoMaisAlta, rule.formacaoMinima)) {
    motivos.push(
      `Formação ${fit.formacaoMaisAlta ?? 'indefinida'} não atende mínimo ${rule.formacaoMinima} para ${tipo}`,
    );
  }

  return { atende: motivos.length === 0, motivos };
}

const FORMACAO_ORDEM: Record<string, number> = {
  MEDIO: 1,
  TECNICO: 2,
  GRADUACAO: 3,
  ESPECIALIZACAO: 4,
  MESTRADO: 5,
  DOUTORADO: 6,
};

function isFormacaoSuficiente(atual: string | undefined, minima: string): boolean {
  if (!atual) return false;
  const a = FORMACAO_ORDEM[atual] ?? 0;
  const m = FORMACAO_ORDEM[minima] ?? 0;
  return a >= m;
}

export function courseTypePoints(atende: boolean): number {
  return atende ? 100 : 0;
}
