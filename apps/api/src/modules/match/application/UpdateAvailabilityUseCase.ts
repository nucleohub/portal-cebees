import type { UpsertDisponibilidadeDto } from '@cebees/shared-types';

import { BusinessRuleViolation, NotFoundError } from '../../../config/errors.js';
import { Disponibilidade, Professor } from '../../../db/models/index.js';
import { sequelize } from '../../../db/sequelize.js';

export interface UpdateAvailabilityInput {
  professorId: number;
  slots: UpsertDisponibilidadeDto[];
}

export async function updateAvailability(input: UpdateAvailabilityInput): Promise<Disponibilidade[]> {
  const professor = await Professor.findByPk(input.professorId);
  if (!professor) throw new NotFoundError('Professor', input.professorId);

  validarSlots(input.slots);

  return sequelize.transaction(async (tx) => {
    await Disponibilidade.destroy({ where: { professorId: input.professorId }, transaction: tx });
    const created = await Disponibilidade.bulkCreate(
      input.slots.map((s) => ({
        professorId: input.professorId,
        diaSemana: s.diaSemana,
        periodo: s.periodo,
        horaInicio: s.horaInicio,
        horaFim: s.horaFim,
      })),
      { transaction: tx, validate: true },
    );
    return created;
  });
}

function validarSlots(slots: UpsertDisponibilidadeDto[]): void {
  for (const s of slots) {
    if (s.diaSemana < 1 || s.diaSemana > 7) {
      throw new BusinessRuleViolation('RN-009', `Dia da semana inválido: ${s.diaSemana}`);
    }
    if (s.horaInicio >= s.horaFim) {
      throw new BusinessRuleViolation(
        'RN-009',
        `Horário inválido: ${s.horaInicio} deve ser anterior a ${s.horaFim}`,
      );
    }
  }

  for (let i = 0; i < slots.length; i++) {
    for (let j = i + 1; j < slots.length; j++) {
      const a = slots[i]!;
      const b = slots[j]!;
      if (a.diaSemana !== b.diaSemana) continue;
      if (a.horaInicio < b.horaFim && b.horaInicio < a.horaFim) {
        throw new BusinessRuleViolation(
          'RN-011',
          `Conflito entre slots no dia ${a.diaSemana}`,
          { a, b },
        );
      }
    }
  }
}
