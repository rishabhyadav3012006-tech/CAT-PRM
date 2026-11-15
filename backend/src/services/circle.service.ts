// ==============================================================================
// CareNest Healthcare Platform - Family Care Circle Collaboration Service
// Member Invitations, Single-Use Codes, Granular Permissions, and Activity Logs.
// ==============================================================================

import {
  prisma,
  memoryStore,
  getIsDatabaseConnected,
  CareCircleMember,
  CareCircleInvite,
  CareCircleActivity,
  CircleRole,
  CirclePermissions,
  hashInvitationCode
} from '../config/db.js';
import { AppError } from '../utils/errors.js';
import { randomBytes, randomUUID } from 'crypto';
import { emailService } from './email.service.js';
import { auditService } from './audit.service.js';
import { MemberRole, MembershipStatus } from '../constants/roles.js';

export interface CreateInviteDTO {
  elderlyId: string;
  targetRole: CircleRole;
  targetRelationship: string;
  invitedEmail?: string;
  invitedPhone?: string;
  expiresInHours?: number;
  defaultPermissions?: Partial<CirclePermissions>;
}

export interface JoinCircleDTO {
  code: string;
  relationship?: string;
  notes?: string;
}

export const circleService = {
  // 1. Fetch connected care circle members (with status filter and pagination)
  getMembers: async (elderlyId: string = 'eld-01', status?: string, page = 1, limit = 20) => {
    const isDb = getIsDatabaseConnected();
    const skip = (page - 1) * limit;

    if (isDb) {
      const where: any = { elderlyId };
      if (status) where.status = status as any;

      const [items, total] = await Promise.all([
        prisma.careMember.findMany({
          where,
          skip,
          take: limit,
          include: {
            user: {
              select: { id: true, name: true, email: true, phone: true, avatarUrl: true, role: true }
            }
          },
          orderBy: { joinedAt: 'desc' }
        }),
        prisma.careMember.count({ where })
      ]);

      const formatted = items.map((m) => ({
        id: m.id,
        elderlyId: m.elderlyId,
        userId: m.userId,
        userName: m.user.name,
        userEmail: m.user.email,
        userPhone: m.user.phone,
        avatarUrl: m.user.avatarUrl,
        relationship: m.relationship || 'Care Circle Member',
        circleRole: m.role as string,
        status: m.status as string,
        permissions: {
          canManageMedications: m.canManageMedications,
          canManageAppointments: m.canManageAppointments,
          canViewVitals: m.canViewVitals,
          canRecordVitals: m.canLogVitals,
          canManageActivities: m.canManageCareTasks,
          receivesAlerts: m.canTriggerEmergency
        },
        joinedAt: m.joinedAt
      }));

      return {
        items: formatted,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
      };
    }

    let members = (memoryStore.careCircleMembers || []).filter((m) => m.elderlyId === elderlyId);
    if (status) {
      members = members.filter((m) => m.status === status);
    }

    const total = members.length;
    const paginated = members.slice(skip, skip + limit);

    return {
      items: paginated,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
  },

  // 2. Generate secure expiring invitation code
  createInvite: async (userId: string, dto: CreateInviteDTO, ip?: string, userAgent?: string) => {
    const isDb = getIsDatabaseConnected();
    const hex1 = randomBytes(2).toString('hex').toUpperCase();
    const hex2 = randomBytes(2).toString('hex').toUpperCase();
    const plainCode = `NEST-${hex1}-${hex2}`;
    const maskedCode = `NEST-****-${hex2}`;
    const hashedCode = hashInvitationCode(plainCode);

    const hours = dto.expiresInHours && dto.expiresInHours > 0 ? dto.expiresInHours : 48;
    const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);

    const fullPermissions: CirclePermissions = {
      canManageMedications: dto.defaultPermissions?.canManageMedications ?? (dto.targetRole !== 'FAMILY_VIEWER'),
      canManageAppointments: dto.defaultPermissions?.canManageAppointments ?? (dto.targetRole !== 'FAMILY_VIEWER'),
      canViewVitals: dto.defaultPermissions?.canViewVitals ?? true,
      canRecordVitals: dto.defaultPermissions?.canRecordVitals ?? (dto.targetRole === 'CARETAKER' || dto.targetRole === 'FAMILY_ADMIN'),
      canManageActivities: dto.defaultPermissions?.canManageActivities ?? (dto.targetRole !== 'FAMILY_VIEWER'),
      receivesAlerts: dto.defaultPermissions?.receivesAlerts ?? true
    };

    let creatorName = 'Family Administrator';

    if (isDb) {
      const creator = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
      if (creator) creatorName = creator.name;

      const invite = await prisma.invitation.create({
        data: {
          elderlyId: dto.elderlyId,
          invitedByUserId: userId,
          targetEmail: dto.invitedEmail || `invite-${plainCode}@carenest.health`,
          inviteCodeHash: hashedCode,
          inviteCodeMask: maskedCode,
          assignedRole: dto.targetRole as any,
          permissions: fullPermissions as any,
          status: 'PENDING',
          expiresAt
        }
      });

      // Audit Log
      await auditService.logEvent({
        actorId: userId,
        elderlyId: dto.elderlyId,
        action: 'INVITE_SENT',
        entityType: 'Invitation',
        entityId: invite.id,
        description: `Generated invitation code ${plainCode} (${hours}h expiry) for ${dto.targetRelationship}.`,
        ipAddress: ip,
        userAgent
      });

      if (dto.invitedEmail) {
        const elderly = await prisma.elderlyProfile.findUnique({
          where: { id: dto.elderlyId },
          include: { user: true }
        });
        emailService.sendFamilyCircleInvite(dto.invitedEmail, {
          inviterName: creatorName,
          elderlyName: elderly?.user?.name || 'Elderly Individual',
          targetRole: dto.targetRole,
          targetRelationship: dto.targetRelationship || 'Family Member',
          invitationCode: plainCode,
          expiresInHours: hours,
          elderlyId: dto.elderlyId,
          inviteId: invite.id
        }).catch(() => {});
      }

      return {
        ...invite,
        code: plainCode,
        plainCode,
        expiresAt
      };
    }

    const creator = memoryStore.users.find((u) => u.id === userId);
    if (creator) creatorName = creator.name;

    const newInvite: CareCircleInvite = {
      id: `inv-${randomUUID().substring(0, 8)}`,
      elderlyId: dto.elderlyId,
      code: plainCode,
      hashedCode,
      targetRole: dto.targetRole,
      targetRelationship: dto.targetRelationship || 'Family Member',
      invitedEmail: dto.invitedEmail,
      invitedPhone: dto.invitedPhone,
      defaultPermissions: fullPermissions,
      createdById: userId,
      createdByName: creatorName,
      expiresAt,
      isSingleUse: true,
      isUsed: false,
      isRevoked: false,
      createdAt: new Date()
    };

    if (!memoryStore.careCircleInvites) memoryStore.careCircleInvites = [];
    memoryStore.careCircleInvites.unshift(newInvite);

    // Audit Log
    await auditService.logEvent({
      actorId: userId,
      elderlyId: dto.elderlyId,
      action: 'INVITE_SENT',
      entityType: 'Invitation',
      entityId: newInvite.id,
      description: `Generated invitation code ${plainCode} (${hours}h expiry) for ${dto.targetRelationship}.`,
      ipAddress: ip,
      userAgent
    });

    if (dto.invitedEmail) {
      const elderly = memoryStore.elderlyProfiles.find((e) => e.id === dto.elderlyId);
      const elderlyUser = elderly ? memoryStore.users.find((u) => u.id === elderly.userId) : null;
      emailService.sendFamilyCircleInvite(dto.invitedEmail, {
        inviterName: creatorName,
        elderlyName: elderlyUser?.name || 'Elderly Individual',
        targetRole: dto.targetRole,
        targetRelationship: dto.targetRelationship || 'Family Member',
        invitationCode: plainCode,
        expiresInHours: hours,
        elderlyId: dto.elderlyId,
        inviteId: newInvite.id
      }).catch(() => {});
    }

    return newInvite;
  },

  // 3. Join Care Circle Using Invitation Code
  joinWithCode: async (userId: string, dto: JoinCircleDTO, ip?: string, userAgent?: string) => {
    const isDb = getIsDatabaseConnected();
    const cleanCode = dto.code.trim().toUpperCase();
    const hashed = hashInvitationCode(cleanCode);

    if (isDb) {
      const invite = await prisma.invitation.findFirst({
        where: {
          OR: [{ inviteCodeHash: hashed }, { inviteCodeHash: cleanCode }]
        }
      });

      if (!invite) throw new AppError('Invalid invitation code. Please verify the code with your family.', 400);
      if (invite.status === 'REVOKED') throw new AppError('This invitation code has been revoked.', 400);
      if (invite.status === 'ACCEPTED') throw new AppError('This single-use invitation code has already been redeemed.', 400);
      if (new Date() > new Date(invite.expiresAt)) throw new AppError('This invitation code has expired.', 400);

      const existingMember = await prisma.careMember.findUnique({
        where: { elderlyId_userId: { elderlyId: invite.elderlyId, userId } }
      });
      if (existingMember && existingMember.status !== 'REVOKED') {
        throw new AppError('You are already a member or have a pending request in this Care Circle.', 409);
      }

      const joiningUser = await prisma.user.findUnique({ where: { id: userId } });
      if (!joiningUser) throw new AppError('User profile not found.', 404);

      const assignedRole = invite.assignedRole;
      const permObj = (invite.permissions as any) || {};

      const newMember = await prisma.careMember.upsert({
        where: { elderlyId_userId: { elderlyId: invite.elderlyId, userId } },
        create: {
          elderlyId: invite.elderlyId,
          userId,
          role: assignedRole,
          relationship: dto.relationship || 'Family Member',
          status: 'PENDING_APPROVAL',
          canManageMedications: permObj.canManageMedications ?? (assignedRole !== 'FAMILY_VIEWER'),
          canLogMedicationIntake: permObj.canLogMedicationIntake ?? true,
          canManageAppointments: permObj.canManageAppointments ?? (assignedRole !== 'FAMILY_VIEWER'),
          canViewVitals: permObj.canViewVitals ?? true,
          canLogVitals: permObj.canLogVitals ?? (assignedRole === 'CARETAKER'),
          canManageCareTasks: permObj.canManageCareTasks ?? (assignedRole !== 'FAMILY_VIEWER'),
          canViewDocuments: permObj.canViewDocuments ?? true,
          canUploadDocuments: permObj.canUploadDocuments ?? false,
          canInviteMembers: permObj.canInviteMembers ?? false,
          canTriggerEmergency: permObj.canTriggerEmergency ?? true
        },
        update: {
          status: 'PENDING_APPROVAL',
          relationship: dto.relationship || 'Family Member',
          role: assignedRole
        }
      });

      await prisma.invitation.update({
        where: { id: invite.id },
        data: { status: 'ACCEPTED', acceptedAt: new Date(), acceptedByUserId: userId }
      });

      await auditService.logEvent({
        actorId: userId,
        elderlyId: invite.elderlyId,
        action: 'INVITE_ACCEPTED',
        entityType: 'CareMember',
        entityId: newMember.id,
        description: `${joiningUser.name} submitted request to join Care Circle via invitation code.`,
        ipAddress: ip,
        userAgent
      });

      return newMember;
    }

    const invite = (memoryStore.careCircleInvites || []).find(
      (i) => i.hashedCode === hashed || i.code.toUpperCase() === cleanCode
    );

    if (!invite) throw new AppError('Invalid invitation code. Please verify the code with your family.', 400);
    if (invite.isRevoked) throw new AppError('This invitation code has been revoked.', 400);
    if (invite.isUsed && invite.isSingleUse) throw new AppError('This invitation code has already been redeemed.', 400);
    if (new Date() > new Date(invite.expiresAt)) throw new AppError('This invitation code has expired.', 400);

    const existing = (memoryStore.careCircleMembers || []).find(
      (m) => m.elderlyId === invite.elderlyId && m.userId === userId && m.status !== 'REVOKED'
    );
    if (existing) {
      throw new AppError('You are already a member or have a pending request in this Care Circle.', 409);
    }

    const joiningUser = memoryStore.users.find((u) => u.id === userId);
    if (!joiningUser) throw new AppError('User profile not found.', 404);

    const newMember: CareCircleMember = {
      id: `mem-${randomUUID().substring(0, 8)}`,
      elderlyId: invite.elderlyId,
      userId,
      userName: joiningUser.name,
      userEmail: joiningUser.email,
      userPhone: joiningUser.phone,
      avatarUrl: joiningUser.avatarUrl,
      relationship: dto.relationship || invite.targetRelationship || 'Family Member',
      circleRole: invite.targetRole,
      status: 'PENDING_APPROVAL',
      permissions: invite.defaultPermissions,
      joinedAt: new Date(),
      invitedById: invite.createdById,
      invitedByName: invite.createdByName,
      notes: dto.notes || `Joined using code ${invite.code}`
    };

    if (!memoryStore.careCircleMembers) memoryStore.careCircleMembers = [];
    memoryStore.careCircleMembers.push(newMember);

    invite.isUsed = true;
    invite.usedAt = new Date();
    invite.usedById = userId;

    await auditService.logEvent({
      actorId: userId,
      elderlyId: invite.elderlyId,
      action: 'INVITE_ACCEPTED',
      entityType: 'CareMember',
      entityId: newMember.id,
      description: `${joiningUser.name} submitted request to join Care Circle via code.`,
      ipAddress: ip,
      userAgent
    });

    return newMember;
  },

  // 4. Approve Member Request
  approveMembership: async (userId: string, memberId: string, actorId?: string, ip?: string, userAgent?: string) => {
    const isDb = getIsDatabaseConnected();

    if (isDb) {
      const updated = await prisma.careMember.update({
        where: { id: memberId },
        data: {
          status: 'ACTIVE',
          joinedAt: new Date()
        },
        include: { user: true }
      });

      await auditService.logEvent({
        actorId,
        elderlyId: updated.elderlyId,
        action: 'UPDATE',
        entityType: 'CareMember',
        entityId: memberId,
        description: `Approved membership request for ${updated.user.name}.`,
        ipAddress: ip,
        userAgent
      });

      return updated;
    }

    const member = (memoryStore.careCircleMembers || []).find((m) => m.id === memberId);
    if (!member) throw new AppError('Membership request not found.', 404);

    member.status = 'ACTIVE';
    member.approvedAt = new Date();
    member.approvedById = userId;

    await auditService.logEvent({
      actorId,
      elderlyId: member.elderlyId,
      action: 'UPDATE',
      entityType: 'CareMember',
      entityId: memberId,
      description: `Approved membership request for ${member.userName}.`,
      ipAddress: ip,
      userAgent
    });

    return member;
  },

  // 5. Reject Member Request
  rejectMembership: async (userId: string, memberId: string, reason?: string, actorId?: string, ip?: string, userAgent?: string) => {
    const isDb = getIsDatabaseConnected();

    if (isDb) {
      const member = await prisma.careMember.update({
        where: { id: memberId },
        data: { status: 'REVOKED', notes: reason ? `Declined: ${reason}` : 'Membership request declined' },
        include: { user: true }
      });

      await auditService.logEvent({
        actorId,
        elderlyId: member.elderlyId,
        action: 'UPDATE',
        entityType: 'CareMember',
        entityId: memberId,
        description: `Declined membership request for ${member.user.name}. Reason: ${reason || 'Not specified'}`,
        ipAddress: ip,
        userAgent
      });

      return member;
    }

    const member = (memoryStore.careCircleMembers || []).find((m) => m.id === memberId);
    if (!member) throw new AppError('Membership request not found.', 404);

    member.status = 'REJECTED';
    member.notes = reason ? `Rejected: ${reason}` : 'Membership request declined';

    await auditService.logEvent({
      actorId,
      elderlyId: member.elderlyId,
      action: 'UPDATE',
      entityType: 'CareMember',
      entityId: memberId,
      description: `Declined membership request for ${member.userName}. Reason: ${reason || 'Not specified'}`,
      ipAddress: ip,
      userAgent
    });

    return member;
  },

  // 6. Update Member Permissions
  updatePermissions: async (userId: string, memberId: string, permissions: CirclePermissions, actorId?: string, ip?: string, userAgent?: string) => {
    const isDb = getIsDatabaseConnected();

    if (isDb) {
      const updated = await prisma.careMember.update({
        where: { id: memberId },
        data: {
          canManageMedications: permissions.canManageMedications,
          canManageAppointments: permissions.canManageAppointments,
          canViewVitals: permissions.canViewVitals,
          canLogVitals: permissions.canRecordVitals,
          canManageCareTasks: permissions.canManageActivities,
          canTriggerEmergency: permissions.receivesAlerts
        },
        include: { user: true }
      });

      await auditService.logEvent({
        actorId,
        elderlyId: updated.elderlyId,
        action: 'PERMISSION_CHANGED',
        entityType: 'CareMember',
        entityId: memberId,
        description: `Configured customized healthcare permissions for ${updated.user.name}.`,
        ipAddress: ip,
        userAgent
      });

      return updated;
    }

    const member = (memoryStore.careCircleMembers || []).find((m) => m.id === memberId);
    if (!member) throw new AppError('Member not found.', 404);

    if (member.circleRole === 'ELDERLY_OWNER') {
      throw new AppError('Cannot restrict permissions for primary profile owner.', 400);
    }

    member.permissions = { ...permissions };

    await auditService.logEvent({
      actorId,
      elderlyId: member.elderlyId,
      action: 'PERMISSION_CHANGED',
      entityType: 'CareMember',
      entityId: memberId,
      description: `Configured customized healthcare permissions for ${member.userName}.`,
      ipAddress: ip,
      userAgent
    });

    return member;
  },

  // 7. Revoke Member Access
  revokeMember: async (userId: string, memberId: string, actorId?: string, ip?: string, userAgent?: string) => {
    const isDb = getIsDatabaseConnected();

    if (isDb) {
      const updated = await prisma.careMember.update({
        where: { id: memberId },
        data: {
          status: 'REVOKED',
          revokedAt: new Date(),
          revokedById: actorId
        },
        include: { user: true }
      });

      await auditService.logEvent({
        actorId,
        elderlyId: updated.elderlyId,
        action: 'ROLE_CHANGED',
        entityType: 'CareMember',
        entityId: memberId,
        description: `Revoked Care Circle access for ${updated.user.name}.`,
        ipAddress: ip,
        userAgent
      });

      return { message: 'Member access revoked successfully.', memberId };
    }

    const member = (memoryStore.careCircleMembers || []).find((m) => m.id === memberId);
    if (!member) throw new AppError('Member not found.', 404);

    if (member.circleRole === 'ELDERLY_OWNER') {
      throw new AppError('Cannot revoke access for primary profile owner.', 400);
    }

    member.status = 'REVOKED';

    await auditService.logEvent({
      actorId,
      elderlyId: member.elderlyId,
      action: 'ROLE_CHANGED',
      entityType: 'CareMember',
      entityId: memberId,
      description: `Revoked Care Circle access for ${member.userName}.`,
      ipAddress: ip,
      userAgent
    });

    return { message: 'Member access revoked successfully.', memberId };
  },

  // 8. Fetch Care Circle Invites
  getInvites: async (elderlyId: string = 'eld-01') => {
    const invites = (memoryStore.careCircleInvites || []).filter((inv) => inv.elderlyId === elderlyId);
    return invites.map((inv) => ({
      ...inv,
      isExpired: new Date() > new Date(inv.expiresAt)
    }));
  },

  // 9. Revoke Invitation Code
  revokeInvite: async (userId: string, inviteId: string) => {
    const invite = (memoryStore.careCircleInvites || []).find((i) => i.id === inviteId);
    if (!invite) throw new AppError('Invitation code not found.', 404);

    invite.isRevoked = true;
    return { message: 'Invitation code revoked successfully.', inviteId };
  },

  // 10. Update Member Role
  updateRole: async (userId: string, memberId: string, newRole: CircleRole, actorId?: string) => {
    const member = (memoryStore.careCircleMembers || []).find((m) => m.id === memberId);
    if (!member) throw new AppError('Member not found.', 404);

    if (member.circleRole === 'ELDERLY_OWNER') {
      throw new AppError('Cannot reassign role of primary elderly profile owner.', 400);
    }

    const oldRole = member.circleRole;
    member.circleRole = newRole;

    if (newRole === 'FAMILY_VIEWER') {
      member.permissions.canManageMedications = false;
      member.permissions.canManageAppointments = false;
      member.permissions.canManageActivities = false;
      member.permissions.canRecordVitals = false;
    }

    await auditService.logEvent({
      actorId,
      elderlyId: member.elderlyId,
      action: 'ROLE_CHANGED',
      entityType: 'CareMember',
      entityId: memberId,
      description: `Changed ${member.userName}'s role from ${oldRole} to ${newRole}.`
    });

    return member;
  },

  // 11. Fetch Care Circle Activity Timeline
  getActivities: async (elderlyId: string = 'eld-01', page = 1, limit = 20) => {
    const skip = (page - 1) * limit;
    const activities = (memoryStore.careCircleActivities || []).filter((a) => a.elderlyId === elderlyId);
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const total = activities.length;
    const paginated = activities.slice(skip, skip + limit);

    return {
      items: paginated,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
  }
};
