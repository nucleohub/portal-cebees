import { Router } from 'express';
import Joi from 'joi';

import { ForbiddenError } from '../../../../config/errors.js';
import { Disponibilidade } from '../../../../db/models/index.js';
import { authRequired } from '../../../../middleware/auth.js';
import { validate } from '../../../../middleware/validate.js';
import { updateAvailability } from '../../application/UpdateAvailabilityUseCase.js';

export const disponibilidadeRouter = Router();

const slotSchema = Joi.object({
  diaSemana: Joi.number().integer().min(1).max(7).required(),
  periodo: Joi.string().valid('MANHA', 'TARDE', 'NOITE').required(),
  horaInicio: Joi.string().pattern(/^\d{2}:\d{2}(:\d{2})?$/).required(),
  horaFim: Joi.string().pattern(/^\d{2}:\d{2}(:\d{2})?$/).required(),
});

const upsertSchema = Joi.object({
  slots: Joi.array().items(slotSchema).min(0).required(),
});

disponibilidadeRouter.use(authRequired);

disponibilidadeRouter.get('/professores/:id(\\d+)', async (req, res, next) => {
  try {
    const professorId = Number(req.params.id);
    if (req.auth!.papel === 'PROFESSOR' && req.auth!.professorId !== professorId) {
      throw new ForbiddenError('Acesso restrito ao próprio perfil');
    }
    const rows = await Disponibilidade.findAll({
      where: { professorId },
      order: [
        ['diaSemana', 'ASC'],
        ['horaInicio', 'ASC'],
      ],
    });
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

disponibilidadeRouter.put(
  '/professores/:id(\\d+)',
  validate(upsertSchema),
  async (req, res, next) => {
    try {
      const professorId = Number(req.params.id);
      if (req.auth!.papel === 'PROFESSOR' && req.auth!.professorId !== professorId) {
        throw new ForbiddenError('Só é possível editar a própria disponibilidade');
      }
      const created = await updateAvailability({ professorId, slots: req.body.slots });
      res.json(created);
    } catch (e) {
      next(e);
    }
  },
);
