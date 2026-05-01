import type { NextFunction, Request, Response } from 'express';

import { Papel } from '@cebees/shared-types';

import { ForbiddenError, UnauthorizedError } from '../config/errors.js';

export function requirePapel(...papeis: Papel[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.auth) return next(new UnauthorizedError());
    if (!papeis.includes(req.auth.papel)) {
      return next(new ForbiddenError(`Requer papel: ${papeis.join(', ')}`));
    }
    next();
  };
}

export const requireAdmin = requirePapel(Papel.ADMIN);
export const requireCoordenador = requirePapel(Papel.ADMIN, Papel.COORDENADOR);
export const requireSecretaria = requirePapel(Papel.ADMIN, Papel.COORDENADOR, Papel.SECRETARIA);
export const requireProfessor = requirePapel(Papel.ADMIN, Papel.PROFESSOR);
