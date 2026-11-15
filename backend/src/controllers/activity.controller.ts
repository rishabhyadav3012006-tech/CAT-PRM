import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { activityService } from '../services/activity.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { ActivityCategory, ActivityStatus } from '../constants/roles.js';

export const activityController = {
  // 1. Fetch Care Activities (with filters & pagination)
  getAll: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const elderlyId = req.query.elderlyId as string | undefined;
      const date = req.query.date as string | undefined;
      const userId = req.query.userId as string | undefined;
      const category = req.query.category as ActivityCategory | undefined;
      const status = req.query.status as ActivityStatus | undefined;
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 20;

      const result = await activityService.getActivities({
        elderlyId,
        date,
        userId,
        category,
        status,
        page,
        limit
      });
      return sendSuccess(res, 'Care activities retrieved successfully', result);
    } catch (err) {
      next(err);
    }
  },

  // 2. Care Activity Timeline Feed
  getTimeline: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const elderlyId = req.query.elderlyId as string | undefined;
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 20;

      const timeline = await activityService.getTimeline(elderlyId, page, limit);
      return sendSuccess(res, 'Care activity timeline retrieved successfully', timeline);
    } catch (err) {
      next(err);
    }
  },

  // 3. Create Scheduled Routine Care Activity
  create: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const activity = await activityService.createActivity(req.user!.userId, req.body, {
        ip: req.ip,
        userAgent: req.get('user-agent')
      });
      return sendSuccess(res, 'Care routine task scheduled successfully', activity, 201);
    } catch (err) {
      next(err);
    }
  },

  // 4. Record Clinical Observations on Care Activity
  recordObservation: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { observations, notes } = req.body;
      const activityId = req.params.id;
      const updated = await activityService.recordObservation(
        activityId,
        req.user!.userId,
        observations,
        notes,
        {
          ip: req.ip,
          userAgent: req.get('user-agent')
        }
      );
      return sendSuccess(res, 'Health observation recorded on care activity successfully', updated);
    } catch (err) {
      next(err);
    }
  },

  // 5. Update Activity Status (e.g. COMPLETED, IN_PROGRESS, SKIPPED)
  updateStatus: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const updated = await activityService.updateStatus(
        req.params.id,
        req.body.status,
        req.body.notes,
        req.user!.userId,
        {
          ip: req.ip,
          userAgent: req.get('user-agent')
        }
      );
      return sendSuccess(res, 'Care task status updated', updated);
    } catch (err) {
      next(err);
    }
  }
};
