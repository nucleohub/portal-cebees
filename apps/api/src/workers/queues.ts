import { Queue } from 'bullmq';
import IORedis, { type Redis } from 'ioredis';

import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

export const redisConnection: Redis | null = env.redisUrl
  ? new IORedis(env.redisUrl, { maxRetriesPerRequest: null })
  : null;

if (!redisConnection) {
  logger.warn('REDIS_URL not set — background workers and queues are disabled');
}

export const QUEUE_NAMES = {
  contractGeneration: 'contract-generation',
  documentExpiry: 'document-expiry',
  performanceRecalc: 'performance-recalc',
  notification: 'notification',
} as const;

export const contractGenerationQueue = redisConnection
  ? new Queue(QUEUE_NAMES.contractGeneration, { connection: redisConnection })
  : null;
export const documentExpiryQueue = redisConnection
  ? new Queue(QUEUE_NAMES.documentExpiry, { connection: redisConnection })
  : null;
export const performanceRecalcQueue = redisConnection
  ? new Queue(QUEUE_NAMES.performanceRecalc, { connection: redisConnection })
  : null;
export const notificationQueue = redisConnection
  ? new Queue(QUEUE_NAMES.notification, { connection: redisConnection })
  : null;

export async function enqueueContractGeneration(contratoId: number): Promise<void> {
  if (!contractGenerationQueue) return;
  await contractGenerationQueue.add('generate', { contratoId }, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5_000 },
    removeOnComplete: 100,
    removeOnFail: 500,
  });
}

export async function enqueuePerformanceRecalc(professorId: number): Promise<void> {
  if (!performanceRecalcQueue) return;
  await performanceRecalcQueue.add('recalc', { professorId }, {
    attempts: 2,
    removeOnComplete: 100,
    removeOnFail: 200,
  });
}

export async function enqueueNotification(payload: {
  to: string;
  subject: string;
  body: string;
}): Promise<void> {
  if (!notificationQueue) return;
  await notificationQueue.add('email', payload, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 10_000 },
    removeOnComplete: 200,
    removeOnFail: 500,
  });
}
