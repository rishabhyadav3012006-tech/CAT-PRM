// ==============================================================================
// CareNest Healthcare Platform - Authentication & Authorization Middleware
// Role-based Access Control (RBAC) & Profile-Level Granular Permissions (PBAC)
// Never trusts client-supplied roles; verifies against active database credentials.
// ==============================================================================

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { verifyToken } from '../utils/jwt.js';
import { sendError } from '../utils/apiResponse.js';
import { UserRole, CareMemberPermissions } from '../constants/roles.js';
import { prisma, memoryStore, getIsDatabaseConnected } from '../config/db.js';
import { logger } from '../utils/logger.js';

// 1. Authenticate Token Middleware
// Extracts JWT from HTTP-only cookie or Authorization header, validates signature,
// and ensures the user account is active in the database.
export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies) {
      token = req.cookies.carenest_token || req.cookies.token;
    }

    if (!token) {
      return sendError(res, 'Authentication required. No session or authorization token found.', 401);
    }

    const decoded = verifyToken(token);

    // Verify user actively exists in database and has not been deactivated or soft-deleted
    const isDb = getIsDatabaseConnected();
    let dbUser: any;

    if (isDb) {
      dbUser = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, name: true, role: true, isActive: true, deletedAt: true }
      });
    } else {
      dbUser = memoryStore.users.find((u) => u.id === decoded.userId);
    }

    if (!dbUser) {
      return sendError(res, 'The user account associated with this session no longer exists.', 401);
    }

    if (!dbUser.isActive || dbUser.deletedAt) {
      return sendError(res, 'This user account has been deactivated. Please contact support.', 403);
    }

    // Attach verified user payload (using fresh authoritative DB role, never trust frontend)
    req.user = {
      userId: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role as UserRole
    };

    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 'Your secure session has expired. Please sign in again or refresh session.', 401);
    }
    return sendError(res, 'Invalid authentication session.', 401);
  }
};

// 2. Role-Based Authorization Middleware
// Verifies user possesses one of the allowed global system roles
export const requireRoles = (...allowedRoles: (UserRole | string)[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 'Authentication required.', 401);
    }

    const userRole = req.user.role;
    // Normalize CAREGIVER and CARETAKER synonyms
    const isAuthorized = allowedRoles.some((role) => {
      if (role === userRole) return true;
      if ((role === 'CAREGIVER' || role === 'CARETAKER') && (userRole === 'CAREGIVER' || userRole === 'CARETAKER')) {
        return true;
      }
      return false;
    });

    if (!isAuthorized) {
      logger.warn(`[AUTHORIZATION] Access denied for user ${req.user.userId} (${userRole}) to role-guarded route. Allowed: ${allowedRoles.join(', ')}`);
      return sendError(
        res,
        `Access denied. Role '${userRole}' is not authorized to access this resource.`,
        403
      );
    }

    next();
  };
};

// 3. Profile-Level Granular Permission Middleware
// Verifies user has explicit permission for the target elderly patient profile
export const requirePermission = (
  permissionKey: keyof CareMemberPermissions,
  elderlyIdParam = 'elderlyId'
) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return sendError(res, 'Authentication required.', 401);
      }

      // Extract target elderly profile ID from params, query, or body
      let targetElderlyId =
        req.params[elderlyIdParam] ||
        (req.query[elderlyIdParam] as string) ||
        req.body?.[elderlyIdParam];

      const isDb = getIsDatabaseConnected();

      // If targetElderlyId is not explicit, attempt smart lookup via medicationId
      if (!targetElderlyId && req.body?.medicationId) {
        const medId = req.body.medicationId;
        if (isDb) {
          const med = await prisma.medication.findUnique({
            where: { id: medId },
            select: { elderlyId: true }
          });
          if (med) targetElderlyId = med.elderlyId;
        } else {
          const med = memoryStore.medications.find((m) => m.id === medId);
          if (med) targetElderlyId = med.elderlyId;
        }
      }

      // If params.id is present and targetElderlyId is still unknown, look up the appointment, medication, activity, or record
      if (!targetElderlyId && req.params?.id) {
        const potentialId = req.params.id;
        if (isDb) {
          const appt = await prisma.appointment.findUnique({
            where: { id: potentialId },
            select: { elderlyId: true }
          });
          if (appt) {
            targetElderlyId = appt.elderlyId;
          } else {
            const med = await prisma.medication.findUnique({
              where: { id: potentialId },
              select: { elderlyId: true }
            });
            if (med) {
              targetElderlyId = med.elderlyId;
            } else {
              const act = await prisma.careActivity.findUnique({
                where: { id: potentialId },
                select: { elderlyId: true }
              });
              if (act) {
                targetElderlyId = act.elderlyId;
              } else {
                const doc = await prisma.medicalRecord.findUnique({
                  where: { id: potentialId },
                  select: { elderlyId: true }
                });
                if (doc) {
                  targetElderlyId = doc.elderlyId;
                } else {
                  const log = await prisma.healthLog.findUnique({
                    where: { id: potentialId },
                    select: { elderlyId: true }
                  });
                  if (log) targetElderlyId = log.elderlyId;
                }
              }
            }
          }
        } else {
          const appt = memoryStore.appointments.find((a) => a.id === potentialId);
          if (appt) {
            targetElderlyId = appt.elderlyId;
          } else {
            const med = memoryStore.medications.find((m) => m.id === potentialId);
            if (med) {
              targetElderlyId = med.elderlyId;
            } else {
              const act = memoryStore.careActivities.find((a) => a.id === potentialId);
              if (act) {
                targetElderlyId = act.elderlyId;
              } else {
                const doc = memoryStore.vaultDocuments.find((d) => d.id === potentialId);
                if (doc) {
                  targetElderlyId = doc.elderlyId;
                } else {
                  const rec = memoryStore.healthRecords.find((r) => r.id === potentialId);
                  if (rec) targetElderlyId = rec.elderlyId;
                }
              }
            }
          }
        }
      }

      // If params.scheduleId is present and targetElderlyId is still unknown, look up via schedule
      if (!targetElderlyId && req.params?.scheduleId) {
        const schId = req.params.scheduleId;
        if (isDb) {
          const sch = await prisma.medicationSchedule.findUnique({
            where: { id: schId },
            include: { medication: { select: { elderlyId: true } } }
          });
          if (sch?.medication) targetElderlyId = sch.medication.elderlyId;
        } else {
          const sch = (memoryStore.medicationSchedules || []).find((s) => s.id === schId);
          if (sch) {
            const med = memoryStore.medications.find((m) => m.id === sch.medicationId);
            if (med) targetElderlyId = med.elderlyId;
          }
        }
      }

      if (!targetElderlyId) {
        // If still no specific elderly profile is targeted, allow route handler to process
        return next();
      }

      const userId = req.user.userId;
      const userRole = req.user.role;

      // Rule A: System ADMIN has full administrative oversight
      if (userRole === UserRole.ADMIN) {
        return next();
      }

      // Rule B: If user is ELDERLY, check if this is their own profile (Primary Owner)
      if (userRole === UserRole.ELDERLY) {
        let isOwner = false;
        if (isDb) {
          const profile = await prisma.elderlyProfile.findFirst({
            where: { id: targetElderlyId, userId }
          });
          isOwner = !!profile;
        } else {
          isOwner = memoryStore.elderlyProfiles.some(
            (p) => (p.id === targetElderlyId || p.userId === targetElderlyId) && p.userId === userId
          );
        }

        if (isOwner) {
          return next();
        }
      }

      // Rule C: Check CareMember membership and explicit permission grant
      let hasPermission = false;
      let memberStatus = 'NONE';

      if (isDb) {
        const member = await prisma.careMember.findFirst({
          where: {
            elderlyId: targetElderlyId,
            userId: userId,
            status: 'ACTIVE'
          }
        });

        if (member) {
          memberStatus = member.status;
          hasPermission = !!(member as any)[permissionKey];
        }
      } else {
        const member = (memoryStore.careCircleMembers || []).find(
          (m) => m.elderlyId === targetElderlyId && m.userId === userId && m.status === 'ACTIVE'
        );

        if (member) {
          memberStatus = member.status;
          // Check permissions dictionary
          hasPermission = !!(member.permissions as any)[permissionKey];
        }
      }

      if (!hasPermission) {
        logger.warn(
          `[AUTHORIZATION] User ${userId} denied permission '${permissionKey}' for elderly ${targetElderlyId}. Member status: ${memberStatus}`
        );
        return sendError(
          res,
          `Permission denied. You do not possess the required permission '${permissionKey}' for this healthcare profile.`,
          403
        );
      }

      next();
    } catch (err: any) {
      logger.error(`Error in requirePermission middleware: ${err.message}`);
      return sendError(res, 'Failed to verify profile authorization permissions.', 500);
    }
  };
};

// 4. Require Profile Access (User must belong to the patient's care team or be patient)
export const requireProfileAccess = (elderlyIdParam = 'elderlyId') => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return sendError(res, 'Authentication required.', 401);
      }

      const targetElderlyId =
        req.params[elderlyIdParam] ||
        (req.query[elderlyIdParam] as string) ||
        req.body[elderlyIdParam] ||
        req.params.id;

      if (!targetElderlyId) {
        return next();
      }

      const userId = req.user.userId;
      const userRole = req.user.role;

      if (userRole === UserRole.ADMIN) {
        return next();
      }

      const isDb = getIsDatabaseConnected();

      // Check ownership
      if (userRole === UserRole.ELDERLY) {
        let isOwner = false;
        if (isDb) {
          const profile = await prisma.elderlyProfile.findFirst({
            where: { id: targetElderlyId, userId }
          });
          isOwner = !!profile;
        } else {
          isOwner = memoryStore.elderlyProfiles.some(
            (p) => (p.id === targetElderlyId || p.userId === targetElderlyId) && p.userId === userId
          );
        }

        if (isOwner) return next();
      }

      // Check membership
      let isMember = false;
      if (isDb) {
        const member = await prisma.careMember.findFirst({
          where: { elderlyId: targetElderlyId, userId, status: 'ACTIVE' }
        });
        isMember = !!member;
      } else {
        isMember = (memoryStore.careCircleMembers || []).some(
          (m) => m.elderlyId === targetElderlyId && m.userId === userId && m.status === 'ACTIVE'
        );
      }

      if (!isMember) {
        return sendError(
          res,
          'Access denied. You are not an authorized member of this patient’s care circle.',
          403
        );
      }

      next();
    } catch (err: any) {
      return sendError(res, 'Authorization verification error.', 500);
    }
  };
};
