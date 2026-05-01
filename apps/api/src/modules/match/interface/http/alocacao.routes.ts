import { Router } from 'express';
import Joi from 'joi';
import { Op } from 'sequelize';

import { AlocacaoStatus } from '@cebees/shared-types';

import { Alocacao, ContratoProfessor } from '../../../../db/models/index.js';
import { authRequired } from '../../../../middleware/auth.js';
import { requireCoordenador, requireSecretaria } from '../../../../middleware/rbac.js';
import { validate } from '../../../../middleware/validate.js';
import { cancelAllocation } from '../../application/CancelAllocationUseCase.js';
import { confirmAllocation } from '../../application/ConfirmAllocationUseCase.js';
import { manualSearch } from '../../application/ManualSearchUseCase.js';
import { suggestAllocations } from '../../application/SuggestAllocationsUseCase.js';
import { getContractPdfUrlQueueJob } from '../../../contratos/ContratoService.js';

export const alocacaoRouter = Router();

const suggestSchema = Joi.object({
  topN: Joi.number().integer().min(1).max(20).optional(),
  includeFiltered: Joi.boolean().default(false),
});

const confirmSchema = Joi.object({
  justificativa: Joi.string().max(500).optional(),
  valorHora: Joi.number().positive().optional(),
});

const cancelSchema = Joi.object({
  motivo: Joi.string().min(5).max(500).required(),
});

const searchSchema = Joi.object({
  especialidadeId: Joi.number().integer().optional(),
  nivelProficienciaMin: Joi.number().integer().min(1).max(5).optional(),
  diaSemana: Joi.number().integer().min(1).max(7).optional(),
  periodo: Joi.string().valid('MANHA', 'TARDE', 'NOITE').optional(),
  nomeQuery: Joi.string().max(100).optional(),
});

alocacaoRouter.use(authRequired);

alocacaoRouter.post(
  '/turmas/:id(\\d+)/suggest',
  requireCoordenador,
  validate(suggestSchema),
  async (req, res, next) => {
    try {
      const result = await suggestAllocations(Number(req.params.id), req.body);
      res.json(result);
    } catch (e) {
      next(e);
    }
  },
);

alocacaoRouter.get('/manual-search', requireCoordenador, validate(searchSchema, 'query'), async (req, res, next) => {
  try {
    const rows = await manualSearch(req.query as never);
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

alocacaoRouter.post(
  '/:id(\\d+)/confirm',
  requireCoordenador,
  validate(confirmSchema),
  async (req, res, next) => {
    try {
      const result = await confirmAllocation({
        alocacaoId: Number(req.params.id),
        usuarioId: req.auth!.sub,
        ...req.body,
      });
      await getContractPdfUrlQueueJob(result.contrato.id);
      res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  },
);

alocacaoRouter.post(
  '/:id(\\d+)/cancel',
  requireCoordenador,
  validate(cancelSchema),
  async (req, res, next) => {
    try {
      const al = await cancelAllocation({
        alocacaoId: Number(req.params.id),
        usuarioId: req.auth!.sub,
        motivo: req.body.motivo,
      });
      res.json(al);
    } catch (e) {
      next(e);
    }
  },
);

alocacaoRouter.get('/turmas/:id(\\d+)', requireSecretaria, async (req, res, next) => {
  try {
    const rows = await Alocacao.findAll({
      where: {
        turmaId: Number(req.params.id),
        status: { [Op.notIn]: [AlocacaoStatus.CANCELADA] },
      },
      include: [{ model: ContratoProfessor, as: 'contrato' }],
    });
    res.json(rows);
  } catch (e) {
    next(e);
  }
});
