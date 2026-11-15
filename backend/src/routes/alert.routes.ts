import { Router } from 'express';
import { z } from 'zod';
import { alertController } from '../controllers/alert.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';

const router = Router();

const triggerSosSchema = z.object({
  elderlyId: z.string().min(1, 'Elderly profile ID is required'),
  type: z.string().optional(),
  message: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional()
});

const resolveAlertSchema = z.object({
  notes: z.string().min(2, 'Resolution notes are required')
});

router.use(authenticate);

router.get('/emergency-profile', alertController.getEmergencyProfile);
router.post('/sos', validateRequest({ body: triggerSosSchema }), alertController.triggerSos);
router.get('/active', alertController.getActiveAlerts);
router.patch('/:id/resolve', validateRequest({ body: resolveAlertSchema }), alertController.resolveAlert);

export default router;
