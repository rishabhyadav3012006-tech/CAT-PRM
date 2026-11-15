// ==============================================================================
// CareNest Healthcare Platform - Notification Routes
// In-App Notification Feeds, Delivery Audit Ledger, Preference Controls, and Test Dispatch.
// ==============================================================================

import { Router } from 'express';
import { z } from 'zod';
import { notificationController } from '../controllers/notification.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';

const router = Router();

const updatePreferencesSchema = z.object({
  emailNotifications: z.boolean().optional(),
  smsNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  medicationReminders: z.boolean().optional(),
  missedDoseAlerts: z.boolean().optional(),
  appointmentReminders: z.boolean().optional(),
  careActivityUpdates: z.boolean().optional(),
  emergencyAlerts: z.boolean().optional(),
  reminderLeadMinutes: z.number().int().min(0).max(180).optional(),
  quietHoursEnabled: z.boolean().optional(),
  quietHoursStart: z.string().optional(),
  quietHoursEnd: z.string().optional()
});

const testEmailSchema = z.object({
  type: z.string().min(1, 'Notification type is required'),
  recipientEmail: z.string().email().optional(),
  patientName: z.string().optional(),
  medicationName: z.string().optional(),
  dosage: z.string().optional(),
  time: z.string().optional(),
  doctorName: z.string().optional(),
  specialty: z.string().optional(),
  appointmentDate: z.string().optional(),
  location: z.string().optional(),
  invitationCode: z.string().optional(),
  activityTitle: z.string().optional(),
  notes: z.string().optional()
});

// All notification routes require authenticated session
router.use(authenticate);

// List in-app notifications
router.get('/', notificationController.getNotifications);

// Specific routes MUST precede parameterized routes (/:id)
router.get('/history', notificationController.getHistory);
router.get('/stats', notificationController.getStats);
router.get('/preferences', notificationController.getPreferences);
router.patch('/preferences', validateRequest({ body: updatePreferencesSchema }), notificationController.updatePreferences);
router.post('/read-all', notificationController.markAllAsRead);
router.post('/test-email', validateRequest({ body: testEmailSchema }), notificationController.testEmail);

// Single notification read receipt
router.patch('/:id/read', notificationController.markAsRead);

export default router;

