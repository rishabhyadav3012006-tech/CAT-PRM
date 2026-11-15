import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import apiRouter from './routes/index.js';
import { notFoundHandler, globalErrorHandler } from './middleware/errorHandler.middleware.js';

export const createApp = (): Application => {
  const app = express();

  // Security Middlewares
  app.use(helmet());
  app.use(
    cors({
      origin: [env.CORS_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    })
  );

  // Logging & Parsing
  if (env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  }
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  // Welcome route
  app.get('/', (req, res) => {
    res.status(200).json({
      name: 'CareNest Health Management API',
      version: '1.0.0',
      description: 'Smart Elderly Healthcare Management Ecosystem API',
      healthCheck: '/api/v1/health',
      documentation: '/api/v1'
    });
  });

  // REST API v1
  app.use('/api/v1', apiRouter);

  // 404 & Error Handling
  app.use(notFoundHandler);
  app.use(globalErrorHandler);

  return app;
};

