// ==============================================================================
// CareNest Healthcare Platform - Medication Management Routes
// All 12 Clinical Medication APIs with Zod Input Validation & RBAC/PBAC Guards
// ==============================================================================

import { Router } from 'express';
import { z } from 'zod';
import { medicationController } from '../controllers/medication.controller.js';
import { authenticate, requirePermission } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { MedicationLogStatus } from '../constants/roles.js';

const router = Router();

// Zod Validation Schemas
const createMedicationSchema = z.object({
  elderlyId: z.string().min(1, 'Elderly profile ID is required'),
  name: z.string().min(1, 'Medication name is required'),
  genericName: z.string().optional(),
  category: z.string().optional(),
  dosage: z.string().min(1, 'Dosage is required (e.g., 500mg, 1 tablet)'),
  frequency: z.string().min(1, 'Frequency is required (e.g., DAILY, BID, TID)'),
  scheduledTimes: z.array(z.string()).min(1, 'At least one scheduled intake time is required'),
  foodRequirement: z.string().optional(),
  foodInstructions: z.string().optional(),
  doctorInstructions: z.string().optional(),
  prescriptionUrl: z.string().optional(),
  instructions: z.string().optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
  stockQuantity: z.number().int().nonnegative().optional(),
  refillReminderThreshold: z.number().int().nonnegative().optional()
});

const updateMedicationSchema = createMedicationSchema.partial();

const createScheduleSchema = z.object({
  timeOfDay: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'timeOfDay must be in HH:mm 24-hour format (e.g., 08:00, 14:30)'),
  dosageOverride: z.string().optional(),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).optional(),
  label: z.string().optional()
});

const updateScheduleSchema = createScheduleSchema.partial();

const takeMedicationSchema = z.object({
  scheduledFor: z.string().optional(),
  dosageTaken: z.string().optional(),
  notes: z.string().optional(),
  force: z.boolean().optional()
});

const skipMedicationSchema = z.object({
  skipReason: z.string().min(3, 'A clinical skip reason of at least 3 characters is required'),
  scheduledFor: z.string().optional(),
  notes: z.string().optional(),
  force: z.boolean().optional()
});

const adherenceSchema = z.object({
  medicationId: z.string().min(1, 'Medication ID is required'),
  status: z.nativeEnum(MedicationLogStatus),
  skipReason: z.string().optional(),
  notes: z.string().optional(),
  scheduledFor: z.string().optional(),
  dosageTaken: z.string().optional(),
  force: z.boolean().optional()
}).refine(
  (data) => {
    if (data.status === MedicationLogStatus.SKIPPED && (!data.skipReason || data.skipReason.trim().length < 3)) {
      return false;
    }
    return true;
  },
  {
    message: 'A clinical skip reason of at least 3 characters is required when recording a skipped dose.',
    path: ['skipReason']
  }
);

const refillSchema = z.object({
  quantity: z.number().int().positive().optional()
});

// Enforce session authentication across all medication endpoints
router.use(authenticate);

// Specific GET routes (MUST precede /:id to avoid URL segment collisions)
router.get('/', medicationController.getAll);
router.get('/schedule/today', medicationController.getTodaySchedule);
router.get('/history', medicationController.getHistory);
router.get('/stats/:elderlyId', medicationController.getStats);
router.get('/:id', medicationController.getById);

// Medication management
router.post('/', requirePermission('canManageMedications'), validateRequest({ body: createMedicationSchema }), medicationController.create);
router.patch('/:id', requirePermission('canManageMedications'), validateRequest({ body: updateMedicationSchema }), medicationController.update);
router.delete('/:id', requirePermission('canManageMedications'), medicationController.archive);
router.post('/:id/archive', requirePermission('canManageMedications'), medicationController.archive);
router.post('/:id/refill', requirePermission('canManageMedications'), validateRequest({ body: refillSchema }), medicationController.refill);

// Medication schedule slot management
router.post('/:id/schedules', requirePermission('canManageMedications'), validateRequest({ body: createScheduleSchema }), medicationController.createSchedule);
router.patch('/schedules/:scheduleId', requirePermission('canManageMedications'), validateRequest({ body: updateScheduleSchema }), medicationController.updateSchedule);

// Medication intake and adherence logging
router.post('/:id/take', requirePermission('canLogMedicationIntake'), validateRequest({ body: takeMedicationSchema }), medicationController.recordTaken);
router.post('/:id/skip', requirePermission('canLogMedicationIntake'), validateRequest({ body: skipMedicationSchema }), medicationController.recordSkipped);
router.post('/adherence', requirePermission('canLogMedicationIntake'), validateRequest({ body: adherenceSchema }), medicationController.logAdherence);

export default router;
