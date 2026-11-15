import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('5000'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  DATABASE_URL: z.string().default('postgresql://carenest_user:carenest_secure_password_2026@localhost:5432/carenest_db?schema=public'),
  DB_MODE: z.enum(['auto', 'postgres', 'mock']).default('auto'),
  JWT_SECRET: z.string().min(16).default('carenest_dev_secret_key_89234892347892374892374892374'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  REDIS_HOST: z.string().default('127.0.0.1'),
  REDIS_PORT: z.string().transform(Number).default('6379'),
  REDIS_PASSWORD: z.string().optional().default(''),
  SMTP_HOST: z.string().default('smtp.mailtrap.io'),
  SMTP_PORT: z.string().transform(Number).default('587'),
  SMTP_USER: z.string().default('dev_smtp_user'),
  SMTP_PASS: z.string().default('dev_smtp_password'),
  EMAIL_FROM: z.string().default('"CareNest Health" <no-reply@carenest.health>')
});

const parseEnv = () => {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error('Invalid environment variables detected:', JSON.stringify(parsed.error.format(), null, 2));
    throw new Error('Invalid environment variables configuration.');
  }
  return parsed.data;
};

export const env = parseEnv();

