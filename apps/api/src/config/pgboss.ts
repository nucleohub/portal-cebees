/**
 * pgboss.ts — pg-boss singleton.
 *
 * pg-boss uses PostgreSQL as a job queue — no Redis needed, works in Vercel
 * serverless and in any process that has a DB connection.
 *
 * Usage:
 *   import { getBoss, startBoss } from './pgboss.js';
 *
 *   // In app startup (non-blocking):
 *   void startBoss().then((boss) => registerWorkers(boss));
 *
 *   // In business logic:
 *   await getBoss().send('contract-generation', { contratoId });
 */
import { PgBoss } from 'pg-boss';

import { env } from './env.js';
import { logger } from './logger.js';

let boss: PgBoss | null = null;

export function getBoss(): PgBoss {
  if (!boss) throw new Error('pg-boss not started. Call startBoss() first.');
  return boss;
}

export async function startBoss(): Promise<PgBoss> {
  if (boss) return boss;

  boss = new PgBoss(env.databaseUrl);

  boss.on('error', (err: unknown) => logger.error({ err }, 'pg-boss error'));

  await boss.start();
  logger.info('pg-boss started');
  return boss;
}

export async function stopBoss(): Promise<void> {
  if (!boss) return;
  await boss.stop();
  boss = null;
  logger.info('pg-boss stopped');
}
