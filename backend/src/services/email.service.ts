// ==============================================================================
// CareNest Healthcare Platform - Complete Email & Notification Dispatch Service
// 10 Healthcare Notification Types, Responsive Templates, Recipient Preferences,
// Audit Logging & In-Memory / PostgreSQL Delivery Tracking.
// ==============================================================================

import { initMailer } from '../config/mailer.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { prisma, memoryStore, getIsDatabaseConnected, MemoryNotification } from '../config/db.js';
import { randomUUID } from 'crypto';
import * as templates from './templates/emailTemplates.js';

export interface EmailDispatchResult {
  success: boolean;
  messageId?: string;
  deliveryStatus: 'SENT' | 'FAILED' | 'SKIPPED_PREFERENCE';
  recipient: string;
  subject: string;
  error?: string;
  notificationId?: string;
}

export const emailService = {
  // Check recipient notification preferences before sending
  checkRecipientPreference: async (userId: string, category: 'medication' | 'missed_dose' | 'appointment' | 'activity' | 'emergency'): Promise<boolean> => {
    try {
      const isDb = getIsDatabaseConnected();
      let pref: any;

      if (isDb) {
        pref = await prisma.notificationPreference.findUnique({ where: { userId } });
      } else {
        pref = (memoryStore.notificationPreferences || []).find((p) => p.userId === userId);
      }

      if (!pref) return true; // Default to true if no explicit preference configured
      if (!pref.emailNotifications) return false; // Master toggle

      switch (category) {
        case 'medication':
          return pref.medicationReminders;
        case 'missed_dose':
          return pref.missedDoseAlerts;
        case 'appointment':
          return pref.appointmentReminders;
        case 'activity':
          return pref.careActivityUpdates;
        case 'emergency':
          return pref.emergencyAlerts;
        default:
          return true;
      }
    } catch (err: any) {
      logger.warn(`Failed to evaluate user preferences for ${userId}: ${err.message}. Defaulting to send.`);
      return true;
    }
  },

  // Record notification dispatch ledger in DB or memoryStore
  recordNotificationDelivery: async (data: {
    userId?: string;
    elderlyId?: string;
    type: string;
    title: string;
    message: string;
    priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
    channel?: 'IN_APP' | 'EMAIL' | 'SMS' | 'PUSH';
    actionUrl?: string;
    emailTo: string;
    deliveryStatus: 'SENT' | 'FAILED' | 'SKIPPED_PREFERENCE';
    error?: string;
    metadata?: Record<string, any>;
  }): Promise<string> => {
    const isDb = getIsDatabaseConnected();
    const notifId = `notif-${randomUUID().substring(0, 8)}`;
    const targetUserId = data.userId || 'usr-elderly-01'; // Fallback to primary patient

    const recordData = {
      id: notifId,
      userId: targetUserId,
      elderlyId: data.elderlyId,
      type: data.type,
      title: data.title,
      message: data.message,
      priority: data.priority || 'NORMAL',
      channel: data.channel || 'EMAIL',
      isRead: false,
      actionUrl: data.actionUrl,
      metadata: {
        emailTo: data.emailTo,
        deliveryStatus: data.deliveryStatus,
        error: data.error,
        retryCount: 0,
        ...data.metadata
      },
      sentAt: new Date(),
      createdAt: new Date()
    };

    if (isDb) {
      try {
        await prisma.notification.create({
          data: {
            id: notifId,
            userId: targetUserId,
            elderlyId: data.elderlyId,
            type: data.type as any,
            title: data.title,
            message: data.message,
            priority: (data.priority as any) || 'NORMAL',
            channel: (data.channel as any) || 'EMAIL',
            isRead: false,
            actionUrl: data.actionUrl,
            metadata: recordData.metadata
          }
        });
      } catch (err: any) {
        logger.warn(`Prisma notification creation failed: ${err.message}. Recording to memory fallback.`);
        if (!memoryStore.notifications) memoryStore.notifications = [];
        memoryStore.notifications.unshift(recordData as MemoryNotification);
      }
    } else {
      if (!memoryStore.notifications) memoryStore.notifications = [];
      memoryStore.notifications.unshift(recordData as MemoryNotification);
    }

    return notifId;
  },

  // Generic Email Dispatcher
  sendMail: async (options: {
    to: string;
    subject: string;
    html: string;
    userId?: string;
    elderlyId?: string;
    type: string;
    title: string;
    message: string;
    priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
    actionUrl?: string;
    category?: 'medication' | 'missed_dose' | 'appointment' | 'activity' | 'emergency';
    metadata?: Record<string, any>;
  }): Promise<EmailDispatchResult> => {
    // 1. Check preferences if userId provided
    if (options.userId && options.category) {
      const allowed = await emailService.checkRecipientPreference(options.userId, options.category);
      if (!allowed) {
        logger.info(`Email skipped due to user preference [${options.category}]: ${options.to}`);
        const notificationId = await emailService.recordNotificationDelivery({
          userId: options.userId,
          elderlyId: options.elderlyId,
          type: options.type,
          title: options.title,
          message: options.message,
          priority: options.priority,
          actionUrl: options.actionUrl,
          emailTo: options.to,
          deliveryStatus: 'SKIPPED_PREFERENCE',
          metadata: options.metadata
        });

        return {
          success: false,
          deliveryStatus: 'SKIPPED_PREFERENCE',
          recipient: options.to,
          subject: options.subject,
          notificationId
        };
      }
    }

    try {
      const transporter = await initMailer();
      const mailOptions = {
        from: env.EMAIL_FROM,
        to: options.to,
        subject: options.subject,
        html: options.html,
        priority: options.priority === 'URGENT' ? ('high' as const) : ('normal' as const)
      };

      const info = await transporter.sendMail(mailOptions);
      logger.info(`CareNest email dispatched to ${options.to} [${options.subject}]`);

      const notificationId = await emailService.recordNotificationDelivery({
        userId: options.userId,
        elderlyId: options.elderlyId,
        type: options.type,
        title: options.title,
        message: options.message,
        priority: options.priority,
        actionUrl: options.actionUrl,
        emailTo: options.to,
        deliveryStatus: 'SENT',
        metadata: {
          ...options.metadata,
          messageId: info.messageId || 'simulated-dev-msg'
        }
      });

      return {
        success: true,
        messageId: info.messageId,
        deliveryStatus: 'SENT',
        recipient: options.to,
        subject: options.subject,
        notificationId
      };
    } catch (err: any) {
      logger.error(`Failed to dispatch email to ${options.to}: ${err.message}`);

      const notificationId = await emailService.recordNotificationDelivery({
        userId: options.userId,
        elderlyId: options.elderlyId,
        type: options.type,
        title: options.title,
        message: options.message,
        priority: options.priority,
        actionUrl: options.actionUrl,
        emailTo: options.to,
        deliveryStatus: 'FAILED',
        error: err.message,
        metadata: options.metadata
      });

      return {
        success: false,
        deliveryStatus: 'FAILED',
        recipient: options.to,
        subject: options.subject,
        error: err.message,
        notificationId
      };
    }
  },

  // ============================================================================
  // 1. UPCOMING MEDICATION REMINDER
  // ============================================================================
  sendUpcomingMedicationReminder: async (
    to: string,
    data: {
      patientName: string;
      medicationName: string;
      dosage: string;
      time: string;
      foodInstructions?: string;
      instructions?: string;
      actionUrl?: string;
      userId?: string;
      elderlyId?: string;
      medicationId?: string;
    }
  ) => {
    const html = templates.upcomingMedicationTemplate(data);
    return emailService.sendMail({
      to,
      subject: `CareNest Schedule: Upcoming Medication Reminder (${data.time})`,
      html,
      userId: data.userId,
      elderlyId: data.elderlyId,
      type: 'MEDICATION_REMINDER',
      title: 'Upcoming Medication Reminder',
      message: `${data.medicationName} (${data.dosage}) scheduled for ${data.time}.`,
      priority: 'NORMAL',
      category: 'medication',
      actionUrl: data.actionUrl || '/medications',
      metadata: { medicationId: data.medicationId, scheduledTime: data.time }
    });
  },

  // Backwards compatibility alias
  sendMedicationReminder: async (to: string, patientName: string, medicationName: string, dosage: string, time: string, instructions?: string) => {
    return emailService.sendUpcomingMedicationReminder(to, {
      patientName,
      medicationName,
      dosage,
      time,
      instructions
    });
  },

  // ============================================================================
  // 2. UNCONFIRMED MEDICATION REMINDER (CHECK-IN NUDGE)
  // ============================================================================
  sendUnconfirmedMedicationReminder: async (
    to: string,
    data: {
      patientName: string;
      medicationName: string;
      dosage: string;
      scheduledTime: string;
      minutesElapsed: number;
      actionUrl?: string;
      userId?: string;
      elderlyId?: string;
      medicationId?: string;
    }
  ) => {
    const html = templates.unconfirmedMedicationTemplate(data);
    return emailService.sendMail({
      to,
      subject: `CareNest Check-In: Medication Scheduled for ${data.patientName}`,
      html,
      userId: data.userId,
      elderlyId: data.elderlyId,
      type: 'MEDICATION_REMINDER',
      title: 'Medication Check-In (Awaiting Confirmation)',
      message: `Dose of ${data.medicationName} at ${data.scheduledTime} is awaiting intake confirmation.`,
      priority: 'NORMAL',
      category: 'medication',
      actionUrl: data.actionUrl || '/medications',
      metadata: { medicationId: data.medicationId, minutesElapsed: data.minutesElapsed }
    });
  },

  // ============================================================================
  // 3. MISSED-DOSE ALERT (ESCALATED TO FAMILY & CAREGIVERS)
  // ============================================================================
  sendMissedDoseAlert: async (
    to: string,
    data: {
      patientName: string;
      medicationName: string;
      dosage: string;
      scheduledTime: string;
      gracePeriodMinutes: number;
      circleRole?: string;
      actionUrl?: string;
      userId?: string;
      elderlyId?: string;
      medicationId?: string;
    }
  ) => {
    const html = templates.missedDoseAlertTemplate(data);
    return emailService.sendMail({
      to,
      subject: `CareNest Alert: Unconfirmed Medication Dose for ${data.patientName}`,
      html,
      userId: data.userId,
      elderlyId: data.elderlyId,
      type: 'MEDICATION_MISSED',
      title: 'Missed-Dose Adherence Alert',
      message: `Grace period exceeded (${data.gracePeriodMinutes}m) for ${data.medicationName} (${data.dosage}) scheduled at ${data.scheduledTime}.`,
      priority: 'HIGH',
      category: 'missed_dose',
      actionUrl: data.actionUrl || '/medications',
      metadata: { medicationId: data.medicationId, gracePeriodMinutes: data.gracePeriodMinutes }
    });
  },

  // ============================================================================
  // 4. MEDICATION CONFIRMATION RECEIPT
  // ============================================================================
  sendMedicationConfirmation: async (
    to: string,
    data: {
      patientName: string;
      medicationName: string;
      dosage: string;
      takenAt: string;
      administeredByName: string;
      actionUrl?: string;
      userId?: string;
      elderlyId?: string;
      medicationId?: string;
    }
  ) => {
    const html = templates.medicationConfirmationTemplate(data);
    return emailService.sendMail({
      to,
      subject: `CareNest Receipt: Medication Administered for ${data.patientName}`,
      html,
      userId: data.userId,
      elderlyId: data.elderlyId,
      type: 'MEDICATION_REMINDER',
      title: 'Medication Confirmed',
      message: `${data.medicationName} (${data.dosage}) confirmed taken at ${data.takenAt} by ${data.administeredByName}.`,
      priority: 'LOW',
      category: 'medication',
      actionUrl: data.actionUrl || '/medications',
      metadata: { medicationId: data.medicationId, takenAt: data.takenAt }
    });
  },

  // ============================================================================
  // 5. UPCOMING DOCTOR APPOINTMENT REMINDER
  // ============================================================================
  sendUpcomingAppointmentReminder: async (
    to: string,
    data: {
      patientName: string;
      doctorName: string;
      specialty: string;
      hospitalName?: string;
      appointmentDate: string;
      appointmentTime?: string;
      location: string;
      preparationNotes?: string;
      actionUrl?: string;
      is24HourNotice?: boolean;
      userId?: string;
      elderlyId?: string;
      appointmentId?: string;
    }
  ) => {
    const html = templates.upcomingAppointmentTemplate(data);
    const subject = data.is24HourNotice
      ? `CareNest Reminder: Upcoming Healthcare Appointment Tomorrow`
      : `CareNest Reminder: Upcoming Appointment with ${data.doctorName}`;

    return emailService.sendMail({
      to,
      subject,
      html,
      userId: data.userId,
      elderlyId: data.elderlyId,
      type: 'APPOINTMENT_REMINDER',
      title: data.is24HourNotice ? 'Appointment Tomorrow' : 'Upcoming Doctor Appointment',
      message: `Consultation with ${data.doctorName} (${data.specialty}) scheduled for ${data.appointmentDate} ${data.appointmentTime || ''}.`,
      priority: 'NORMAL',
      category: 'appointment',
      actionUrl: data.actionUrl || '/appointments',
      metadata: { appointmentId: data.appointmentId, is24HourNotice: data.is24HourNotice }
    });
  },

  // Backwards compatibility alias
  sendAppointmentReminder: async (to: string, patientName: string, doctorName: string, specialty: string, appointmentDate: string, location: string) => {
    return emailService.sendUpcomingAppointmentReminder(to, {
      patientName,
      doctorName,
      specialty,
      appointmentDate,
      location
    });
  },

  // ============================================================================
  // 6. APPOINTMENT RESCHEDULING NOTIFICATION
  // ============================================================================
  sendAppointmentRescheduledNotification: async (
    to: string,
    data: {
      patientName: string;
      doctorName: string;
      specialty: string;
      oldDate?: string;
      newDate: string;
      newTime?: string;
      location: string;
      reason?: string;
      actionUrl?: string;
      userId?: string;
      elderlyId?: string;
      appointmentId?: string;
    }
  ) => {
    const html = templates.appointmentRescheduledTemplate(data);
    return emailService.sendMail({
      to,
      subject: `CareNest Update: Healthcare Appointment Rescheduled`,
      html,
      userId: data.userId,
      elderlyId: data.elderlyId,
      type: 'APPOINTMENT_REMINDER',
      title: 'Appointment Rescheduled',
      message: `Appointment with ${data.doctorName} rescheduled to ${data.newDate} ${data.newTime || ''}.`,
      priority: 'NORMAL',
      category: 'appointment',
      actionUrl: data.actionUrl || '/appointments',
      metadata: { appointmentId: data.appointmentId, newDate: data.newDate, reason: data.reason }
    });
  },

  // ============================================================================
  // 7. APPOINTMENT CANCELLATION NOTIFICATION
  // ============================================================================
  sendAppointmentCancelledNotification: async (
    to: string,
    data: {
      patientName: string;
      doctorName: string;
      specialty: string;
      cancelledDate: string;
      reason?: string;
      actionUrl?: string;
      userId?: string;
      elderlyId?: string;
      appointmentId?: string;
    }
  ) => {
    const html = templates.appointmentCancelledTemplate(data);
    return emailService.sendMail({
      to,
      subject: `CareNest Notice: Appointment Cancelled`,
      html,
      userId: data.userId,
      elderlyId: data.elderlyId,
      type: 'APPOINTMENT_REMINDER',
      title: 'Appointment Cancelled',
      message: `Appointment with ${data.doctorName} on ${data.cancelledDate} was cancelled.`,
      priority: 'NORMAL',
      category: 'appointment',
      actionUrl: data.actionUrl || '/appointments',
      metadata: { appointmentId: data.appointmentId, cancelledDate: data.cancelledDate, reason: data.reason }
    });
  },

  // ============================================================================
  // 8. NEW FAMILY MEMBER / CARE CIRCLE INVITATION
  // ============================================================================
  sendFamilyCircleInvite: async (
    to: string,
    data: {
      inviterName: string;
      elderlyName: string;
      targetRole: string;
      targetRelationship: string;
      invitationCode: string;
      expiresInHours: number;
      actionUrl?: string;
      userId?: string;
      elderlyId?: string;
      inviteId?: string;
    }
  ) => {
    const html = templates.familyCircleInviteTemplate(data);
    return emailService.sendMail({
      to,
      subject: `You've Been Invited to Join ${data.elderlyName}'s CareNest Circle`,
      html,
      userId: data.userId,
      elderlyId: data.elderlyId,
      type: 'CIRCLE_INVITE',
      title: 'Care Circle Invitation',
      message: `Invited by ${data.inviterName} to join ${data.elderlyName}'s Care Circle as ${data.targetRelationship}. Code: ${data.invitationCode}`,
      priority: 'NORMAL',
      actionUrl: data.actionUrl || `/join-profile?code=${data.invitationCode}`,
      metadata: { inviteId: data.inviteId, code: data.invitationCode, expiresInHours: data.expiresInHours }
    });
  },

  // ============================================================================
  // 9. CARETAKER ACTIVITY UPDATE
  // ============================================================================
  sendCaretakerActivityUpdate: async (
    to: string,
    data: {
      caretakerName: string;
      patientName: string;
      activityTitle: string;
      category: string;
      scheduledTime?: string;
      completedAt: string;
      notes?: string;
      actionUrl?: string;
      userId?: string;
      elderlyId?: string;
      activityId?: string;
    }
  ) => {
    const html = templates.caretakerActivityTemplate(data);
    return emailService.sendMail({
      to,
      subject: `CareNest Daily Update: Care Activity Completed for ${data.patientName}`,
      html,
      userId: data.userId,
      elderlyId: data.elderlyId,
      type: 'CARE_ACTIVITY_DUE',
      title: 'Care Activity Completed',
      message: `${data.activityTitle} (${data.category}) completed by ${data.caretakerName}.`,
      priority: 'LOW',
      category: 'activity',
      actionUrl: data.actionUrl || '/dashboard',
      metadata: { activityId: data.activityId, caretakerName: data.caretakerName }
    });
  },

  // ============================================================================
  // 10. MEDICATION SCHEDULE MODIFICATION
  // ============================================================================
  sendMedicationScheduleModified: async (
    to: string,
    data: {
      patientName: string;
      medicationName: string;
      modificationType: string;
      details: string;
      modifiedByName: string;
      actionUrl?: string;
      userId?: string;
      elderlyId?: string;
      medicationId?: string;
    }
  ) => {
    const html = templates.medicationScheduleModifiedTemplate(data);
    return emailService.sendMail({
      to,
      subject: `CareNest Protocol Update: Medication Schedule Changed for ${data.patientName}`,
      html,
      userId: data.userId,
      elderlyId: data.elderlyId,
      type: 'MEDICATION_REMINDER',
      title: 'Medication Schedule Modified',
      message: `${data.medicationName} protocol updated (${data.modificationType}): ${data.details}.`,
      priority: 'NORMAL',
      category: 'medication',
      actionUrl: data.actionUrl || '/medications',
      metadata: { medicationId: data.medicationId, modificationType: data.modificationType }
    });
  },

  // ============================================================================
  // EMERGENCY ALERT BROADCAST
  // ============================================================================
  sendEmergencyAlertEmail: async (to: string, elderlyName: string, emergencyType: string, triggeredAt: string, emergencyContactPhone: string) => {
    try {
      const transporter = await initMailer();
      const mailOptions = {
        from: env.EMAIL_FROM,
        to,
        subject: `🚨 [URGENT EMERGENCY ALERT] CareNest SOS Triggered by ${elderlyName}`,
        priority: 'high' as const,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 2px solid #ef4444; overflow: hidden;">
            <div style="background: #dc2626; padding: 24px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 26px; font-weight: 800;">🚨 EMERGENCY SOS ALERT</h1>
              <p style="margin: 6px 0 0; opacity: 0.95; font-size: 15px; font-weight: 600;">Immediate Attention Required</p>
            </div>
            <div style="padding: 30px;">
              <p style="font-size: 16px; color: #991b1b; font-weight: 700;">
                An emergency assistance request has been triggered!
              </p>
              <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 18px; margin: 20px 0;">
                <p style="margin: 6px 0; color: #b91c1c; font-size: 15px;"><strong>Elderly Individual:</strong> ${elderlyName}</p>
                <p style="margin: 6px 0; color: #b91c1c; font-size: 15px;"><strong>Alert Type:</strong> ${emergencyType}</p>
                <p style="margin: 6px 0; color: #b91c1c; font-size: 15px;"><strong>Time of Trigger:</strong> ${triggeredAt}</p>
                <p style="margin: 6px 0; color: #b91c1c; font-size: 15px;"><strong>Primary Emergency Contact:</strong> ${emergencyContactPhone}</p>
              </div>
              <p style="font-size: 14px; color: #4b5563; line-height: 1.5;">
                Caregivers and family members have been notified. Please check the CareNest live portal immediately or call the individual.
              </p>
            </div>
          </div>
        `
      };

      const info = await transporter.sendMail(mailOptions);
      logger.info(`Emergency SOS email broadcasted for ${elderlyName} to ${to}`);
      return info;
    } catch (err: any) {
      logger.error(`Failed to send emergency SOS email: ${err.message}`);
    }
  }
};
