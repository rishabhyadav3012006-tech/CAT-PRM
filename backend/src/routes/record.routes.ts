import { Router } from 'express';
import { z } from 'zod';
import { recordController } from '../controllers/record.controller.js';
import { authenticate, requirePermission } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';

const router = Router();

const createRecordSchema = z.object({
  elderlyId: z.string().min(1, 'Elderly ID is required'),
  systolicBp: z.number().int().min(50).max(250).optional(),
  diastolicBp: z.number().int().min(30).max(180).optional(),
  bloodGlucose: z.number().min(30).max(600).optional(),
  heartRate: z.number().int().min(30).max(220).optional(),
  oxygenSaturation: z.number().min(50).max(100).optional(),
  bodyTemperature: z.number().min(90).max(110).optional(),
  weight: z.number().min(20).max(300).optional(),
  mood: z.string().optional(),
  painLevel: z.number().min(0).max(10).optional(),
  sleepHours: z.number().min(0).max(24).optional(),
  wellnessNotes: z.string().optional(),
  notes: z.string().optional(),
  recordedAt: z.string().optional()
});

const updateRecordSchema = z.object({
  systolicBp: z.number().int().min(50).max(250).optional(),
  diastolicBp: z.number().int().min(30).max(180).optional(),
  bloodGlucose: z.number().min(30).max(600).optional(),
  heartRate: z.number().int().min(30).max(220).optional(),
  oxygenSaturation: z.number().min(50).max(100).optional(),
  bodyTemperature: z.number().min(90).max(110).optional(),
  weight: z.number().min(20).max(300).optional(),
  mood: z.string().optional(),
  painLevel: z.number().min(0).max(10).optional(),
  sleepHours: z.number().min(0).max(24).optional(),
  wellnessNotes: z.string().optional(),
  notes: z.string().optional()
});

router.use(authenticate);

// Specific routes before parameterized :id
router.get('/history', requirePermission('canViewVitals'), recordController.getHistory);
router.get('/', requirePermission('canViewVitals'), recordController.getAll);

router.post('/', requirePermission('canLogVitals'), validateRequest({ body: createRecordSchema }), recordController.create);
router.patch('/:id', requirePermission('canLogVitals'), validateRequest({ body: updateRecordSchema }), recordController.update);

export default router;
