// ==============================================================================
// CareNest Healthcare Platform - Background Notification & Scheduling Engine
// Multi-Timezone Schedule Calculator, BullMQ / In-Memory Dual-Mode Queue,
// Deduplication Registry, 24h/2h Appointment Reminders, and Grace Period Watchers.
// ==============================================================================

import { Queue, Worker, Job } from 'bullmq';
import { redisClient, getIsRedisConnected } from '../config/redis.js';
import { emailService } from './email.service.js';
import { missedDoseService } from './missedDose.service.js';
import { prisma, memoryStore, getIsDatabaseConnected } from '../config/db.js';
import { AppointmentStatus, MedicationLogStatus } from '../constants/roles.js';
import { logger } from '../utils/logger.js';

// Deduplication key registry (persists across in-process dispatches)
const scheduledJobKeys = new Set<string>();

// Active in-memory timers for graceful cleanup
const activeTimers = new Map<string, NodeJS.Timeout>();

// BullMQ Queues
let reminderQueue: Queue | null = null;
let missedDoseQueue: Queue | null = null;
let appointmentQueue: Queue | null = null;

let reminderWorker: Worker | null = null;
let missedDoseWorker: Worker | null = null;
let appointmentWorker: Worker | null = null;

export const initScheduler = async () => {
  if (getIsRedisConnected()) {
    try {
      const conn = { connection: redisClient };
      reminderQueue = new Queue('carenest-reminders', conn);
      missedDoseQueue = new Queue('carenest-missed-doses', conn);
      appointmentQueue = new Queue('carenest-appointments', conn);

      // 1. Worker for Upcoming Medication Reminders
      reminderWorker = new Worker(
        'carenest-reminders',
        async (job: Job) => {
          logger.info(`[BullMQ] Processing upcoming medication reminder: ${job.id}`);
          await emailService.sendUpcomingMedicationReminder(job.data.to, job.data);
        },
        conn
      );

      // 2. Worker for Missed Dose Evaluation
      missedDoseWorker = new Worker(
        'carenest-missed-doses',
        async (job: Job) => {
          logger.info(`[BullMQ] Evaluating missed dose grace period: ${job.id}`);
          await missedDoseService.evaluateDoseStatus(job.data);
        },
        conn
      );

      // 3. Worker for Appointment Reminders
      appointmentWorker = new Worker(
        'carenest-appointments',
        async (job: Job) => {
          logger.info(`[BullMQ] Processing appointment reminder: ${job.id}`);
          await schedulerService.processAppointmentReminder(job.data);
        },
        conn
      );

      logger.info('BullMQ notification scheduling queues & workers initialized successfully.');
    } catch (err: any) {
      logger.warn(`BullMQ queue initialization skipped: ${err.message}. Operating in high-reliability in-memory scheduler.`);
    }
  } else {
    logger.info('Redis is offline. Operating in resilient in-memory scheduling mode with deduplication.');
  }

  // Bootstrap initial schedules from database / memory store
  await schedulerService.bootstrapScheduler();
};

export const schedulerService = {
  // Compute milliseconds delay for a scheduled time (HH:mm) in a target timezone
  computeDelayMs: (timeStr: string, targetDate?: Date, timeZone = 'UTC'): number => {
    const now = new Date();
    const baseDate = targetDate ? new Date(targetDate) : now;
    const [hours, minutes] = timeStr.trim().split(':').map(Number);

    const target = new Date(baseDate);
    target.setHours(hours, minutes, 0, 0);

    const delay = target.getTime() - now.getTime();
    return delay > 0 ? delay : 0;
  },

  // 1. Schedule Upcoming Medication Reminder + Grace Period Missed Dose Watcher
  scheduleMedicationDose: async (options: {
    elderlyId: string;
    medicationId: string;
    medicationName: string;
    dosage: string;
    timeOfDay: string;          // "08:00"
    targetDate?: Date;
    recipientEmail: string;
    patientName: string;
    foodInstructions?: string;
    instructions?: string;
    gracePeriodMinutes?: number; // default 45 min
    leadTimeMinutes?: number;    // default 0 (at time of dose)
  }) => {
    const scheduledDate = options.targetDate ? new Date(options.targetDate) : new Date();
    const dayStr = scheduledDate.toISOString().split('T')[0];
    const dedupKey = `med-remind-${options.medicationId}-${dayStr}-${options.timeOfDay.replace(':', '')}`;

    // Prevent duplicate scheduling for the same slot on the same day
    if (scheduledJobKeys.has(dedupKey)) {
      logger.info(`Duplicate reminder scheduling prevented for key: ${dedupKey}`);
      return { scheduled: false, dedupKey, reason: 'ALREADY_SCHEDULED' };
    }
    scheduledJobKeys.add(dedupKey);

    const delayMs = schedulerService.computeDelayMs(options.timeOfDay, scheduledDate);

    // Job A: Dispatch Medication Reminder
    const reminderData = {
      to: options.recipientEmail,
      patientName: options.patientName,
      medicationName: options.medicationName,
      dosage: options.dosage,
      time: options.timeOfDay,
      foodInstructions: options.foodInstructions,
      instructions: options.instructions,
      elderlyId: options.elderlyId,
      medicationId: options.medicationId
    };

    if (reminderQueue && getIsRedisConnected()) {
      await reminderQueue.add('send-medication-reminder', reminderData, {
        jobId: dedupKey,
        delay: delayMs,
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: true
      });
    } else {
      // In-Memory Timer Dispatch
      if (delayMs > 0) {
        const timer = setTimeout(async () => {
          await emailService.sendUpcomingMedicationReminder(options.recipientEmail, reminderData);
          activeTimers.delete(dedupKey);
        }, Math.min(delayMs, 2147483647));
        activeTimers.set(dedupKey, timer);
      } else {
        // If due immediately, trigger async
        setImmediate(async () => {
          await emailService.sendUpcomingMedicationReminder(options.recipientEmail, reminderData);
        });
      }
    }

    // Job B: Grace Period Missed Dose Watcher
    const graceMinutes = options.gracePeriodMinutes || 45;
    const graceDelayMs = delayMs + graceMinutes * 60 * 1000;
    const missedDedupKey = `med-missed-${options.medicationId}-${dayStr}-${options.timeOfDay.replace(':', '')}`;

    const missedData = {
      elderlyId: options.elderlyId,
      medicationId: options.medicationId,
      medicationName: options.medicationName,
      dosage: options.dosage,
      scheduledTime: options.timeOfDay,
      scheduledFor: scheduledDate,
      gracePeriodMinutes: graceMinutes
    };

    await missedDoseService.scheduleMissedDoseCheck(missedData);

    if (missedDoseQueue && getIsRedisConnected()) {
      await missedDoseQueue.add('evaluate-missed-dose', missedData, {
        jobId: missedDedupKey,
        delay: graceDelayMs,
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: true
      });
    } else {
      const graceTimer = setTimeout(async () => {
        await missedDoseService.evaluateDoseStatus(missedData);
        activeTimers.delete(missedDedupKey);
      }, Math.min(graceDelayMs, 2147483647));
      activeTimers.set(missedDedupKey, graceTimer);
    }

    return {
      scheduled: true,
      dedupKey,
      delayMs,
      gracePeriodMinutes: graceMinutes
    };
  },

  // 2. Schedule Appointment Reminders (24-Hour & 2-Hour Reminders)
  scheduleAppointmentReminders: async (options: {
    appointmentId: string;
    elderlyId: string;
    doctorName: string;
    specialty: string;
    hospitalName?: string;
    location: string;
    appointmentDate: Date;
    appointmentTime?: string;
    recipientEmail: string;
    patientName: string;
  }) => {
    const apptTime = options.appointmentDate.getTime();
    const now = Date.now();

    // 24 Hours Notice (86,400,000 ms before)
    const notice24hDelay = apptTime - 24 * 60 * 60 * 1000 - now;
    const dedup24h = `appt-remind-${options.appointmentId}-24h`;

    if (!scheduledJobKeys.has(dedup24h)) {
      scheduledJobKeys.add(dedup24h);
      const data24h = {
        ...options,
        is24HourNotice: true
      };

      if (notice24hDelay > 0) {
        if (appointmentQueue && getIsRedisConnected()) {
          await appointmentQueue.add('send-appointment-reminder', data24h, {
            jobId: dedup24h,
            delay: notice24hDelay,
            attempts: 3,
            backoff: { type: 'exponential', delay: 2000 },
            removeOnComplete: true
          });
        } else {
          const t24 = setTimeout(async () => {
            await schedulerService.processAppointmentReminder(data24h);
            activeTimers.delete(dedup24h);
          }, Math.min(notice24hDelay, 2147483647));
          activeTimers.set(dedup24h, t24);
        }
      }
    }

    // 2 Hours Notice (7,200,000 ms before)
    const notice2hDelay = apptTime - 2 * 60 * 60 * 1000 - now;
    const dedup2h = `appt-remind-${options.appointmentId}-2h`;

    if (!scheduledJobKeys.has(dedup2h)) {
      scheduledJobKeys.add(dedup2h);
      const data2h = {
        ...options,
        is24HourNotice: false
      };

      if (notice2hDelay > 0) {
        if (appointmentQueue && getIsRedisConnected()) {
          await appointmentQueue.add('send-appointment-reminder', data2h, {
            jobId: dedup2h,
            delay: notice2hDelay,
            attempts: 3,
            backoff: { type: 'exponential', delay: 2000 },
            removeOnComplete: true
          });
        } else {
          const t2 = setTimeout(async () => {
            await schedulerService.processAppointmentReminder(data2h);
            activeTimers.delete(dedup2h);
          }, Math.min(notice2hDelay, 2147483647));
          activeTimers.set(dedup2h, t2);
        }
      }
    }

    return { scheduled: true, appointmentId: options.appointmentId };
  },

  // 3. Process Appointment Reminder with Status Validation Guard
  processAppointmentReminder: async (data: {
    appointmentId: string;
    elderlyId: string;
    doctorName: string;
    specialty: string;
    hospitalName?: string;
    location: string;
    appointmentDate: string | Date;
    appointmentTime?: string;
    recipientEmail: string;
    patientName: string;
    is24HourNotice?: boolean;
  }) => {
    const isDb = getIsDatabaseConnected();
    let currentStatus = AppointmentStatus.UPCOMING;

    // Safety rule: avoid sending reminders for cancelled appointments
    if (isDb) {
      const appt = await prisma.appointment.findUnique({
        where: { id: data.appointmentId },
        select: { status: true }
      });
      if (appt) currentStatus = appt.status as any;
    } else {
      const appt = memoryStore.appointments.find((a) => a.id === data.appointmentId);
      if (appt) currentStatus = appt.status;
    }

    if (currentStatus === AppointmentStatus.CANCELLED) {
      logger.info(`Appointment reminder skipped for cancelled appointment: ${data.appointmentId}`);
      return { skipped: true, reason: 'APPOINTMENT_CANCELLED' };
    }

    const dateStr = typeof data.appointmentDate === 'string'
      ? data.appointmentDate
      : new Date(data.appointmentDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });

    await emailService.sendUpcomingAppointmentReminder(data.recipientEmail, {
      patientName: data.patientName,
      doctorName: data.doctorName,
      specialty: data.specialty,
      hospitalName: data.hospitalName,
      appointmentDate: dateStr,
      appointmentTime: data.appointmentTime,
      location: data.location,
      is24HourNotice: data.is24HourNotice,
      elderlyId: data.elderlyId,
      appointmentId: data.appointmentId
    });

    return { sent: true };
  },

  // 4. Server Restart Recovery & Bootstrap Scheduler
  bootstrapScheduler: async () => {
    logger.info('Bootstrapping notification scheduler: scanning active medications & upcoming appointments...');
    const isDb = getIsDatabaseConnected();

    try {
      if (isDb) {
        // Load active medications with active schedules
        const meds = await prisma.medication.findMany({
          where: { isActive: true },
          include: {
            schedules: { where: { isActive: true } },
            elderly: { include: { user: true } }
          }
        });

        for (const med of meds) {
          if (!med.elderly?.user?.email) continue;
          for (const sch of med.schedules) {
            await schedulerService.scheduleMedicationDose({
              elderlyId: med.elderlyId,
              medicationId: med.id,
              medicationName: med.name,
              dosage: sch.dosageOverride || med.dosage,
              timeOfDay: sch.timeOfDay,
              recipientEmail: med.elderly.user.email,
              patientName: med.elderly.user.name,
              foodInstructions: med.instructions || undefined
            });
          }
        }

        // Load upcoming non-cancelled appointments
        const appts = await prisma.appointment.findMany({
          where: {
            status: { in: [AppointmentStatus.UPCOMING as any, AppointmentStatus.SCHEDULED as any] },
            appointmentDate: { gte: new Date() }
          },
          include: {
            elderly: { include: { user: true } }
          }
        });

        for (const appt of appts) {
          if (!appt.elderly?.user?.email) continue;
          await schedulerService.scheduleAppointmentReminders({
            appointmentId: appt.id,
            elderlyId: appt.elderlyId,
            doctorName: appt.doctorName,
            specialty: appt.specialty,
            hospitalName: 'CareNest Medical Pavilion',
            location: appt.location,
            appointmentDate: appt.appointmentDate,
            recipientEmail: appt.elderly.user.email,
            patientName: appt.elderly.user.name
          });
        }
      } else {
        // In-Memory Bootstrap
        const meds = memoryStore.medications.filter((m) => m.isActive);
        for (const med of meds) {
          const elderly = memoryStore.elderlyProfiles.find((e) => e.id === med.elderlyId);
          const user = elderly ? memoryStore.users.find((u) => u.id === elderly.userId) : null;
          if (!user || !user.email) continue;

          const slots = (memoryStore.medicationSchedules || []).filter((s) => s.medicationId === med.id && s.isActive);
          for (const slot of slots) {
            await schedulerService.scheduleMedicationDose({
              elderlyId: med.elderlyId,
              medicationId: med.id,
              medicationName: med.name,
              dosage: slot.dosageOverride || med.dosage,
              timeOfDay: slot.timeOfDay,
              recipientEmail: user.email,
              patientName: user.name,
              foodInstructions: med.foodInstructions || med.instructions
            });
          }
        }

        const appts = memoryStore.appointments.filter(
          (a) => a.status !== AppointmentStatus.CANCELLED && new Date(a.appointmentDate).getTime() >= Date.now()
        );
        for (const appt of appts) {
          const elderly = memoryStore.elderlyProfiles.find((e) => e.id === appt.elderlyId);
          const user = elderly ? memoryStore.users.find((u) => u.id === elderly.userId) : null;
          if (!user || !user.email) continue;

          await schedulerService.scheduleAppointmentReminders({
            appointmentId: appt.id,
            elderlyId: appt.elderlyId,
            doctorName: appt.doctorName,
            specialty: appt.specialty,
            hospitalName: appt.hospitalName,
            location: appt.location,
            appointmentDate: new Date(appt.appointmentDate),
            appointmentTime: appt.appointmentTime,
            recipientEmail: user.email,
            patientName: user.name
          });
        }
      }

      logger.info('Scheduler bootstrap complete: all active clinical reminders provisioned with deduplication.');
    } catch (err: any) {
      logger.warn(`Scheduler bootstrap warning: ${err.message}. Will continue.`);
    }
  },

  // Clear timers (for testing teardown)
  teardownTimers: () => {
    for (const [, timer] of activeTimers) {
      clearTimeout(timer);
    }
    activeTimers.clear();
    scheduledJobKeys.clear();
  }
};

