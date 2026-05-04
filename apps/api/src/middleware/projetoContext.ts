import { type NextFunction, type Request, type Response } from 'express';

import { ProjetoStatus } from '@cebees/shared-types';

import { Projeto } from '../db/models/index.js';

export interface ProjetoContextPayload {
  projetoId: number;
  projetoCodigo: string;
  tipo: 'INTERNO' | 'SUB_AMBIENTE';
}

declare global {
  namespace Express {
    interface Request {
      /** Populated by projetoContext middleware when X-Projeto-Id header is present. */
      projetoContext?: ProjetoContextPayload;
    }
  }
}

/**
 * projetoContext — Reads the `X-Projeto-Id` request header and attaches the
 * resolved Projeto to `req.projetoContext`.
 *
 * Usage: apply this middleware SELECTIVELY on route groups that require a project
 * context (e.g., turmas, alocações).  Do NOT apply globally — auth and health
 * routes must remain unaffected.
 *
 * @example
 *   app.use('/api/v1/turmas', projetoContext, turmaRouter);
 */
export const projetoContext = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const projetoIdHeader = req.headers['x-projeto-id'] as string | undefined;

  if (!projetoIdHeader) {
    res.status(400).json({
      error: {
        code: 'PROJETO_REQUIRED',
        message: 'Header X-Projeto-Id obrigatório para esta rota.',
      },
    });
    return;
  }

  const projetoId = parseInt(projetoIdHeader, 10);
  if (isNaN(projetoId) || projetoId <= 0) {
    res.status(400).json({
      error: {
        code: 'PROJETO_INVALID',
        message: 'X-Projeto-Id deve ser um número inteiro positivo.',
      },
    });
    return;
  }

  try {
    const projeto = await Projeto.findByPk(projetoId);

    if (!projeto || projeto.status !== ProjetoStatus.ATIVO) {
      res.status(404).json({
        error: {
          code: 'PROJETO_NOT_FOUND',
          message: 'Projeto não encontrado ou inativo.',
        },
      });
      return;
    }

    req.projetoContext = {
      projetoId: projeto.id,
      projetoCodigo: projeto.codigo,
      tipo: projeto.tipo,
    };

    next();
  } catch (e) {
    next(e);
  }
};
