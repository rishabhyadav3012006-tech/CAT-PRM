import { Router } from 'express';
import { z } from 'zod';
import { analyticsController } from '../controllers/analytics.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';

const router = Router();

const analyticsQuerySchema = z.object({
  elderlyId: z.string().optional(),
  period: z.enum(['today', 'this_week', 'this_month', 'custom']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  format: z.enum(['html', 'json', 'csv']).optional()
});

router.use(authenticate);

router.get(
  '/overview',
  validateRequest({ query: analyticsQuerySchema }),
  analyticsController.getOverview
);

router.get(
  '/report/download',
  validateRequest({ query: analyticsQuerySchema }),
  analyticsController.downloadReport
);

export default router;

