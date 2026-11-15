// ==============================================================================
// CareNest Healthcare Platform - Appointment Service
// Clinical Scheduling, Rescheduling, Cancellations, Document Attachments,
// Multi-Channel Reminders, Pagination, and HIPAA Audit Logging.
// ==============================================================================

import { prisma, memoryStore, getIsDatabaseConnected, AppointmentDocument } from '../config/db.js';
import { AppointmentStatus } from '../constants/roles.js';
import { emailService } from './email.service.js';
import { schedulerService } from './scheduler.service.js';
import { auditService } from './audit.service.js';
import { AppError } from '../utils/errors.js';
import { randomUUID } from 'crypto';

export interface CreateAppointmentDTO {
  elderlyId: string;
  doctorName: string;
  specialty: string;
  hospitalName?: string;
  contactNumber?: string;
  location: string;
  appointmentDate: string;
  appointmentTime?: string;
  notes?: string;
  consultationNotes?: string;
  documents?: Array<{
    name: string;
    type: string;
    size?: string;
    url?: string;
  }>;
}

export interface UpdateAppointmentDTO {
  doctorName?: string;
  specialty?: string;
  hospitalName?: string;
  contactNumber?: string;
  location?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  notes?: string;
  consultationNotes?: string;
  status?: AppointmentStatus;
}

export interface RescheduleAppointmentDTO {
  newDate: string;
  newTime?: string;
  reason?: string;
}

export const appointmentService = {
  // 1. Fetch Appointments (with optional status & pagination)
  getAppointments: async (elderlyId?: string, status?: string, page = 1, limit = 20) => {
    const isDb = getIsDatabaseConnected();
    const skip = (page - 1) * limit;

    if (isDb) {
      const where: any = {};
      if (elderlyId) where.elderlyId = elderlyId;
      if (status && status !== 'ALL') {
        where.status = status as AppointmentStatus;
      }

      const [items, total] = await Promise.all([
        prisma.appointment.findMany({
          where,
          orderBy: { appointmentDate: 'asc' },
          skip,
          take: limit,
          include: {
            elderly: {
              include: { user: { select: { name: true, phone: true } } }
            }
          }
        }),
        prisma.appointment.count({ where })
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
      ? memoryStore.appointments.filter((a) => a.elderlyId === elderlyId)
      : memoryStore.appointments;

    if (status && status !== 'ALL') {
      filtered = filtered.filter((a) => a.status === status);
    }

    // Sort chronologically
    filtered.sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime());

    const total = filtered.length;
    const paginated = filtered.slice(skip, skip + limit).map((a) => {
      const elderly = memoryStore.elderlyProfiles.find((e) => e.id === a.elderlyId);
      const user = elderly ? memoryStore.users.find((u) => u.id === elderly.userId) : null;
      return {
        ...a,
        elderly: elderly ? { ...elderly, user: user ? { name: user.name, phone: user.phone } : null } : null
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

  // 2. Fetch Upcoming Appointments
  getUpcomingAppointments: async (elderlyId?: string, page = 1, limit = 20) => {
    const isDb = getIsDatabaseConnected();
    const now = new Date();
    const skip = (page - 1) * limit;

    if (isDb) {
      const where: any = {
        appointmentDate: { gte: now },
        status: { in: [AppointmentStatus.UPCOMING as any, AppointmentStatus.SCHEDULED as any, AppointmentStatus.RESCHEDULED as any] },
        ...(elderlyId ? { elderlyId } : {})
      };

      const [items, total] = await Promise.all([
        prisma.appointment.findMany({
          where,
          orderBy: { appointmentDate: 'asc' },
          skip,
          take: limit,
          include: {
            elderly: { include: { user: { select: { name: true, phone: true } } } }
          }
        }),
        prisma.appointment.count({ where })
      ]);

      return {
        items,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
      };
    }

    let filtered = memoryStore.appointments.filter((a) => {
      const isMatchElderly = !elderlyId || a.elderlyId === elderlyId;
      const isFuture = new Date(a.appointmentDate).getTime() >= now.getTime();
      const isActiveStatus = a.status !== AppointmentStatus.CANCELLED && a.status !== AppointmentStatus.COMPLETED;
      return isMatchElderly && isFuture && isActiveStatus;
    });

    filtered.sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime());

    const total = filtered.length;
    const paginated = filtered.slice(skip, skip + limit).map((a) => {
      const elderly = memoryStore.elderlyProfiles.find((e) => e.id === a.elderlyId);
      const user = elderly ? memoryStore.users.find((u) => u.id === elderly.userId) : null;
      return {
        ...a,
        elderly: elderly ? { ...elderly, user: user ? { name: user.name, phone: user.phone } : null } : null
      };
    });

    return {
      items: paginated,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
  },

  // 3. Fetch Appointment History
  getAppointmentHistory: async (elderlyId?: string, page = 1, limit = 20) => {
    const isDb = getIsDatabaseConnected();
    const now = new Date();
    const skip = (page - 1) * limit;

    if (isDb) {
      const where: any = {
        OR: [
          { status: { in: [AppointmentStatus.COMPLETED as any, AppointmentStatus.CANCELLED as any] } },
          { appointmentDate: { lt: now } }
        ],
        ...(elderlyId ? { elderlyId } : {})
      };

      const [items, total] = await Promise.all([
        prisma.appointment.findMany({
          where,
          orderBy: { appointmentDate: 'desc' },
          skip,
          take: limit,
          include: {
            elderly: { include: { user: { select: { name: true, phone: true } } } }
          }
        }),
        prisma.appointment.count({ where })
      ]);

      return {
        items,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
      };
    }

    let filtered = memoryStore.appointments.filter((a) => {
      const isMatchElderly = !elderlyId || a.elderlyId === elderlyId;
      const isPast = new Date(a.appointmentDate).getTime() < now.getTime();
      const isArchivedStatus = a.status === AppointmentStatus.COMPLETED || a.status === AppointmentStatus.CANCELLED;
      return isMatchElderly && (isPast || isArchivedStatus);
    });

    filtered.sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime());

    const total = filtered.length;
    const paginated = filtered.slice(skip, skip + limit).map((a) => {
      const elderly = memoryStore.elderlyProfiles.find((e) => e.id === a.elderlyId);
      const user = elderly ? memoryStore.users.find((u) => u.id === elderly.userId) : null;
      return {
        ...a,
        elderly: elderly ? { ...elderly, user: user ? { name: user.name, phone: user.phone } : null } : null
      };
    });

    return {
      items: paginated,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
  },

  // 4. Fetch Appointment by ID
  getAppointmentById: async (appointmentId: string) => {
    const isDb = getIsDatabaseConnected();
    if (isDb) {
      const appt = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: {
          elderly: {
            include: { user: { select: { name: true, phone: true } } }
          }
        }
      });
      if (!appt) throw new AppError('Appointment not found.', 404);
      return appt;
    }

    const appt = memoryStore.appointments.find((a) => a.id === appointmentId);
    if (!appt) throw new AppError('Appointment not found.', 404);

    const elderly = memoryStore.elderlyProfiles.find((e) => e.id === appt.elderlyId);
    const user = elderly ? memoryStore.users.find((u) => u.id === elderly.userId) : null;
    return {
      ...appt,
      elderly: elderly ? { ...elderly, user: user ? { name: user.name, phone: user.phone } : null } : null
    };
  },

  // 5. Create Appointment
  createAppointment: async (userId: string, dto: CreateAppointmentDTO, ip?: string, userAgent?: string) => {
    const isDb = getIsDatabaseConnected();
    const apptDate = new Date(dto.appointmentDate);

    // Initial documents
    const initialDocuments: AppointmentDocument[] = (dto.documents || []).map((doc) => ({
      id: `doc-${randomUUID().substring(0, 8)}`,
      name: doc.name,
      type: doc.type || 'Medical Document',
      size: doc.size || '1.2 MB',
      url: doc.url || 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80',
      uploadedAt: new Date()
    }));

    let created: any;
    if (isDb) {
      created = await prisma.appointment.create({
        data: {
          elderlyId: dto.elderlyId,
          createdById: userId,
          doctorName: dto.doctorName,
          specialty: dto.specialty,
          location: dto.location,
          appointmentDate: apptDate,
          notes: dto.notes,
          status: AppointmentStatus.UPCOMING as any
        },
        include: {
          elderly: { include: { user: true } }
        }
      });
    } else {
      created = {
        id: `apt-${randomUUID().substring(0, 8)}`,
        elderlyId: dto.elderlyId,
        createdById: userId,
        doctorName: dto.doctorName,
        specialty: dto.specialty,
        hospitalName: dto.hospitalName || 'Primary Care Clinic',
        contactNumber: dto.contactNumber || '+1 (555) 000-0000',
        location: dto.location,
        appointmentDate: apptDate,
        appointmentTime: dto.appointmentTime || apptDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        reminderSent: false,
        status: AppointmentStatus.UPCOMING,
        notes: dto.notes || '',
        consultationNotes: dto.consultationNotes || '',
        documents: initialDocuments,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      memoryStore.appointments.push(created);
    }

    // Schedule background reminder via BullMQ queue & scheduler
    const elderly = memoryStore.elderlyProfiles.find((e) => e.id === dto.elderlyId);
    const user = elderly ? memoryStore.users.find((u) => u.id === elderly.userId) : null;
    if (user && user.email) {
      schedulerService.scheduleAppointmentReminders({
        appointmentId: created.id,
        elderlyId: dto.elderlyId,
        doctorName: dto.doctorName,
        specialty: dto.specialty,
        hospitalName: dto.hospitalName,
        location: dto.location,
        appointmentDate: apptDate,
        appointmentTime: dto.appointmentTime,
        recipientEmail: user.email,
        patientName: user.name
      }).catch(() => {});
    }

    // Audit Log
    await auditService.logEvent({
      actorId: userId,
      elderlyId: dto.elderlyId,
      action: 'CREATE',
      entityType: 'Appointment',
      entityId: created.id,
      description: `Scheduled appointment with ${dto.doctorName} (${dto.specialty}) on ${apptDate.toLocaleDateString()}.`,
      ipAddress: ip,
      userAgent
    });

    return created;
  },

  // 6. Update Appointment
  updateAppointment: async (appointmentId: string, dto: UpdateAppointmentDTO, actorId?: string, ip?: string, userAgent?: string) => {
    const isDb = getIsDatabaseConnected();
    if (isDb) {
      const data: any = { updatedAt: new Date() };
      if (dto.doctorName) data.doctorName = dto.doctorName;
      if (dto.specialty) data.specialty = dto.specialty;
      if (dto.location) data.location = dto.location;
      if (dto.appointmentDate) data.appointmentDate = new Date(dto.appointmentDate);
      if (dto.notes !== undefined) data.notes = dto.notes;
      if (dto.status) data.status = dto.status as any;

      const updated = await prisma.appointment.update({
        where: { id: appointmentId },
        data
      });

      await auditService.logEvent({
        actorId,
        elderlyId: updated.elderlyId,
        action: 'UPDATE',
        entityType: 'Appointment',
        entityId: appointmentId,
        description: `Updated appointment details for ${updated.doctorName}.`,
        ipAddress: ip,
        userAgent
      });

      return updated;
    }

    const appt = memoryStore.appointments.find((a) => a.id === appointmentId);
    if (!appt) throw new AppError('Appointment not found.', 404);

    if (dto.doctorName) appt.doctorName = dto.doctorName;
    if (dto.specialty) appt.specialty = dto.specialty;
    if (dto.hospitalName !== undefined) appt.hospitalName = dto.hospitalName;
    if (dto.contactNumber !== undefined) appt.contactNumber = dto.contactNumber;
    if (dto.location) appt.location = dto.location;
    if (dto.appointmentDate) appt.appointmentDate = new Date(dto.appointmentDate);
    if (dto.appointmentTime) appt.appointmentTime = dto.appointmentTime;
    if (dto.notes !== undefined) appt.notes = dto.notes;
    if (dto.consultationNotes !== undefined) appt.consultationNotes = dto.consultationNotes;
    if (dto.status) appt.status = dto.status;
    appt.updatedAt = new Date();

    await auditService.logEvent({
      actorId,
      elderlyId: appt.elderlyId,
      action: 'UPDATE',
      entityType: 'Appointment',
      entityId: appointmentId,
      description: `Updated appointment details for ${appt.doctorName}.`,
      ipAddress: ip,
      userAgent
    });

    return appt;
  },

  // 7. Reschedule Appointment
  rescheduleAppointment: async (appointmentId: string, dto: RescheduleAppointmentDTO, actorId?: string, ip?: string, userAgent?: string) => {
    const isDb = getIsDatabaseConnected();
    const newDate = new Date(dto.newDate);

    if (isDb) {
      const updated = await prisma.appointment.update({
        where: { id: appointmentId },
        data: {
          appointmentDate: newDate,
          status: AppointmentStatus.RESCHEDULED as any,
          notes: dto.reason ? `Rescheduled: ${dto.reason}` : undefined,
          updatedAt: new Date()
        },
        include: { elderly: { include: { user: true } } }
      });

      if (updated.elderly?.user?.email) {
        emailService.sendAppointmentRescheduledNotification(updated.elderly.user.email, {
          patientName: updated.elderly.user.name,
          doctorName: updated.doctorName,
          specialty: updated.specialty,
          newDate: newDate.toLocaleDateString(),
          newTime: dto.newTime,
          location: updated.location,
          reason: dto.reason,
          userId: updated.elderly.user.id,
          elderlyId: updated.elderlyId,
          appointmentId
        }).catch(() => {});
      }

      await auditService.logEvent({
        actorId,
        elderlyId: updated.elderlyId,
        action: 'UPDATE',
        entityType: 'Appointment',
        entityId: appointmentId,
        description: `Rescheduled appointment with ${updated.doctorName} to ${newDate.toLocaleDateString()}. Reason: ${dto.reason || 'Not specified'}`,
        ipAddress: ip,
        userAgent
      });

      return updated;
    }

    const appt = memoryStore.appointments.find((a) => a.id === appointmentId);
    if (!appt) throw new AppError('Appointment not found.', 404);

    const oldDateStr = appt.appointmentDate ? new Date(appt.appointmentDate).toLocaleDateString() : undefined;
    appt.rescheduledFrom = appt.appointmentDate;
    appt.appointmentDate = newDate;
    if (dto.newTime) {
      appt.appointmentTime = dto.newTime;
    }
    appt.rescheduleReason = dto.reason || 'Rescheduled per patient/doctor request';
    appt.status = AppointmentStatus.RESCHEDULED;
    appt.updatedAt = new Date();

    // Trigger rescheduling email notification & update reminder jobs
    const elderly = memoryStore.elderlyProfiles.find((e) => e.id === appt.elderlyId);
    const user = elderly ? memoryStore.users.find((u) => u.id === elderly.userId) : null;
    if (user && user.email) {
      emailService.sendAppointmentRescheduledNotification(user.email, {
        patientName: user.name,
        doctorName: appt.doctorName,
        specialty: appt.specialty,
        oldDate: oldDateStr,
        newDate: newDate.toLocaleDateString(),
        newTime: dto.newTime || appt.appointmentTime,
        location: appt.location,
        reason: dto.reason,
        userId: user.id,
        elderlyId: appt.elderlyId,
        appointmentId
      }).catch(() => {});

      schedulerService.scheduleAppointmentReminders({
        appointmentId,
        elderlyId: appt.elderlyId,
        doctorName: appt.doctorName,
        specialty: appt.specialty,
        hospitalName: appt.hospitalName,
        location: appt.location,
        appointmentDate: newDate,
        appointmentTime: dto.newTime || appt.appointmentTime,
        recipientEmail: user.email,
        patientName: user.name
      }).catch(() => {});
    }

    await auditService.logEvent({
      actorId,
      elderlyId: appt.elderlyId,
      action: 'UPDATE',
      entityType: 'Appointment',
      entityId: appointmentId,
      description: `Rescheduled appointment with ${appt.doctorName} to ${newDate.toLocaleDateString()}. Reason: ${dto.reason || 'Not specified'}`,
      ipAddress: ip,
      userAgent
    });

    return appt;
  },

  // 8. Cancel Appointment
  cancelAppointment: async (appointmentId: string, reason?: string, actorId?: string, ip?: string, userAgent?: string) => {
    const isDb = getIsDatabaseConnected();
    if (isDb) {
      const updated = await prisma.appointment.update({
        where: { id: appointmentId },
        data: {
          status: AppointmentStatus.CANCELLED,
          notes: reason ? `Cancelled reason: ${reason}` : undefined,
          updatedAt: new Date()
        },
        include: { elderly: { include: { user: true } } }
      });

      if (updated.elderly?.user?.email) {
        emailService.sendAppointmentCancelledNotification(updated.elderly.user.email, {
          patientName: updated.elderly.user.name,
          doctorName: updated.doctorName,
          specialty: updated.specialty,
          cancelledDate: new Date(updated.appointmentDate).toLocaleDateString(),
          reason,
          userId: updated.elderly.user.id,
          elderlyId: updated.elderlyId,
          appointmentId
        }).catch(() => {});
      }

      await auditService.logEvent({
        actorId,
        elderlyId: updated.elderlyId,
        action: 'UPDATE',
        entityType: 'Appointment',
        entityId: appointmentId,
        description: `Cancelled appointment with ${updated.doctorName}. Reason: ${reason || 'Not specified'}`,
        ipAddress: ip,
        userAgent
      });

      return updated;
    }

    const appt = memoryStore.appointments.find((a) => a.id === appointmentId);
    if (!appt) throw new AppError('Appointment not found.', 404);

    appt.status = AppointmentStatus.CANCELLED;
    appt.cancelReason = reason || 'Cancelled by care coordinator';
    appt.updatedAt = new Date();

    const elderly = memoryStore.elderlyProfiles.find((e) => e.id === appt.elderlyId);
    const user = elderly ? memoryStore.users.find((u) => u.id === elderly.userId) : null;
    if (user && user.email) {
      emailService.sendAppointmentCancelledNotification(user.email, {
        patientName: user.name,
        doctorName: appt.doctorName,
        specialty: appt.specialty,
        cancelledDate: new Date(appt.appointmentDate).toLocaleDateString(),
        reason,
        userId: user.id,
        elderlyId: appt.elderlyId,
        appointmentId
      }).catch(() => {});
    }

    await auditService.logEvent({
      actorId,
      elderlyId: appt.elderlyId,
      action: 'UPDATE',
      entityType: 'Appointment',
      entityId: appointmentId,
      description: `Cancelled appointment with ${appt.doctorName}. Reason: ${reason || 'Not specified'}`,
      ipAddress: ip,
      userAgent
    });

    return appt;
  },

  // 9. Update Status
  updateStatus: async (appointmentId: string, status: AppointmentStatus, actorId?: string) => {
    const isDb = getIsDatabaseConnected();
    if (isDb) {
      return prisma.appointment.update({
        where: { id: appointmentId },
        data: { status: status as any, updatedAt: new Date() }
      });
    }

    const appt = memoryStore.appointments.find((a) => a.id === appointmentId);
    if (!appt) throw new AppError('Appointment not found.', 404);
    appt.status = status;
    appt.updatedAt = new Date();
    return appt;
  },

  // 10. Add Consultation Notes
  addConsultationNotes: async (appointmentId: string, consultationNotes: string, actorId?: string) => {
    const isDb = getIsDatabaseConnected();
    if (isDb) {
      return prisma.appointment.update({
        where: { id: appointmentId },
        data: {
          notes: consultationNotes,
          updatedAt: new Date()
        }
      });
    }

    const appt = memoryStore.appointments.find((a) => a.id === appointmentId);
    if (!appt) throw new AppError('Appointment not found.', 404);

    appt.consultationNotes = consultationNotes;
    appt.updatedAt = new Date();
    return appt;
  },

  // 11. Add Medical Document Attachment
  addDocument: async (appointmentId: string, doc: { name: string; type: string; size?: string; url?: string }, actorId?: string) => {
    const appt = memoryStore.appointments.find((a) => a.id === appointmentId);
    if (!appt) throw new AppError('Appointment not found.', 404);

    if (!appt.documents) {
      appt.documents = [];
    }

    const newDoc: AppointmentDocument = {
      id: `doc-${randomUUID().substring(0, 8)}`,
      name: doc.name,
      type: doc.type || 'Medical Document',
      size: doc.size || '1.5 MB',
      url: doc.url || 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80',
      uploadedAt: new Date()
    };

    appt.documents.push(newDoc);
    appt.updatedAt = new Date();
    return newDoc;
  },

  // 12. Delete Appointment
  deleteAppointment: async (appointmentId: string, actorId?: string) => {
    const isDb = getIsDatabaseConnected();
    if (isDb) {
      const deleted = await prisma.appointment.delete({ where: { id: appointmentId } });
      await auditService.logEvent({
        actorId,
        action: 'DELETE',
        entityType: 'Appointment',
        entityId: appointmentId,
        description: `Permanently removed appointment record.`
      });
      return deleted;
    }

    const index = memoryStore.appointments.findIndex((a) => a.id === appointmentId);
    if (index === -1) throw new AppError('Appointment not found.', 404);
    const removed = memoryStore.appointments.splice(index, 1);

    await auditService.logEvent({
      actorId,
      action: 'DELETE',
      entityType: 'Appointment',
      entityId: appointmentId,
      description: `Permanently removed appointment record.`
    });

    return removed[0];
  }
};
