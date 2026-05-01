import { Op } from 'sequelize';

import { ProfessorStatus, type ManualSearchFilters } from '@cebees/shared-types';

import {
  Disponibilidade,
  Especialidade,
  Professor,
  ProfessorEspecialidade,
} from '../../../db/models/index.js';

export interface ManualSearchResult {
  id: number;
  nome: string;
  email: string;
  especialidades: Array<{ id: number; nome: string; nivel: number }>;
  experienciaAnos: number;
}

export async function manualSearch(filters: ManualSearchFilters): Promise<ManualSearchResult[]> {
  const where: Record<string, unknown> = { status: ProfessorStatus.ATIVO };
  if (filters.nomeQuery) {
    where.nomeCompleto = { [Op.iLike]: `%${filters.nomeQuery}%` };
  }

  const include: Array<Record<string, unknown>> = [
    {
      model: ProfessorEspecialidade,
      as: 'professorEspecialidades',
      required: !!filters.especialidadeId || !!filters.nivelProficienciaMin,
      where: construirWhereEsp(filters),
      include: [{ model: Especialidade, as: 'especialidade' }],
    },
  ];

  if (filters.diaSemana) {
    include.push({
      model: Disponibilidade,
      as: 'disponibilidades',
      required: true,
      where: {
        diaSemana: filters.diaSemana,
        ...(filters.periodo ? { periodo: filters.periodo } : {}),
      },
    });
  }

  const profs = await Professor.findAll({ where, include: include as never, limit: 50 });

  return profs.map((p) => {
    const pes = (p as Professor & { professorEspecialidades?: Array<ProfessorEspecialidade & { especialidade?: Especialidade }> })
      .professorEspecialidades ?? [];
    return {
      id: p.id,
      nome: p.nomeCompleto,
      email: p.email,
      especialidades: pes.map((pe) => ({
        id: pe.especialidadeId,
        nome: pe.especialidade?.nome ?? '',
        nivel: pe.nivelProficiencia,
      })),
      experienciaAnos: p.experienciaAnos,
    };
  });
}

function construirWhereEsp(filters: ManualSearchFilters): Record<string, unknown> | undefined {
  const where: Record<string, unknown> = {};
  if (filters.especialidadeId) where.especialidadeId = filters.especialidadeId;
  if (filters.nivelProficienciaMin) {
    where.nivelProficiencia = { [Op.gte]: filters.nivelProficienciaMin };
  }
  return Object.keys(where).length > 0 ? where : undefined;
}
