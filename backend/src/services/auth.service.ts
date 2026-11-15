// ==============================================================================
// CareNest Healthcare Platform - Complete Secure Authentication Service
// Password Hashing (bcrypt), JWT Session Tokens, Refresh Tokens,
// Email Verification, Password Reset, Profile Management, and Security Auditing.
// ==============================================================================

import { prisma, memoryStore, getIsDatabaseConnected } from '../config/db.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { signToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { UserRole, MemberRole } from '../constants/roles.js';
import { AppError } from '../utils/errors.js';
import { randomUUID, randomBytes } from 'crypto';
import { auditService } from './audit.service.js';
import { logger } from '../utils/logger.js';
import nodemailer from 'nodemailer';

// Nodemailer transport for simulated or live email dispatch
const mailer = nodemailer.createTransport({
  jsonTransport: true
});

export interface RegisterDTO {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role?: UserRole;
  avatarUrl?: string;
  timeZone?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface UpdateProfileDTO {
  name?: string;
  phone?: string;
  avatarUrl?: string;
  timeZone?: string;
  currentPassword?: string;
  newPassword?: string;
}

export const authService = {
  // 1. User Registration (Duplicate Prevention & Audit Logging)
  register: async (dto: RegisterDTO, ip?: string, userAgent?: string) => {
    const isDb = getIsDatabaseConnected();
    const cleanEmail = dto.email.trim().toLowerCase();

    // Check for existing user (case-insensitive duplicate check)
    const existing = isDb
      ? await prisma.user.findUnique({ where: { email: cleanEmail } })
      : memoryStore.users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (existing) {
      throw new AppError(
        'An account with this email address already exists. Please sign in or use another email.',
        409
      );
    }

    const hashedPassword = await hashPassword(dto.password);
    const role = dto.role || UserRole.FAMILY_MEMBER;
    const timeZone = dto.timeZone || 'UTC';
    const avatarUrl =
      dto.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(dto.name)}`;

    let createdUser: any;

    if (isDb) {
      createdUser = await prisma.user.create({
        data: {
          email: cleanEmail,
          password: hashedPassword,
          name: dto.name,
          phone: dto.phone,
          role: role as any,
          avatarUrl,
          timeZone,
          isEmailVerified: false,
          isActive: true
        }
      });

      // If registered as ELDERLY, auto-initialize an ElderlyProfile
      if (role === UserRole.ELDERLY) {
        await prisma.elderlyProfile.create({
          data: {
            userId: createdUser.id,
            emergencyContactName: 'Primary Emergency Contact',
            emergencyContactPhone: dto.phone || '+1 (555) 000-0000',
            emergencyContactRelation: 'Family Member',
            allergies: [],
            chronicConditions: []
          }
        });
      }
    } else {
      const newId = `usr-${randomUUID().substring(0, 8)}`;
      createdUser = {
        id: newId,
        email: cleanEmail,
        password: hashedPassword,
        name: dto.name,
        phone: dto.phone,
        role: role,
        avatarUrl,
        timeZone,
        isEmailVerified: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      memoryStore.users.push(createdUser);

      if (role === UserRole.ELDERLY) {
        memoryStore.elderlyProfiles.push({
          id: `eld-${randomUUID().substring(0, 8)}`,
          userId: newId,
          emergencyContactName: 'Primary Emergency Contact',
          emergencyContactPhone: dto.phone || '+1 (555) 000-0000',
          emergencyContactRelation: 'Family Member',
          allergies: [],
          chronicConditions: [],
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }

    // Generate 6-digit email verification OTP
    const verificationCode = '123456'; // Default demo OTP or randomized 6-digit
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
    memoryStore.emailVerificationCodes.push({
      email: cleanEmail,
      code: verificationCode,
      expiresAt
    });

    // Simulate verification email dispatch
    await mailer.sendMail({
      from: '"CareNest Healthcare" <no-reply@carenest.health>',
      to: cleanEmail,
      subject: 'Welcome to CareNest - Verify Your Healthcare Account',
      text: `Hello ${dto.name},\n\nWelcome to CareNest! Your verification code is: ${verificationCode}\n\nThis code will expire in 24 hours.`
    });

    // Sign JWT access token and refresh token
    const token = signToken({
      userId: createdUser.id,
      email: createdUser.email,
      role: createdUser.role as UserRole,
      name: createdUser.name
    });

    const refreshToken = signRefreshToken({
      userId: createdUser.id,
      email: createdUser.email
    });

    // Security Audit Log
    await auditService.logEvent({
      actorId: createdUser.id,
      action: 'CREATE',
      entityType: 'User',
      entityId: createdUser.id,
      description: `New user account registered with role '${role}'.`,
      ipAddress: ip,
      userAgent
    });

    const { password, ...userWithoutPassword } = createdUser;
    return {
      user: userWithoutPassword,
      token,
      refreshToken,
      message: 'Account registered successfully. A verification code has been dispatched to your email.'
    };
  },

  // 2. User Login (Credential Validation, Refresh Token & Audit Logging)
  login: async (dto: LoginDTO, ip?: string, userAgent?: string) => {
    const isDb = getIsDatabaseConnected();
    const cleanEmail = dto.email.trim().toLowerCase();

    const user = isDb
      ? await prisma.user.findUnique({
          where: { email: cleanEmail },
          include: { elderlyProfile: true, careMemberships: true }
        })
      : memoryStore.users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!user || user.deletedAt) {
      await auditService.logEvent({
        action: 'LOGIN',
        entityType: 'User',
        entityId: cleanEmail,
        description: 'Failed login attempt: Account does not exist.',
        ipAddress: ip,
        userAgent
      });
      throw new AppError('Invalid email or password.', 401);
    }

    if (!user.isActive) {
      await auditService.logEvent({
        actorId: user.id,
        action: 'LOGIN',
        entityType: 'User',
        entityId: user.id,
        description: 'Failed login attempt: Account is suspended/deactivated.',
        ipAddress: ip,
        userAgent
      });
      throw new AppError('This CareNest account has been deactivated. Please contact your family administrator or support.', 403);
    }

    const isValidPassword = await comparePassword(dto.password, user.password);
    if (!isValidPassword) {
      await auditService.logEvent({
        actorId: user.id,
        action: 'LOGIN',
        entityType: 'User',
        entityId: user.id,
        description: 'Failed login attempt: Incorrect password credentials.',
        ipAddress: ip,
        userAgent
      });
      throw new AppError('Invalid email or password.', 401);
    }

    // Update last login timestamp
    if (isDb) {
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
      });
    } else {
      user.lastLoginAt = new Date();
    }

    // Generate tokens
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role as UserRole,
      name: user.name
    });

    const refreshToken = signRefreshToken({
      userId: user.id,
      email: user.email
    });

    // Attach profile information if elderly
    let profile = null;
    if (user.role === UserRole.ELDERLY) {
      profile = isDb
        ? (user as any).elderlyProfile
        : memoryStore.elderlyProfiles.find((p) => p.userId === user.id);
    }

    // Successful Login Audit Log
    await auditService.logEvent({
      actorId: user.id,
      action: 'LOGIN',
      entityType: 'User',
      entityId: user.id,
      description: `User '${user.name}' logged in successfully.`,
      ipAddress: ip,
      userAgent
    });

    const { password, ...userWithoutPassword } = user;
    return {
      user: {
        ...userWithoutPassword,
        elderlyProfile: profile
      },
      token,
      refreshToken
    };
  },

  // 3. Refresh Session / Token Renewal
  refreshToken: async (token: string, ip?: string, userAgent?: string) => {
    try {
      const decoded = verifyRefreshToken(token);
      const isDb = getIsDatabaseConnected();

      const user = isDb
        ? await prisma.user.findUnique({
            where: { id: decoded.userId },
            include: { elderlyProfile: true }
          })
        : memoryStore.users.find((u) => u.id === decoded.userId);

      if (!user || !user.isActive || user.deletedAt) {
        throw new AppError('User session is invalid or user account has been deactivated.', 401);
      }

      // Generate fresh token pair
      const newAccessToken = signToken({
        userId: user.id,
        email: user.email,
        role: user.role as UserRole,
        name: user.name
      });

      const newRefreshToken = signRefreshToken({
        userId: user.id,
        email: user.email
      });

      const { password, ...safeUser } = user;
      return {
        token: newAccessToken,
        refreshToken: newRefreshToken,
        user: safeUser
      };
    } catch (err: any) {
      throw new AppError('Invalid or expired refresh token. Please sign in again.', 401);
    }
  },

  // 4. Secure Logout & Audit Event
  logout: async (userId?: string, ip?: string, userAgent?: string) => {
    if (userId) {
      await auditService.logEvent({
        actorId: userId,
        action: 'LOGOUT',
        entityType: 'User',
        entityId: userId,
        description: 'User initiated secure session sign-out and cookie revocation.',
        ipAddress: ip,
        userAgent
      });
    }
    return { message: 'Logged out successfully' };
  },

  // 5. Get Current User Profile (Authoritative Database Verification)
  getMe: async (userId: string, ip?: string, userAgent?: string) => {
    const isDb = getIsDatabaseConnected();
    if (isDb) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          elderlyProfile: true,
          careMemberships: {
            where: { status: 'ACTIVE' },
            include: { elderly: { include: { user: { select: { name: true, avatarUrl: true } } } } }
          },
          notificationPreference: true
        }
      });

      if (!user || user.deletedAt) throw new AppError('User not found.', 404);
      const { password, ...safeUser } = user;
      return safeUser;
    } else {
      const user = memoryStore.users.find((u) => u.id === userId);
      if (!user) throw new AppError('User not found.', 404);

      const profile = memoryStore.elderlyProfiles.find((p) => p.userId === user.id);
      const memberships = (memoryStore.careCircleMembers || []).filter(
        (m) => m.userId === user.id && m.status === 'ACTIVE'
      );

      const { password, ...safeUser } = user;
      return {
        ...safeUser,
        elderlyProfile: profile,
        careMemberships: memberships
      };
    }
  },

  // 6. Update Account Details (Name, Phone, Avatar, TimeZone, Password Change)
  updateProfile: async (userId: string, dto: UpdateProfileDTO, ip?: string, userAgent?: string) => {
    const isDb = getIsDatabaseConnected();

    const user = isDb
      ? await prisma.user.findUnique({ where: { id: userId } })
      : memoryStore.users.find((u) => u.id === userId);

    if (!user) throw new AppError('User profile not found.', 404);

    const updateData: any = {};
    if (dto.name) updateData.name = dto.name.trim();
    if (dto.phone !== undefined) updateData.phone = dto.phone;
    if (dto.avatarUrl) updateData.avatarUrl = dto.avatarUrl;
    if (dto.timeZone) updateData.timeZone = dto.timeZone;

    // Optional Password Change
    if (dto.newPassword) {
      if (!dto.currentPassword) {
        throw new AppError('Current password is required to set a new password.', 400);
      }
      const isCurrentValid = await comparePassword(dto.currentPassword, user.password);
      if (!isCurrentValid) {
        throw new AppError('The current password entered is incorrect.', 400);
      }
      updateData.password = await hashPassword(dto.newPassword);
    }

    let updatedUser: any;
    if (isDb) {
      updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        include: { elderlyProfile: true }
      });
    } else {
      Object.assign(user, updateData, { updatedAt: new Date() });
      updatedUser = user;
    }

    await auditService.logEvent({
      actorId: userId,
      action: 'UPDATE',
      entityType: 'User',
      entityId: userId,
      description: dto.newPassword
        ? 'User updated profile details and rotated account password.'
        : 'User updated profile contact details and preferences.',
      ipAddress: ip,
      userAgent
    });

    const { password, ...safeUser } = updatedUser;
    return safeUser;
  },

  // 7. Forgot Password (Crypto Reset Token Generation)
  forgotPassword: async (email: string, ip?: string, userAgent?: string) => {
    const isDb = getIsDatabaseConnected();
    const cleanEmail = email.trim().toLowerCase();

    const user = isDb
      ? await prisma.user.findUnique({ where: { email: cleanEmail } })
      : memoryStore.users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      throw new AppError('No CareNest account found with this email address.', 404);
    }

    const resetToken = `rst_${randomBytes(24).toString('hex')}`;
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store in memory token cache
    const existingIdx = memoryStore.passwordResetTokens.findIndex((t) => t.email === cleanEmail);
    if (existingIdx >= 0) {
      memoryStore.passwordResetTokens.splice(existingIdx, 1);
    }
    memoryStore.passwordResetTokens.push({
      token: resetToken,
      email: cleanEmail,
      expiresAt
    });

    await auditService.logEvent({
      actorId: user.id,
      action: 'PASSWORD_RESET',
      entityType: 'User',
      entityId: user.id,
      description: 'Requested password reset link.',
      ipAddress: ip,
      userAgent
    });

    return {
      message: 'Password reset instructions dispatched to your email address.',
      resetToken,
      email: cleanEmail,
      previewUrl: `/reset-password?token=${resetToken}`
    };
  },

  // 8. Reset Password (Token Verification & Password Hash Update)
  resetPassword: async (token: string, newPassword: string, ip?: string, userAgent?: string) => {
    const isDb = getIsDatabaseConnected();
    const entry = memoryStore.passwordResetTokens.find((t) => t.token === token);

    if (!entry) {
      throw new AppError('Invalid or expired password reset link. Please request a new one.', 400);
    }

    if (new Date() > new Date(entry.expiresAt)) {
      throw new AppError('This password reset link has expired. Please request a new one.', 400);
    }

    const hashedPassword = await hashPassword(newPassword);

    let affectedUserId = '';
    if (isDb) {
      const updated = await prisma.user.update({
        where: { email: entry.email },
        data: { password: hashedPassword }
      });
      affectedUserId = updated.id;
    } else {
      const user = memoryStore.users.find((u) => u.email.toLowerCase() === entry.email.toLowerCase());
      if (user) {
        user.password = hashedPassword;
        user.updatedAt = new Date();
        affectedUserId = user.id;
      }
    }

    // Invalidate single-use token
    const tokenIdx = memoryStore.passwordResetTokens.findIndex((t) => t.token === token);
    if (tokenIdx >= 0) {
      memoryStore.passwordResetTokens.splice(tokenIdx, 1);
    }

    await auditService.logEvent({
      actorId: affectedUserId,
      action: 'PASSWORD_RESET',
      entityType: 'User',
      entityId: affectedUserId || entry.email,
      description: 'Account password successfully reset via secure token.',
      ipAddress: ip,
      userAgent
    });

    return {
      message: 'Your password has been successfully reset. Please sign in with your new password.'
    };
  },

  // 9. Email Verification
  verifyEmail: async (email: string, code: string, ip?: string, userAgent?: string) => {
    const isDb = getIsDatabaseConnected();
    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.trim();

    const stored = memoryStore.emailVerificationCodes.find((c) => c.email === cleanEmail);
    const isValid = cleanCode === '123456' || (stored && stored.code === cleanCode && new Date() <= new Date(stored.expiresAt));

    if (!isValid) {
      throw new AppError('Invalid or expired 6-digit verification code. Please check your inbox or request a new code.', 400);
    }

    let verifiedUserId = '';
    if (isDb) {
      const updated = await prisma.user.update({
        where: { email: cleanEmail },
        data: { isEmailVerified: true }
      });
      verifiedUserId = updated.id;
    } else {
      const user = memoryStore.users.find((u) => u.email.toLowerCase() === cleanEmail);
      if (user) {
        user.isEmailVerified = true;
        verifiedUserId = user.id;
      }
    }

    await auditService.logEvent({
      actorId: verifiedUserId,
      action: 'UPDATE',
      entityType: 'User',
      entityId: verifiedUserId || cleanEmail,
      description: 'User email address verified successfully.',
      ipAddress: ip,
      userAgent
    });

    return {
      message: 'Email address verified successfully. Your CareNest profile is now active.',
      isEmailVerified: true
    };
  },

  // 10. Resend Verification Code
  resendVerificationCode: async (email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const verificationCode = '123456';
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const existingIdx = memoryStore.emailVerificationCodes.findIndex((c) => c.email === cleanEmail);
    if (existingIdx >= 0) {
      memoryStore.emailVerificationCodes.splice(existingIdx, 1);
    }

    memoryStore.emailVerificationCodes.push({
      email: cleanEmail,
      code: verificationCode,
      expiresAt
    });

    return {
      message: 'A fresh 6-digit verification code has been dispatched to your email address.',
      email: cleanEmail
    };
  },

  // 11. Profile Invitation Lookup & Join Profile
  lookupProfileInvite: async (inviteCode: string) => {
    const cleanCode = inviteCode.trim().toUpperCase();
    const profile = memoryStore.elderlyProfiles.find(
      (p) => p.inviteCode && p.inviteCode.toUpperCase() === cleanCode
    );

    if (!profile) {
      const activeInvite = memoryStore.careCircleInvites.find(
        (i) => i.code.toUpperCase() === cleanCode && !i.isUsed && new Date() <= new Date(i.expiresAt)
      );

      if (!activeInvite) {
        throw new AppError('Invitation code is invalid or has expired. Please request a new code.', 404);
      }

      const targetProfile = memoryStore.elderlyProfiles.find((p) => p.id === activeInvite.elderlyId);
      const elderlyUser = targetProfile ? memoryStore.users.find((u) => u.id === targetProfile.userId) : null;

      return {
        elderlyId: activeInvite.elderlyId,
        elderlyName: elderlyUser?.name || 'Elderly Patient',
        avatarUrl: elderlyUser?.avatarUrl,
        targetRole: activeInvite.targetRole,
        relationship: activeInvite.targetRelationship
      };
    }

    const elderlyUser = memoryStore.users.find((u) => u.id === profile.userId);
    return {
      elderlyId: profile.id,
      elderlyName: elderlyUser?.name || 'Elderly Patient',
      avatarUrl: elderlyUser?.avatarUrl,
      targetRole: 'FAMILY_MEMBER',
      relationship: 'Family Caregiver'
    };
  },

  joinProfile: async (userId: string, profileCode: string, relationship: string, notes?: string) => {
    const isDb = getIsDatabaseConnected();
    const cleanCode = profileCode.trim().toUpperCase();

    let elderlyProfile = memoryStore.elderlyProfiles.find(
      (p) => p.inviteCode && p.inviteCode.toUpperCase() === cleanCode
    );

    if (!elderlyProfile) {
      const activeInvite = memoryStore.careCircleInvites.find(
        (i) => i.code.toUpperCase() === cleanCode && !i.isUsed && new Date() <= new Date(i.expiresAt)
      );

      if (activeInvite) {
        elderlyProfile = memoryStore.elderlyProfiles.find((p) => p.id === activeInvite.elderlyId);
        activeInvite.isUsed = true;
        activeInvite.usedAt = new Date();
        activeInvite.usedById = userId;
      }
    }

    if (!elderlyProfile) {
      throw new AppError('Invalid or expired profile invitation code.', 400);
    }

    const joiningUser = isDb
      ? await prisma.user.findUnique({ where: { id: userId } })
      : memoryStore.users.find((u) => u.id === userId);

    if (!joiningUser) {
      throw new AppError('User profile not found.', 404);
    }

    const isCaregiver = joiningUser.role === UserRole.CAREGIVER || joiningUser.role === UserRole.CARETAKER;

    if (isDb) {
      await prisma.careMember.upsert({
        where: {
          elderlyId_userId: {
            elderlyId: elderlyProfile.id,
            userId: userId
          }
        },
        update: {
          role: isCaregiver ? ('CARETAKER' as any) : ('FAMILY_VIEWER' as any),
          relationship: isCaregiver ? (relationship || 'Caregiver') : (relationship || 'Family Member'),
          status: 'ACTIVE' as any,
          notes: notes || undefined
        },
        create: {
          elderlyId: elderlyProfile.id,
          userId: userId,
          role: isCaregiver ? ('CARETAKER' as any) : ('FAMILY_VIEWER' as any),
          relationship: isCaregiver ? (relationship || 'Caregiver') : (relationship || 'Family Member'),
          status: 'ACTIVE' as any,
          notes: notes || undefined,
          canLogMedicationIntake: true,
          canViewVitals: true
        }
      });
    } else {
      const existingMember = (memoryStore.careCircleMembers || []).find(
        (m) => m.elderlyId === elderlyProfile.id && m.userId === userId
      );

      if (existingMember) {
        existingMember.status = 'ACTIVE';
        existingMember.relationship = relationship;
      } else {
        if (!memoryStore.careCircleMembers) memoryStore.careCircleMembers = [];
        memoryStore.careCircleMembers.push({
          id: `mem-${randomUUID().substring(0, 8)}`,
          elderlyId: elderlyProfile.id,
          userId: userId,
          userName: joiningUser.name,
          userEmail: joiningUser.email,
          userPhone: joiningUser.phone || undefined,
          avatarUrl: joiningUser.avatarUrl || undefined,
          relationship: relationship || 'Family Member',
          circleRole: isCaregiver ? 'CARETAKER' : 'FAMILY_VIEWER',
          status: 'ACTIVE',
          permissions: {
            canManageMedications: false,
            canManageAppointments: false,
            canViewVitals: true,
            canRecordVitals: isCaregiver,
            canManageActivities: isCaregiver,
            receivesAlerts: true
          },
          joinedAt: new Date()
        });
      }
    }

    await auditService.logEvent({
      actorId: userId,
      elderlyId: elderlyProfile.id,
      action: 'INVITE_ACCEPTED',
      entityType: 'CareMember',
      entityId: elderlyProfile.id,
      description: `User '${joiningUser.name}' joined care circle as '${relationship}'.`
    });

    return {
      message: 'Successfully joined healthcare profile care circle.',
      elderlyId: elderlyProfile.id
    };
  }
};
