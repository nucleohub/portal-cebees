import { Router } from 'express';
import Joi from 'joi';

import { ProfessorStatus } from '@cebees/shared-types';

import { NotFoundError } from '../../../../config/errors.js';
import { Professor, ProfessorEspecialidade } from '../../../../db/models/index.js';
import { authRequired } from '../../../../middleware/auth.js';
import { requireCoordenador, requireSecretaria } from '../../../../middleware/rbac.js';
import { validate } from '../../../../middleware/validate.js';
import { validarCpf, validarEmail, validarFormacoes } from '../../domain/Professor.js';

export const professorRouter = Router();

const formacaoSchema = Joi.object({
  nivel: Joi.string().valid('MEDIO', 'TECNICO', 'GRADUACAO', 'ESPECIALIZACAO', 'MESTRADO', 'DOUTORADO').required(),
  curso: Joi.string().required(),
  instituicao: Joi.string().required(),
  anoConclusao: Joi.number().integer().min(1950).max(new Date().getUTCFullYear()).required(),
});

const createSchema = Joi.object({
  nomeCompleto: Joi.string().min(3).max(200).required(),
  cpf: Joi.string().required(),
  rg: Joi.string().required(),
  email: Joi.string().email().required(),
  telefone: Joi.string().max(30).optional(),
  dataNascimento: Joi.date().iso().required(),
  formacoes: Joi.array().items(formacaoSchema).min(1).required(),
  experienciaAnos: Joi.number().integer().min(0).default(0),
});

const updateSchema = createSchema.fork(
  ['nomeCompleto', 'cpf', 'rg', 'email', 'dataNascimento', 'formacoes'],
  (s) => s.optional(),
).append({
  status: Joi.string().valid('ATIVO', 'INATIVO', 'SUSPENSO').optional(),
});

professorRouter.use(authRequired);

professorRouter.get('/', requireSecretaria, async (_req, res, next) => {
  try {
    const profs = await Professor.findAll({ order: [['nomeCompleto', 'ASC']] });
    res.json(profs.map(toDto));
  } catch (e) {
    next(e);
  }
});

professorRouter.get('/:id(\\d+)', requireSecretaria, async (req, res, next) => {
  try {
    const p = await Professor.findByPk(Number(req.params.id));
    if (!p) throw new NotFoundError('Professor', req.params.id);
    res.json(toDto(p));
  } catch (e) {
    next(e);
  }
});

professorRouter.post('/', requireCoordenador, validate(createSchema), async (req, res, next) => {
  try {
    const body = req.body as {
      cpf: string;
      rg: string;
      email: string;
      formacoes: Array<{ nivel: string }>;
      nomeCompleto: string;
      telefone?: string;
      dataNascimento: string;
      experienciaAnos: number;
    };
    validarCpf(body.cpf);
    validarEmail(body.email);
    validarFormacoes(body.formacoes);

    const professor = Professor.build({
      nomeCompleto: body.nomeCompleto,
      email: body.email,
      telefone: body.telefone ?? null,
      dataNascimento: body.dataNascimento,
      formacoes: body.formacoes as never,
      experienciaAnos: body.experienciaAnos,
      status: ProfessorStatus.ATIVO,
      cpfEncrypted: '',
      cpfHash: '',
      rgEncrypted: '',
    });
    professor.cpf = body.cpf;
    professor.rg = body.rg;
    await professor.save();
    res.status(201).json(toDto(professor));
  } catch (e) {
    next(e);
  }
});

professorRouter.patch('/:id(\\d+)', requireCoordenador, validate(updateSchema), async (req, res, next) => {
  try {
    const p = await Professor.findByPk(Number(req.params.id));
    if (!p) throw new NotFoundError('Professor', req.params.id);
    const body = req.body as Record<string, unknown>;
    if (body.cpf) validarCpf(String(body.cpf));
    if (body.email) validarEmail(String(body.email));
    Object.assign(p, body);
    if (body.cpf) p.cpf = String(body.cpf);
    if (body.rg) p.rg = String(body.rg);
    await p.save();
    res.json(toDto(p));
  } catch (e) {
    next(e);
  }
});

const assignSchema = Joi.object({
  especialidadeId: Joi.number().integer().required(),
  nivelProficiencia: Joi.number().integer().min(1).max(5).required(),
  desdeAno: Joi.number().integer().min(1950).max(new Date().getUTCFullYear()).required(),
  comprovacao: Joi.string().optional(),
});

professorRouter.post(
  '/:id(\\d+)/especialidades',
  requireCoordenador,
  validate(assignSchema),
  async (req, res, next) => {
    try {
      const professorId = Number(req.params.id);
      const p = await Professor.findByPk(professorId);
      if (!p) throw new NotFoundError('Professor', req.params.id);
      const pe = await ProfessorEspecialidade.upsert({ professorId, ...req.body });
      res.status(201).json(pe[0]);
    } catch (e) {
      next(e);
    }
  },
);

professorRouter.delete(
  '/:id(\\d+)/especialidades/:espId(\\d+)',
  requireCoordenador,
  async (req, res, next) => {
    try {
      const removed = await ProfessorEspecialidade.destroy({
        where: {
          professorId: Number(req.params.id),
          especialidadeId: Number(req.params.espId),
        },
      });
      if (!removed) throw new NotFoundError('ProfessorEspecialidade');
      res.status(204).end();
    } catch (e) {
      next(e);
    }
  },
);

function toDto(p: Professor) {
  return {
    id: p.id,
    nomeCompleto: p.nomeCompleto,
    email: p.email,
    telefone: p.telefone,
    dataNascimento: p.dataNascimento,
    status: p.status,
    formacoes: p.formacoes,
    experienciaAnos: p.experienciaAnos,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}
