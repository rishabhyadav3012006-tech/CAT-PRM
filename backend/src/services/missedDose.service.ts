// ==============================================================================
// CareNest Healthcare Platform - Missed Dose Escalation Engine
// Automated Grace Period Evaluation, Multi-Tier Care Circle Alerts,
// In-App Dashboard Notifications, and Escalation Resolution.
// ==============================================================================

import { prisma, memoryStore, getIsDatabaseConnected } from '../config/db.js';
import { MedicationLogStatus, UserRole } from '../constants/roles.js';
import { emailService } from './email.service.js';
import { logger } from '../utils/logger.js';

export interface MissedDoseCheckOptions {
  elderlyId: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  scheduledTime: string;      // "08:00"
  scheduledFor: Date;          // Date object
  gracePeriodMinutes?: number; // Default 45 min
  checkDelayMs?: number;       // For testing / timer dispatch
}

export interface EscalationStatus {
  doseKey: string;
  medicationId: string;
  scheduledFor: string;
  status: 'PENDING_EVALUATION' | 'RESOLVED' | 'ESCALATED';
  resolvedAt?: Date;
  escalatedAt?: Date;
  notifiedRecipients: string[];
}

// Registry to track in-flight dose watchers and prevent duplicate alerts
const activeEscalationRegistry = new Map<string, EscalationStatus>();

export const missedDoseService = {
  // Generate unique idempotency key for this dose occurrence
  getDoseKey: (medicationId: string, scheduledFor: Date, timeSlot: string): string => {
    const dayStr = scheduledFor.toISOString().split('T')[0];
    return `${medicationId}-${dayStr}-${timeSlot.replace(':', '')}`;
  },

  // 1. Schedule Grace Period Watcher
  scheduleMissedDoseCheck: async (options: MissedDoseCheckOptions): Promise<string> => {
    const doseKey = missedDoseService.getDoseKey(options.medicationId, options.scheduledFor, options.scheduledTime);
    const graceMinutes = options.gracePeriodMinutes || 45;

    activeEscalationRegistry.set(doseKey, {
      doseKey,
      medicationId: options.medicationId,
      scheduledFor: options.scheduledFor.toISOString(),
      status: 'PENDING_EVALUATION',
      notifiedRecipients: []
    });

    logger.info(`Scheduled missed-dose grace period watcher for ${options.medicationName} at ${options.scheduledTime} (Grace: ${graceMinutes}m, Key: ${doseKey})`);
    return doseKey;
  },

  // 2. Evaluate Dose Status after Grace Period
  evaluateDoseStatus: async (options: MissedDoseCheckOptions): Promise<{
    resolved: boolean;
    escalated: boolean;
    status: string;
    notifiedCount: number;
    recipients: string[];
  }> => {
    const doseKey = missedDoseService.getDoseKey(options.medicationId, options.scheduledFor, options.scheduledTime);
    const isDb = getIsDatabaseConnected();
    const scheduledDayStr = options.scheduledFor.toISOString().split('T')[0];
    const graceMinutes = options.gracePeriodMinutes || 45;

    // Check if intake was recorded (TAKEN or SKIPPED with clinical reason)
    let isRecorded = false;
    let recordedLog: any = null;

    if (isDb) {
      const logs = await prisma.medicationLog.findMany({
        where: {
          medicationId: options.medicationId,
          scheduledFor: {
            gte: new Date(`${scheduledDayStr}T00:00:00.000Z`),
            lte: new Date(`${scheduledDayStr}T23:59:59.999Z`)
          }
        }
      });
      recordedLog = logs.find(
        (l) => l.status === MedicationLogStatus.TAKEN || l.status === MedicationLogStatus.SKIPPED
      );
      isRecorded = !!recordedLog;
    } else {
      recordedLog = memoryStore.medicationLogs.find((l) => {
        if (l.medicationId !== options.medicationId) return false;
        const logDay = new Date(l.scheduledFor).toISOString().split('T')[0];
        const isFinished = l.status === MedicationLogStatus.TAKEN || l.status === MedicationLogStatus.SKIPPED;
        return logDay === scheduledDayStr && isFinished;
      });
      isRecorded = !!recordedLog;
    }

    // SCENARIO A: Dose was recorded (taken or skipped). Stop escalation!
    if (isRecorded) {
      logger.info(`Missed-dose check resolved: Dose for ${options.medicationName} was recorded as ${recordedLog.status}. Escalation cancelled.`);
      const existing = activeEscalationRegistry.get(doseKey);
      if (existing) {
        existing.status = 'RESOLVED';
        existing.resolvedAt = new Date();
      }
      return {
        resolved: true,
        escalated: false,
        status: recordedLog.status,
        notifiedCount: 0,
        recipients: []
      };
    }

    // SCENARIO B: Dose is still unconfirmed after grace period. Escalate to Family & Caregivers!
    logger.warn(`🚨 Missed-dose escalation triggered for ${options.medicationName} (${options.dosage}) - ${options.scheduledTime}. Grace period of ${graceMinutes}m expired.`);

    // Fetch patient name and care circle contacts
    let patientName = 'Elderly Individual';
    const recipientEmails: Array<{ email: string; name: string; userId: string; role: string }> = [];

    if (isDb) {
      const elderly = await prisma.elderlyProfile.findUnique({
        where: { id: options.elderlyId },
        include: {
          user: { select: { id: true, name: true, email: true } },
          careMembers: {
            where: { status: 'ACTIVE' },
            include: { user: { select: { id: true, name: true, email: true, role: true } } }
          }
        }
      });

      if (elderly) {
        patientName = elderly.user.name;
        // Include patient themselves
        if (elderly.user.email) {
          recipientEmails.push({
            email: elderly.user.email,
            name: elderly.user.name,
            userId: elderly.user.id,
            role: 'PATIENT'
          });
        }
        // Include family administrators and caregivers with medication permissions
        for (const member of elderly.careMembers) {
          if (member.canManageMedications && member.user?.email) {
            recipientEmails.push({
              email: member.user.email,
              name: member.user.name,
              userId: member.user.id,
              role: member.role
            });
          }
        }
      }
    } else {
      const elderly = memoryStore.elderlyProfiles.find((e) => e.id === options.elderlyId);
      if (elderly) {
        const u = memoryStore.users.find((user) => user.id === elderly.userId);
        if (u) {
          patientName = u.name;
          if (u.email) {
            recipientEmails.push({ email: u.email, name: u.name, userId: u.id, role: 'PATIENT' });
          }
        }
      }

      // Add authorized circle members from memoryStore
      const members = memoryStore.careCircleMembers.filter(
        (m) => m.elderlyId === options.elderlyId && m.status === 'ACTIVE' && m.permissions.canManageMedications
      );
      for (const m of members) {
        recipientEmails.push({
          email: m.userEmail,
          name: m.userName,
          userId: m.userId,
          role: m.circleRole
        });
      }
    }

    // Deduplicate recipients
    const uniqueRecipients = new Map<string, { email: string; name: string; userId: string; role: string }>();
    for (const r of recipientEmails) {
      uniqueRecipients.set(r.email.toLowerCase(), r);
    }

    const notifiedList: string[] = [];

    // Dispatch missed-dose alert email to all authorized care circle members
    for (const [, contact] of uniqueRecipients) {
      await emailService.sendMissedDoseAlert(contact.email, {
        patientName,
        medicationName: options.medicationName,
        dosage: options.dosage,
        scheduledTime: options.scheduledTime,
        gracePeriodMinutes: graceMinutes,
        circleRole: contact.role,
        userId: contact.userId,
        elderlyId: options.elderlyId,
        medicationId: options.medicationId
      });
      notifiedList.push(contact.email);
    }

    // Update escalation registry
    activeEscalationRegistry.set(doseKey, {
      doseKey,
      medicationId: options.medicationId,
      scheduledFor: options.scheduledFor.toISOString(),
      status: 'ESCALATED',
      escalatedAt: new Date(),
      notifiedRecipients: notifiedList
    });

    return {
      resolved: false,
      escalated: true,
      status: 'ESCALATED_UNCONFIRMED',
      notifiedCount: notifiedList.length,
      recipients: notifiedList
    };
  },

  // 3. Resolve Dose Escalation (Invoked when dose is logged as taken or skipped)
  resolveDoseEscalation: (medicationId: string, scheduledFor: Date, timeSlot?: string) => {
    let resolvedCount = 0;
    const dayStr = scheduledFor.toISOString().split('T')[0];

    for (const [key, status] of activeEscalationRegistry.entries()) {
      if (status.medicationId === medicationId && key.includes(dayStr)) {
        status.status = 'RESOLVED';
        status.resolvedAt = new Date();
        resolvedCount++;
        logger.info(`Dose escalation resolved for key: ${key}`);
      }
    }

    return { resolvedCount };
  },

  // 4. Get Active Escalation Registry Status
  getEscalationStatus: (doseKey: string): EscalationStatus | undefined => {
    return activeEscalationRegistry.get(doseKey);
  },

  // 5. Clear / Reset Registry (for testing isolation)
  resetRegistry: () => {
    activeEscalationRegistry.clear();
  }
};

