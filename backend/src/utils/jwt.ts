import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { UserRole } from '../constants/roles.js';

export interface JwtUserPayload {
  userId: string;
  email: string;
  role: UserRole;
  name: string;
}

export interface JwtRefreshPayload {
  userId: string;
  email: string;
}

// Access Token: Standard session token (default 1h or configured JWT_EXPIRES_IN)
export const signToken = (payload: JwtUserPayload, expiresIn: string = env.JWT_EXPIRES_IN || '1h'): string => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: expiresIn as any
  });
};

export const verifyToken = (token: string): JwtUserPayload => {
  return jwt.verify(token, env.JWT_SECRET) as JwtUserPayload;
};

// Refresh Token: Long-lived token for session renewal (default 7 days)
export const signRefreshToken = (payload: JwtRefreshPayload, expiresIn = '7d'): string => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: expiresIn as any
  });
};

export const verifyRefreshToken = (token: string): JwtRefreshPayload => {
  return jwt.verify(token, env.JWT_SECRET) as JwtRefreshPayload;
};
