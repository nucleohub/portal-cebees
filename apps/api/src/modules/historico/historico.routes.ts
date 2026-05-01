import { Router } from 'express';
import Joi from 'joi';

import { HistoricoAtuacao, Professor, Turma, Disciplina } from '../../db/models/index.js';
import { authRequired } from '../../middleware/auth.js';
import { requireCoordenador, requireSecretaria } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { registerHistory } from '../match/application/RegisterHistoryUseCase.js';

export const historicoRouter = Router();

const createSchema = Joi.object({
  professorId: Joi.number().integer().positive().required(),
  turmaId: Joi.number().integer().positive().required(),
  dataInicio: Joi.string().isoDate().required(),
  dataFim: Joi.string().isoDate().required(),
  cargaHorariaCumprida: Joi.number().integer().min(0).required(),
  avaliacaoCoordenacao: Joi.number().min(0).max(5).optional(),
  avaliacaoAlunos: Joi.number().min(0).max(5).optional(),
  observacoes: Joi.string().max(1000).optional(),
});

historicoRouter.use(authRequired);

historicoRouter.post('/', requireCoordenador, validate(createSchema), async (req, res, next) => {
  try {
    const historico = await registerHistory(req.body);
    res.status(201).json(historico);
  } catch (e) {
    next(e);
  }
});

historicoRouter.get('/professor/:professorId(\\d+)', requireSecretaria, async (req, res, next) => {
  try {
    const rows = await HistoricoAtuacao.findAll({
      where: { professorId: Number(req.params.professorId) },
      include: [
        { model: Professor, as: 'professor', attributes: ['id', 'nomeCompleto'] },
        {
          model: Turma,
          as: 'turma',
          attributes: ['id', 'codigo', 'nome'],
          include: [{ model: Disciplina, as: 'disciplina', attributes: ['id', 'nome'] }],
        },
      ],
      order: [['dataFim', 'DESC']],
    });
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

historicoRouter.get('/', requireSecretaria, async (req, res, next) => {
  try {
    const { professorId } = req.query;
    const where: Record<string, unknown> = {};
    if (professorId) where.professorId = Number(professorId);

    const rows = await HistoricoAtuacao.findAll({
      where,
      include: [
        { model: Professor, as: 'professor', attributes: ['id', 'nomeCompleto'] },
        {
          model: Turma,
          as: 'turma',
          attributes: ['id', 'codigo', 'nome'],
          include: [{ model: Disciplina, as: 'disciplina', attributes: ['id', 'nome'] }],
        },
      ],
      order: [['dataFim', 'DESC']],
    });
    res.json(rows);
  } catch (e) {
    next(e);
  }
});
