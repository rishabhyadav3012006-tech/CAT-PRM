import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { recordService } from '../services/record.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const recordController = {
  // 1. Fetch Health Records (paginated)
  getAll: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const elderlyId = req.query.elderlyId as string | undefined;
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 20;

      const result = await recordService.getRecords(elderlyId, page, limit);
      return sendSuccess(res, 'Health vitals retrieved successfully', result);
    } catch (err) {
      next(err);
    }
  },

  // 2. Fetch Historical Records with Date Range Filter
  getHistory: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const elderlyId = req.query.elderlyId as string | undefined;
      const startDate = req.query.startDate as string | undefined;
      const endDate = req.query.endDate as string | undefined;
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 20;

      const history = await recordService.getRecordHistory(elderlyId, startDate, endDate, page, limit);
      return sendSuccess(res, 'Health records history retrieved successfully', history);
    } catch (err) {
      next(err);
    }
  },

  // 3. Record Vitals & Optional Wellness Entry
  create: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const record = await recordService.createRecord(req.user!.userId, req.body, {
        ip: req.ip,
        userAgent: req.get('user-agent')
      });
      return sendSuccess(res, 'Health vital recorded successfully', record, 201);
    } catch (err) {
      next(err);
    }
  },

  // 4. Update Permitted Health Record
  update: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const updated = await recordService.updateRecord(
        req.params.id,
        req.user!.userId,
        req.body,
        {
          ip: req.ip,
          userAgent: req.get('user-agent')
        }
      );
      return sendSuccess(res, 'Health record updated successfully', updated);
    } catch (err) {
      next(err);
    }
  }
};
