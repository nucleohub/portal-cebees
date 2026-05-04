/**
 * app.ts — Express application factory (no listen).
 * Imported by server.ts (local dev) and api/index.ts (Vercel serverless).
 */
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import hpp from 'hpp';
import { pinoHttp } from 'pino-http';

import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { metricsMiddleware, registry } from './config/metrics.js';
import { startBoss } from './config/pgboss.js';
import { Sentry, initSentry } from './config/sentry.js';
import { sequelize } from './db/sequelize.js';
import './db/models/index.js';
import { audit } from './middleware/audit.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestId } from './middleware/requestId.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { contratoRouter } from './modules/contratos/contrato.routes.js';
import { historicoRouter } from './modules/historico/historico.routes.js';
import { alocacaoRouter } from './modules/match/interface/http/alocacao.routes.js';
import { disponibilidadeRouter } from './modules/match/interface/http/disponibilidade.routes.js';
import { especialidadeRouter } from './modules/match/interface/http/especialidade.routes.js';
import { professorRouter } from './modules/match/interface/http/professor.routes.js';
import { turmaRouter } from './modules/match/interface/http/turma.routes.js';
import { projetoRouter } from './modules/projeto/interface/http/projeto.routes.js';
import { registerWorkers } from './workers/index.js';

initSentry();

// Start pg-boss and register workers non-blocking so the HTTP server is not
// delayed.  Errors are logged but do not crash the process.
void startBoss()
  .then((boss) => registerWorkers(boss))
  .catch((err) => logger.error({ err }, 'pg-boss startup failed'));

export const app = express();

app.set('trust proxy', 1);
app.use(helmet());
app.use(
  cors({
    origin: (origin, cb) => {
      const allowed = env.corsOrigin.split(',').map((s) => s.trim());
      if (!origin || allowed.includes('*') || allowed.includes(origin)) return cb(null, true);
      cb(new Error('Not allowed by CORS'));
    },
    credentials: true,
  }),
);
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(hpp());
app.use(requestId);
app.use(pinoHttp({ logger }));
app.use(metricsMiddleware);

app.use(
  rateLimit({
    windowMs: 60_000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/ready', async (_req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ status: 'ready' });
  } catch (err) {
    logger.error({ err }, 'readiness check failed');
    res.status(503).json({ status: 'not-ready' });
  }
});

app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', registry.contentType);
  res.end(await registry.metrics());
});

app.use(audit);

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/projetos', projetoRouter);
app.use('/api/v1/professores', professorRouter);
app.use('/api/v1/especialidades', especialidadeRouter);
app.use('/api/v1', disponibilidadeRouter);
app.use('/api/v1/turmas', turmaRouter);
app.use('/api/v1/alocacoes', alocacaoRouter);
app.use('/api/v1/contratos', contratoRouter);
app.use('/api/v1/historico', historicoRouter);

app.use((_req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Rota não encontrada' } });
});

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (env.sentryDsn) Sentry.captureException(err);
  errorHandler(err, req, res, next);
});

export default app;
