import { app } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { sequelize } from './db/sequelize.js';

async function start(): Promise<void> {
  try {
    await sequelize.authenticate();
    logger.info('Database connected');
  } catch (err) {
    logger.error({ err }, 'Database connection failed');
    process.exit(1);
  }

  const server = app.listen(env.port, env.host, () => {
    logger.info(`API listening on http://${env.host}:${env.port}`);
  });

  const shutdown = async (): Promise<void> => {
    logger.info('Shutting down API...');
    server.close(async () => {
      await sequelize.close();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 15_000).unref();
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

start().catch((err) => {
  logger.error({ err }, 'Fatal startup error');
  process.exit(1);
});
