// ==============================================================================
// CareNest Healthcare Platform - Notification Dashboard Service
// Delivery History, Read/Unread Status Management, Failure Tracking,
// Delivery Analytics, and Recipient Preference Controls.
// ==============================================================================

import { prisma, memoryStore, getIsDatabaseConnected, MemoryNotification, MemoryNotificationPreference } from '../config/db.js';
import { AppError } from '../utils/errors.js';
import { randomUUID } from 'crypto';

export interface UpdatePreferencesDTO {
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  pushNotifications?: boolean;
  medicationReminders?: boolean;
  missedDoseAlerts?: boolean;
  appointmentReminders?: boolean;
  careActivityUpdates?: boolean;
  emergencyAlerts?: boolean;
  reminderLeadMinutes?: number;
  quietHoursEnabled?: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
}

export const notificationService = {
  // 1. Get User In-App Notifications
  getNotifications: async (userId: string, filters: { isRead?: boolean; type?: string; priority?: string; page?: number; limit?: number }) => {
    const isDb = getIsDatabaseConnected();
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    if (isDb) {
      const where: any = { userId };
      if (filters.isRead !== undefined) where.isRead = filters.isRead;
      if (filters.type) where.type = filters.type as any;
      if (filters.priority) where.priority = filters.priority as any;

      const [items, total] = await Promise.all([
        prisma.notification.findMany({
          where,
          orderBy: { sentAt: 'desc' },
          skip,
          take: limit
        }),
        prisma.notification.count({ where })
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

    let items = (memoryStore.notifications || []).filter((n) => n.userId === userId);
    if (filters.isRead !== undefined) items = items.filter((n) => n.isRead === filters.isRead);
    if (filters.type) items = items.filter((n) => n.type === filters.type);
    if (filters.priority) items = items.filter((n) => n.priority === filters.priority);

    const total = items.length;
    const paginated = items
      .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())
      .slice(skip, skip + limit);

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

  // 2. Get Notification Delivery History & Audit Ledger
  getNotificationHistory: async (elderlyId?: string, statusFilter?: string) => {
    const isDb = getIsDatabaseConnected();

    if (isDb) {
      const where: any = {};
      if (elderlyId) where.elderlyId = elderlyId;

      const records = await prisma.notification.findMany({
        where,
        orderBy: { sentAt: 'desc' },
        take: 100,
        include: { user: { select: { id: true, name: true, email: true, role: true } } }
      });

      return records
        .map((r) => {
          const meta = (r.metadata as any) || {};
          return {
            id: r.id,
            userId: r.userId,
            userName: r.user?.name,
            userEmail: r.user?.email,
            type: r.type,
            title: r.title,
            message: r.message,
            priority: r.priority,
            channel: r.channel,
            isRead: r.isRead,
            readAt: r.readAt,
            sentAt: r.sentAt,
            deliveryStatus: meta.deliveryStatus || 'SENT',
            recipientEmail: meta.emailTo || r.user?.email,
            error: meta.error,
            metadata: meta
          };
        })
        .filter((r) => !statusFilter || r.deliveryStatus === statusFilter);
    }

    let list = memoryStore.notifications || [];
    if (elderlyId) list = list.filter((n) => !n.elderlyId || n.elderlyId === elderlyId);

    return list
      .map((r) => {
        const u = memoryStore.users.find((user) => user.id === r.userId);
        const meta = r.metadata || {};
        return {
          id: r.id,
          userId: r.userId,
          userName: u?.name || 'CareNest User',
          userEmail: u?.email,
          type: r.type,
          title: r.title,
          message: r.message,
          priority: r.priority,
          channel: r.channel,
          isRead: r.isRead,
          readAt: r.readAt,
          sentAt: r.sentAt,
          deliveryStatus: meta.deliveryStatus || 'SENT',
          recipientEmail: meta.emailTo || u?.email,
          error: meta.error,
          metadata: meta
        };
      })
      .filter((r) => !statusFilter || r.deliveryStatus === statusFilter)
      .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
  },

  // 3. Get Notification Dashboard Statistics
  getNotificationStats: async (userId: string, elderlyId?: string) => {
    const isDb = getIsDatabaseConnected();

    if (isDb) {
      const all = await prisma.notification.findMany({
        where: {
          OR: [{ userId }, ...(elderlyId ? [{ elderlyId }] : [])]
        }
      });

      const total = all.length;
      const unread = all.filter((n) => !n.isRead).length;
      const read = all.filter((n) => n.isRead).length;
      const sent = all.filter((n) => ((n.metadata as any)?.deliveryStatus || 'SENT') === 'SENT').length;
      const failed = all.filter((n) => (n.metadata as any)?.deliveryStatus === 'FAILED').length;
      const skippedPreference = all.filter((n) => (n.metadata as any)?.deliveryStatus === 'SKIPPED_PREFERENCE').length;

      const deliveryRate = total > 0 ? Math.round((sent / total) * 100) : 100;

      return {
        total,
        unread,
        read,
        sent,
        failed,
        skippedPreference,
        deliveryRate
      };
    }

    const all = (memoryStore.notifications || []).filter(
      (n) => n.userId === userId || (elderlyId && n.elderlyId === elderlyId)
    );

    const total = all.length;
    const unread = all.filter((n) => !n.isRead).length;
    const read = all.filter((n) => n.isRead).length;
    const sent = all.filter((n) => (n.metadata?.deliveryStatus || 'SENT') === 'SENT').length;
    const failed = all.filter((n) => n.metadata?.deliveryStatus === 'FAILED').length;
    const skippedPreference = all.filter((n) => n.metadata?.deliveryStatus === 'SKIPPED_PREFERENCE').length;

    const deliveryRate = total > 0 ? Math.round((sent / total) * 100) : 100;

    return {
      total,
      unread,
      read,
      sent,
      failed,
      skippedPreference,
      deliveryRate
    };
  },

  // 4. Mark Single Notification as Read
  markAsRead: async (notificationId: string, userId: string) => {
    const isDb = getIsDatabaseConnected();

    if (isDb) {
      const existing = await prisma.notification.findUnique({ where: { id: notificationId } });
      if (!existing) throw new AppError('Notification not found', 404);
      if (existing.userId !== userId) throw new AppError('Unauthorized access to notification', 403);

      return prisma.notification.update({
        where: { id: notificationId },
        data: {
          isRead: true,
          readAt: new Date()
        }
      });
    }

    const notif = (memoryStore.notifications || []).find((n) => n.id === notificationId);
    if (!notif) throw new AppError('Notification not found', 404);
    if (notif.userId !== userId) throw new AppError('Unauthorized access to notification', 403);

    notif.isRead = true;
    notif.readAt = new Date();

    return notif;
  },

  // 5. Mark All Notifications as Read
  markAllAsRead: async (userId: string) => {
    const isDb = getIsDatabaseConnected();

    if (isDb) {
      const result = await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: {
          isRead: true,
          readAt: new Date()
        }
      });
      return { markedCount: result.count };
    }

    let count = 0;
    for (const notif of memoryStore.notifications || []) {
      if (notif.userId === userId && !notif.isRead) {
        notif.isRead = true;
        notif.readAt = new Date();
        count++;
      }
    }

    return { markedCount: count };
  },

  // 6. Get User Notification Preferences
  getPreferences: async (userId: string) => {
    const isDb = getIsDatabaseConnected();

    if (isDb) {
      let pref = await prisma.notificationPreference.findUnique({ where: { userId } });
      if (!pref) {
        // Create default preferences
        pref = await prisma.notificationPreference.create({
          data: {
            userId,
            emailNotifications: true,
            smsNotifications: false,
            pushNotifications: true,
            medicationReminders: true,
            missedDoseAlerts: true,
            appointmentReminders: true,
            careActivityUpdates: true,
            emergencyAlerts: true,
            reminderLeadMinutes: 15,
            quietHoursEnabled: false,
            quietHoursStart: '22:00',
            quietHoursEnd: '07:00'
          }
        });
      }
      return pref;
    }

    let pref = (memoryStore.notificationPreferences || []).find((p) => p.userId === userId);
    if (!pref) {
      pref = {
        id: `pref-${randomUUID().substring(0, 8)}`,
        userId,
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        medicationReminders: true,
        missedDoseAlerts: true,
        appointmentReminders: true,
        careActivityUpdates: true,
        emergencyAlerts: true,
        reminderLeadMinutes: 15,
        quietHoursEnabled: false,
        quietHoursStart: '22:00',
        quietHoursEnd: '07:00',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      if (!memoryStore.notificationPreferences) memoryStore.notificationPreferences = [];
      memoryStore.notificationPreferences.push(pref);
    }

    return pref;
  },

  // 7. Update User Notification Preferences
  updatePreferences: async (userId: string, dto: UpdatePreferencesDTO) => {
    const isDb = getIsDatabaseConnected();

    if (isDb) {
      return prisma.notificationPreference.upsert({
        where: { userId },
        create: {
          userId,
          emailNotifications: dto.emailNotifications ?? true,
          smsNotifications: dto.smsNotifications ?? false,
          pushNotifications: dto.pushNotifications ?? true,
          medicationReminders: dto.medicationReminders ?? true,
          missedDoseAlerts: dto.missedDoseAlerts ?? true,
          appointmentReminders: dto.appointmentReminders ?? true,
          careActivityUpdates: dto.careActivityUpdates ?? true,
          emergencyAlerts: dto.emergencyAlerts ?? true,
          reminderLeadMinutes: dto.reminderLeadMinutes ?? 15,
          quietHoursEnabled: dto.quietHoursEnabled ?? false,
          quietHoursStart: dto.quietHoursStart || '22:00',
          quietHoursEnd: dto.quietHoursEnd || '07:00'
        },
        update: {
          ...dto,
          updatedAt: new Date()
        }
      });
    }

    let pref = (memoryStore.notificationPreferences || []).find((p) => p.userId === userId);
    if (!pref) {
      pref = {
        id: `pref-${randomUUID().substring(0, 8)}`,
        userId,
        emailNotifications: dto.emailNotifications ?? true,
        smsNotifications: dto.smsNotifications ?? false,
        pushNotifications: dto.pushNotifications ?? true,
        medicationReminders: dto.medicationReminders ?? true,
        missedDoseAlerts: dto.missedDoseAlerts ?? true,
        appointmentReminders: dto.appointmentReminders ?? true,
        careActivityUpdates: dto.careActivityUpdates ?? true,
        emergencyAlerts: dto.emergencyAlerts ?? true,
        reminderLeadMinutes: dto.reminderLeadMinutes ?? 15,
        quietHoursEnabled: dto.quietHoursEnabled ?? false,
        quietHoursStart: dto.quietHoursStart || '22:00',
        quietHoursEnd: dto.quietHoursEnd || '07:00',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      if (!memoryStore.notificationPreferences) memoryStore.notificationPreferences = [];
      memoryStore.notificationPreferences.push(pref);
      return pref;
    }

    if (dto.emailNotifications !== undefined) pref.emailNotifications = dto.emailNotifications;
    if (dto.smsNotifications !== undefined) pref.smsNotifications = dto.smsNotifications;
    if (dto.pushNotifications !== undefined) pref.pushNotifications = dto.pushNotifications;
    if (dto.medicationReminders !== undefined) pref.medicationReminders = dto.medicationReminders;
    if (dto.missedDoseAlerts !== undefined) pref.missedDoseAlerts = dto.missedDoseAlerts;
    if (dto.appointmentReminders !== undefined) pref.appointmentReminders = dto.appointmentReminders;
    if (dto.careActivityUpdates !== undefined) pref.careActivityUpdates = dto.careActivityUpdates;
    if (dto.emergencyAlerts !== undefined) pref.emergencyAlerts = dto.emergencyAlerts;
    if (dto.reminderLeadMinutes !== undefined) pref.reminderLeadMinutes = dto.reminderLeadMinutes;
    if (dto.quietHoursEnabled !== undefined) pref.quietHoursEnabled = dto.quietHoursEnabled;
    if (dto.quietHoursStart !== undefined) pref.quietHoursStart = dto.quietHoursStart;
    if (dto.quietHoursEnd !== undefined) pref.quietHoursEnd = dto.quietHoursEnd;
    pref.updatedAt = new Date();

    return pref;
  }
};

