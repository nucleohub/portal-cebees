import type { NextFunction, Request, Response } from 'express';

import { logger } from '../config/logger.js';
import { AuditLog } from '../db/models/index.js';

const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export function audit(req: Request, res: Response, next: NextFunction): void {
  if (!WRITE_METHODS.has(req.method)) return next();

  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const sucesso = res.statusCode < 400;
    const acao = `${req.method} ${req.route?.path ?? req.path}`;
    const recurso = inferirRecurso(req.path);
    const recursoId = inferirRecursoId(req.path);

    AuditLog.create({
      usuarioId: req.auth?.sub ?? null,
      usuarioEmail: req.auth?.email ?? null,
      acao,
      recurso,
      recursoId,
      ip: req.ip ?? null,
      userAgent: req.header('user-agent') ?? null,
      requestId: req.requestId ?? null,
      diff: safeDiff(req.body),
      sucesso,
      mensagemErro: sucesso ? null : `HTTP ${res.statusCode}`,
    }).catch((err) => {
      logger.error({ err }, 'audit write failed');
    });

    logger.info(
      {
        reqId: req.requestId,
        method: req.method,
        path: req.path,
        status: res.statusCode,
        duration,
        user: req.auth?.email,
      },
      'audit',
    );
  });

  next();
}

function inferirRecurso(path: string): string {
  const parts = path.split('/').filter(Boolean);
  return parts[1] ?? parts[0] ?? 'unknown';
}

function inferirRecursoId(path: string): string | null {
  const match = path.match(/\/(\d+)(?:\/|$)/);
  return match?.[1] ?? null;
}

function safeDiff(body: unknown): Record<string, unknown> | null {
  if (!body || typeof body !== 'object') return null;
  const clone = JSON.parse(JSON.stringify(body)) as Record<string, unknown>;
  for (const k of ['senha', 'password', 'cpf', 'rg', 'senhaAtual', 'novaSenha']) {
    if (k in clone) clone[k] = '[REDACTED]';
  }
  return clone;
}
