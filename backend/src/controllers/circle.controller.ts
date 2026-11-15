// ==============================================================================
// CareNest Healthcare Platform - Family Circle Controller
// Member Invitations, Approvals, Role & Permission Configuration, Access Revocation.
// ==============================================================================

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { circleService } from '../services/circle.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const circleController = {
  // 1. Fetch connected care circle members
  getMembers: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const elderlyId = (req.query.elderlyId as string) || 'eld-01';
      const status = req.query.status as string | undefined;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      const members = await circleService.getMembers(elderlyId, status, page, limit);
      return sendSuccess(res, 'Care circle members retrieved', members);
    } catch (err) {
      next(err);
    }
  },

  // 2. Generate secure expiring invitation code
  createInvite: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const invite = await circleService.createInvite(
        req.user!.userId,
        req.body,
        req.ip,
        req.headers['user-agent'] as string
      );
      return sendSuccess(res, 'Secure invitation code generated', invite, 201);
    } catch (err) {
      next(err);
    }
  },

  // 3. Fetch active invitation codes
  getInvites: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const elderlyId = (req.query.elderlyId as string) || 'eld-01';
      const invites = await circleService.getInvites(elderlyId);
      return sendSuccess(res, 'Care circle invites retrieved', invites);
    } catch (err) {
      next(err);
    }
  },

  // 4. Revoke invitation code
  revokeInvite: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const result = await circleService.revokeInvite(req.user!.userId, req.params.inviteId);
      return sendSuccess(res, 'Invitation code revoked', result);
    } catch (err) {
      next(err);
    }
  },

  // 5. Join care circle using invitation code
  joinWithCode: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const member = await circleService.joinWithCode(
        req.user!.userId,
        req.body,
        req.ip,
        req.headers['user-agent'] as string
      );
      return sendSuccess(res, 'Joined care circle successfully (membership submitted)', member, 201);
    } catch (err) {
      next(err);
    }
  },

  // 6. Approve membership request
  approveMember: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const approved = await circleService.approveMembership(
        req.user!.userId,
        req.params.memberId,
        req.user!.userId,
        req.ip,
        req.headers['user-agent'] as string
      );
      return sendSuccess(res, 'Membership request approved', approved);
    } catch (err) {
      next(err);
    }
  },

  // 7. Decline / reject membership request
  rejectMember: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const rejected = await circleService.rejectMembership(
        req.user!.userId,
        req.params.memberId,
        req.body.reason,
        req.user!.userId,
        req.ip,
        req.headers['user-agent'] as string
      );
      return sendSuccess(res, 'Membership request declined', rejected);
    } catch (err) {
      next(err);
    }
  },

  // 8. Update member role
  updateRole: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const updated = await circleService.updateRole(
        req.user!.userId,
        req.params.memberId,
        req.body.role,
        req.user!.userId
      );
      return sendSuccess(res, 'Member role updated successfully', updated);
    } catch (err) {
      next(err);
    }
  },

  // 9. Update member permissions
  updatePermissions: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const updated = await circleService.updatePermissions(
        req.user!.userId,
        req.params.memberId,
        req.body.permissions,
        req.user!.userId,
        req.ip,
        req.headers['user-agent'] as string
      );
      return sendSuccess(res, 'Healthcare permissions updated', updated);
    } catch (err) {
      next(err);
    }
  },

  // 10. Revoke member access
  revokeMember: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const result = await circleService.revokeMember(
        req.user!.userId,
        req.params.memberId,
        req.user!.userId,
        req.ip,
        req.headers['user-agent'] as string
      );
      return sendSuccess(res, 'Care circle member access revoked', result);
    } catch (err) {
      next(err);
    }
  },

  // 11. Care circle activity ledger
  getActivities: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const elderlyId = (req.query.elderlyId as string) || 'eld-01';
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      const activities = await circleService.getActivities(elderlyId, page, limit);
      return sendSuccess(res, 'Care circle activities retrieved', activities);
    } catch (err) {
      next(err);
    }
  }
};
