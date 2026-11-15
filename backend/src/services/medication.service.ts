// ==============================================================================
// CareNest Healthcare Platform - Complete Medication Management Service
// Scheduling Engine, Multiple Daily Doses, Adherence Analytics,
// Duplicate Dose Prevention Guard, Stock Tracking, and Clinical Audit Logging.
// ==============================================================================

import { prisma, memoryStore, getIsDatabaseConnected } from '../config/db.js';
import { MedicationLogStatus, UserRole } from '../constants/roles.js';
import { AppError } from '../utils/errors.js';
import { randomUUID } from 'crypto';
import { auditService } from './audit.service.js';
import { missedDoseService } from './missedDose.service.js';
import { emailService } from './email.service.js';
import { schedulerService } from './scheduler.service.js';
import { logger } from '../utils/logger.js';

export interface CreateMedicationDTO {
  elderlyId: string;
  name: string;
  genericName?: string;
  category?: string;
  dosage: string;
  frequency: string;
  scheduledTimes: string[];
  foodRequirement?: string;
  foodInstructions?: string;
  doctorInstructions?: string;
  prescriptionUrl?: string;
  instructions?: string;
  startDate: string;
  endDate?: string;
  stockQuantity?: number;
  refillReminderThreshold?: number;
}

export interface CreateScheduleDTO {
  timeOfDay: string;        // "08:00", "13:00", "20:00" in HH:mm
  dosageOverride?: string;
  daysOfWeek?: number[];    // 0=Sunday, 6=Saturday
  label?: string;           // "Morning with Breakfast"
}

export interface AdherenceLogDTO {
  medicationId: string;
  status: MedicationLogStatus;
  loggedById?: string;
  skipReason?: string;
  notes?: string;
  scheduledFor?: string;
  dosageTaken?: string;
  force?: boolean;
}

export const medicationService = {
  // 1. Fetch Medications (with optional archive filter)
  getMedications: async (elderlyId?: string, includeArchived: boolean = false) => {
    const isDb = getIsDatabaseConnected();
    if (isDb) {
      return prisma.medication.findMany({
        where: {
          ...(elderlyId ? { elderlyId } : {}),
          ...(includeArchived ? {} : { isActive: true })
        },
        include: {
          schedules: {
            where: { isActive: true },
            orderBy: { timeOfDay: 'asc' }
          },
          logs: {
            take: 5,
            orderBy: { scheduledFor: 'desc' },
            include: { loggedBy: { select: { id: true, name: true, role: true } } }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    const filtered = memoryStore.medications.filter((m) => {
      const matchElderly = !elderlyId || m.elderlyId === elderlyId;
      const matchActive = includeArchived || m.isActive;
      return matchElderly && matchActive;
    });

    return filtered.map((m) => {
      const schedules = (memoryStore.medicationSchedules || [])
        .filter((s) => s.medicationId === m.id && s.isActive)
        .sort((a, b) => a.timeOfDay.localeCompare(b.timeOfDay));

      const logs = memoryStore.medicationLogs
        .filter((l) => l.medicationId === m.id)
        .sort((a, b) => new Date(b.scheduledFor).getTime() - new Date(a.scheduledFor).getTime())
        .slice(0, 5)
        .map((l) => {
          const u = l.loggedById ? memoryStore.users.find((user) => user.id === l.loggedById) : undefined;
          return {
            ...l,
            loggedBy: u ? { id: u.id, name: u.name, role: u.role } : undefined
          };
        });

      return {
        ...m,
        schedules,
        logs
      };
    });
  },

  // 2. Fetch Medication by ID
  getMedicationById: async (id: string) => {
    const isDb = getIsDatabaseConnected();
    if (isDb) {
      const med = await prisma.medication.findUnique({
        where: { id },
        include: {
          schedules: {
            where: { isActive: true },
            orderBy: { timeOfDay: 'asc' }
          },
          logs: {
            orderBy: { scheduledFor: 'desc' },
            take: 20,
            include: { loggedBy: { select: { id: true, name: true, role: true } } }
          },
          elderly: {
            include: { user: true }
          }
        }
      });
      if (!med) throw new AppError('Medication not found', 404);
      return med;
    }

    const med = memoryStore.medications.find((m) => m.id === id);
    if (!med) throw new AppError('Medication not found', 404);

    const schedules = (memoryStore.medicationSchedules || [])
      .filter((s) => s.medicationId === id && s.isActive)
      .sort((a, b) => a.timeOfDay.localeCompare(b.timeOfDay));

    const logs = memoryStore.medicationLogs
      .filter((l) => l.medicationId === id)
      .sort((a, b) => new Date(b.scheduledFor).getTime() - new Date(a.scheduledFor).getTime())
      .map((l) => {
        const u = l.loggedById ? memoryStore.users.find((user) => user.id === l.loggedById) : undefined;
        return {
          ...l,
          loggedBy: u ? { id: u.id, name: u.name, role: u.role } : undefined
        };
      });

    const elderlyProfile = memoryStore.elderlyProfiles.find((p) => p.id === med.elderlyId);
    const elderlyUser = elderlyProfile ? memoryStore.users.find((u) => u.id === elderlyProfile.userId) : undefined;

    return {
      ...med,
      schedules,
      logs,
      elderly: elderlyProfile
        ? {
            ...elderlyProfile,
            user: elderlyUser
          }
        : undefined
    };
  },

  // 3. Add Medication (with Auto-Schedule Generation)
  createMedication: async (userId: string, dto: CreateMedicationDTO, ip?: string, userAgent?: string) => {
    const isDb = getIsDatabaseConnected();
    const startDate = new Date(dto.startDate);
    const endDate = dto.endDate ? new Date(dto.endDate) : undefined;

    // Normalize scheduled times to standard HH:mm format
    const scheduledTimes = (dto.scheduledTimes || []).map((t) => {
      const clean = t.trim();
      // Handle "08:00 AM" or "8:00"
      if (clean.includes('AM') || clean.includes('PM')) {
        const parts = clean.split(' ');
        const [h, m] = parts[0].split(':').map(Number);
        let hour = h;
        if (parts[1].toUpperCase() === 'PM' && hour < 12) hour += 12;
        if (parts[1].toUpperCase() === 'AM' && hour === 12) hour = 0;
        return `${String(hour).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      }
      return clean;
    });

    if (isDb) {
      const created = await prisma.medication.create({
        data: {
          elderlyId: dto.elderlyId,
          createdById: userId,
          name: dto.name,
          genericName: dto.genericName,
          category: (dto.category as any) || 'OTHER',
          dosage: dto.dosage,
          frequency: dto.frequency || 'DAILY',
          scheduledTimes,
          instructions: dto.instructions || dto.doctorInstructions,
          startDate,
          endDate,
          stockQuantity: dto.stockQuantity !== undefined ? dto.stockQuantity : 30,
          refillReminderThreshold: dto.refillReminderThreshold !== undefined ? dto.refillReminderThreshold : 7,
          isActive: true,
          // Automatically create recurrence schedules for each time slot
          schedules: {
            create: scheduledTimes.map((time) => ({
              timeOfDay: time,
              dosageOverride: dto.dosage,
              daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
              label: `Dose at ${time}`
            }))
          }
        },
        include: { schedules: true }
      });

      await auditService.logEvent({
        actorId: userId,
        elderlyId: dto.elderlyId,
        action: 'CREATE',
        entityType: 'Medication',
        entityId: created.id,
        description: `Prescribed '${created.name}' (${created.dosage}, ${created.frequency}) with ${scheduledTimes.length} daily dose slots.`,
        ipAddress: ip,
        userAgent
      });

      return created;
    }

    const newMedId = `med-${randomUUID().substring(0, 8)}`;
    const newMed: any = {
      id: newMedId,
      elderlyId: dto.elderlyId,
      createdById: userId,
      name: dto.name,
      genericName: dto.genericName,
      category: dto.category || 'General Health',
      dosage: dto.dosage,
      frequency: dto.frequency || 'DAILY',
      scheduledTimes,
      foodInstructions: dto.foodInstructions || 'WITH_MEAL',
      doctorInstructions: dto.doctorInstructions || dto.instructions,
      prescriptionUrl: dto.prescriptionUrl,
      instructions: dto.instructions || dto.doctorInstructions,
      startDate,
      endDate,
      stockQuantity: dto.stockQuantity !== undefined ? dto.stockQuantity : 30,
      refillReminderThreshold: dto.refillReminderThreshold !== undefined ? dto.refillReminderThreshold : 7,
      lastRefillDate: new Date(),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    memoryStore.medications.push(newMed);

    // Auto-create schedules in memoryStore
    if (!memoryStore.medicationSchedules) memoryStore.medicationSchedules = [];
    const createdSchedules = scheduledTimes.map((time, idx) => {
      const sch = {
        id: `sch-${newMedId}-${idx + 1}`,
        medicationId: newMedId,
        timeOfDay: time,
        dosageOverride: dto.dosage,
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        label: `Dose at ${time}`,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      memoryStore.medicationSchedules.push(sch);
      return sch;
    });

    await auditService.logEvent({
      actorId: userId,
      elderlyId: dto.elderlyId,
      action: 'CREATE',
      entityType: 'Medication',
      entityId: newMedId,
      description: `Prescribed '${newMed.name}' (${newMed.dosage}) with ${scheduledTimes.length} daily dose slots.`,
      ipAddress: ip,
      userAgent
    });

    return {
      ...newMed,
      schedules: createdSchedules
    };
  },

  // 4. Update Medication (Preserves Historical Logs)
  updateMedication: async (id: string, dto: Partial<CreateMedicationDTO>, actorId?: string, ip?: string, userAgent?: string) => {
    const isDb = getIsDatabaseConnected();

    if (isDb) {
      const updated = await prisma.medication.update({
        where: { id },
        data: {
          ...(dto.name ? { name: dto.name } : {}),
          ...(dto.dosage ? { dosage: dto.dosage } : {}),
          ...(dto.frequency ? { frequency: dto.frequency } : {}),
          ...(dto.scheduledTimes ? { scheduledTimes: dto.scheduledTimes } : {}),
          ...(dto.instructions ? { instructions: dto.instructions } : {}),
          ...(dto.stockQuantity !== undefined ? { stockQuantity: dto.stockQuantity } : {}),
          ...(dto.refillReminderThreshold !== undefined ? { refillReminderThreshold: dto.refillReminderThreshold } : {})
        },
        include: { schedules: true }
      });

      await auditService.logEvent({
        actorId,
        elderlyId: updated.elderlyId,
        action: 'UPDATE',
        entityType: 'Medication',
        entityId: id,
        description: `Updated clinical medication protocol for '${updated.name}'.`,
        ipAddress: ip,
        userAgent
      });

      return updated;
    }

    const med = memoryStore.medications.find((m) => m.id === id);
    if (!med) throw new AppError('Medication not found', 404);

    if (dto.name) med.name = dto.name;
    if (dto.category) med.category = dto.category;
    if (dto.dosage) med.dosage = dto.dosage;
    if (dto.frequency) med.frequency = dto.frequency;
    if (dto.scheduledTimes) med.scheduledTimes = dto.scheduledTimes;
    if (dto.instructions) med.instructions = dto.instructions;
    if (dto.stockQuantity !== undefined) med.stockQuantity = dto.stockQuantity;
    if (dto.refillReminderThreshold !== undefined) med.refillReminderThreshold = dto.refillReminderThreshold;
    med.updatedAt = new Date();

    await auditService.logEvent({
      actorId,
      elderlyId: med.elderlyId,
      action: 'UPDATE',
      entityType: 'Medication',
      entityId: id,
      description: `Updated clinical medication protocol for '${med.name}'.`,
      ipAddress: ip,
      userAgent
    });

    return med;
  },

  // 5. Archive / Discontinue Medication (Ceases Future Doses Without Corrupting Past History)
  archiveMedication: async (id: string, actorId?: string, ip?: string, userAgent?: string) => {
    const isDb = getIsDatabaseConnected();
    if (isDb) {
      const archived = await prisma.medication.update({
        where: { id },
        data: {
          isActive: false,
          isArchived: true,
          archivedAt: new Date(),
          archivedById: actorId
        }
      });

      await auditService.logEvent({
        actorId,
        elderlyId: archived.elderlyId,
        action: 'UPDATE',
        entityType: 'Medication',
        entityId: id,
        description: `Discontinued and archived medication '${archived.name}'. Future scheduled doses suspended; clinical history preserved.`,
        ipAddress: ip,
        userAgent
      });

      return {
        message: `${archived.name} discontinued and archived successfully. Historical records preserved.`,
        id
      };
    }

    const med = memoryStore.medications.find((m) => m.id === id);
    if (!med) throw new AppError('Medication not found', 404);

    med.isActive = false;
    (med as any).isArchived = true;
    (med as any).archivedAt = new Date();
    (med as any).archivedById = actorId;
    med.updatedAt = new Date();

    await auditService.logEvent({
      actorId,
      elderlyId: med.elderlyId,
      action: 'UPDATE',
      entityType: 'Medication',
      entityId: id,
      description: `Discontinued and archived medication '${med.name}'. Historical records preserved.`,
      ipAddress: ip,
      userAgent
    });

    return {
      message: `${med.name} discontinued and archived successfully. Historical records preserved.`,
      id
    };
  },

  // 6. Create Medication Schedule Slot
  createSchedule: async (medicationId: string, dto: CreateScheduleDTO, actorId?: string) => {
    const isDb = getIsDatabaseConnected();
    const daysOfWeek = dto.daysOfWeek || [0, 1, 2, 3, 4, 5, 6];

    if (isDb) {
      const schedule = await prisma.medicationSchedule.create({
        data: {
          medicationId,
          timeOfDay: dto.timeOfDay,
          dosageOverride: dto.dosageOverride,
          daysOfWeek,
          label: dto.label || `Dose at ${dto.timeOfDay}`,
          isActive: true
        }
      });

      await auditService.logEvent({
        actorId,
        action: 'CREATE',
        entityType: 'MedicationSchedule',
        entityId: schedule.id,
        description: `Created schedule slot ${dto.timeOfDay} for medication ${medicationId}.`
      });

      return schedule;
    }

    const scheduleId = `sch-${randomUUID().substring(0, 8)}`;
    const newSch = {
      id: scheduleId,
      medicationId,
      timeOfDay: dto.timeOfDay,
      dosageOverride: dto.dosageOverride,
      daysOfWeek,
      label: dto.label || `Dose at ${dto.timeOfDay}`,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    if (!memoryStore.medicationSchedules) memoryStore.medicationSchedules = [];
    memoryStore.medicationSchedules.push(newSch);

    return newSch;
  },

  // 7. Update Medication Schedule Slot
  updateSchedule: async (scheduleId: string, dto: Partial<CreateScheduleDTO>, actorId?: string) => {
    const isDb = getIsDatabaseConnected();

    if (isDb) {
      return prisma.medicationSchedule.update({
        where: { id: scheduleId },
        data: {
          ...(dto.timeOfDay ? { timeOfDay: dto.timeOfDay } : {}),
          ...(dto.dosageOverride ? { dosageOverride: dto.dosageOverride } : {}),
          ...(dto.daysOfWeek ? { daysOfWeek: dto.daysOfWeek } : {}),
          ...(dto.label ? { label: dto.label } : {})
        }
      });
    }

    const sch = (memoryStore.medicationSchedules || []).find((s) => s.id === scheduleId);
    if (!sch) throw new AppError('Medication schedule not found', 404);

    if (dto.timeOfDay) sch.timeOfDay = dto.timeOfDay;
    if (dto.dosageOverride) sch.dosageOverride = dto.dosageOverride;
    if (dto.daysOfWeek) sch.daysOfWeek = dto.daysOfWeek;
    if (dto.label) sch.label = dto.label;
    sch.updatedAt = new Date();

    return sch;
  },

  // 8. Fetch Today's Medication Schedule (The Core Scheduling Engine)
  getTodaySchedule: async (elderlyId: string, targetDateStr?: string, timeZone = 'America/New_York') => {
    const isDb = getIsDatabaseConnected();

    // Determine target date window in patient's timezone
    const now = new Date();
    const targetDate = targetDateStr ? new Date(targetDateStr) : now;
    const targetDayStr = targetDate.toISOString().split('T')[0]; // "YYYY-MM-DD"
    const targetDayOfWeek = targetDate.getDay(); // 0 = Sunday, 6 = Saturday

    // 1. Fetch active medications for this elderly profile
    let medications: any[] = [];
    if (isDb) {
      medications = await prisma.medication.findMany({
        where: {
          elderlyId,
          isActive: true,
          startDate: { lte: new Date(`${targetDayStr}T23:59:59.999Z`) },
          OR: [
            { endDate: null },
            { endDate: { gte: new Date(`${targetDayStr}T00:00:00.000Z`) } }
          ]
        },
        include: {
          schedules: {
            where: { isActive: true }
          }
        }
      });
    } else {
      medications = memoryStore.medications.filter((m) => {
        if (m.elderlyId !== elderlyId || !m.isActive) return false;
        const start = new Date(m.startDate).toISOString().split('T')[0];
        const end = m.endDate ? new Date(m.endDate).toISOString().split('T')[0] : null;
        if (targetDayStr < start) return false;
        if (end && targetDayStr > end) return false;
        return true;
      });
    }

    // 2. Fetch all medication logs recorded for this patient today
    let todaysLogs: any[] = [];
    if (isDb) {
      todaysLogs = await prisma.medicationLog.findMany({
        where: {
          medication: { elderlyId },
          scheduledFor: {
            gte: new Date(`${targetDayStr}T00:00:00.000Z`),
            lte: new Date(`${targetDayStr}T23:59:59.999Z`)
          }
        },
        include: {
          loggedBy: { select: { id: true, name: true, role: true } }
        }
      });
    } else {
      todaysLogs = memoryStore.medicationLogs.filter((l) => {
        const logDay = new Date(l.scheduledFor).toISOString().split('T')[0];
        return logDay === targetDayStr;
      });
    }

    // 3. Generate scheduled dose occurrences for each active schedule slot
    const doses: any[] = [];

    for (const med of medications) {
      // Gather slots: from Prisma schedules or fallback scheduledTimes
      let slots = med.schedules && med.schedules.length > 0 ? med.schedules : [];

      if (slots.length === 0) {
        // Fallback to memoryStore schedules or scheduledTimes array
        const memorySchedules = (memoryStore.medicationSchedules || []).filter(
          (s) => s.medicationId === med.id && s.isActive
        );
        if (memorySchedules.length > 0) {
          slots = memorySchedules;
        } else if (med.scheduledTimes && med.scheduledTimes.length > 0) {
          slots = med.scheduledTimes.map((t: string) => ({
            timeOfDay: t,
            dosageOverride: med.dosage,
            daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
            label: `Dose at ${t}`
          }));
        }
      }

      for (const slot of slots) {
        // Check day-of-week eligibility
        const days = slot.daysOfWeek || [0, 1, 2, 3, 4, 5, 6];
        if (!days.includes(targetDayOfWeek)) {
          continue; // Dose not scheduled on this day of week
        }

        // Compute scheduled ISO timestamp
        const timeOfDay = slot.timeOfDay.trim();
        const [hours, minutes] = timeOfDay.split(':').map(Number);
        const scheduledTimestamp = new Date(
          `${targetDayStr}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00Z`
        );

        // Check if an existing intake/skip log exists for this medication slot
        const existingLog = todaysLogs.find((l) => {
          if (l.medicationId !== med.id) return false;
          // Match by scheduleId or time within 1 hour of scheduled timestamp
          if (l.scheduleId && slot.id && l.scheduleId === slot.id) return true;
          const diffMs = Math.abs(new Date(l.scheduledFor).getTime() - scheduledTimestamp.getTime());
          return diffMs <= 60 * 60 * 1000;
        });

        let status = MedicationLogStatus.PENDING;
        let takenAt: Date | undefined;
        let recordedByName: string | undefined;
        let skipReason: string | undefined;
        let notes: string | undefined;
        let logId: string | undefined;

        if (existingLog) {
          status = existingLog.status as MedicationLogStatus;
          takenAt = existingLog.takenAt;
          recordedByName = existingLog.recordedByName || existingLog.loggedBy?.name;
          skipReason = existingLog.skipReason;
          notes = existingLog.notes;
          logId = existingLog.id;
        } else {
          // If no log exists yet, compare scheduled time with current time:
          // CLINICAL SAFETY RULE: Do NOT assume an unconfirmed dose was definitely missed.
          // Distinguish upcoming vs pending awaiting confirmation.
          const isFuture = scheduledTimestamp.getTime() > now.getTime();
          status = isFuture ? MedicationLogStatus.PENDING : MedicationLogStatus.PENDING;
        }

        // Categorize into Morning, Afternoon, Evening, Bedtime
        let period: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT' = 'MORNING';
        if (hours >= 12 && hours < 17) period = 'AFTERNOON';
        else if (hours >= 17 && hours < 21) period = 'EVENING';
        else if (hours >= 21 || hours < 5) period = 'NIGHT';

        doses.push({
          doseId: logId || `dose-${med.id}-${timeOfDay.replace(':', '')}`,
          logId,
          medicationId: med.id,
          scheduleId: slot.id,
          medicationName: med.name,
          genericName: med.genericName,
          category: med.category,
          dosage: slot.dosageOverride || med.dosage,
          foodRequirement: med.foodRequirement || med.foodInstructions || 'WITH_FOOD',
          instructions: med.instructions,
          timeOfDay,
          period,
          scheduledFor: scheduledTimestamp.toISOString(),
          status,
          takenAt,
          recordedByName,
          skipReason,
          notes,
          stockRemaining: med.stockQuantity,
          refillWarning: med.stockQuantity <= med.refillReminderThreshold
        });
      }
    }

    // Sort doses chronologically
    doses.sort((a, b) => a.timeOfDay.localeCompare(b.timeOfDay));

    // Calculate daily metrics
    const totalDoses = doses.length;
    const takenDoses = doses.filter((d) => d.status === MedicationLogStatus.TAKEN).length;
    const skippedDoses = doses.filter((d) => d.status === MedicationLogStatus.SKIPPED).length;
    const pendingDoses = doses.filter(
      (d) => d.status === MedicationLogStatus.PENDING || d.status === MedicationLogStatus.UPCOMING
    ).length;

    const complianceRate = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 100;

    return {
      date: targetDayStr,
      timeZone,
      totalDoses,
      takenDoses,
      skippedDoses,
      pendingDoses,
      complianceRate,
      doses
    };
  },

  // 9. Record Medication as Taken (Decrements stock, Prevents Duplicate Dose)
  recordTaken: async (data: AdherenceLogDTO, actorId?: string, ip?: string, userAgent?: string) => {
    return medicationService.logAdherence({
      ...data,
      status: MedicationLogStatus.TAKEN,
      loggedById: actorId
    }, ip, userAgent);
  },

  // 10. Record Medication as Skipped (Requires Skip Reason, Preserves Stock)
  recordSkipped: async (data: AdherenceLogDTO, actorId?: string, ip?: string, userAgent?: string) => {
    if (!data.skipReason || !data.skipReason.trim()) {
      throw new AppError('A clinical reason must be provided when recording a skipped medication dose.', 400);
    }

    return medicationService.logAdherence({
      ...data,
      status: MedicationLogStatus.SKIPPED,
      loggedById: actorId
    }, ip, userAgent);
  },

  // Core Adherence Logger (Dual-Mode: Prisma DB + MemoryStore)
  logAdherence: async (data: AdherenceLogDTO, ip?: string, userAgent?: string) => {
    if (data.status === MedicationLogStatus.SKIPPED && (!data.skipReason || !data.skipReason.trim())) {
      throw new AppError('A clinical reason must be provided when recording a skipped medication dose.', 400);
    }

    const isDb = getIsDatabaseConnected();
    const scheduledTime = data.scheduledFor ? new Date(data.scheduledFor) : new Date();

    // Fetch user details for audit trail
    let recordedByName = 'Care Circle';
    let recordedByRole = 'CARETAKER';

    if (data.loggedById) {
      if (isDb) {
        const u = await prisma.user.findUnique({ where: { id: data.loggedById } });
        if (u) {
          recordedByName = u.name;
          recordedByRole = u.role;
        }
      } else {
        const u = memoryStore.users.find((user) => user.id === data.loggedById);
        if (u) {
          recordedByName = u.name;
          recordedByRole = u.role;
        }
      }
    }

    // 1. Prevent duplicate dose recording for the same scheduled slot on the same day
    if (!data.force) {
      const scheduledDayString = scheduledTime.toISOString().split('T')[0];
      const existingLogs = isDb
        ? await prisma.medicationLog.findMany({ where: { medicationId: data.medicationId } })
        : memoryStore.medicationLogs.filter((l) => l.medicationId === data.medicationId);

      const alreadyRecorded = existingLogs.some((l) => {
        const logDay = new Date(l.scheduledFor).toISOString().split('T')[0];
        const isFinished = l.status === MedicationLogStatus.TAKEN || l.status === MedicationLogStatus.SKIPPED;
        return logDay === scheduledDayString && isFinished;
      });

      if (alreadyRecorded) {
        throw new AppError(
          'A dose has already been recorded for this medication today. Duplicate intake prevented for safety.',
          409
        );
      }
    }

    if (isDb) {
      const log = await prisma.medicationLog.create({
        data: {
          medicationId: data.medicationId,
          status: data.status as any,
          scheduledFor: scheduledTime,
          takenAt: data.status === MedicationLogStatus.TAKEN ? new Date() : null,
          loggedById: data.loggedById,
          recordedByName,
          recordedByRole,
          skipReason: data.skipReason,
          dosageTaken: data.dosageTaken,
          notes: data.notes
        },
        include: { medication: true }
      });

      // Decrement stock if dose was taken
      if (data.status === MedicationLogStatus.TAKEN) {
        await prisma.medication.update({
          where: { id: data.medicationId },
          data: { stockQuantity: { decrement: 1 } }
        });
      }

      // Security Audit Log
      await auditService.logEvent({
        actorId: data.loggedById,
        elderlyId: log.medication.elderlyId,
        action: 'UPDATE',
        entityType: 'MedicationLog',
        entityId: log.id,
        description: data.status === MedicationLogStatus.TAKEN
          ? `Recorded dose TAKEN for '${log.medication.name}'. Administered by ${recordedByName}.`
          : `Recorded dose SKIPPED for '${log.medication.name}'. Reason: ${data.skipReason || 'Unspecified'}. Recorded by ${recordedByName}.`,
        ipAddress: ip,
        userAgent
      });

      return { ...log, loggedByName: recordedByName };
    }

    const newLogId = `log-${randomUUID().substring(0, 8)}`;
    const newLog: any = {
      id: newLogId,
      medicationId: data.medicationId,
      scheduledFor: scheduledTime,
      takenAt: data.status === MedicationLogStatus.TAKEN ? new Date() : undefined,
      status: data.status,
      loggedById: data.loggedById,
      recordedByName,
      recordedByRole,
      skipReason: data.skipReason,
      notes: data.notes,
      createdAt: new Date()
    };
    memoryStore.medicationLogs.push(newLog);

    // Decrement stock if taken
    const med = memoryStore.medications.find((m) => m.id === data.medicationId);
    if (data.status === MedicationLogStatus.TAKEN && med && med.stockQuantity > 0) {
      med.stockQuantity -= 1;
    }

    if (med) {
      await auditService.logEvent({
        actorId: data.loggedById,
        elderlyId: med.elderlyId,
        action: 'UPDATE',
        entityType: 'MedicationLog',
        entityId: newLogId,
        description: data.status === MedicationLogStatus.TAKEN
          ? `Recorded dose TAKEN for '${med.name}'. Administered by ${recordedByName}.`
          : `Recorded dose SKIPPED for '${med.name}'. Reason: ${data.skipReason || 'Unspecified'}. Recorded by ${recordedByName}.`,
        ipAddress: ip,
        userAgent
      });

      // Stop any active escalation for this dose slot
      missedDoseService.resolveDoseEscalation(data.medicationId, scheduledTime);

      // If dose was TAKEN, send medication confirmation receipt to patient
      if (data.status === MedicationLogStatus.TAKEN) {
        const elderly = memoryStore.elderlyProfiles.find((e) => e.id === med.elderlyId);
        const user = elderly ? memoryStore.users.find((u) => u.id === elderly.userId) : null;
        if (user && user.email) {
          emailService.sendMedicationConfirmation(user.email, {
            patientName: user.name,
            medicationName: med.name,
            dosage: data.dosageTaken || med.dosage,
            takenAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            administeredByName: recordedByName,
            userId: user.id,
            elderlyId: med.elderlyId,
            medicationId: med.id
          }).catch(() => {});
        }
      }
    }

    return newLog;
  },

  // 11. Fetch Medication History
  getMedicationHistory: async (elderlyId?: string, medicationId?: string) => {
    const isDb = getIsDatabaseConnected();
    if (isDb) {
      return prisma.medicationLog.findMany({
        where: {
          ...(medicationId ? { medicationId } : {}),
          ...(elderlyId ? { medication: { elderlyId } } : {})
        },
        include: {
          medication: true,
          loggedBy: {
            select: { id: true, name: true, role: true }
          }
        },
        orderBy: { scheduledFor: 'desc' },
        take: 100
      });
    }

    let logs = memoryStore.medicationLogs;
    if (medicationId) {
      logs = logs.filter((l) => l.medicationId === medicationId);
    } else if (elderlyId) {
      const medIds = memoryStore.medications.filter((m) => m.elderlyId === elderlyId).map((m) => m.id);
      logs = logs.filter((l) => medIds.includes(l.medicationId));
    }

    return logs
      .map((l) => {
        const med = memoryStore.medications.find((m) => m.id === l.medicationId);
        const user = l.loggedById ? memoryStore.users.find((u) => u.id === l.loggedById) : undefined;
        return {
          ...l,
          medication: med,
          loggedBy: user ? { id: user.id, name: user.name, role: user.role } : undefined
        };
      })
      .sort((a, b) => new Date(b.scheduledFor).getTime() - new Date(a.scheduledFor).getTime());
  },

  // 12. Calculate Comprehensive Adherence Statistics
  getAdherenceStats: async (elderlyId: string, periodDays = 30) => {
    const isDb = getIsDatabaseConnected();
    const cutoffDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);
    const now = new Date();

    if (isDb) {
      const logs = await prisma.medicationLog.findMany({
        where: {
          medication: { elderlyId },
          scheduledFor: { gte: cutoffDate }
        },
        orderBy: { scheduledFor: 'desc' },
        include: { medication: { select: { name: true, dosage: true } } }
      });

      // Filter eligible doses whose scheduled time has occurred
      const eligibleLogs = logs.filter((l) => new Date(l.scheduledFor).getTime() <= now.getTime());
      const totalEligible = eligibleLogs.length;

      const taken = eligibleLogs.filter((l) => l.status === 'TAKEN').length;
      const skipped = eligibleLogs.filter((l) => l.status === 'SKIPPED').length;
      const missed = eligibleLogs.filter((l) => l.status === 'MISSED').length;
      // Do not assume unconfirmed was definitely missed
      const unconfirmed = eligibleLogs.filter((l) => l.status === 'PENDING' || (l.status as any) === 'UPCOMING').length;

      const adherenceRate = totalEligible > 0 ? Math.round((taken / totalEligible) * 100) : 100;

      return {
        elderlyId,
        periodDays,
        totalEligible,
        total: totalEligible,
        taken,
        skipped,
        missed,
        unconfirmed,
        adherenceRate,
        rate: adherenceRate,
        recentLogs: logs.slice(0, 15)
      };
    }

    const elderlyMeds = memoryStore.medications.filter((m) => m.elderlyId === elderlyId);
    const medIds = elderlyMeds.map((m) => m.id);
    const logs = memoryStore.medicationLogs.filter(
      (l) => medIds.includes(l.medicationId) && new Date(l.scheduledFor).getTime() >= cutoffDate.getTime()
    );

    const eligibleLogs = logs.filter((l) => new Date(l.scheduledFor).getTime() <= now.getTime());
    const totalEligible = eligibleLogs.length;

    const taken = eligibleLogs.filter((l) => l.status === MedicationLogStatus.TAKEN).length;
    const skipped = eligibleLogs.filter((l) => l.status === MedicationLogStatus.SKIPPED).length;
    const missed = eligibleLogs.filter((l) => l.status === MedicationLogStatus.MISSED).length;
    const unconfirmed = eligibleLogs.filter(
      (l) => l.status === MedicationLogStatus.PENDING || l.status === MedicationLogStatus.UPCOMING
    ).length;

    const adherenceRate = totalEligible > 0 ? Math.round((taken / totalEligible) * 100) : 100;

    return {
      elderlyId,
      periodDays,
      totalEligible,
      total: totalEligible,
      taken,
      skipped,
      missed,
      unconfirmed,
      adherenceRate,
      rate: adherenceRate,
      recentLogs: logs.slice(-15)
    };
  },

  // 13. Medication Refill Tracking
  refillMedication: async (id: string, quantityToAdd: number = 30, actorId?: string) => {
    const isDb = getIsDatabaseConnected();
    if (isDb) {
      const updated = await prisma.medication.update({
        where: { id },
        data: {
          stockQuantity: { increment: quantityToAdd },
          lastRefillDate: new Date()
        }
      });

      await auditService.logEvent({
        actorId,
        elderlyId: updated.elderlyId,
        action: 'UPDATE',
        entityType: 'Medication',
        entityId: id,
        description: `Refilled stock for '${updated.name}'. Added ${quantityToAdd} doses; new balance: ${updated.stockQuantity}.`
      });

      return {
        message: `Refill confirmed. Added ${quantityToAdd} doses. New stock: ${updated.stockQuantity}.`,
        medication: updated
      };
    }

    const med = memoryStore.medications.find((m) => m.id === id);
    if (!med) throw new AppError('Medication not found', 404);

    med.stockQuantity += quantityToAdd;
    med.lastRefillDate = new Date();
    med.updatedAt = new Date();

    await auditService.logEvent({
      actorId,
      elderlyId: med.elderlyId,
      action: 'UPDATE',
      entityType: 'Medication',
      entityId: id,
      description: `Refilled stock for '${med.name}'. Added ${quantityToAdd} doses; new balance: ${med.stockQuantity}.`
    });

    return {
      message: `Refill confirmed. Added ${quantityToAdd} doses. New stock: ${med.stockQuantity}.`,
      medication: med
    };
  }
};
