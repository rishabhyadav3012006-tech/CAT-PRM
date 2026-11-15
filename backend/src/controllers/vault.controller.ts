import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { vaultService } from '../services/vault.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const vaultController = {
  getAll: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const elderlyId = (req.query.elderlyId as string) || 'eld-01';
      const category = req.query.category as string | undefined;
      const isArchived = req.query.isArchived === 'true';
      const query = req.query.q as string | undefined;

      const docs = await vaultService.getDocuments(elderlyId, category, isArchived, query);
      return sendSuccess(res, 'Medical vault records retrieved successfully', docs);
    } catch (err) {
      next(err);
    }
  },

  getById: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const actor = req.user ? { id: req.user.userId, name: req.user.role, role: req.user.role } : undefined;
      const doc = await vaultService.getDocumentById(req.params.id, actor);
      return sendSuccess(res, 'Document details retrieved', doc);
    } catch (err) {
      next(err);
    }
  },

  upload: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const newDoc = await vaultService.uploadDocument(req.user!.userId, req.body);
      return sendSuccess(res, 'Medical document encrypted & uploaded to vault', newDoc, 201);
    } catch (err) {
      next(err);
    }
  },

  update: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const updated = await vaultService.updateDocument(
        req.params.id,
        req.body,
        req.user!.userId,
        req.ip,
        req.get('user-agent')
      );
      return sendSuccess(res, 'Document metadata updated successfully', updated);
    } catch (err) {
      next(err);
    }
  },

  archive: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const archived = await vaultService.archiveDocument(req.params.id, req.user!.userId);
      return sendSuccess(res, 'Document archived in compliance vault', archived);
    } catch (err) {
      next(err);
    }
  },

  restore: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const restored = await vaultService.restoreDocument(req.params.id, req.user!.userId);
      return sendSuccess(res, 'Document restored to active vault records', restored);
    } catch (err) {
      next(err);
    }
  },

  getSignedUrl: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const expiresInMinutes = req.query.expiresInMinutes ? Number(req.query.expiresInMinutes) : 15;
      const actor = {
        id: req.user!.userId,
        name: req.user!.role,
        role: req.user!.role
      };
      const signed = await vaultService.generateSignedDownloadUrl(req.params.id, actor, expiresInMinutes);
      return sendSuccess(res, 'Short-lived signed download link generated', signed);
    } catch (err) {
      next(err);
    }
  },

  download: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const token = req.query.token as string;
      const expires = Number(req.query.expires);
      const actorId = req.query.actorId as string;

      if (!token || !expires || !actorId) {
        return res.status(400).json({
          success: false,
          message: 'Missing signed download credentials (token, expires, actorId required)'
        });
      }

      const result = await vaultService.verifyAndDownload(req.params.id, actorId, expires, token);

      // Return simulated file stream headers
      res.setHeader('Content-Disposition', `attachment; filename="${result.document.fileName}"`);
      res.setHeader('Content-Type', result.document.fileType);
      return res.status(200).json({
        success: true,
        message: 'Verified and authorized for download',
        data: result.simulatedDownloadStream
      });
    } catch (err) {
      next(err);
    }
  },

  getAuditLogs: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const elderlyId = (req.query.elderlyId as string) || 'eld-01';
      const logs = await vaultService.getAuditLogs(elderlyId);
      return sendSuccess(res, 'Vault access audit trail retrieved', logs);
    } catch (err) {
      next(err);
    }
  },

  delete: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const result = await vaultService.deleteDocument(req.params.id, req.user!.userId);
      return sendSuccess(res, 'Document removed', result);
    } catch (err) {
      next(err);
    }
  }
};

