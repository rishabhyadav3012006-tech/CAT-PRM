import { Router } from 'express';
import { z } from 'zod';
import { elderlyController } from '../controllers/elderly.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';

const router = Router();

const updateProfileSchema = z.object({
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactRelation: z.string().optional(),
  bloodGroup: z.string().optional(),
  allergies: z.array(z.string()).optional(),
  chronicConditions: z.array(z.string()).optional(),
  mobilityStatus: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional()
});

router.use(authenticate);

router.get('/', elderlyController.getAll);
router.get('/:id', elderlyController.getById);
router.patch('/:id', validateRequest({ body: updateProfileSchema }), elderlyController.update);

export default router;

