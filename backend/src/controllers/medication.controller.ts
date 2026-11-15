// ==============================================================================
// CareNest Healthcare Platform - Medication Controller
// Full Clinical Protocol Management, Multi-Dose Schedules,
// Daily Adherence Timeline, Dose Logging, Refill Alerts, and Analytics.
// ==============================================================================

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { medicationService } from '../services/medication.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { AppError } from '../utils/errors.js';
import { UserRole } from '../constants/roles.js';
import { prisma, memoryStore, getIsDatabaseConnected } from '../config/db.js';

export const medicationController = {
  // 1. Fetch all medications (with optional filtering)
  getAll: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const elderlyId = req.query.elderlyId as string | undefined;
      const includeArchived = req.query.includeArchived === 'true';
      const medications = await medicationService.getMedications(elderlyId, includeArchived);
      return sendSuccess(res, 'Medications retrieved successfully', medications);
    } catch (err) {
      next(err);
    }
  },

  // 2. Fetch medication details by ID
  getById: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const medication = await medicationService.getMedicationById(req.params.id);
      return sendSuccess(res, 'Medication details retrieved successfully', medication);
    } catch (err) {
      next(err);
    }
  },

  // 3. Add new medication prescription
  create: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const medication = await medicationService.createMedication(
        req.user!.userId,
        req.body,
        req.ip,
        req.headers['user-agent'] as string
      );
      return sendSuccess(res, 'Medication schedule created successfully', medication, 201);
    } catch (err) {
      next(err);
    }
  },

  // 4. Update existing medication details
  update: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const medication = await medicationService.updateMedication(
        req.params.id,
        req.body,
        req.user!.userId,
        req.ip,
        req.headers['user-agent'] as string
      );
      return sendSuccess(res, 'Medication updated successfully', medication);
    } catch (err) {
      next(err);
    }
  },

  // 5. Archive / discontinue medication
  archive: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const result = await medicationService.archiveMedication(
        req.params.id,
        req.user!.userId,
        req.ip,
        req.headers['user-agent'] as string
      );
      return sendSuccess(res, 'Medication archived successfully', result);
    } catch (err) {
      next(err);
    }
  },

  // 6. Create medication schedule slot
  createSchedule: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const schedule = await medicationService.createSchedule(
        req.params.id,
        req.body,
        req.user!.userId
      );
      return sendSuccess(res, 'Medication schedule slot created successfully', schedule, 201);
    } catch (err) {
      next(err);
    }
  },

  // 7. Update medication schedule slot
  updateSchedule: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const schedule = await medicationService.updateSchedule(
        req.params.scheduleId,
        req.body,
        req.user!.userId
      );
      return sendSuccess(res, 'Medication schedule updated successfully', schedule);
    } catch (err) {
      next(err);
    }
  },

  // 8. Fetch Today's Medication Schedule (Daily Timeline with Statuses)
  getTodaySchedule: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      let elderlyId = req.query.elderlyId as string | undefined;

      if (!elderlyId && req.user?.role === UserRole.ELDERLY) {
        const isDb = getIsDatabaseConnected();
        if (isDb) {
          const profile = await prisma.elderlyProfile.findFirst({
            where: { userId: req.user.userId },
            select: { id: true }
          });
          if (profile) elderlyId = profile.id;
        } else {
          const profile = memoryStore.elderlyProfiles.find((p) => p.userId === req.user!.userId);
          if (profile) elderlyId = profile.id;
        }
      }

      if (!elderlyId) {
        throw new AppError('elderlyId query parameter is required to fetch daily medication schedule', 400);
      }

      const targetDate = req.query.date as string | undefined;
      const timeZone = (req.query.timeZone as string) || 'America/New_York';
      const schedule = await medicationService.getTodaySchedule(elderlyId, targetDate, timeZone);
      return sendSuccess(res, "Today's medication schedule retrieved", schedule);
    } catch (err) {
      next(err);
    }
  },

  // 9. Record medication dose as TAKEN
  recordTaken: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const medicationId = req.params.id;
      const log = await medicationService.recordTaken(
        {
          medicationId,
          ...req.body,
          loggedById: req.user!.userId
        },
        req.user!.userId,
        req.ip,
        req.headers['user-agent'] as string
      );
      return sendSuccess(res, 'Medication dose recorded as taken', log, 201);
    } catch (err) {
      next(err);
    }
  },

  // 10. Record medication dose as SKIPPED (Requires clinical reason)
  recordSkipped: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const medicationId = req.params.id;
      const log = await medicationService.recordSkipped(
        {
          medicationId,
          ...req.body,
          loggedById: req.user!.userId
        },
        req.user!.userId,
        req.ip,
        req.headers['user-agent'] as string
      );
      return sendSuccess(res, 'Medication dose recorded as skipped', log, 201);
    } catch (err) {
      next(err);
    }
  },

  // Generic Adherence Logger
  logAdherence: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const log = await medicationService.logAdherence(
        {
          ...req.body,
          loggedById: req.user!.userId
        },
        req.ip,
        req.headers['user-agent'] as string
      );
      return sendSuccess(res, 'Medication adherence logged successfully', log, 201);
    } catch (err) {
      next(err);
    }
  },

  // 11. Fetch intake history
  getHistory: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const elderlyId = req.query.elderlyId as string | undefined;
      const medicationId = req.query.medicationId as string | undefined;
      const history = await medicationService.getMedicationHistory(elderlyId, medicationId);
      return sendSuccess(res, 'Medication intake history retrieved', history);
    } catch (err) {
      next(err);
    }
  },

  // 12. Adherence statistics and trends
  getStats: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const elderlyId = req.params.elderlyId;
      const periodDays = req.query.days ? parseInt(req.query.days as string, 10) : 30;
      const stats = await medicationService.getAdherenceStats(elderlyId, periodDays);
      return sendSuccess(res, 'Medication adherence statistics retrieved', stats);
    } catch (err) {
      next(err);
    }
  },

  // 13. Medication Refill Tracking
  refill: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const quantity = req.body.quantity ? parseInt(req.body.quantity, 10) : 30;
      const result = await medicationService.refillMedication(req.params.id, quantity, req.user!.userId);
      return sendSuccess(res, 'Medication refilled successfully', result);
    } catch (err) {
      next(err);
    }
  }
};
