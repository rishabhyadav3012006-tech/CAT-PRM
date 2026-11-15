// ==============================================================================
// CareNest Healthcare Platform - Care Activity Service
// Caretaker activities, observations, timeline feeds, filtering, and audit logs.
// ==============================================================================

import { prisma, memoryStore, getIsDatabaseConnected } from '../config/db.js';
import { ActivityCategory, ActivityStatus } from '../constants/roles.js';
import { emailService } from './email.service.js';
import { auditService } from './audit.service.js';
import { AppError } from '../utils/errors.js';
import { randomUUID } from 'crypto';

export interface CreateCareActivityDTO {
  elderlyId: string;
  assignedToId?: string;
  title: string;
  description?: string;
  category: ActivityCategory;
  scheduledDate: string;
  scheduledTime: string;
  notes?: string;
}

export interface ActivityFilterOptions {
  elderlyId?: string;
  date?: string;
  userId?: string;
  category?: ActivityCategory;
  status?: ActivityStatus;
  page?: number;
  limit?: number;
}

export const activityService = {
  // 1. Fetch activities with multi-criteria filtering and pagination
  getActivities: async (
    filterOrElderlyId?: string | ActivityFilterOptions,
    dateParam?: string,
    pageParam = 1,
    limitParam = 20
  ) => {
    let opts: ActivityFilterOptions = {};
    if (typeof filterOrElderlyId === 'object' && filterOrElderlyId !== null) {
      opts = filterOrElderlyId;
    } else {
      opts = {
        elderlyId: filterOrElderlyId,
        date: dateParam,
        page: pageParam,
        limit: limitParam
      };
    }

    const page = opts.page && opts.page > 0 ? opts.page : 1;
    const limit = opts.limit && opts.limit > 0 ? opts.limit : 20;
    const skip = (page - 1) * limit;

    const isDb = getIsDatabaseConnected();
    if (isDb) {
      const where: any = { deletedAt: null };
      if (opts.elderlyId) where.elderlyId = opts.elderlyId;
      if (opts.category) where.category = opts.category;
      if (opts.status) where.status = opts.status;
      if (opts.userId) {
        where.OR = [
          { assignedToId: opts.userId },
          { createdById: opts.userId }
        ];
      }
      if (opts.date) {
        const startOfDay = new Date(opts.date);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(opts.date);
        endOfDay.setUTCHours(23, 59, 59, 999);
        where.scheduledDate = {
          gte: startOfDay,
          lte: endOfDay
        };
      }

      const [items, total] = await Promise.all([
        prisma.careActivity.findMany({
          where,
          orderBy: [{ scheduledDate: 'desc' }, { scheduledTime: 'asc' }],
          skip,
          take: limit,
          include: {
            assignedTo: {
              select: { id: true, name: true, role: true }
            },
            createdBy: {
              select: { id: true, name: true, role: true }
            }
          }
        }),
        prisma.careActivity.count({ where })
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

    // Memory Store Fallback
    let filtered = memoryStore.careActivities.slice();

    if (opts.elderlyId) {
      filtered = filtered.filter((a) => a.elderlyId === opts.elderlyId);
    }
    if (opts.category) {
      filtered = filtered.filter((a) => a.category === opts.category);
    }
    if (opts.status) {
      filtered = filtered.filter((a) => a.status === opts.status);
    }
    if (opts.userId) {
      filtered = filtered.filter((a) => a.assignedToId === opts.userId || a.createdById === opts.userId);
    }
    if (opts.date) {
      const targetDateStr = new Date(opts.date).toISOString().split('T')[0];
      filtered = filtered.filter((a) => {
        const actDateStr = new Date(a.scheduledDate).toISOString().split('T')[0];
        return actDateStr === targetDateStr;
      });
    }

    filtered.sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime());

    const total = filtered.length;
    const paginated = filtered.slice(skip, skip + limit).map((a) => {
      const caregiver = a.assignedToId
        ? memoryStore.users.find((u) => u.id === a.assignedToId)
        : null;
      const creator = memoryStore.users.find((u) => u.id === a.createdById);
      return {
        ...a,
        assignedTo: caregiver ? { id: caregiver.id, name: caregiver.name, role: caregiver.role } : null,
        createdBy: creator ? { id: creator.id, name: creator.name, role: creator.role } : null
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

  // 2. Care Activity Timeline Feed
  getTimeline: async (elderlyId?: string, page = 1, limit = 20) => {
    const isDb = getIsDatabaseConnected();
    const skip = (page - 1) * limit;

    if (isDb) {
      const where: any = { deletedAt: null };
      if (elderlyId) where.elderlyId = elderlyId;

      const [activities, total] = await Promise.all([
        prisma.careActivity.findMany({
          where,
          orderBy: [{ scheduledDate: 'desc' }, { scheduledTime: 'desc' }],
          skip,
          take: limit,
          include: {
            createdBy: { select: { id: true, name: true, role: true } },
            assignedTo: { select: { id: true, name: true, role: true } },
            completedBy: { select: { id: true, name: true, role: true } }
          }
        }),
        prisma.careActivity.count({ where })
      ]);

      const timelineItems = activities.map((act) => ({
        id: act.id,
        elderlyId: act.elderlyId,
        title: act.title,
        description: act.description,
        category: act.category,
        scheduledDate: act.scheduledDate,
        scheduledTime: act.scheduledTime,
        status: act.status,
        completedAt: act.completedAt,
        notes: act.notes,
        assignedTo: act.assignedTo ? { name: act.assignedTo.name, role: act.assignedTo.role } : null,
        recordedBy: act.completedBy
          ? { name: act.completedBy.name, role: act.completedBy.role }
          : (act.createdBy ? { name: act.createdBy.name, role: act.createdBy.role } : null),
        createdAt: act.createdAt
      }));

      return {
        items: timelineItems,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    }

    let list = elderlyId
      ? memoryStore.careActivities.filter((a) => a.elderlyId === elderlyId)
      : memoryStore.careActivities.slice();

    list.sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime());
    const total = list.length;
    const paginated = list.slice(skip, skip + limit).map((a) => {
      const creator = memoryStore.users.find((u) => u.id === a.createdById);
      const assigned = a.assignedToId ? memoryStore.users.find((u) => u.id === a.assignedToId) : null;
      return {
        id: a.id,
        elderlyId: a.elderlyId,
        title: a.title,
        description: a.description,
        category: a.category,
        scheduledDate: a.scheduledDate,
        scheduledTime: a.scheduledTime,
        status: a.status,
        completedAt: a.completedAt,
        notes: a.notes,
        observations: a.observations,
        assignedTo: assigned ? { name: assigned.name, role: assigned.role } : null,
        recordedBy: creator ? { name: creator.name, role: creator.role } : null,
        createdAt: a.createdAt
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

  // 3. Create Care Activity
  createActivity: async (
    userId: string,
    dto: CreateCareActivityDTO,
    reqInfo?: { ip?: string; userAgent?: string }
  ) => {
    const isDb = getIsDatabaseConnected();
    const scheduledDate = new Date(dto.scheduledDate);

    if (isDb) {
      const act = await prisma.careActivity.create({
        data: {
          elderlyId: dto.elderlyId,
          createdById: userId,
          assignedToId: dto.assignedToId,
          title: dto.title,
          description: dto.description,
          category: dto.category,
          scheduledDate,
          scheduledTime: dto.scheduledTime,
          status: ActivityStatus.PENDING,
          notes: dto.notes
        }
      });

      await auditService.logEvent({
        actorId: userId,
        elderlyId: dto.elderlyId,
        action: 'CREATE',
        entityType: 'CareActivity',
        entityId: act.id,
        description: `Created care activity: ${dto.title}`,
        newState: dto,
        ipAddress: reqInfo?.ip,
        userAgent: reqInfo?.userAgent
      });

      return act;
    }

    const newAct: any = {
      id: `act-${randomUUID().substring(0, 8)}`,
      elderlyId: dto.elderlyId,
      createdById: userId,
      assignedToId: dto.assignedToId,
      title: dto.title,
      description: dto.description,
      category: dto.category,
      scheduledDate,
      scheduledTime: dto.scheduledTime,
      status: ActivityStatus.PENDING,
      notes: dto.notes,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    memoryStore.careActivities.push(newAct);

    await auditService.logEvent({
      actorId: userId,
      elderlyId: dto.elderlyId,
      action: 'CREATE',
      entityType: 'CareActivity',
      entityId: newAct.id,
      description: `Created care activity: ${dto.title}`,
      newState: dto,
      ipAddress: reqInfo?.ip,
      userAgent: reqInfo?.userAgent
    });

    return newAct;
  },

  // 4. Record Health Observations on Activity
  recordObservation: async (
    activityId: string,
    userId: string,
    observations: string,
    vitalNotes?: string,
    reqInfo?: { ip?: string; userAgent?: string }
  ) => {
    const isDb = getIsDatabaseConnected();
    const observationText = vitalNotes
      ? `[Observation: ${observations}] Notes: ${vitalNotes}`
      : `[Observation: ${observations}]`;

    if (isDb) {
      const existing = await prisma.careActivity.findUnique({ where: { id: activityId } });
      if (!existing) throw new AppError('Care activity not found', 404);

      const updatedNotes = existing.notes
        ? `${existing.notes}\n${observationText}`
        : observationText;

      const updated = await prisma.careActivity.update({
        where: { id: activityId },
        data: {
          notes: updatedNotes,
          updatedAt: new Date()
        }
      });

      await auditService.logEvent({
        actorId: userId,
        elderlyId: existing.elderlyId,
        action: 'UPDATE',
        entityType: 'CareActivity',
        entityId: activityId,
        description: `Recorded clinical health observation on task: ${existing.title}`,
        previousState: { notes: existing.notes },
        newState: { notes: updatedNotes, observations },
        ipAddress: reqInfo?.ip,
        userAgent: reqInfo?.userAgent
      });

      return updated;
    }

    const act = memoryStore.careActivities.find((a) => a.id === activityId);
    if (!act) throw new AppError('Care activity not found', 404);

    const prevNotes = act.notes;
    act.observations = act.observations ? `${act.observations}; ${observations}` : observations;
    act.notes = act.notes ? `${act.notes}\n${observationText}` : observationText;
    act.updatedAt = new Date();

    await auditService.logEvent({
      actorId: userId,
      elderlyId: act.elderlyId,
      action: 'UPDATE',
      entityType: 'CareActivity',
      entityId: activityId,
      description: `Recorded health observation: ${observations}`,
      previousState: { notes: prevNotes },
      newState: { observations: act.observations, notes: act.notes },
      ipAddress: reqInfo?.ip,
      userAgent: reqInfo?.userAgent
    });

    return act;
  },

  // 5. Update Activity Status (e.g. COMPLETED, IN_PROGRESS, SKIPPED)
  updateStatus: async (
    activityId: string,
    status: ActivityStatus,
    notes?: string,
    userId?: string,
    reqInfo?: { ip?: string; userAgent?: string }
  ) => {
    const isDb = getIsDatabaseConnected();
    const completedAt = status === ActivityStatus.COMPLETED ? new Date() : null;

    if (isDb) {
      const existing = await prisma.careActivity.findUnique({ where: { id: activityId } });
      if (!existing) throw new AppError('Care activity not found', 404);

      const updated = await prisma.careActivity.update({
        where: { id: activityId },
        data: {
          status,
          completedAt,
          completedById: status === ActivityStatus.COMPLETED && userId ? userId : undefined,
          notes: notes !== undefined ? notes : undefined,
          updatedAt: new Date()
        }
      });

      await auditService.logEvent({
        actorId: userId,
        elderlyId: existing.elderlyId,
        action: 'UPDATE',
        entityType: 'CareActivity',
        entityId: activityId,
        description: `Updated care activity status to ${status}`,
        previousState: { status: existing.status, notes: existing.notes },
        newState: { status, notes },
        ipAddress: reqInfo?.ip,
        userAgent: reqInfo?.userAgent
      });

      return updated;
    }

    const act = memoryStore.careActivities.find((a) => a.id === activityId);
    if (!act) throw new AppError('Care activity not found', 404);

    const prevStatus = act.status;
    const prevNotes = act.notes;
    act.status = status;
    act.completedAt = completedAt || undefined;
    if (notes !== undefined) act.notes = notes;
    act.updatedAt = new Date();

    if (status === ActivityStatus.COMPLETED) {
      const elderly = memoryStore.elderlyProfiles.find((e) => e.id === act.elderlyId);
      const user = elderly ? memoryStore.users.find((u) => u.id === elderly.userId) : null;
      if (user && user.email) {
        emailService.sendCaretakerActivityUpdate(user.email, {
          caretakerName: 'Marcus Chen',
          patientName: user.name,
          activityTitle: act.title,
          category: act.category,
          scheduledTime: act.scheduledTime,
          completedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          notes: notes || act.notes,
          userId: user.id,
          elderlyId: act.elderlyId,
          activityId
        }).catch(() => {});
      }
    }

    await auditService.logEvent({
      actorId: userId,
      elderlyId: act.elderlyId,
      action: 'UPDATE',
      entityType: 'CareActivity',
      entityId: activityId,
      description: `Updated care activity status to ${status}`,
      previousState: { status: prevStatus, notes: prevNotes },
      newState: { status, notes: act.notes },
      ipAddress: reqInfo?.ip,
      userAgent: reqInfo?.userAgent
    });

    return act;
  }
};
