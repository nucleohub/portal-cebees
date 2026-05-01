import 'dotenv/config';
import Joi from 'joi';

const schema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  PORT: Joi.number().port().default(3000),
  HOST: Joi.string().default('0.0.0.0'),

  DATABASE_URL: Joi.string().uri({ scheme: ['postgres', 'postgresql'] }).required(),
  REDIS_URL: Joi.string().uri({ scheme: ['redis', 'rediss'] }).optional(),

  JWT_SECRET: Joi.string().min(32).required(),
  JWT_ACCESS_TTL: Joi.string().default('15m'),
  JWT_REFRESH_TTL: Joi.string().default('7d'),
  BCRYPT_ROUNDS: Joi.number().integer().min(10).max(15).default(12),

  ENCRYPTION_KEY: Joi.string().min(32).required(),

  S3_ENDPOINT: Joi.string().uri().optional(),
  S3_REGION: Joi.string().default('us-east-1'),
  S3_ACCESS_KEY: Joi.string().allow('').default(''),
  S3_SECRET_KEY: Joi.string().allow('').default(''),
  S3_BUCKET: Joi.string().allow('').default(''),
  S3_FORCE_PATH_STYLE: Joi.boolean().default(false),

  SMTP_HOST: Joi.string().default('localhost'),
  SMTP_PORT: Joi.number().port().default(1025),
  SMTP_FROM: Joi.string().email().default('no-reply@cebees.local'),
  SMTP_USER: Joi.string().allow('').optional(),
  SMTP_PASS: Joi.string().allow('').optional(),

  SENDGRID_API_KEY: Joi.string().allow('').optional(),
  DOCUSIGN_INTEGRATION_KEY: Joi.string().allow('').optional(),
  DOCUSIGN_SECRET: Joi.string().allow('').optional(),

  LOG_LEVEL: Joi.string().valid('fatal', 'error', 'warn', 'info', 'debug', 'trace').default('info'),
  SENTRY_DSN: Joi.string().uri().allow('').optional(),

  CORS_ORIGIN: Joi.string().default('http://localhost:5173'),
}).unknown(true);

const { value, error } = schema.validate(process.env, { abortEarly: false });

if (error) {
  // Exit immediately on invalid config — fail fast.
  console.error('Invalid environment configuration:\n' + error.message);
  process.exit(1);
}

export const env = {
  nodeEnv: value.NODE_ENV as 'development' | 'test' | 'production',
  port: value.PORT as number,
  host: value.HOST as string,

  databaseUrl: value.DATABASE_URL as string,
  redisUrl: value.REDIS_URL as string | undefined,

  jwtSecret: value.JWT_SECRET as string,
  jwtAccessTtl: value.JWT_ACCESS_TTL as string,
  jwtRefreshTtl: value.JWT_REFRESH_TTL as string,
  bcryptRounds: value.BCRYPT_ROUNDS as number,

  encryptionKey: value.ENCRYPTION_KEY as string,

  s3: {
    endpoint: value.S3_ENDPOINT as string | undefined,
    region: value.S3_REGION as string,
    accessKey: value.S3_ACCESS_KEY as string,
    secretKey: value.S3_SECRET_KEY as string,
    bucket: value.S3_BUCKET as string,
    forcePathStyle: value.S3_FORCE_PATH_STYLE as boolean,
  },

  smtp: {
    host: value.SMTP_HOST as string,
    port: value.SMTP_PORT as number,
    from: value.SMTP_FROM as string,
    user: value.SMTP_USER as string | undefined,
    pass: value.SMTP_PASS as string | undefined,
  },

  sendgridApiKey: value.SENDGRID_API_KEY as string | undefined,
  docusign: {
    integrationKey: value.DOCUSIGN_INTEGRATION_KEY as string | undefined,
    secret: value.DOCUSIGN_SECRET as string | undefined,
  },

  logLevel: value.LOG_LEVEL as string,
  sentryDsn: value.SENTRY_DSN as string | undefined,

  corsOrigin: value.CORS_ORIGIN as string,
} as const;

export const isProduction = env.nodeEnv === 'production';
export const isTest = env.nodeEnv === 'test';
