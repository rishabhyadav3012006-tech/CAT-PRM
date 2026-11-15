import { Router } from 'express';
import { z } from 'zod';
import { vaultController } from '../controllers/vault.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';

const router = Router();

const createDocumentSchema = z.object({
  elderlyId: z.string().default('eld-01'),
  title: z.string().min(2, 'Document title is required'),
  category: z.enum([
    'PRESCRIPTION',
    'BLOOD_REPORT',
    'MEDICAL_HISTORY',
    'DIAGNOSTIC_REPORT',
    'DISCHARGE_SUMMARY',
    'OTHER'
  ]),
  doctorName: z.string().optional(),
  facilityName: z.string().optional(),
  documentDate: z.string().min(10, 'Valid issue date is required'),
  fileName: z.string().min(3, 'File name is required'),
  fileType: z.string().optional(),
  fileSize: z.string().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
  previewUrl: z.string().optional()
});

const updateDocumentSchema = z.object({
  title: z.string().min(2).optional(),
  category: z
    .enum([
      'PRESCRIPTION',
      'BLOOD_REPORT',
      'MEDICAL_HISTORY',
      'DIAGNOSTIC_REPORT',
      'DISCHARGE_SUMMARY',
      'OTHER'
    ])
    .optional(),
  doctorName: z.string().optional(),
  facilityName: z.string().optional(),
  documentDate: z.string().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional()
});

// Download endpoint can be reached with signed token URL (or authenticate)
router.get('/documents/:id/download', vaultController.download);

router.use(authenticate);

router.get('/documents', vaultController.getAll);
router.get('/documents/:id', vaultController.getById);
router.post('/documents', validateRequest({ body: createDocumentSchema }), vaultController.upload);
router.patch('/documents/:id', validateRequest({ body: updateDocumentSchema }), vaultController.update);
router.post('/documents/:id/archive', vaultController.archive);
router.post('/documents/:id/restore', vaultController.restore);
router.get('/documents/:id/signed-url', vaultController.getSignedUrl);
router.delete('/documents/:id', vaultController.delete);
router.get('/audit-logs', vaultController.getAuditLogs);

export default router;

