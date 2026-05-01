import type { NextFunction, Request, Response } from 'express';
import { Counter, Histogram, Registry, collectDefaultMetrics } from 'prom-client';

export const registry = new Registry();
registry.setDefaultLabels({ service: 'cebees-api' });
collectDefaultMetrics({ register: registry });

export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests by method/route/status',
  labelNames: ['method', 'route', 'status'] as const,
  registers: [registry],
});

export const httpRequestDurationMs = new Histogram({
  name: 'http_request_duration_ms',
  help: 'HTTP request duration in milliseconds',
  labelNames: ['method', 'route', 'status'] as const,
  buckets: [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000],
  registers: [registry],
});

export const matchSuggestionsHistogram = new Histogram({
  name: 'match_suggestions_score',
  help: 'Distribution of computed scores from SuggestAllocations',
  buckets: [0, 20, 40, 60, 80, 90, 100],
  registers: [registry],
});

export const matchSuggestionsTotal = new Counter({
  name: 'match_suggestions_total',
  help: 'Total suggestions emitted per turma',
  labelNames: ['tipo_curso'] as const,
  registers: [registry],
});

export function metricsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const elapsedMs = Number(process.hrtime.bigint() - start) / 1_000_000;
    const route = req.route?.path ?? req.baseUrl + (req.path || '');
    const labels = { method: req.method, route, status: String(res.statusCode) };
    httpRequestsTotal.inc(labels);
    httpRequestDurationMs.observe(labels, elapsedMs);
  });
  next();
}
