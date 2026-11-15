// ==============================================================================
// CareNest Healthcare Platform - Security & Audit Logging Service
// HIPAA & GDPR compliant event tracking for authentication, role changes,
// patient record inspection, and clinical modifications.
// ==============================================================================

import { prisma, memoryStore, getIsDatabaseConnected } from '../config/db.js';
import { logger } from '../utils/logger.js';
import { randomUUID } from 'crypto';

export type AuditActionType =
  | 'CREATE'
  | 'READ'
  | 'UPDATE'
  | 'DELETE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'PASSWORD_RESET'
  | 'INVITE_SENT'
  | 'INVITE_ACCEPTED'
  | 'ROLE_CHANGED'
  | 'PERMISSION_CHANGED'
  | 'DOCUMENT_DOWNLOADED'
  | 'DOCUMENT_ARCHIVED'
  | 'EMERGENCY_TRIGGERED'
  | 'EMERGENCY_RESOLVED';

export interface LogAuditParams {
  elderlyId?: string;
  actorId?: string;
  action: AuditActionType;
  entityType: string;
  entityId: string;
  description: string;
  previousState?: any;
  newState?: any;
  ipAddress?: string;
  userAgent?: string;
}

export const auditService = {
  logEvent: async (params: LogAuditParams) => {
    try {
      const isDb = getIsDatabaseConnected();

      if (isDb) {
        await prisma.auditLog.create({
          data: {
            elderlyId: params.elderlyId,
            actorId: params.actorId,
            action: params.action as any,
            entityType: params.entityType,
            entityId: params.entityId,
            description: params.description,
            previousState: params.previousState ? params.previousState : undefined,
            newState: params.newState ? params.newState : undefined,
            ipAddress: params.ipAddress,
            userAgent: params.userAgent
          }
        });
      } else {
        if (!(memoryStore as any).auditLogs) {
          (memoryStore as any).auditLogs = [];
        }
        (memoryStore as any).auditLogs.push({
          id: `aud-${randomUUID().substring(0, 8)}`,
          elderlyId: params.elderlyId,
          actorId: params.actorId,
          action: params.action,
          entityType: params.entityType,
          entityId: params.entityId,
          description: params.description,
          previousState: params.previousState,
          newState: params.newState,
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
          createdAt: new Date()
        });
      }

      logger.info(`[AUDIT] [${params.action}] [${params.entityType}:${params.entityId}] ${params.description}`);
    } catch (err: any) {
      // Never crash the main request on audit log failure; log warning
      logger.warn(`Failed to record audit log: ${err.message}`);
    }
  },

  getAuditLogs: async (elderlyId?: string, limit = 50) => {
    const isDb = getIsDatabaseConnected();
    if (isDb) {
      return prisma.auditLog.findMany({
        where: elderlyId ? { elderlyId } : undefined,
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: {
          actor: {
            select: { id: true, name: true, email: true, role: true }
          }
        }
      });
    }

    const logs = ((memoryStore as any).auditLogs || []) as any[];
    const filtered = elderlyId ? logs.filter((l) => l.elderlyId === elderlyId) : logs;
    return filtered
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)
      .map((log) => {
        const actor = memoryStore.users.find((u) => u.id === log.actorId);
        return {
          ...log,
          actor: actor ? { id: actor.id, name: actor.name, email: actor.email, role: actor.role } : null
        };
      });
  }
};

