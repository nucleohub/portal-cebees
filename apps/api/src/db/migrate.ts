import { readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { Umzug, SequelizeStorage } from 'umzug';

import { logger } from '../config/logger.js';

import { sequelize } from './sequelize.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const migrationsDir = join(__dirname, 'migrations');

async function loadMigrations() {
  const files = (await readdir(migrationsDir))
    .filter((f) => /^\d{3}-.+\.ts$/.test(f) || /^\d{3}-.+\.js$/.test(f))
    .sort();

  return Promise.all(
    files.map(async (file) => {
      const fullPath = pathToFileURL(join(migrationsDir, file)).href;
      const mod = (await import(fullPath)) as {
        up: (ctx: { context: typeof sequelize }) => Promise<void>;
        down: (ctx: { context: typeof sequelize }) => Promise<void>;
      };
      return {
        name: file.replace(/\.(ts|js)$/, ''),
        up: mod.up,
        down: mod.down,
      };
    }),
  );
}

async function createUmzug() {
  const migrations = await loadMigrations();
  return new Umzug({
    migrations,
    context: sequelize,
    storage: new SequelizeStorage({ sequelize }),
    logger: {
      info: (msg) => logger.info(msg),
      warn: (msg) => logger.warn(msg),
      error: (msg) => logger.error(msg),
      debug: (msg) => logger.debug(msg),
    },
  });
}

async function main(): Promise<void> {
  const cmd = process.argv[2] ?? 'up';
  const umzug = await createUmzug();

  try {
    if (cmd === 'up') {
      const executed = await umzug.up();
      logger.info({ count: executed.length }, 'Migrations applied');
    } else if (cmd === 'down') {
      const reverted = await umzug.down();
      logger.info({ count: reverted.length }, 'Migration reverted');
    } else if (cmd === 'status') {
      const pending = await umzug.pending();
      const done = await umzug.executed();
      logger.info({ pending: pending.map((m) => m.name), executed: done.map((m) => m.name) });
    } else {
      throw new Error(`Unknown migrate command: ${cmd}`);
    }
  } finally {
    await sequelize.close();
  }
}

main().catch((err) => {
  logger.error({ err }, 'Migration failed');
  process.exit(1);
});
