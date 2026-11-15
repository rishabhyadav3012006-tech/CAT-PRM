import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { dashboardService } from '../services/dashboard.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const dashboardController = {
  getOverview: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const elderlyId = req.query.elderlyId as string | undefined;
      const data = await dashboardService.getOverview(elderlyId);
      return sendSuccess(res, 'Dashboard overview metrics retrieved', data);
    } catch (err) {
      next(err);
    }
  }
};

