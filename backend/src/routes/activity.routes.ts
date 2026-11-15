import { Router } from 'express';
import { z } from 'zod';
import { activityController } from '../controllers/activity.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { ActivityCategory, ActivityStatus } from '../constants/roles.js';

const router = Router();

const createActivitySchema = z.object({
  elderlyId: z.string().min(1, 'Elderly ID is required'),
  assignedToId: z.string().optional(),
  title: z.string().min(2, 'Activity title is required'),
  description: z.string().optional(),
  category: z.nativeEnum(ActivityCategory),
  scheduledDate: z.string(),
  scheduledTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format'),
  notes: z.string().optional()
});

const recordObservationSchema = z.object({
  observations: z.string().min(1, 'Clinical observation text is required'),
  notes: z.string().optional()
});

const updateStatusSchema = z.object({
  status: z.nativeEnum(ActivityStatus),
  notes: z.string().optional()
});

router.use(authenticate);

// Specific routes before parameterized :id
router.get('/timeline', activityController.getTimeline);
router.get('/', activityController.getAll);

router.post('/', validateRequest({ body: createActivitySchema }), activityController.create);
router.post('/:id/observations', validateRequest({ body: recordObservationSchema }), activityController.recordObservation);
router.patch('/:id/status', validateRequest({ body: updateStatusSchema }), activityController.updateStatus);

export default router;
