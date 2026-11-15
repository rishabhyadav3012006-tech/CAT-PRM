// ==============================================================================
// CareNest Healthcare Platform - Complete Secure Authentication Routes
// Validated with Zod, protected with Rate Limiting, HTTP-only Cookies,
// and Granular Authorization Guards.
// ==============================================================================

import { Router } from 'express';
import { z } from 'zod';
import { authController } from '../controllers/auth.controller.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { loginRateLimiter, authActionRateLimiter } from '../middleware/rate-limit.middleware.js';
import { UserRole } from '../constants/roles.js';

const router = Router();

// Validation Schemas
const registerSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  phone: z.string().optional(),
  role: z.nativeEnum(UserRole).optional(),
  avatarUrl: z.string().url().optional(),
  timeZone: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(1, 'Password is required')
});

const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long').optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().url('Avatar must be a valid URL').optional().or(z.literal('')),
  timeZone: z.string().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, 'New password must be at least 6 characters long').optional()
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address')
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Password reset token is required'),
  password: z.string().min(6, 'New password must be at least 6 characters long')
});

const verifyEmailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  code: z.string().min(4, 'Verification code must be at least 4 digits')
});

const resendCodeSchema = z.object({
  email: z.string().email('Please enter a valid email address')
});

const joinProfileSchema = z.object({
  profileCode: z.string().min(1, 'Profile invitation code is required'),
  relationship: z.string().min(2, 'Please state your relationship (e.g. Daughter, Caretaker)'),
  notes: z.string().optional()
});

// Authentication Lifecycle Routes
// 1. Registration
router.post(
  '/register',
  authActionRateLimiter.middleware(),
  validateRequest({ body: registerSchema }),
  authController.register
);

// 2. Login (Protected with sliding-window brute-force rate limiter)
router.post(
  '/login',
  loginRateLimiter.middleware(),
  validateRequest({ body: loginSchema }),
  authController.login
);

// 3. Refresh Session
router.post('/refresh', authController.refreshToken);

// 4. Authenticated Profile & Session Management
router.get('/me', authenticate, authController.getMe);
router.patch(
  '/profile',
  authenticate,
  validateRequest({ body: updateProfileSchema }),
  authController.updateProfile
);
router.post('/logout', authenticate, authController.logout);

// 5. Recovery & Verification Routes
router.post(
  '/forgot-password',
  authActionRateLimiter.middleware(),
  validateRequest({ body: forgotPasswordSchema }),
  authController.forgotPassword
);

router.post(
  '/reset-password',
  authActionRateLimiter.middleware(),
  validateRequest({ body: resetPasswordSchema }),
  authController.resetPassword
);

router.post(
  '/verify-email',
  authActionRateLimiter.middleware(),
  validateRequest({ body: verifyEmailSchema }),
  authController.verifyEmail
);

router.post(
  '/resend-code',
  authActionRateLimiter.middleware(),
  validateRequest({ body: resendCodeSchema }),
  authController.resendCode
);

// 6. Care Circle Profile Join Routes
router.get('/profile-invite/:code', authController.lookupProfileInvite);
router.post(
  '/join-profile',
  authenticate,
  validateRequest({ body: joinProfileSchema }),
  authController.joinProfile
);

export default router;
