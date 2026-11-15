import { Queue, Worker, Job } from 'bullmq';
import { redisClient, getIsRedisConnected } from '../config/redis.js';
import { emailService } from './email.service.js';
import { logger } from '../utils/logger.js';

let medicationQueue: Queue | null = null;
let appointmentQueue: Queue | null = null;
let sosQueue: Queue | null = null;

let medicationWorker: Worker | null = null;
let appointmentWorker: Worker | null = null;
let sosWorker: Worker | null = null;

export const initQueues = async () => {
  // Only connect BullMQ if Redis is active
  if (!getIsRedisConnected()) {
    logger.info('BullMQ initialization skipped because Redis is offline. Direct dispatch mode is active.');
    return;
  }

  try {
    const queueOptions = { connection: redisClient };

    medicationQueue = new Queue('medication-reminders', queueOptions);
    appointmentQueue = new Queue('appointment-reminders', queueOptions);
    sosQueue = new Queue('sos-alerts', queueOptions);

    // BullMQ Worker for Medication Reminders
    medicationWorker = new Worker(
      'medication-reminders',
      async (job: Job) => {
        const { to, patientName, medicationName, dosage, time, instructions } = job.data;
        logger.info(`Processing BullMQ job: medication-reminder [${job.id}] for ${patientName}`);
        await emailService.sendMedicationReminder(to, patientName, medicationName, dosage, time, instructions);
      },
      queueOptions
    );

    // BullMQ Worker for Appointment Reminders
    appointmentWorker = new Worker(
      'appointment-reminders',
      async (job: Job) => {
        const { to, patientName, doctorName, specialty, appointmentDate, location } = job.data;
        logger.info(`Processing BullMQ job: appointment-reminder [${job.id}] for ${patientName}`);
        await emailService.sendAppointmentReminder(to, patientName, doctorName, specialty, appointmentDate, location);
      },
      queueOptions
    );

    // BullMQ Worker for Emergency SOS
    sosWorker = new Worker(
      'sos-alerts',
      async (job: Job) => {
        const { to, elderlyName, emergencyType, triggeredAt, emergencyContactPhone } = job.data;
        logger.info(`Processing BullMQ job: sos-alert [${job.id}] for ${elderlyName}`);
        await emailService.sendEmergencyAlertEmail(to, elderlyName, emergencyType, triggeredAt, emergencyContactPhone);
      },
      queueOptions
    );

    logger.info('BullMQ queues & workers initialized successfully.');
  } catch (error: any) {
    logger.warn(`Failed to initialize BullMQ workers: ${error.message}. Running in fallback dispatch mode.`);
  }
};

export const queueService = {
  dispatchMedicationReminder: async (data: {
    to: string;
    patientName: string;
    medicationName: string;
    dosage: string;
    time: string;
    instructions?: string;
    delayMs?: number;
  }) => {
    if (medicationQueue && getIsRedisConnected()) {
      await medicationQueue.add('send-reminder', data, {
        delay: data.delayMs || 0,
        removeOnComplete: true
      });
    } else {
      // Direct async dispatch fallback
      emailService.sendMedicationReminder(
        data.to,
        data.patientName,
        data.medicationName,
        data.dosage,
        data.time,
        data.instructions
      );
    }
  },

  dispatchAppointmentReminder: async (data: {
    to: string;
    patientName: string;
    doctorName: string;
    specialty: string;
    appointmentDate: string;
    location: string;
    delayMs?: number;
  }) => {
    if (appointmentQueue && getIsRedisConnected()) {
      await appointmentQueue.add('send-appointment-reminder', data, {
        delay: data.delayMs || 0,
        removeOnComplete: true
      });
    } else {
      emailService.sendAppointmentReminder(
        data.to,
        data.patientName,
        data.doctorName,
        data.specialty,
        data.appointmentDate,
        data.location
      );
    }
  },

  dispatchSosAlert: async (data: {
    to: string;
    elderlyName: string;
    emergencyType: string;
    triggeredAt: string;
    emergencyContactPhone: string;
  }) => {
    if (sosQueue && getIsRedisConnected()) {
      await sosQueue.add('broadcast-sos', data, {
        priority: 1,
        removeOnComplete: true
      });
    } else {
      emailService.sendEmergencyAlertEmail(
        data.to,
        data.elderlyName,
        data.emergencyType,
        data.triggeredAt,
        data.emergencyContactPhone
      );
    }
  }
};

