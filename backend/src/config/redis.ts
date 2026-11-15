import { Redis } from 'ioredis';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

let isRedisConnected = false;

export const redisClient = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  lazyConnect: true,
  retryStrategy(times) {
    if (times > 3) {
      logger.warn(`Redis connection retry limit reached (${times}). Pausing retries to prevent log spam.`);
      return null; // Stop retrying automatically
    }
    return Math.min(times * 1000, 3000);
  }
});

redisClient.on('connect', () => {
  isRedisConnected = true;
  logger.info(`Connected to Redis at ${env.REDIS_HOST}:${env.REDIS_PORT}`);
});

redisClient.on('error', (err) => {
  isRedisConnected = false;
  // Non-fatal warning so the server remains resilient
  logger.warn(`Redis connection unavailable (${err.message}). Background BullMQ jobs will operate in passive mode.`);
});

export const getIsRedisConnected = () => isRedisConnected;

export const initRedis = async () => {
  try {
    await redisClient.connect();
  } catch (err: any) {
    logger.warn(`Redis initial connection skipped: ${err.message}. Server will continue running without Redis background queues.`);
  }
};

