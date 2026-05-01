import type { RuleCode } from '@cebees/shared-types';

export class AppError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(message: string, status: number, code: string, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string | number) {
    super(
      id !== undefined ? `${resource} '${id}' não encontrado` : `${resource} não encontrado`,
      404,
      'NOT_FOUND',
    );
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Não autenticado') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Acesso negado') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 409, 'CONFLICT', details);
  }
}

export class BusinessRuleViolation extends AppError {
  public readonly ruleCode: RuleCode;

  constructor(ruleCode: RuleCode, message: string, details?: unknown) {
    super(message, 422, ruleCode, details);
    this.ruleCode = ruleCode;
  }
}
