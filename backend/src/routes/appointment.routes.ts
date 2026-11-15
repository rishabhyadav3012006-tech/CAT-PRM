// ==============================================================================
// CareNest Healthcare Platform - Appointment Routes
// Appointments Lifecycle: Scheduling, Upcoming/History Feeds, Rescheduling & Cancelling.
// ==============================================================================

import { Router } from 'express';
import { z } from 'zod';
import { appointmentController } from '../controllers/appointment.controller.js';
import { authenticate, requirePermission } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { AppointmentStatus } from '../constants/roles.js';

const router = Router();

const createAppointmentSchema = z.object({
  elderlyId: z.string().min(1, 'Elderly profile ID is required'),
  doctorName: z.string().min(2, 'Doctor name is required'),
  specialty: z.string().min(2, 'Specialty is required'),
  hospitalName: z.string().optional(),
  contactNumber: z.string().optional(),
  location: z.string().min(2, 'Location is required'),
  appointmentDate: z.string().min(10, 'Valid appointment date is required'),
  appointmentTime: z.string().optional(),
  notes: z.string().optional(),
  consultationNotes: z.string().optional(),
  documents: z.array(
    z.object({
      name: z.string().min(1, 'Document name is required'),
      type: z.string(),
      size: z.string().optional(),
      url: z.string().optional()
    })
  ).optional()
});

const updateAppointmentSchema = z.object({
  doctorName: z.string().min(2).optional(),
  specialty: z.string().min(2).optional(),
  hospitalName: z.string().optional(),
  contactNumber: z.string().optional(),
  location: z.string().min(2).optional(),
  appointmentDate: z.string().min(10).optional(),
  appointmentTime: z.string().optional(),
  notes: z.string().optional(),
  consultationNotes: z.string().optional(),
  status: z.nativeEnum(AppointmentStatus).optional()
});

const rescheduleAppointmentSchema = z.object({
  newDate: z.string().min(10, 'New appointment date is required'),
  newTime: z.string().optional(),
  reason: z.string().optional()
});

const cancelAppointmentSchema = z.object({
  reason: z.string().optional()
});

const updateStatusSchema = z.object({
  status: z.nativeEnum(AppointmentStatus)
});

const consultationNotesSchema = z.object({
  consultationNotes: z.string().min(1, 'Consultation notes cannot be empty')
});

const documentSchema = z.object({
  name: z.string().min(1, 'Document name is required'),
  type: z.string().default('Medical Document'),
  size: z.string().optional(),
  url: z.string().optional()
});

// All appointment routes require authentication
router.use(authenticate);

// List & Feed routes (MUST precede /:id to prevent segment collision)
router.get('/', appointmentController.getAll);
router.get('/upcoming', appointmentController.getUpcoming);
router.get('/history', appointmentController.getHistory);
router.get('/:id', appointmentController.getById);

// Appointment mutations
router.post('/', requirePermission('canManageAppointments'), validateRequest({ body: createAppointmentSchema }), appointmentController.create);
router.patch('/:id', requirePermission('canManageAppointments'), validateRequest({ body: updateAppointmentSchema }), appointmentController.update);
router.post('/:id/reschedule', requirePermission('canManageAppointments'), validateRequest({ body: rescheduleAppointmentSchema }), appointmentController.reschedule);
router.post('/:id/cancel', requirePermission('canManageAppointments'), validateRequest({ body: cancelAppointmentSchema }), appointmentController.cancel);
router.patch('/:id/status', requirePermission('canManageAppointments'), validateRequest({ body: updateStatusSchema }), appointmentController.updateStatus);
router.post('/:id/consultation-notes', requirePermission('canManageAppointments'), validateRequest({ body: consultationNotesSchema }), appointmentController.addConsultationNotes);
router.post('/:id/documents', requirePermission('canManageAppointments'), validateRequest({ body: documentSchema }), appointmentController.addDocument);
router.delete('/:id', requirePermission('canManageAppointments'), appointmentController.delete);

export default router;
