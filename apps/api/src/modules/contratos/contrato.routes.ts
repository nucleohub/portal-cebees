import { Router } from 'express';

import { NotFoundError } from '../../config/errors.js';
import { ContratoProfessor, Professor, Alocacao, Turma } from '../../db/models/index.js';
import { authRequired } from '../../middleware/auth.js';
import { requireCoordenador, requireSecretaria } from '../../middleware/rbac.js';
import { getPresignedGetUrl } from '../../integrations/storage.js';
import { marcarEnviado } from './ContratoService.js';

export const contratoRouter = Router();

contratoRouter.use(authRequired);

contratoRouter.get('/', requireSecretaria, async (req, res, next) => {
  try {
    const { professorId, status } = req.query;
    const where: Record<string, unknown> = {};
    if (professorId) where.professorId = Number(professorId);
    if (status) where.status = status;

    const rows = await ContratoProfessor.findAll({
      where,
      include: [
        { model: Professor, as: 'professor', attributes: ['id', 'nomeCompleto'] },
        {
          model: Alocacao,
          as: 'alocacao',
          include: [{ model: Turma, as: 'turma', attributes: ['id', 'codigo', 'nome'] }],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

contratoRouter.get('/:id(\\d+)', requireSecretaria, async (req, res, next) => {
  try {
    const contrato = await ContratoProfessor.findByPk(Number(req.params.id), {
      include: [
        { model: Professor, as: 'professor', attributes: ['id', 'nomeCompleto', 'email'] },
        {
          model: Alocacao,
          as: 'alocacao',
          include: [{ model: Turma, as: 'turma', attributes: ['id', 'codigo', 'nome', 'tipoCurso'] }],
        },
      ],
    });
    if (!contrato) throw new NotFoundError('Contrato', req.params.id);
    res.json(contrato);
  } catch (e) {
    next(e);
  }
});

contratoRouter.get('/:id(\\d+)/pdf', requireSecretaria, async (req, res, next) => {
  try {
    const contrato = await ContratoProfessor.findByPk(Number(req.params.id));
    if (!contrato) throw new NotFoundError('Contrato', req.params.id);
    if (!contrato.pdfUrl) {
      res.status(404).json({ error: { code: 'PDF_NOT_READY', message: 'PDF ainda não foi gerado' } });
      return;
    }

    const key = contrato.pdfUrl.replace(/^s3:\/\/[^/]+\//, '');
    const url = await getPresignedGetUrl(key, 3600);
    res.json({ pdfUrl: url });
  } catch (e) {
    next(e);
  }
});

contratoRouter.post('/:id(\\d+)/send-signature', requireCoordenador, async (req, res, next) => {
  try {
    const contrato = await ContratoProfessor.findByPk(Number(req.params.id));
    if (!contrato) throw new NotFoundError('Contrato', req.params.id);
    const envelopeId = `stub-${Date.now()}`;
    await marcarEnviado(contrato.id, envelopeId, 'stub');
    res.json({ envelopeId, message: 'Enviado para assinatura (stub)' });
  } catch (e) {
    next(e);
  }
});
