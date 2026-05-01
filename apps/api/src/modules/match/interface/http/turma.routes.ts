import { Router } from 'express';
import Joi from 'joi';

import { TipoCurso, TurmaStatus } from '@cebees/shared-types';

import { NotFoundError } from '../../../../config/errors.js';
import { Disciplina, Turma } from '../../../../db/models/index.js';
import { authRequired } from '../../../../middleware/auth.js';
import { requireCoordenador, requireSecretaria } from '../../../../middleware/rbac.js';
import { validate } from '../../../../middleware/validate.js';

export const turmaRouter = Router();

const horarioSchema = Joi.object({
  diaSemana: Joi.number().integer().min(1).max(7).required(),
  periodo: Joi.string().valid('MANHA', 'TARDE', 'NOITE').required(),
  horaInicio: Joi.string().pattern(/^\d{2}:\d{2}$/).required(),
  horaFim: Joi.string().pattern(/^\d{2}:\d{2}$/).required(),
});

const createSchema = Joi.object({
  codigo: Joi.string().max(50).required(),
  nome: Joi.string().max(200).required(),
  disciplinaId: Joi.number().integer().required(),
  tipoCurso: Joi.string().valid(...Object.values(TipoCurso)).required(),
  cargaHorariaTotal: Joi.number().integer().min(1).required(),
  dataInicio: Joi.date().iso().required(),
  dataFim: Joi.date().iso().required(),
  horarios: Joi.array().items(horarioSchema).min(1).required(),
  vagas: Joi.number().integer().min(1).required(),
});

const disciplinaSchema = Joi.object({
  codigo: Joi.string().max(50).required(),
  nome: Joi.string().max(200).required(),
  ementa: Joi.string().allow('').optional(),
  cargaHoraria: Joi.number().integer().min(1).required(),
});

turmaRouter.use(authRequired);

turmaRouter.get('/disciplinas', requireSecretaria, async (_req, res, next) => {
  try {
    res.json(await Disciplina.findAll({ order: [['nome', 'ASC']] }));
  } catch (e) {
    next(e);
  }
});

turmaRouter.post('/disciplinas', requireCoordenador, validate(disciplinaSchema), async (req, res, next) => {
  try {
    res.status(201).json(await Disciplina.create(req.body));
  } catch (e) {
    next(e);
  }
});

turmaRouter.get('/', requireSecretaria, async (_req, res, next) => {
  try {
    const turmas = await Turma.findAll({
      include: [{ model: Disciplina, as: 'disciplina' }],
      order: [['dataInicio', 'DESC']],
    });
    res.json(turmas);
  } catch (e) {
    next(e);
  }
});

turmaRouter.get('/:id(\\d+)', requireSecretaria, async (req, res, next) => {
  try {
    const t = await Turma.findByPk(Number(req.params.id), {
      include: [{ model: Disciplina, as: 'disciplina' }],
    });
    if (!t) throw new NotFoundError('Turma', req.params.id);
    res.json(t);
  } catch (e) {
    next(e);
  }
});

turmaRouter.post('/', requireCoordenador, validate(createSchema), async (req, res, next) => {
  try {
    const turma = await Turma.create({ ...req.body, status: TurmaStatus.PLANEJADA });
    res.status(201).json(turma);
  } catch (e) {
    next(e);
  }
});
