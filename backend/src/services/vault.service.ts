// ==============================================================================
// CareNest Healthcare Platform - Medical Records & Prescription Vault Service
// Private Document Storage, Ephemeral HMAC-SHA256 Signed URLs, Search/Filtering,
// Archival Protocols, Pagination, and Security Audit Logging.
// ==============================================================================

import {
  prisma,
  memoryStore,
  getIsDatabaseConnected,
  VaultDocument,
  VaultAccessLog,
  VaultCategory
} from '../config/db.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/errors.js';
import { auditService } from './audit.service.js';
import { randomUUID, createHmac, timingSafeEqual, createHash } from 'crypto';

export interface CreateVaultDocumentDTO {
  elderlyId: string;
  title: string;
  category: VaultCategory;
  doctorName?: string;
  facilityName?: string;
  documentDate: string;
  fileName: string;
  fileType?: string;
  fileSize?: string;
  fileBase64?: string;
  previewUrl?: string;
  tags?: string[];
  notes?: string;
}

export interface UpdateVaultDocumentDTO {
  title?: string;
  category?: VaultCategory;
  doctorName?: string;
  facilityName?: string;
  documentDate?: string;
  tags?: string[];
  notes?: string;
}

const SIGNING_SECRET = env.JWT_SECRET || 'carenest-vault-hmac-sha256-secret-key-2026';

export const vaultService = {
  // 1. Fetch Documents (with category, archive state, search query, and pagination)
  getDocuments: async (
    elderlyId: string = 'eld-01',
    category?: string,
    isArchived: boolean = false,
    query?: string,
    page = 1,
    limit = 20
  ) => {
    const isDb = getIsDatabaseConnected();
    const skip = (page - 1) * limit;

    if (isDb) {
      const where: any = {
        elderlyId,
        isArchived
      };

      if (category && category !== 'ALL') {
        where.category = category as any;
      }

      if (query && query.trim()) {
        const q = query.trim();
        where.OR = [
          { title: { contains: q, mode: 'insensitive' } },
          { doctorName: { contains: q, mode: 'insensitive' } },
          { facilityName: { contains: q, mode: 'insensitive' } }
        ];
      }

      const [items, total] = await Promise.all([
        prisma.medicalRecord.findMany({
          where,
          orderBy: { documentDate: 'desc' },
          skip,
          take: limit,
          include: {
            uploadedBy: { select: { id: true, name: true, role: true } }
          }
        }),
        prisma.medicalRecord.count({ where })
      ]);

      const formatted = items.map((d) => ({
        id: d.id,
        elderlyId: d.elderlyId,
        title: d.title,
        category: d.category as VaultCategory,
        doctorName: d.doctorName || undefined,
        facilityName: d.facilityName || undefined,
        documentDate: d.documentDate,
        fileName: d.fileName,
        fileType: d.mimeType,
        fileSize: d.sizeBytes ? `${(d.sizeBytes / 1024 / 1024).toFixed(1)} MB` : '1.8 MB',
        storageKey: d.fileUrl,
        previewUrl: d.fileUrl,
        tags: d.tags,
        notes: d.summary || undefined,
        isArchived: d.isArchived,
        archivedAt: d.archivedAt || undefined,
        uploadedById: d.uploadedById,
        uploadedByName: d.uploadedBy?.name || 'Authorized Member',
        uploadedByRole: d.uploadedBy?.role || 'CARETAKER',
        createdAt: d.createdAt,
        updatedAt: d.updatedAt
      }));

      return {
        items: formatted,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
      };
    }

    let docs = (memoryStore.vaultDocuments || []).filter(
      (d) => d.elderlyId === elderlyId && d.isArchived === isArchived
    );

    if (category && category !== 'ALL') {
      docs = docs.filter((d) => d.category === category);
    }

    if (query && query.trim()) {
      const q = query.trim().toLowerCase();
      docs = docs.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          (d.doctorName && d.doctorName.toLowerCase().includes(q)) ||
          (d.facilityName && d.facilityName.toLowerCase().includes(q)) ||
          (d.notes && d.notes.toLowerCase().includes(q)) ||
          d.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    docs.sort((a, b) => new Date(b.documentDate).getTime() - new Date(a.documentDate).getTime());

    const total = docs.length;
    const paginated = docs.slice(skip, skip + limit);

    return {
      items: paginated,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
  },

  // 2. Fetch Document by ID
  getDocumentById: async (
    id: string,
    actor?: { id: string; name: string; role: string },
    ip?: string,
    userAgent?: string
  ) => {
    const isDb = getIsDatabaseConnected();

    if (isDb) {
      const doc = await prisma.medicalRecord.findUnique({
        where: { id },
        include: { uploadedBy: { select: { id: true, name: true, role: true } } }
      });
      if (!doc) throw new AppError('Medical record not found in vault.', 404);

      if (actor) {
        await auditService.logEvent({
          actorId: actor.id,
          elderlyId: doc.elderlyId,
          action: 'READ',
          entityType: 'MedicalRecord',
          entityId: doc.id,
          description: `Viewed document details for '${doc.title}'.`,
          ipAddress: ip,
          userAgent
        });
      }

      return {
        ...doc,
        category: doc.category as VaultCategory,
        storageKey: doc.fileUrl,
        previewUrl: doc.fileUrl
      };
    }

    const doc = (memoryStore.vaultDocuments || []).find((d) => d.id === id);
    if (!doc) throw new AppError('Medical record not found in vault.', 404);

    if (actor) {
      if (!memoryStore.vaultAccessLogs) memoryStore.vaultAccessLogs = [];
      memoryStore.vaultAccessLogs.unshift({
        id: `val-${randomUUID().substring(0, 8)}`,
        documentId: doc.id,
        documentTitle: doc.title,
        elderlyId: doc.elderlyId,
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        action: 'VIEWED',
        details: 'Inspected document clinical summary and verified signature metadata.',
        timestamp: new Date()
      });

      await auditService.logEvent({
        actorId: actor.id,
        elderlyId: doc.elderlyId,
        action: 'READ',
        entityType: 'MedicalRecord',
        entityId: doc.id,
        description: `Viewed document details for '${doc.title}'.`,
        ipAddress: ip,
        userAgent
      });
    }

    return doc;
  },

  // 3. Upload Medical Document
  uploadDocument: async (
    userId: string,
    dto: CreateVaultDocumentDTO,
    ip?: string,
    userAgent?: string
  ) => {
    const isDb = getIsDatabaseConnected();
    const cleanFileName = dto.fileName.trim();
    const extension = cleanFileName.substring(cleanFileName.lastIndexOf('.')).toLowerCase();
    const allowedExtensions = ['.pdf', '.png', '.jpg', '.jpeg', '.webp'];

    if (!allowedExtensions.includes(extension)) {
      throw new AppError(
        `Invalid file format "${extension}". Supported medical vault formats: PDF, PNG, JPG, JPEG, WEBP.`,
        400
      );
    }

    const docDate = dto.documentDate ? new Date(dto.documentDate) : new Date();
    const storageKey = `vault/${dto.elderlyId || 'eld-01'}/${dto.category.toLowerCase()}/${randomUUID()}${extension}`;
    const previewUrl =
      dto.previewUrl ||
      (extension === '.pdf'
        ? 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80'
        : 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&q=80');

    if (isDb) {
      const created = await prisma.medicalRecord.create({
        data: {
          elderlyId: dto.elderlyId || 'eld-01',
          uploadedById: userId,
          title: dto.title.trim(),
          category: dto.category as any,
          doctorName: dto.doctorName ? dto.doctorName.trim() : undefined,
          facilityName: dto.facilityName ? dto.facilityName.trim() : undefined,
          documentDate: docDate,
          fileName: cleanFileName,
          fileExtension: extension,
          fileHash: createHash('sha256').update(cleanFileName).digest('hex'),
          mimeType: dto.fileType || (extension === '.pdf' ? 'application/pdf' : 'image/jpeg'),
          sizeBytes: 1024 * 1024 * 2,
          fileUrl: previewUrl,
          tags: dto.tags || ['General Record'],
          summary: dto.notes ? dto.notes.trim() : undefined,
          isArchived: false
        }
      });

      await auditService.logEvent({
        actorId: userId,
        elderlyId: dto.elderlyId,
        action: 'CREATE',
        entityType: 'MedicalRecord',
        entityId: created.id,
        description: `Uploaded '${created.title}' (${created.category}) to private vault.`,
        ipAddress: ip,
        userAgent
      });

      return created;
    }

    const user = memoryStore.users.find((u) => u.id === userId);
    const uploaderName = user ? user.name : 'Authorized Care Member';
    const uploaderRole = user ? user.role : 'FAMILY_MEMBER';

    const newDoc: VaultDocument = {
      id: `doc-${randomUUID().substring(0, 8)}`,
      elderlyId: dto.elderlyId || 'eld-01',
      title: dto.title.trim(),
      category: dto.category,
      doctorName: dto.doctorName ? dto.doctorName.trim() : undefined,
      facilityName: dto.facilityName ? dto.facilityName.trim() : undefined,
      documentDate: docDate,
      fileName: cleanFileName,
      fileType: dto.fileType || (extension === '.pdf' ? 'application/pdf' : 'image/jpeg'),
      fileSize: dto.fileSize || '1.8 MB',
      storageKey,
      previewUrl,
      tags: dto.tags || ['General Record'],
      notes: dto.notes ? dto.notes.trim() : undefined,
      isArchived: false,
      uploadedById: userId,
      uploadedByName: uploaderName,
      uploadedByRole: uploaderRole,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (!memoryStore.vaultDocuments) memoryStore.vaultDocuments = [];
    memoryStore.vaultDocuments.unshift(newDoc);

    if (!memoryStore.vaultAccessLogs) memoryStore.vaultAccessLogs = [];
    memoryStore.vaultAccessLogs.unshift({
      id: `val-${randomUUID().substring(0, 8)}`,
      documentId: newDoc.id,
      documentTitle: newDoc.title,
      elderlyId: newDoc.elderlyId,
      actorId: userId,
      actorName: uploaderName,
      actorRole: uploaderRole,
      action: 'UPLOADED',
      details: `Uploaded new ${newDoc.category} (${newDoc.fileSize}) to private vault.`,
      timestamp: new Date()
    });

    await auditService.logEvent({
      actorId: userId,
      elderlyId: dto.elderlyId,
      action: 'CREATE',
      entityType: 'MedicalRecord',
      entityId: newDoc.id,
      description: `Uploaded '${newDoc.title}' (${newDoc.category}) to private vault.`,
      ipAddress: ip,
      userAgent
    });

    return newDoc;
  },

  // 4. Update Document Metadata
  updateDocument: async (
    id: string,
    dto: UpdateVaultDocumentDTO,
    actorId?: string,
    ip?: string,
    userAgent?: string
  ) => {
    const isDb = getIsDatabaseConnected();

    if (isDb) {
      const data: any = {};
      if (dto.title) data.title = dto.title.trim();
      if (dto.category) data.category = dto.category as any;
      if (dto.doctorName !== undefined) data.doctorName = dto.doctorName.trim();
      if (dto.facilityName !== undefined) data.facilityName = dto.facilityName.trim();
      if (dto.documentDate) data.documentDate = new Date(dto.documentDate);
      if (dto.tags) data.tags = dto.tags;
      if (dto.notes !== undefined) data.summary = dto.notes.trim();

      const updated = await prisma.medicalRecord.update({
        where: { id },
        data
      });

      await auditService.logEvent({
        actorId,
        elderlyId: updated.elderlyId,
        action: 'UPDATE',
        entityType: 'MedicalRecord',
        entityId: id,
        description: `Updated clinical metadata for '${updated.title}'.`,
        ipAddress: ip,
        userAgent
      });

      return updated;
    }

    const doc = (memoryStore.vaultDocuments || []).find((d) => d.id === id);
    if (!doc) throw new AppError('Medical record not found.', 404);

    if (dto.title) doc.title = dto.title.trim();
    if (dto.category) doc.category = dto.category;
    if (dto.doctorName !== undefined) doc.doctorName = dto.doctorName ? dto.doctorName.trim() : undefined;
    if (dto.facilityName !== undefined) doc.facilityName = dto.facilityName ? dto.facilityName.trim() : undefined;
    if (dto.documentDate) doc.documentDate = new Date(dto.documentDate);
    if (dto.tags) doc.tags = dto.tags;
    if (dto.notes !== undefined) doc.notes = dto.notes ? dto.notes.trim() : undefined;
    doc.updatedAt = new Date();

    await auditService.logEvent({
      actorId,
      elderlyId: doc.elderlyId,
      action: 'UPDATE',
      entityType: 'MedicalRecord',
      entityId: id,
      description: `Updated clinical metadata for '${doc.title}'.`,
      ipAddress: ip,
      userAgent
    });

    return doc;
  },

  // 5. Archive Document
  archiveDocument: async (
    id: string,
    userId: string,
    ip?: string,
    userAgent?: string
  ) => {
    const isDb = getIsDatabaseConnected();

    if (isDb) {
      const updated = await prisma.medicalRecord.update({
        where: { id },
        data: {
          isArchived: true,
          archivedAt: new Date()
        }
      });

      await auditService.logEvent({
        actorId: userId,
        elderlyId: updated.elderlyId,
        action: 'DOCUMENT_ARCHIVED',
        entityType: 'MedicalRecord',
        entityId: id,
        description: `Archived outdated record '${updated.title}'.`,
        ipAddress: ip,
        userAgent
      });

      return { message: 'Document archived successfully.', id };
    }

    const doc = (memoryStore.vaultDocuments || []).find((d) => d.id === id);
    if (!doc) throw new AppError('Medical record not found.', 404);

    doc.isArchived = true;
    doc.archivedAt = new Date();
    doc.archivedById = userId;
    doc.updatedAt = new Date();

    await auditService.logEvent({
      actorId: userId,
      elderlyId: doc.elderlyId,
      action: 'DOCUMENT_ARCHIVED',
      entityType: 'MedicalRecord',
      entityId: id,
      description: `Archived outdated record '${doc.title}'.`,
      ipAddress: ip,
      userAgent
    });

    return { message: 'Document archived successfully.', id };
  },

  // 6. Restore Archived Document
  restoreDocument: async (id: string, userId: string) => {
    const isDb = getIsDatabaseConnected();
    if (isDb) {
      const updated = await prisma.medicalRecord.update({
        where: { id },
        data: { isArchived: false, archivedAt: null }
      });
      return { message: 'Document restored to active vault.', id };
    }

    const doc = (memoryStore.vaultDocuments || []).find((d) => d.id === id);
    if (!doc) throw new AppError('Medical record not found.', 404);

    doc.isArchived = false;
    doc.archivedAt = undefined;
    doc.archivedById = undefined;
    doc.updatedAt = new Date();

    return { message: 'Document restored to active vault.', id };
  },

  // 7. Generate Signed Ephemeral Download URL
  generateSignedDownloadUrl: async (
    id: string,
    actor: { id: string; name: string; role: string },
    expiresInMinutes: number = 15
  ) => {
    const doc = (memoryStore.vaultDocuments || []).find((d) => d.id === id);
    if (!doc) throw new AppError('Medical record not found.', 404);

    const expires = Date.now() + expiresInMinutes * 60 * 1000;
    const payload = `${doc.id}:${actor.id}:${expires}`;
    const signature = createHmac('sha256', SIGNING_SECRET).update(payload).digest('hex');

    const downloadPath = `/api/v1/vault/documents/${doc.id}/download?token=${signature}&expires=${expires}&actorId=${actor.id}`;

    return {
      documentId: doc.id,
      title: doc.title,
      fileName: doc.fileName,
      fileSize: doc.fileSize,
      expiresAt: new Date(expires),
      expiresInMinutes,
      signedDownloadUrl: downloadPath,
      token: signature
    };
  },

  // 8. Verify and Download via Signed Token
  verifyAndDownload: async (
    id: string,
    actorId: string,
    expires: number,
    token: string,
    ip?: string,
    userAgent?: string
  ) => {
    const doc = (memoryStore.vaultDocuments || []).find((d) => d.id === id);
    if (!doc) throw new AppError('Medical record not found.', 404);

    if (Date.now() > expires) {
      throw new AppError('Download link has expired for security. Please generate a fresh link.', 403);
    }

    const payload = `${doc.id}:${actorId}:${expires}`;
    const expectedSignature = createHmac('sha256', SIGNING_SECRET).update(payload).digest('hex');

    const tokenBuffer = Buffer.from(token);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (tokenBuffer.length !== expectedBuffer.length || !timingSafeEqual(tokenBuffer, expectedBuffer)) {
      throw new AppError('Invalid download authentication token.', 403);
    }

    await auditService.logEvent({
      actorId,
      elderlyId: doc.elderlyId,
      action: 'DOCUMENT_DOWNLOADED',
      entityType: 'MedicalRecord',
      entityId: doc.id,
      description: `Downloaded document '${doc.title}' via authorized signed link.`,
      ipAddress: ip,
      userAgent
    });

    return {
      document: doc,
      simulatedDownloadStream: {
        fileName: doc.fileName,
        contentType: doc.fileType,
        size: doc.fileSize,
        storageKey: doc.storageKey
      }
    };
  },

  // 9. Delete Document Permanently
  deleteDocument: async (id: string, userId: string) => {
    const isDb = getIsDatabaseConnected();
    if (isDb) {
      const deleted = await prisma.medicalRecord.delete({ where: { id } });
      await auditService.logEvent({
        actorId: userId,
        action: 'DELETE',
        entityType: 'MedicalRecord',
        entityId: id,
        description: `Permanently deleted document '${deleted.title}'.`
      });
      return { message: 'Document permanently removed.', id };
    }

    const idx = (memoryStore.vaultDocuments || []).findIndex((d) => d.id === id);
    if (idx === -1) throw new AppError('Medical record not found.', 404);

    const removed = memoryStore.vaultDocuments.splice(idx, 1)[0];

    await auditService.logEvent({
      actorId: userId,
      elderlyId: removed.elderlyId,
      action: 'DELETE',
      entityType: 'MedicalRecord',
      entityId: id,
      description: `Permanently deleted document '${removed.title}'.`
    });

    return { message: 'Document permanently removed.', id };
  },

  // 10. Audit Logs
  getAuditLogs: async (elderlyId: string = 'eld-01') => {
    return auditService.getAuditLogs(elderlyId);
  }
};
