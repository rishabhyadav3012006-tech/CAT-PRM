// ==============================================================================
// CareNest Healthcare Platform - Intelligent Auth Rate Limiting Middleware
// Protects sensitive authentication endpoints (login, forgot password, OTP)
// against credential stuffing, brute-force attacks, and DDoS.
// ==============================================================================

import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';

interface RateLimitRecord {
  count: number;
  resetAt: number;
  blockedUntil?: number;
}

interface RateLimiterOptions {
  windowMs: number;       // Window size in ms (e.g. 15 * 60 * 1000 = 15m)
  maxAttempts: number;    // Maximum attempts allowed within window
  blockDurationMs?: number; // How long to lock out after limit is exceeded (e.g. 15m)
  keyGenerator?: (req: Request) => string;
  message?: string;
}

export class MemoryRateLimiter {
  private store = new Map<string, RateLimitRecord>();

  constructor(private options: RateLimiterOptions) {
    // Periodic sweep every 5 minutes to prevent memory leak
    setInterval(() => {
      const now = Date.now();
      for (const [key, record] of this.store.entries()) {
        if (record.resetAt < now && (!record.blockedUntil || record.blockedUntil < now)) {
          this.store.delete(key);
        }
      }
    }, 5 * 60 * 1000).unref();
  }

  public middleware = () => {
    return (req: Request, res: Response, next: NextFunction) => {
      const key = this.options.keyGenerator
        ? this.options.keyGenerator(req)
        : (req.ip || req.socket.remoteAddress || 'unknown-client');

      const now = Date.now();
      let record = this.store.get(key);

      // Check if currently blocked
      if (record?.blockedUntil && record.blockedUntil > now) {
        const retryAfterSeconds = Math.ceil((record.blockedUntil - now) / 1000);
        res.setHeader('Retry-After', retryAfterSeconds);
        res.setHeader('X-RateLimit-Limit', this.options.maxAttempts);
        res.setHeader('X-RateLimit-Remaining', 0);
        logger.warn(`[SECURITY] Rate limit block active for key: ${key}. Retry in ${retryAfterSeconds}s`);
        return sendError(
          res,
          this.options.message ||
            `Too many failed attempts. For your security, this action is locked for ${Math.ceil(retryAfterSeconds / 60)} minutes. Please try again later.`,
          429
        );
      }

      // If record expired, reset window
      if (!record || record.resetAt <= now) {
        record = {
          count: 1,
          resetAt: now + this.options.windowMs
        };
        this.store.set(key, record);
      } else {
        record.count++;
      }

      const remaining = Math.max(0, this.options.maxAttempts - record.count);
      res.setHeader('X-RateLimit-Limit', this.options.maxAttempts);
      res.setHeader('X-RateLimit-Remaining', remaining);
      res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetAt / 1000));

      if (record.count > this.options.maxAttempts) {
        const blockDuration = this.options.blockDurationMs || this.options.windowMs;
        record.blockedUntil = now + blockDuration;
        const retryAfterSeconds = Math.ceil(blockDuration / 1000);
        res.setHeader('Retry-After', retryAfterSeconds);
        logger.warn(`[SECURITY] Rate limit triggered for key: ${key}. Blocked for ${retryAfterSeconds}s`);
        return sendError(
          res,
          this.options.message ||
            `Too many failed attempts. For your security, access is temporarily locked. Please try again in ${Math.ceil(retryAfterSeconds / 60)} minutes.`,
          429
        );
      }

      next();
    };
  };

  public resetKey(key: string) {
    this.store.delete(key);
  }
}

// 1. Login rate limiter: Max 5 attempts per 15-minute window per IP + Email
export const loginRateLimiter = new MemoryRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxAttempts: 5,
  blockDurationMs: 15 * 60 * 1000,
  keyGenerator: (req) => {
    const email = (req.body?.email || '').trim().toLowerCase();
    const ip = req.ip || req.socket.remoteAddress || 'client';
    return `login:${ip}:${email}`;
  },
  message: 'Too many login attempts. For security, your account login is temporarily locked for 15 minutes. Please try again later or reset your password.'
});

// 2. Sensitive auth action rate limiter (forgot password, email verify): Max 10 attempts per 15 minutes
export const authActionRateLimiter = new MemoryRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxAttempts: 10,
  blockDurationMs: 15 * 60 * 1000,
  keyGenerator: (req) => {
    const ip = req.ip || req.socket.remoteAddress || 'client';
    return `auth_action:${ip}`;
  },
  message: 'Too many security requests. Please wait a few moments before trying again.'
});

