import { Router } from 'express';
import { z } from 'zod';
import { circleController } from '../controllers/circle.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';

const router = Router();

const createInviteSchema = z.object({
  elderlyId: z.string().default('eld-01'),
  targetRole: z.enum(['FAMILY_ADMIN', 'FAMILY_VIEWER', 'CARETAKER']),
  targetRelationship: z.string().min(2, 'Please specify the relationship or role title'),
  invitedEmail: z.string().email().optional(),
  invitedPhone: z.string().optional(),
  expiresInHours: z.number().min(1).max(720).optional(),
  defaultPermissions: z
    .object({
      canManageMedications: z.boolean().optional(),
      canManageAppointments: z.boolean().optional(),
      canViewVitals: z.boolean().optional(),
      canRecordVitals: z.boolean().optional(),
      canManageActivities: z.boolean().optional(),
      receivesAlerts: z.boolean().optional()
    })
    .optional()
});

const joinCircleSchema = z.object({
  code: z.string().min(4, 'Invitation code is required'),
  relationship: z.string().optional(),
  notes: z.string().optional()
});

const updateRoleSchema = z.object({
  role: z.enum(['FAMILY_ADMIN', 'FAMILY_VIEWER', 'CARETAKER'])
});

const updatePermissionsSchema = z.object({
  permissions: z.object({
    canManageMedications: z.boolean().optional(),
    canManageAppointments: z.boolean().optional(),
    canViewVitals: z.boolean().optional(),
    canRecordVitals: z.boolean().optional(),
    canManageActivities: z.boolean().optional(),
    receivesAlerts: z.boolean().optional(),
    canViewDocuments: z.boolean().optional(),
    canUploadDocuments: z.boolean().optional(),
    canManageCareTasks: z.boolean().optional(),
    canInviteMembers: z.boolean().optional()
  })
});

const rejectSchema = z.object({
  reason: z.string().optional()
});

router.use(authenticate);

router.get('/members', circleController.getMembers);
router.post('/invites', validateRequest({ body: createInviteSchema }), circleController.createInvite);
router.get('/invites', circleController.getInvites);
router.post('/invites/:inviteId/revoke', circleController.revokeInvite);
router.post('/join', validateRequest({ body: joinCircleSchema }), circleController.joinWithCode);
router.post('/members/:memberId/approve', circleController.approveMember);
router.post('/members/:memberId/reject', validateRequest({ body: rejectSchema }), circleController.rejectMember);
router.patch('/members/:memberId/role', validateRequest({ body: updateRoleSchema }), circleController.updateRole);
router.patch('/members/:memberId/permissions', validateRequest({ body: updatePermissionsSchema }), circleController.updatePermissions);
router.delete('/members/:memberId', circleController.revokeMember);
router.get('/activities', circleController.getActivities);

export default router;

