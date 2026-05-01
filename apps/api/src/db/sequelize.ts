import { Sequelize } from 'sequelize';

import { env, isTest } from '../config/env.js';
import { logger } from '../config/logger.js';

const isSsl = env.databaseUrl.includes('supabase') ||
  env.databaseUrl.includes('sslmode=require') ||
  env.databaseUrl.includes('neon.tech');

export const sequelize = new Sequelize(env.databaseUrl, {
  dialect: 'postgres',
  logging: isTest ? false : (msg) => logger.debug({ sql: msg }, 'sql'),
  pool: {
    max: 20,
    min: 2,
    acquire: 30_000,
    idle: 10_000,
  },
  dialectOptions: isSsl ? {
    ssl: { require: true, rejectUnauthorized: false },
  } : {},
  define: {
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

export async function closeDatabase(): Promise<void> {
  await sequelize.close();
}
