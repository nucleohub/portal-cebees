import type { NextFunction, Request, Response } from 'express';

import { AppError } from '../config/errors.js';
import { logger } from '../config/logger.js';

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.status).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
        requestId: req.requestId,
      },
    });
    return;
  }

  logger.error({ err, reqId: req.requestId, path: req.path }, 'unhandled error');
  res.status(500).json({
    error: {
      code: 'INTERNAL',
      message: 'Erro interno do servidor',
      requestId: req.requestId,
    },
  });
}
