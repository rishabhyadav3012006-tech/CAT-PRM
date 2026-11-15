import { createApp } from './app.js';
import { env } from './config/env.js';
import { checkDatabaseConnection } from './config/db.js';
import { initRedis } from './config/redis.js';
import { initMailer } from './config/mailer.js';
import { initQueues } from './services/queue.service.js';
import { initScheduler } from './services/scheduler.service.js';
import { logger } from './utils/logger.js';

const startServer = async () => {
  try {
    logger.info('========================================================');
    logger.info(`Starting CareNest Healthcare Management API [${env.NODE_ENV}]`);
    logger.info('========================================================');

    // 1. Check Database connection (PostgreSQL / Prisma or Memory Fallback)
    await checkDatabaseConnection();

    // 2. Initialize Mailer
    await initMailer();

    // 3. Initialize Redis, BullMQ & Background Notification Scheduler
    await initRedis();
    await initQueues();
    await initScheduler();

    // 4. Create and start Express application
    const app = createApp();
    const server = app.listen(env.PORT, () => {
      logger.info(`CareNest API Server is listening on http://localhost:${env.PORT}`);
      logger.info(`Health Check available at http://localhost:${env.PORT}/api/v1/health`);
    });

    // Graceful Shutdown Handlers
    const handleShutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Gracefully shutting down CareNest server...`);
      server.close(() => {
        logger.info('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    process.on('SIGINT', () => handleShutdown('SIGINT'));
  } catch (error: any) {
    logger.error('Fatal error encountered during server boot:', error);
    process.exit(1);
  }
};

startServer();

