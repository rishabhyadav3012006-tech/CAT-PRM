// ==============================================================================
// CareNest Healthcare Platform - Health Records & Biometrics Service
// Longitudinal vital signs, clinical thresholds, wellness logs, and audit trails.
// ==============================================================================

import { prisma, memoryStore, getIsDatabaseConnected } from '../config/db.js';
import { auditService } from './audit.service.js';
import { AppError } from '../utils/errors.js';
import { randomUUID } from 'crypto';
import { logger } from '../utils/logger.js';

export interface CreateHealthRecordDTO {
  elderlyId: string;
  systolicBp?: number;
  diastolicBp?: number;
  bloodGlucose?: number;
  heartRate?: number;
  oxygenSaturation?: number;
  bodyTemperature?: number;
  weight?: number;
  mood?: string;
  painLevel?: number;
  sleepHours?: number;
  wellnessNotes?: string;
  notes?: string;
  recordedAt?: string;
}

export interface UpdateHealthRecordDTO {
  systolicBp?: number;
  diastolicBp?: number;
  bloodGlucose?: number;
  heartRate?: number;
  oxygenSaturation?: number;
  bodyTemperature?: number;
  weight?: number;
  mood?: string;
  painLevel?: number;
  sleepHours?: number;
  wellnessNotes?: string;
  notes?: string;
}

const evaluateVitalAlerts = (vitals: {
  systolicBp?: number;
  diastolicBp?: number;
  bloodGlucose?: number;
  heartRate?: number;
  oxygenSaturation?: number;
}) => {
  let isAlert = false;
  const alertReasons: string[] = [];

  if (vitals.systolicBp && (vitals.systolicBp >= 140 || vitals.systolicBp <= 90)) {
    isAlert = true;
    alertReasons.push(`Systolic BP out of range (${vitals.systolicBp} mmHg)`);
  }
  if (vitals.diastolicBp && (vitals.diastolicBp >= 90 || vitals.diastolicBp <= 60)) {
    isAlert = true;
    alertReasons.push(`Diastolic BP out of range (${vitals.diastolicBp} mmHg)`);
  }
  if (vitals.bloodGlucose && (vitals.bloodGlucose > 180 || vitals.bloodGlucose < 70)) {
    isAlert = true;
    alertReasons.push(`Blood Glucose abnormal (${vitals.bloodGlucose} mg/dL)`);
  }
  if (vitals.oxygenSaturation && vitals.oxygenSaturation < 94) {
    isAlert = true;
    alertReasons.push(`Low Oxygen Saturation (${vitals.oxygenSaturation}%)`);
  }
  if (vitals.heartRate && (vitals.heartRate > 100 || vitals.heartRate < 50)) {
    isAlert = true;
    alertReasons.push(`Abnormal Heart Rate (${vitals.heartRate} bpm)`);
  }

  return { isAlert, alertReason: alertReasons.join('; ') || undefined };
};

const formatWellnessNotes = (dto: {
  mood?: string;
  painLevel?: number;
  sleepHours?: number;
  wellnessNotes?: string;
  notes?: string;
}) => {
  const parts: string[] = [];
  if (dto.mood) parts.push(`Mood: ${dto.mood}`);
  if (dto.painLevel !== undefined) parts.push(`Pain: ${dto.painLevel}/10`);
  if (dto.sleepHours !== undefined) parts.push(`Sleep: ${dto.sleepHours} hrs`);
  if (dto.wellnessNotes) parts.push(`Wellness: ${dto.wellnessNotes}`);

  const wellnessHeader = parts.length > 0 ? `[Wellness: ${parts.join(', ')}]` : '';
  if (wellnessHeader && dto.notes) {
    return `${wellnessHeader} ${dto.notes}`;
  }
  return wellnessHeader || dto.notes || undefined;
};

export const recordService = {
  // 1. Fetch Health Records (paginated)
  getRecords: async (elderlyId?: string, page = 1, limit = 20) => {
    const isDb = getIsDatabaseConnected();
    const skip = (page - 1) * limit;

    if (isDb) {
      const where: any = elderlyId ? { elderlyId } : {};
      const [items, total] = await Promise.all([
        prisma.healthLog.findMany({
          where,
          orderBy: { recordedAt: 'desc' },
          skip,
          take: limit,
          include: {
            recordedBy: {
              select: { id: true, name: true, role: true }
            }
          }
        }),
        prisma.healthLog.count({ where })
      ]);

      return {
        items,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    }

    const filtered = elderlyId
      ? memoryStore.healthRecords.filter((r) => r.elderlyId === elderlyId)
      : memoryStore.healthRecords;

    const sorted = [...filtered].sort((a, b) => b.recordedAt.getTime() - a.recordedAt.getTime());
    const total = sorted.length;
    const paginated = sorted.slice(skip, skip + limit).map((r) => {
      const user = memoryStore.users.find((u) => u.id === r.recordedById);
      return {
        ...r,
        recordedBy: user ? { id: user.id, name: user.name, role: user.role } : null
      };
    });

    return {
      items: paginated,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  // 2. Fetch Historical Records with Date Range Filtering
  getRecordHistory: async (
    elderlyId?: string,
    startDate?: string,
    endDate?: string,
    page = 1,
    limit = 20
  ) => {
    const isDb = getIsDatabaseConnected();
    const skip = (page - 1) * limit;

    if (isDb) {
      const where: any = {};
      if (elderlyId) where.elderlyId = elderlyId;
      if (startDate || endDate) {
        where.recordedAt = {};
        if (startDate) where.recordedAt.gte = new Date(startDate);
        if (endDate) where.recordedAt.lte = new Date(endDate);
      }

      const [items, total] = await Promise.all([
        prisma.healthLog.findMany({
          where,
          orderBy: { recordedAt: 'desc' },
          skip,
          take: limit,
          include: {
            recordedBy: {
              select: { id: true, name: true, role: true }
            }
          }
        }),
        prisma.healthLog.count({ where })
      ]);

      return {
        items,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    }

    let filtered = elderlyId
      ? memoryStore.healthRecords.filter((r) => r.elderlyId === elderlyId)
      : memoryStore.healthRecords;

    if (startDate) {
      const startMs = new Date(startDate).getTime();
      filtered = filtered.filter((r) => r.recordedAt.getTime() >= startMs);
    }
    if (endDate) {
      const endMs = new Date(endDate).getTime();
      filtered = filtered.filter((r) => r.recordedAt.getTime() <= endMs);
    }

    const sorted = [...filtered].sort((a, b) => b.recordedAt.getTime() - a.recordedAt.getTime());
    const total = sorted.length;
    const paginated = sorted.slice(skip, skip + limit).map((r) => {
      const user = memoryStore.users.find((u) => u.id === r.recordedById);
      return {
        ...r,
        recordedBy: user ? { id: user.id, name: user.name, role: user.role } : null
      };
    });

    return {
      items: paginated,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  // 3. Record Vitals & Optional Wellness Entry
  createRecord: async (
    userId: string,
    dto: CreateHealthRecordDTO,
    reqInfo?: { ip?: string; userAgent?: string }
  ) => {
    const isDb = getIsDatabaseConnected();
    const { isAlert, alertReason } = evaluateVitalAlerts(dto);

    if (isAlert) {
      logger.warn(`Vital Alert triggered for elderly ${dto.elderlyId}: ${alertReason}`);
    }

    const recordedAt = dto.recordedAt ? new Date(dto.recordedAt) : new Date();
    const compositeNotes = formatWellnessNotes(dto);

    if (isDb) {
      const record = await prisma.healthLog.create({
        data: {
          elderlyId: dto.elderlyId,
          recordedById: userId,
          recordedAt,
          systolicBp: dto.systolicBp,
          diastolicBp: dto.diastolicBp,
          bloodGlucose: dto.bloodGlucose,
          heartRate: dto.heartRate,
          oxygenSaturation: dto.oxygenSaturation,
          bodyTemperature: dto.bodyTemperature,
          weight: dto.weight,
          isAlert,
          alertReason,
          notes: compositeNotes
        }
      });

      await auditService.logEvent({
        actorId: userId,
        elderlyId: dto.elderlyId,
        action: 'CREATE',
        entityType: 'HealthLog',
        entityId: record.id,
        description: `Recorded clinical vitals & wellness entries (Alert: ${isAlert})`,
        newState: dto,
        ipAddress: reqInfo?.ip,
        userAgent: reqInfo?.userAgent
      });

      return record;
    }

    const newRecord: any = {
      id: `rec-${randomUUID().substring(0, 8)}`,
      elderlyId: dto.elderlyId,
      recordedById: userId,
      recordedAt,
      systolicBp: dto.systolicBp,
      diastolicBp: dto.diastolicBp,
      bloodGlucose: dto.bloodGlucose,
      heartRate: dto.heartRate,
      oxygenSaturation: dto.oxygenSaturation,
      bodyTemperature: dto.bodyTemperature,
      weight: dto.weight,
      mood: dto.mood,
      painLevel: dto.painLevel,
      sleepHours: dto.sleepHours,
      isAlert,
      notes: compositeNotes,
      createdAt: new Date()
    };
    memoryStore.healthRecords.unshift(newRecord);

    await auditService.logEvent({
      actorId: userId,
      elderlyId: dto.elderlyId,
      action: 'CREATE',
      entityType: 'HealthLog',
      entityId: newRecord.id,
      description: `Recorded clinical vitals & wellness entries (Alert: ${isAlert})`,
      newState: dto,
      ipAddress: reqInfo?.ip,
      userAgent: reqInfo?.userAgent
    });

    return newRecord;
  },

  // 4. Update Permitted Health Record
  updateRecord: async (
    recordId: string,
    userId: string,
    dto: UpdateHealthRecordDTO,
    reqInfo?: { ip?: string; userAgent?: string }
  ) => {
    const isDb = getIsDatabaseConnected();

    if (isDb) {
      const existing = await prisma.healthLog.findUnique({ where: { id: recordId } });
      if (!existing) throw new AppError('Health record not found', 404);

      const mergedVitals = {
        systolicBp: dto.systolicBp ?? existing.systolicBp ?? undefined,
        diastolicBp: dto.diastolicBp ?? existing.diastolicBp ?? undefined,
        bloodGlucose: dto.bloodGlucose ?? existing.bloodGlucose ?? undefined,
        heartRate: dto.heartRate ?? existing.heartRate ?? undefined,
        oxygenSaturation: dto.oxygenSaturation ?? existing.oxygenSaturation ?? undefined
      };
      const { isAlert, alertReason } = evaluateVitalAlerts(mergedVitals);
      const compositeNotes = formatWellnessNotes({
        mood: dto.mood,
        painLevel: dto.painLevel,
        sleepHours: dto.sleepHours,
        wellnessNotes: dto.wellnessNotes,
        notes: dto.notes ?? existing.notes ?? undefined
      });

      const updated = await prisma.healthLog.update({
        where: { id: recordId },
        data: {
          systolicBp: dto.systolicBp !== undefined ? dto.systolicBp : undefined,
          diastolicBp: dto.diastolicBp !== undefined ? dto.diastolicBp : undefined,
          bloodGlucose: dto.bloodGlucose !== undefined ? dto.bloodGlucose : undefined,
          heartRate: dto.heartRate !== undefined ? dto.heartRate : undefined,
          oxygenSaturation: dto.oxygenSaturation !== undefined ? dto.oxygenSaturation : undefined,
          bodyTemperature: dto.bodyTemperature !== undefined ? dto.bodyTemperature : undefined,
          weight: dto.weight !== undefined ? dto.weight : undefined,
          isAlert,
          alertReason,
          notes: compositeNotes
        }
      });

      await auditService.logEvent({
        actorId: userId,
        elderlyId: existing.elderlyId,
        action: 'UPDATE',
        entityType: 'HealthLog',
        entityId: recordId,
        description: `Updated clinical health log entries`,
        previousState: existing,
        newState: updated,
        ipAddress: reqInfo?.ip,
        userAgent: reqInfo?.userAgent
      });

      return updated;
    }

    const rec = memoryStore.healthRecords.find((r) => r.id === recordId);
    if (!rec) throw new AppError('Health record not found', 404);

    const prevSnapshot = { ...rec };
    if (dto.systolicBp !== undefined) rec.systolicBp = dto.systolicBp;
    if (dto.diastolicBp !== undefined) rec.diastolicBp = dto.diastolicBp;
    if (dto.bloodGlucose !== undefined) rec.bloodGlucose = dto.bloodGlucose;
    if (dto.heartRate !== undefined) rec.heartRate = dto.heartRate;
    if (dto.oxygenSaturation !== undefined) rec.oxygenSaturation = dto.oxygenSaturation;
    if (dto.bodyTemperature !== undefined) rec.bodyTemperature = dto.bodyTemperature;
    if (dto.weight !== undefined) rec.weight = dto.weight;
    if (dto.mood !== undefined) rec.mood = dto.mood;
    if (dto.painLevel !== undefined) rec.painLevel = dto.painLevel;
    if (dto.sleepHours !== undefined) rec.sleepHours = dto.sleepHours;

    const { isAlert } = evaluateVitalAlerts(rec);
    rec.isAlert = isAlert;

    const compositeNotes = formatWellnessNotes({
      mood: dto.mood ?? rec.mood,
      painLevel: dto.painLevel ?? rec.painLevel,
      sleepHours: dto.sleepHours ?? rec.sleepHours,
      wellnessNotes: dto.wellnessNotes,
      notes: dto.notes ?? rec.notes
    });
    if (compositeNotes) rec.notes = compositeNotes;
    rec.updatedAt = new Date();

    await auditService.logEvent({
      actorId: userId,
      elderlyId: rec.elderlyId,
      action: 'UPDATE',
      entityType: 'HealthLog',
      entityId: recordId,
      description: `Updated clinical health log entries`,
      previousState: prevSnapshot,
      newState: rec,
      ipAddress: reqInfo?.ip,
      userAgent: reqInfo?.userAgent
    });

    return rec;
  }
};
