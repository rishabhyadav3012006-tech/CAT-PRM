import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { elderlyService } from '../services/elderly.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const elderlyController = {
  getAll: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const list = await elderlyService.getAllElderly();
      return sendSuccess(res, 'Elderly profiles fetched successfully', list);
    } catch (err) {
      next(err);
    }
  },

  getById: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const profile = await elderlyService.getProfileById(req.params.id);
      return sendSuccess(res, 'Elderly profile details retrieved', profile);
    } catch (err) {
      next(err);
    }
  },

  update: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const updated = await elderlyService.updateProfile(req.params.id, req.body);
      return sendSuccess(res, 'Elderly health profile updated successfully', updated);
    } catch (err) {
      next(err);
    }
  }
};

