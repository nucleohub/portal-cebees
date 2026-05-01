import * as Sentry from '@sentry/node';

import { env } from './env.js';
import { logger } from './logger.js';

let initialized = false;

export function initSentry(): void {
  if (initialized) return;
  if (!env.sentryDsn) {
    logger.debug('Sentry disabled (no SENTRY_DSN set)');
    return;
  }
  Sentry.init({
    dsn: env.sentryDsn,
    environment: env.nodeEnv,
    tracesSampleRate: env.nodeEnv === 'production' ? 0.1 : 1.0,
  });
  initialized = true;
  logger.info('Sentry initialized');
}

export { Sentry };
