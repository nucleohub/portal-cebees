import type { NextFunction, Request, Response } from 'express';
import type Joi from 'joi';

import { ValidationError } from '../config/errors.js';

type Source = 'body' | 'query' | 'params';

export function validate(schema: Joi.ObjectSchema, source: Source = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const { value, error } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });
    if (error) {
      return next(
        new ValidationError('Dados inválidos', {
          details: error.details.map((d) => ({ path: d.path.join('.'), message: d.message })),
        }),
      );
    }
    (req as Request & Record<Source, unknown>)[source] = value;
    next();
  };
}
