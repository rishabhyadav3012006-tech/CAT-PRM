import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { sendError } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

export const notFoundHandler = (req: Request, res: Response) => {
  return sendError(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
};

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(`Error processing request ${req.method} ${req.originalUrl}:`, err.stack || err);

  // Zod Validation Error
  if (err instanceof ZodError) {
    const issues = err.issues.map((i) => ({
      field: i.path.join('.'),
      message: i.message
    }));
    return sendError(res, 'Validation error occurred', 422, issues);
  }

  // Prisma Unique Constraint Violation
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[]) || ['field'];
      return sendError(res, `A record with this ${target.join(', ')} already exists.`, 409);
    }
    if (err.code === 'P2025') {
      return sendError(res, 'The requested record was not found.', 404);
    }
  }

  // JSON Web Token Error
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 'Invalid authentication token.', 401);
  }

  if (err.name === 'TokenExpiredError') {
    return sendError(res, 'Token has expired. Please sign in again.', 401);
  }

  // Default Internal Server Error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error occurred';

  return sendError(
    res,
    message,
    statusCode,
    env.NODE_ENV === 'development' ? { stack: err.stack } : undefined
  );
};

