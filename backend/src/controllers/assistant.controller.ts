// ==============================================================================
// CareNest Healthcare Platform - Smart Care Assistant Controller
// HTTP Handlers for Routine Summaries, Conversational Queries, and Wellness Logs.
// ==============================================================================

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { assistantService } from '../services/assistant.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const assistantController = {
  // 1. GET /api/v1/assistant/summary
  getSummary: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const elderlyId = (req.query.elderlyId as string) || 'eld-01';
      const userId = req.user?.userId;
      const summary = await assistantService.getDailySummary(elderlyId, userId);
      return sendSuccess(res, 'Daily routine summary fetched successfully', summary);
    } catch (err) {
      next(err);
    }
  },

  // 2. POST /api/v1/assistant/chat
  chat: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { message, elderlyId } = req.body;
      const targetElderlyId = elderlyId || (req.query.elderlyId as string) || 'eld-01';
      const userId = req.user?.userId || 'usr-anonymous';
      const response = await assistantService.processChatMessage(userId, targetElderlyId, message);
      return sendSuccess(res, 'Assistant response generated successfully', response);
    } catch (err) {
      next(err);
    }
  },

  // 3. POST /api/v1/assistant/wellness
  logWellness: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const targetElderlyId = req.body.elderlyId || (req.query.elderlyId as string) || 'eld-01';
      const userId = req.user?.userId || 'usr-anonymous';
      const result = await assistantService.logWellnessTelemetry(userId, targetElderlyId, req.body);
      return sendSuccess(res, result.message, result);
    } catch (err) {
      next(err);
    }
  }
};

