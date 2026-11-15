import { elderlyService } from './elderly.service.js';
import { medicationService } from './medication.service.js';
import { appointmentService } from './appointment.service.js';
import { recordService } from './record.service.js';
import { activityService } from './activity.service.js';
import { alertService } from './alert.service.js';

export const dashboardService = {
  getOverview: async (elderlyId?: string) => {
    // If not provided, choose the first elderly profile
    let targetId = elderlyId;
    if (!targetId) {
      const all = await elderlyService.getAllElderly();
      if (all.length > 0) {
        targetId = all[0].id;
      }
    }

    if (!targetId) {
      return {
        message: 'No elderly profile registered yet.',
        overview: null
      };
    }

    const [profile, medications, appointments, records, activities, activeAlerts, adherenceStats] =
      await Promise.all([
        elderlyService.getProfileById(targetId),
        medicationService.getMedications(targetId),
        appointmentService.getAppointments(targetId),
        recordService.getRecords(targetId, 1, 5),
        activityService.getActivities(targetId),
        alertService.getActiveAlerts(),
        medicationService.getAdherenceStats(targetId)
      ]);

    const recordList: any[] = Array.isArray(records) ? records : (records as any)?.items || [];
    const apptList: any[] = Array.isArray(appointments) ? appointments : (appointments as any)?.items || [];
    const actList: any[] = Array.isArray(activities) ? activities : (activities as any)?.items || [];

    const latestVital = recordList.length > 0 ? recordList[0] : null;
    const upcomingAppointments = apptList
      .filter((a: any) => (a.status === 'SCHEDULED' || a.status === 'UPCOMING') && new Date(a.appointmentDate) >= new Date())
      .slice(0, 3);
    const pendingActivities = actList.filter((a: any) => a.status === 'PENDING');

    return {
      elderly: profile,
      metrics: {
        totalMedications: medications.length,
        adherenceRate: (adherenceStats as any).adherenceRate ?? (adherenceStats as any).rate ?? 100,
        adherenceSummary: {
          taken: adherenceStats.taken,
          missed: adherenceStats.missed,
          total: (adherenceStats as any).totalEligible ?? (adherenceStats as any).total ?? 0
        },
        upcomingAppointmentsCount: upcomingAppointments.length,
        pendingActivitiesCount: pendingActivities.length,
        activeAlertsCount: activeAlerts.length
      },
      latestVital,
      upcomingAppointments,
      todayActivities: actList.slice(0, 6),
      activeAlerts
    };
  }
};

