import { Router } from 'express';
import { z } from 'zod';
import { assistantController } from '../controllers/assistant.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';

const router = Router();

const chatSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty'),
  elderlyId: z.string().optional()
});

const wellnessSchema = z.object({
  action: z.enum(['LOG_WATER', 'SET_WATER', 'LOG_MOOD', 'LOG_SLEEP', 'LOG_OBSERVATION', 'TOGGLE_CHECKLIST']),
  waterGlasses: z.number().int().min(0).max(24).optional(),
  mood: z.string().optional(),
  sleepHours: z.number().min(0).max(24).optional(),
  sleepQuality: z.string().optional(),
  observationNotes: z.string().max(1000).optional(),
  checklistItemId: z.string().optional(),
  completed: z.boolean().optional(),
  elderlyId: z.string().optional()
});

router.use(authenticate);

// 1. GET /api/v1/assistant/summary
router.get('/summary', assistantController.getSummary);

// 2. POST /api/v1/assistant/chat
router.post('/chat', validateRequest({ body: chatSchema }), assistantController.chat);

// 3. POST /api/v1/assistant/wellness
router.post('/wellness', validateRequest({ body: wellnessSchema }), assistantController.logWellness);

export default router;

