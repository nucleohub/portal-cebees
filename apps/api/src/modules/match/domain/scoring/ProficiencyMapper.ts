import {
  NivelProficiencia,
  PROFICIENCY_POINTS,
  type NivelProficiencia as Nivel,
} from '@cebees/shared-types';

export function proficiencyPoints(nivel: Nivel): number {
  return PROFICIENCY_POINTS[nivel];
}

export function isValidNivel(value: unknown): value is Nivel {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    (Object.values(NivelProficiencia) as number[]).includes(value)
  );
}
