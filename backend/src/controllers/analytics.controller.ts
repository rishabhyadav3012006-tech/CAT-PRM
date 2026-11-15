import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { analyticsService, AnalyticsQueryOptions } from '../services/analytics.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { auditService } from '../services/audit.service.js';

export const analyticsController = {
  // 1. Fetch Comprehensive Healthcare Analytics & Dashboard Statistics
  getOverview: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const options: AnalyticsQueryOptions = {
        elderlyId: req.query.elderlyId as string | undefined,
        period: (req.query.period as any) || 'this_month',
        startDate: req.query.startDate as string | undefined,
        endDate: req.query.endDate as string | undefined
      };

      const overview = await analyticsService.getOverview(options);

      // HIPAA Audit Log
      await auditService.logEvent({
        actorId: req.user!.userId,
        elderlyId: overview.elderlyId,
        action: 'READ',
        entityType: 'AnalyticsDashboard',
        entityId: overview.elderlyId,
        description: `Inspected adherence and healthcare activity statistics for period: ${overview.period}`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      return sendSuccess(res, 'Analytics overview retrieved successfully', overview);
    } catch (err) {
      next(err);
    }
  },

  // 2. Download Healthcare Activity Summary Report
  downloadReport: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const options: AnalyticsQueryOptions = {
        elderlyId: req.query.elderlyId as string | undefined,
        period: (req.query.period as any) || 'this_month',
        startDate: req.query.startDate as string | undefined,
        endDate: req.query.endDate as string | undefined
      };
      const format = (req.query.format as string) || 'html';

      const report = await analyticsService.generatePrintableReport(options);

      // Audit Log
      await auditService.logEvent({
        actorId: req.user!.userId,
        elderlyId: report.overview.elderlyId,
        action: 'READ',
        entityType: 'HealthcareReport',
        entityId: report.overview.elderlyId,
        description: `Exported downloadable healthcare activity summary (${format.toUpperCase()}) for ${report.overview.patientName}`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      if (format === 'json') {
        res.setHeader('Content-Disposition', `attachment; filename="${report.fileName.replace('.html', '.json')}"`);
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).send(JSON.stringify(report.overview, null, 2));
      }

      if (format === 'csv') {
        const rows = [
          ['Date', 'Day', 'Total Scheduled', 'Taken', 'Skipped', 'Missed', 'Unconfirmed', 'Adherence Rate %'],
          ...report.overview.charts.adherenceLineTrend.map((d: any) => [
            d.date,
            d.dayOfWeek,
            d.totalEligible,
            d.taken,
            d.skipped,
            d.missed,
            d.unconfirmed,
            `${d.adherenceRate}%`
          ])
        ];
        const csvContent = rows.map((r) => r.join(',')).join('\n');
        res.setHeader('Content-Disposition', `attachment; filename="${report.fileName.replace('.html', '.csv')}"`);
        res.setHeader('Content-Type', 'text/csv');
        return res.status(200).send(csvContent);
      }

      // Default: HTML Printable Summary
      res.setHeader('Content-Disposition', `attachment; filename="${report.fileName}"`);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(report.htmlContent);
    } catch (err) {
      next(err);
    }
  }
};

