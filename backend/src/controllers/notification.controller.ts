// ==============================================================================
// CareNest Healthcare Platform - Notification Controller
// In-App Feeds, Delivery Audit Logs, Read Receipts, Preferences, and Test Dispatch.
// ==============================================================================

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { notificationService } from '../services/notification.service.js';
import { emailService } from '../services/email.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { AppError } from '../utils/errors.js';

export const notificationController = {
  // 1. Get current user's in-app notifications
  getNotifications: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const isRead = req.query.isRead !== undefined ? req.query.isRead === 'true' : undefined;
      const type = req.query.type as string | undefined;
      const priority = req.query.priority as string | undefined;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      const result = await notificationService.getNotifications(req.user!.userId, {
        isRead,
        type,
        priority,
        page,
        limit
      });

      return sendSuccess(res, 'Notifications retrieved successfully', result);
    } catch (err) {
      next(err);
    }
  },

  // 2. Get full notification delivery history audit log
  getHistory: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const elderlyId = req.query.elderlyId as string | undefined;
      const status = req.query.status as string | undefined;

      const history = await notificationService.getNotificationHistory(elderlyId, status);
      return sendSuccess(res, 'Notification delivery history retrieved', history);
    } catch (err) {
      next(err);
    }
  },

  // 3. Get notification statistics & delivery failure metrics
  getStats: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const elderlyId = req.query.elderlyId as string | undefined;
      const stats = await notificationService.getNotificationStats(req.user!.userId, elderlyId);
      return sendSuccess(res, 'Notification statistics retrieved', stats);
    } catch (err) {
      next(err);
    }
  },

  // 4. Mark single notification as read
  markAsRead: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const notification = await notificationService.markAsRead(req.params.id, req.user!.userId);
      return sendSuccess(res, 'Notification marked as read', notification);
    } catch (err) {
      next(err);
    }
  },

  // 5. Mark all user notifications as read
  markAllAsRead: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const result = await notificationService.markAllAsRead(req.user!.userId);
      return sendSuccess(res, 'All notifications marked as read', result);
    } catch (err) {
      next(err);
    }
  },

  // 6. Get user notification preferences
  getPreferences: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const preferences = await notificationService.getPreferences(req.user!.userId);
      return sendSuccess(res, 'Notification preferences retrieved', preferences);
    } catch (err) {
      next(err);
    }
  },

  // 7. Update user notification preferences
  updatePreferences: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const updated = await notificationService.updatePreferences(req.user!.userId, req.body);
      return sendSuccess(res, 'Notification preferences updated successfully', updated);
    } catch (err) {
      next(err);
    }
  },

  // 8. Test email dispatch for any of the 10 notification types
  testEmail: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { type, recipientEmail, patientName = 'Eleanor Vance' } = req.body;
      const to = recipientEmail || req.user!.email;

      let result: any;

      switch (type) {
        case 'UPCOMING_MEDICATION':
          result = await emailService.sendUpcomingMedicationReminder(to, {
            patientName,
            medicationName: req.body.medicationName || 'Lisinopril',
            dosage: req.body.dosage || '10mg',
            time: req.body.time || '08:00 AM',
            foodInstructions: req.body.foodInstructions || 'Take with morning meal and water',
            instructions: req.body.instructions || 'Daily blood pressure management',
            userId: req.user!.userId
          });
          break;

        case 'UNCONFIRMED_MEDICATION':
          result = await emailService.sendUnconfirmedMedicationReminder(to, {
            patientName,
            medicationName: req.body.medicationName || 'Metformin',
            dosage: req.body.dosage || '500mg',
            scheduledTime: req.body.scheduledTime || '08:30 AM',
            minutesElapsed: req.body.minutesElapsed || 25,
            userId: req.user!.userId
          });
          break;

        case 'MISSED_DOSE':
          result = await emailService.sendMissedDoseAlert(to, {
            patientName,
            medicationName: req.body.medicationName || 'Atorvastatin',
            dosage: req.body.dosage || '20mg',
            scheduledTime: req.body.scheduledTime || '09:00 PM',
            gracePeriodMinutes: req.body.gracePeriodMinutes || 45,
            circleRole: req.user!.role,
            userId: req.user!.userId
          });
          break;

        case 'MEDICATION_CONFIRMATION':
          result = await emailService.sendMedicationConfirmation(to, {
            patientName,
            medicationName: req.body.medicationName || 'Lisinopril',
            dosage: req.body.dosage || '10mg',
            takenAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            administeredByName: req.user!.name,
            userId: req.user!.userId
          });
          break;

        case 'UPCOMING_APPOINTMENT':
          result = await emailService.sendUpcomingAppointmentReminder(to, {
            patientName,
            doctorName: req.body.doctorName || 'Dr. Gregory House',
            specialty: req.body.specialty || 'Diagnostic Medicine',
            hospitalName: req.body.hospitalName || 'Princeton-Plainsboro Pavilion',
            appointmentDate: req.body.appointmentDate || 'Tomorrow, Nov 16, 2026',
            appointmentTime: req.body.appointmentTime || '11:30 AM',
            location: req.body.location || 'Diagnostic Wing, Room 402',
            preparationNotes: req.body.preparationNotes || 'Bring past 30 days blood pressure log',
            is24HourNotice: req.body.is24HourNotice ?? true,
            userId: req.user!.userId
          });
          break;

        case 'APPOINTMENT_RESCHEDULED':
          result = await emailService.sendAppointmentRescheduledNotification(to, {
            patientName,
            doctorName: req.body.doctorName || 'Dr. Elizabeth Adams',
            specialty: req.body.specialty || 'Cardiologist',
            oldDate: req.body.oldDate || 'Monday, Nov 17, 2026 at 10:00 AM',
            newDate: req.body.newDate || 'Wednesday, Nov 19, 2026',
            newTime: req.body.newTime || '02:00 PM',
            location: req.body.location || 'Suite 300, Cardiology Pavilion',
            reason: req.body.reason || 'Physician schedule adjustment',
            userId: req.user!.userId
          });
          break;

        case 'APPOINTMENT_CANCELLED':
          result = await emailService.sendAppointmentCancelledNotification(to, {
            patientName,
            doctorName: req.body.doctorName || 'Dr. Michael Chang',
            specialty: req.body.specialty || 'Dermatology',
            cancelledDate: req.body.cancelledDate || 'Friday, Nov 21, 2026 at 09:00 AM',
            reason: req.body.reason || 'Patient rescheduled per care plan',
            userId: req.user!.userId
          });
          break;

        case 'CIRCLE_INVITE':
          result = await emailService.sendFamilyCircleInvite(to, {
            inviterName: req.user!.name,
            elderlyName: patientName,
            targetRole: req.body.targetRole || 'CARETAKER',
            targetRelationship: req.body.targetRelationship || 'Evening Physical Therapist',
            invitationCode: req.body.invitationCode || 'NEST-7742-9901',
            expiresInHours: req.body.expiresInHours || 48,
            userId: req.user!.userId
          });
          break;

        case 'CARETAKER_ACTIVITY':
          result = await emailService.sendCaretakerActivityUpdate(to, {
            caretakerName: req.user!.name,
            patientName,
            activityTitle: req.body.activityTitle || 'Morning Vital Signs & Mobility Stride',
            category: req.body.category || 'MOBILITY',
            completedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            notes: req.body.notes || '15 min walker stride completed with zero balance loss.',
            userId: req.user!.userId
          });
          break;

        case 'SCHEDULE_MODIFIED':
          result = await emailService.sendMedicationScheduleModified(to, {
            patientName,
            medicationName: req.body.medicationName || 'Metformin',
            modificationType: req.body.modificationType || 'DOSE_INCREASED',
            details: req.body.details || 'Upgraded from 250mg once daily to 500mg twice daily with meals.',
            modifiedByName: req.user!.name,
            userId: req.user!.userId
          });
          break;

        default:
          throw new AppError(
            `Unsupported test notification type: '${type}'. Supported types: UPCOMING_MEDICATION, UNCONFIRMED_MEDICATION, MISSED_DOSE, MEDICATION_CONFIRMATION, UPCOMING_APPOINTMENT, APPOINTMENT_RESCHEDULED, APPOINTMENT_CANCELLED, CIRCLE_INVITE, CARETAKER_ACTIVITY, SCHEDULE_MODIFIED.`,
            400
          );
      }

      return sendSuccess(res, `Test email for '${type}' processed successfully`, result);
    } catch (err) {
      next(err);
    }
  }
};

