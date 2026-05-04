/**
 * queues.ts — pg-boss job-send helpers.
 *
 * Replaces the former BullMQ/ioredis queue definitions.  Each helper simply
 * sends a job to the named queue.  If pg-boss has not been started yet (e.g.
 * during unit tests) the call is silently skipped.
 */
import type { PgBoss } from 'pg-boss';

import { logger } from '../config/logger.js';

export const QUEUE_NAMES = {
  contractGeneration: 'contract-generation',
  documentExpiry: 'document-expiry',
  performanceRecalc: 'performance-recalc',
  notification: 'notification',
} as const;

// Lazily resolved — avoids circular-import issues when queues.ts is imported
// before pgboss.ts has been initialised.
let _boss: PgBoss | null = null;

export function setBoss(b: PgBoss): void {
  _boss = b;
}

function getBossOrNull(): PgBoss | null {
  return _boss;
}

// ---------------------------------------------------------------------------
// Public send helpers
// ---------------------------------------------------------------------------

export async function enqueueContractGeneration(contratoId: number): Promise<void> {
  const b = getBossOrNull();
  if (!b) {
    logger.warn({ contratoId }, 'pg-boss not ready — contract-generation job skipped');
    return;
  }
  await b.send(QUEUE_NAMES.contractGeneration, { contratoId }, {
    retryLimit: 3,
    retryDelay: 5,
    retryBackoff: true,
    expireInSeconds: 3600,
  });
}

export async function enqueuePerformanceRecalc(professorId: number): Promise<void> {
  const b = getBossOrNull();
  if (!b) return;
  await b.send(QUEUE_NAMES.performanceRecalc, { professorId }, {
    retryLimit: 2,
    expireInSeconds: 7200,
  });
}

export async function enqueueNotification(payload: {
  to: string;
  subject: string;
  body: string;
  html?: string;
}): Promise<void> {
  const b = getBossOrNull();
  if (!b) {
    logger.warn({ to: payload.to }, 'pg-boss not ready — notification job skipped');
    return;
  }
  await b.send(QUEUE_NAMES.notification, payload, {
    retryLimit: 3,
    retryDelay: 10,
    retryBackoff: true,
    expireInSeconds: 86400,
  });
}
