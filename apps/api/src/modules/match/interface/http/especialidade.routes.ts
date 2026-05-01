import { Router } from 'express';
import Joi from 'joi';

import { NotFoundError } from '../../../../config/errors.js';
import { Especialidade } from '../../../../db/models/index.js';
import { authRequired } from '../../../../middleware/auth.js';
import { requireCoordenador, requireSecretaria } from '../../../../middleware/rbac.js';
import { validate } from '../../../../middleware/validate.js';

export const especialidadeRouter = Router();

const schema = Joi.object({
  nome: Joi.string().max(150).required(),
  area: Joi.string().max(100).required(),
  descricao: Joi.string().allow('').optional(),
});

especialidadeRouter.use(authRequired);

especialidadeRouter.get('/', requireSecretaria, async (_req, res, next) => {
  try {
    const rows = await Especialidade.findAll({ order: [['nome', 'ASC']] });
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

especialidadeRouter.post('/', requireCoordenador, validate(schema), async (req, res, next) => {
  try {
    const e = await Especialidade.create(req.body);
    res.status(201).json(e);
  } catch (err) {
    next(err);
  }
});

especialidadeRouter.patch('/:id(\\d+)', requireCoordenador, validate(schema.fork(Object.keys((schema as unknown as { describe(): { keys: Record<string, unknown> } }).describe().keys), (s) => s.optional())), async (req, res, next) => {
  try {
    const e = await Especialidade.findByPk(Number(req.params.id));
    if (!e) throw new NotFoundError('Especialidade', req.params.id);
    Object.assign(e, req.body);
    await e.save();
    res.json(e);
  } catch (err) {
    next(err);
  }
});
