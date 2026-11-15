// ==============================================================================
// CareNest Healthcare Platform - Complete Authentication Controller
// Sets secure HTTP-only cookies, enforces session expiration, rate-limiting,
// and extracts client telemetry for HIPAA-grade security audit logging.
// ==============================================================================

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { authService } from '../services/auth.service.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

const isProduction = process.env.NODE_ENV === 'production';

// Cookie Configuration Presets
const ACCESS_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 1000 // 1 hour
};

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

export const authController = {
  // 1. Register
  register: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const ip = req.ip || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];
      const result = await authService.register(req.body, ip, userAgent);

      // Set HTTP-only session cookies
      res.cookie('carenest_token', result.token, ACCESS_COOKIE_OPTIONS);
      res.cookie('carenest_refresh', result.refreshToken, REFRESH_COOKIE_OPTIONS);
      res.cookie('token', result.token, ACCESS_COOKIE_OPTIONS); // Backward compatibility

      return sendSuccess(res, result.message, result, 201);
    } catch (err) {
      next(err);
    }
  },

  // 2. Login
  login: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const ip = req.ip || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];
      const result = await authService.login(req.body, ip, userAgent);

      // Set secure HTTP-only cookies
      res.cookie('carenest_token', result.token, ACCESS_COOKIE_OPTIONS);
      res.cookie('carenest_refresh', result.refreshToken, REFRESH_COOKIE_OPTIONS);
      res.cookie('token', result.token, ACCESS_COOKIE_OPTIONS); // Legacy support

      return sendSuccess(res, 'Login successful', result);
    } catch (err) {
      next(err);
    }
  },

  // 3. Refresh Session
  refreshToken: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const ip = req.ip || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];

      // Extract refresh token from HTTP-only cookie, header, or body
      const refreshToken =
        req.cookies?.carenest_refresh ||
        req.body?.refreshToken ||
        req.headers['x-refresh-token'];

      if (!refreshToken) {
        return sendError(res, 'No refresh token provided. Please sign in again.', 401);
      }

      const result = await authService.refreshToken(refreshToken, ip, userAgent);

      // Set refreshed session cookies
      res.cookie('carenest_token', result.token, ACCESS_COOKIE_OPTIONS);
      res.cookie('carenest_refresh', result.refreshToken, REFRESH_COOKIE_OPTIONS);
      res.cookie('token', result.token, ACCESS_COOKIE_OPTIONS);

      return sendSuccess(res, 'Session refreshed successfully', result);
    } catch (err) {
      next(err);
    }
  },

  // 4. Get Current User Profile (Authoritative)
  getMe: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const ip = req.ip || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];
      const user = await authService.getMe(req.user!.userId, ip, userAgent);
      return sendSuccess(res, 'User profile fetched successfully', user);
    } catch (err) {
      next(err);
    }
  },

  // 5. Update Profile Details
  updateProfile: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const ip = req.ip || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];
      const updated = await authService.updateProfile(req.user!.userId, req.body, ip, userAgent);
      return sendSuccess(res, 'Profile updated successfully', updated);
    } catch (err) {
      next(err);
    }
  },

  // 6. Secure Logout
  logout: async (req: AuthenticatedRequest, res: Response) => {
    const ip = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    await authService.logout(req.user?.userId, ip, userAgent);

    // Clear all session cookies
    res.clearCookie('carenest_token');
    res.clearCookie('carenest_refresh');
    res.clearCookie('token');

    return sendSuccess(res, 'Logged out successfully');
  },

  // 7. Forgot Password
  forgotPassword: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const ip = req.ip || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];
      const result = await authService.forgotPassword(req.body.email, ip, userAgent);
      return sendSuccess(res, 'Password reset instructions dispatched', result);
    } catch (err) {
      next(err);
    }
  },

  // 8. Reset Password
  resetPassword: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const ip = req.ip || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];
      const result = await authService.resetPassword(req.body.token, req.body.password, ip, userAgent);
      return sendSuccess(res, 'Password reset successfully', result);
    } catch (err) {
      next(err);
    }
  },

  // 9. Verify Email
  verifyEmail: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const ip = req.ip || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];
      const result = await authService.verifyEmail(req.body.email, req.body.code, ip, userAgent);
      return sendSuccess(res, 'Email verified successfully', result);
    } catch (err) {
      next(err);
    }
  },

  // 10. Resend Verification Code
  resendCode: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const result = await authService.resendVerificationCode(req.body.email);
      return sendSuccess(res, 'Verification code sent', result);
    } catch (err) {
      next(err);
    }
  },

  // 11. Profile Invite Lookup & Joining
  lookupProfileInvite: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const result = await authService.lookupProfileInvite(req.params.code);
      return sendSuccess(res, 'Profile invite found', result);
    } catch (err) {
      next(err);
    }
  },

  joinProfile: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return sendError(res, 'Authentication required to join profile', 401);
      }
      const result = await authService.joinProfile(
        userId,
        req.body.profileCode,
        req.body.relationship,
        req.body.notes
      );
      return sendSuccess(res, 'Successfully joined healthcare profile', result);
    } catch (err) {
      next(err);
    }
  }
};
