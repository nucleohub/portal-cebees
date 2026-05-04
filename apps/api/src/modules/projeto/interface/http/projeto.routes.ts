import { Router } from 'express';
import Joi from 'joi';

import { ProjetoStatus, ProjetoTipo } from '@cebees/shared-types';

import { authRequired } from '../../../../middleware/auth.js';
import { requireAdmin, requireSecretaria } from '../../../../middleware/rbac.js';
import { validate } from '../../../../middleware/validate.js';
import { Projeto } from '../../../../db/models/index.js';

export const projetoRouter = Router();

const createSchema = Joi.object({
  nome: Joi.string().min(2).max(255).required(),
  codigo: Joi.string()
    .uppercase()
    .pattern(/^[A-Z0-9_]+$/)
    .max(50)
    .required(),
  tipo: Joi.string()
    .valid(...Object.values(ProjetoTipo))
    .default(ProjetoTipo.INTERNO),
  ambientePaiId: Joi.number().integer().positive().allow(null).default(null),
  corTema: Joi.string()
    .pattern(/^#[0-9A-Fa-f]{6}$/)
    .default('#1A365D'),
  logoUrl: Joi.string().uri().allow(null, '').default(null),
  regrasEspecificas: Joi.object().default({}),
});

const updateSchema = createSchema
  .fork(
    ['nome', 'codigo', 'tipo', 'ambientePaiId', 'corTema', 'logoUrl', 'regrasEspecificas'],
    (s) => s.optional(),
  )
  .concat(
    Joi.object({
      status: Joi.string().valid(...Object.values(ProjetoStatus)).optional(),
    }),
  );

// All routes require authentication
projetoRouter.use(authRequired);

/**
 * GET /api/v1/projetos
 * Returns all active projects — used by every role to populate the project selector.
 */
projetoRouter.get('/', requireSecretaria, async (_req, res, next) => {
  try {
    const projetos = await Projeto.findAll({
      where: { status: ProjetoStatus.ATIVO },
      order: [
        ['tipo', 'ASC'], // INTERNO first, SUB_AMBIENTE last
        ['nome', 'ASC'],
      ],
    });
    res.json(projetos);
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/v1/projetos/:id
 */
projetoRouter.get('/:id', requireSecretaria, async (req, res, next) => {
  try {
    const projeto = await Projeto.findByPk(req.params.id);
    if (!projeto) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Projeto não encontrado' } });
      return;
    }
    res.json(projeto);
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/v1/projetos — Admin only
 */
projetoRouter.post('/', requireAdmin, validate(createSchema), async (req, res, next) => {
  try {
    const projeto = await Projeto.create(req.body);
    res.status(201).json(projeto);
  } catch (e) {
    next(e);
  }
});

/**
 * PUT /api/v1/projetos/:id — Admin only
 */
projetoRouter.put('/:id', requireAdmin, validate(updateSchema), async (req, res, next) => {
  try {
    const projeto = await Projeto.findByPk(req.params.id);
    if (!projeto) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Projeto não encontrado' } });
      return;
    }
    await projeto.update(req.body);
    res.json(projeto);
  } catch (e) {
    next(e);
  }
});

/**
 * DELETE /api/v1/projetos/:id — Admin only (soft-delete via status = INATIVO)
 */
projetoRouter.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const projeto = await Projeto.findByPk(req.params.id);
    if (!projeto) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Projeto não encontrado' } });
      return;
    }
    await projeto.update({ status: ProjetoStatus.INATIVO });
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});
