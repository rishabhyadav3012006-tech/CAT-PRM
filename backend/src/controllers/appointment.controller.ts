// ==============================================================================
// CareNest Healthcare Platform - Appointment Controller
// Clinical Consultations, Rescheduling, Cancellations, History & Timeline Feeds.
// ==============================================================================

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { appointmentService } from '../services/appointment.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const appointmentController = {
  // 1. Fetch all appointments (with optional status & pagination)
  getAll: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const elderlyId = req.query.elderlyId as string | undefined;
      const status = req.query.status as string | undefined;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      const result = await appointmentService.getAppointments(elderlyId, status, page, limit);
      return sendSuccess(res, 'Appointments fetched successfully', result);
    } catch (err) {
      next(err);
    }
  },

  // 2. Fetch upcoming appointments
  getUpcoming: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const elderlyId = req.query.elderlyId as string | undefined;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      const result = await appointmentService.getUpcomingAppointments(elderlyId, page, limit);
      return sendSuccess(res, 'Upcoming appointments fetched successfully', result);
    } catch (err) {
      next(err);
    }
  },

  // 3. Fetch past appointment history
  getHistory: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const elderlyId = req.query.elderlyId as string | undefined;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      const result = await appointmentService.getAppointmentHistory(elderlyId, page, limit);
      return sendSuccess(res, 'Appointment history fetched successfully', result);
    } catch (err) {
      next(err);
    }
  },

  // 4. Fetch appointment by ID
  getById: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const appt = await appointmentService.getAppointmentById(req.params.id);
      return sendSuccess(res, 'Appointment retrieved successfully', appt);
    } catch (err) {
      next(err);
    }
  },

  // 5. Create new appointment
  create: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const appt = await appointmentService.createAppointment(
        req.user!.userId,
        req.body,
        req.ip,
        req.headers['user-agent'] as string
      );
      return sendSuccess(res, 'Appointment scheduled successfully', appt, 201);
    } catch (err) {
      next(err);
    }
  },

  // 6. Update appointment
  update: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const updated = await appointmentService.updateAppointment(
        req.params.id,
        req.body,
        req.user!.userId,
        req.ip,
        req.headers['user-agent'] as string
      );
      return sendSuccess(res, 'Appointment updated successfully', updated);
    } catch (err) {
      next(err);
    }
  },

  // 7. Reschedule appointment
  reschedule: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const rescheduled = await appointmentService.rescheduleAppointment(
        req.params.id,
        req.body,
        req.user!.userId,
        req.ip,
        req.headers['user-agent'] as string
      );
      return sendSuccess(res, 'Appointment rescheduled successfully', rescheduled);
    } catch (err) {
      next(err);
    }
  },

  // 8. Cancel appointment
  cancel: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const cancelled = await appointmentService.cancelAppointment(
        req.params.id,
        req.body.reason,
        req.user!.userId,
        req.ip,
        req.headers['user-agent'] as string
      );
      return sendSuccess(res, 'Appointment cancelled successfully', cancelled);
    } catch (err) {
      next(err);
    }
  },

  // 9. Update status
  updateStatus: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const updated = await appointmentService.updateStatus(req.params.id, req.body.status, req.user!.userId);
      return sendSuccess(res, 'Appointment status updated', updated);
    } catch (err) {
      next(err);
    }
  },

  // 10. Add consultation notes
  addConsultationNotes: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const updated = await appointmentService.addConsultationNotes(
        req.params.id,
        req.body.consultationNotes,
        req.user!.userId
      );
      return sendSuccess(res, 'Consultation notes saved', updated);
    } catch (err) {
      next(err);
    }
  },

  // 11. Add medical document attachment
  addDocument: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const doc = await appointmentService.addDocument(req.params.id, req.body, req.user!.userId);
      return sendSuccess(res, 'Medical document attached successfully', doc, 201);
    } catch (err) {
      next(err);
    }
  },

  // 12. Delete appointment
  delete: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const deleted = await appointmentService.deleteAppointment(req.params.id, req.user!.userId);
      return sendSuccess(res, 'Appointment cancelled & removed', deleted);
    } catch (err) {
      next(err);
    }
  }
};
