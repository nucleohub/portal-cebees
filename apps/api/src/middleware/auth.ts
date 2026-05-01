import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { Papel } from '@cebees/shared-types';

import { env } from '../config/env.js';
import { UnauthorizedError } from '../config/errors.js';

export interface AuthPayload {
  sub: number;
  email: string;
  nome: string;
  papel: Papel;
  professorId: number | null;
}

declare module 'express-serve-static-core' {
  interface Request {
    auth?: AuthPayload;
    requestId?: string;
  }
}

export function signAccessToken(payload: AuthPayload): string {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtAccessTtl as jwt.SignOptions['expiresIn'],
  });
}

export function signRefreshToken(payload: Pick<AuthPayload, 'sub'>): string {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtRefreshTtl as jwt.SignOptions['expiresIn'],
  });
}

export function verifyToken<T extends object>(token: string): T {
  return jwt.verify(token, env.jwtSecret) as T;
}

export function authRequired(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Token ausente'));
  }
  try {
    const token = header.substring('Bearer '.length);
    const payload = verifyToken<AuthPayload>(token);
    req.auth = payload;
    next();
  } catch {
    next(new UnauthorizedError('Token inválido ou expirado'));
  }
}
