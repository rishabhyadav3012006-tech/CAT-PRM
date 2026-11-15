import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { alertService } from '../services/alert.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const alertController = {
  getEmergencyProfile: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const elderlyId = (req.query.elderlyId as string) || 'eld-01';
      const profile = await alertService.getEmergencyProfile(elderlyId);
      return sendSuccess(res, 'Emergency medical profile retrieved successfully', profile);
    } catch (err) {
      next(err);
    }
  },

  triggerSos: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const alert = await alertService.triggerSos(req.user!.userId, req.body);
      return sendSuccess(res, '🚨 EMERGENCY SOS DISPATCHED: Care team & emergency contacts notified!', alert, 201);
    } catch (err) {
      next(err);
    }
  },

  getActiveAlerts: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const alerts = await alertService.getActiveAlerts();
      return sendSuccess(res, 'Active emergency alerts retrieved', alerts);
    } catch (err) {
      next(err);
    }
  },

  resolveAlert: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const resolved = await alertService.resolveAlert(req.params.id, req.body.notes || 'Resolved by responder.');
      return sendSuccess(res, 'Emergency alert resolved', resolved);
    } catch (err) {
      next(err);
    }
  }
};
