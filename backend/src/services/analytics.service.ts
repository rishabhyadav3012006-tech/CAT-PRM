// ==============================================================================
// CareNest Healthcare Platform - Analytics & Clinical Reporting Service
// Longitudinal adherence trends, weekly day-of-week bar metrics, appointment stats,
// caretaker summaries, daily healthcare activity reports, and printable audit export.
// ==============================================================================

import { prisma, memoryStore, getIsDatabaseConnected } from '../config/db.js';
import { MedicationLogStatus } from '../constants/roles.js';
import { AppError } from '../utils/errors.js';

export interface AnalyticsQueryOptions {
  elderlyId?: string;
  period?: 'today' | 'this_week' | 'this_month' | 'custom';
  startDate?: string;
  endDate?: string;
}

export const analyticsService = {
  // 1. Fetch Comprehensive Healthcare Analytics & Dashboard Statistics
  getOverview: async (options: AnalyticsQueryOptions) => {
    const isDb = getIsDatabaseConnected();

    // Determine target elderly profile
    let targetElderlyId = options.elderlyId;
    if (!targetElderlyId) {
      if (isDb) {
        const firstProfile = await prisma.elderlyProfile.findFirst({ select: { id: true } });
        if (firstProfile) targetElderlyId = firstProfile.id;
      } else {
        const firstProfile = memoryStore.elderlyProfiles[0];
        if (firstProfile) targetElderlyId = firstProfile.id;
      }
    }

    if (!targetElderlyId) {
      targetElderlyId = 'eld-01';
    }

    // 1. Calculate Date Range Boundaries
    const now = new Date();
    let rangeStart: Date;
    let rangeEnd: Date;
    const period = options.period || 'this_month';

    if (period === 'today') {
      rangeStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      rangeEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    } else if (period === 'this_week') {
      // Last 7 full days
      rangeStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      rangeStart.setHours(0, 0, 0, 0);
      rangeEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    } else if (period === 'custom' && options.startDate && options.endDate) {
      rangeStart = new Date(`${options.startDate}T00:00:00.000Z`);
      rangeEnd = new Date(`${options.endDate}T23:59:59.999Z`);
    } else {
      // Default: Last 30 days
      rangeStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      rangeStart.setHours(0, 0, 0, 0);
      rangeEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    }

    // 2. Fetch Patient Profile & Care Circle Members
    let patientName = 'Eleanor Vance';
    let patientProfile: any = null;
    let caretakersList: any[] = [];

    if (isDb) {
      patientProfile = await prisma.elderlyProfile.findUnique({
        where: { id: targetElderlyId },
        include: { user: { select: { name: true, email: true, phone: true } } }
      });
      if (patientProfile?.user?.name) patientName = patientProfile.user.name;

      const members = await prisma.careMember.findMany({
        where: { elderlyId: targetElderlyId, status: 'ACTIVE' },
        include: { user: { select: { id: true, name: true, role: true, phone: true, avatarUrl: true } } }
      });
      caretakersList = members.map((m) => ({
        id: m.id,
        userId: m.userId,
        name: m.user?.name || 'Care Circle Member',
        role: m.role,
        relationship: m.relationship || 'Caretaker',
        phone: m.user?.phone,
        avatarUrl: m.user?.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80',
        shift: m.shiftStart && m.shiftEnd ? `${m.shiftStart} - ${m.shiftEnd}` : 'Standard Day Shift'
      }));
    } else {
      patientProfile = memoryStore.elderlyProfiles.find((e) => e.id === targetElderlyId);
      const user = patientProfile ? memoryStore.users.find((u) => u.id === patientProfile.userId) : null;
      if (user) patientName = user.name;

      caretakersList = (memoryStore.careCircleMembers || [])
        .filter((m) => m.elderlyId === targetElderlyId && m.status === 'ACTIVE')
        .map((m) => ({
          id: m.id,
          userId: m.userId,
          name: m.userName,
          role: m.circleRole,
          relationship: m.relationship,
          phone: m.userPhone,
          avatarUrl: m.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
          shift: '08:00 - 17:00'
        }));
    }

    // 3. Fetch Medication Logs within Range
    let medLogs: any[] = [];
    if (isDb) {
      medLogs = await prisma.medicationLog.findMany({
        where: {
          medication: { elderlyId: targetElderlyId },
          scheduledFor: { gte: rangeStart, lte: rangeEnd }
        },
        orderBy: { scheduledFor: 'asc' },
        include: { medication: { select: { id: true, name: true, dosage: true, category: true } } }
      });
    } else {
      const targetMeds = memoryStore.medications.filter((m) => m.elderlyId === targetElderlyId);
      const medIds = targetMeds.map((m) => m.id);
      medLogs = memoryStore.medicationLogs
        .filter(
          (l) =>
            medIds.includes(l.medicationId) &&
            new Date(l.scheduledFor).getTime() >= rangeStart.getTime() &&
            new Date(l.scheduledFor).getTime() <= rangeEnd.getTime()
        )
        .sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime())
        .map((l) => {
          const med = targetMeds.find((m) => m.id === l.medicationId);
          return {
            ...l,
            medication: med ? { id: med.id, name: med.name, dosage: med.dosage, category: med.category } : null
          };
        });
    }

    // 4. Compute Core Dashboard Cards Metrics
    const totalScheduledDoses = medLogs.length;
    // Eligible doses: scheduled time is in the past or right now
    const eligibleLogs = medLogs.filter((l) => new Date(l.scheduledFor).getTime() <= now.getTime());
    const totalEligibleDoses = eligibleLogs.length;

    const takenLogs = eligibleLogs.filter((l) => l.status === 'TAKEN');
    const skippedLogs = eligibleLogs.filter((l) => l.status === 'SKIPPED');
    const missedLogs = eligibleLogs.filter((l) => l.status === 'MISSED');
    // Clearly distinguish missing info (unconfirmed) from clinically confirmed missed medication
    const unconfirmedLogs = eligibleLogs.filter(
      (l) => l.status === 'PENDING' || (l.status as any) === 'UPCOMING'
    );
    const upcomingLogs = medLogs.filter((l) => new Date(l.scheduledFor).getTime() > now.getTime());

    const takenCount = takenLogs.length;
    const skippedCount = skippedLogs.length;
    const missedCount = missedLogs.length;
    const unconfirmedCount = unconfirmedLogs.length;
    const upcomingCount = upcomingLogs.length;
    const missedOrUnconfirmedCount = missedCount + unconfirmedCount;

    const adherenceRate = totalEligibleDoses > 0 ? Math.round((takenCount / totalEligibleDoses) * 100) : 100;

    // 5. Adherence by Period (Daily, Weekly, Monthly)
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const getPeriodAdherence = (cutoff: Date) => {
      const eligible = medLogs.filter(
        (l) =>
          new Date(l.scheduledFor).getTime() >= cutoff.getTime() &&
          new Date(l.scheduledFor).getTime() <= now.getTime()
      );
      if (eligible.length === 0) return 100;
      const taken = eligible.filter((l) => l.status === 'TAKEN').length;
      return Math.round((taken / eligible.length) * 100);
    };

    const dailyAdherence = getPeriodAdherence(todayStart);
    const weeklyAdherence = getPeriodAdherence(weekStart);
    const monthlyAdherence = getPeriodAdherence(monthStart);

    // 6. Medication Completion Trends (Daily Line Chart Points)
    // Build day-by-day continuous timeline within [rangeStart, rangeEnd]
    const daysMap = new Map<string, {
      date: string;
      label: string;
      dayOfWeek: string;
      taken: number;
      skipped: number;
      missed: number;
      unconfirmed: number;
      totalEligible: number;
      adherenceRate: number;
    }>();

    const curDay = new Date(rangeStart);
    while (curDay.getTime() <= rangeEnd.getTime()) {
      const dateKey = curDay.toISOString().split('T')[0];
      const dayLabel = curDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const dayOfWeek = curDay.toLocaleDateString('en-US', { weekday: 'short' });
      daysMap.set(dateKey, {
        date: dateKey,
        label: dayLabel,
        dayOfWeek,
        taken: 0,
        skipped: 0,
        missed: 0,
        unconfirmed: 0,
        totalEligible: 0,
        adherenceRate: 100
      });
      curDay.setDate(curDay.getDate() + 1);
    }

    medLogs.forEach((l) => {
      const dateKey = new Date(l.scheduledFor).toISOString().split('T')[0];
      const entry = daysMap.get(dateKey);
      if (entry) {
        const isEligible = new Date(l.scheduledFor).getTime() <= now.getTime();
        if (isEligible) {
          entry.totalEligible += 1;
          if (l.status === 'TAKEN') entry.taken += 1;
          else if (l.status === 'SKIPPED') entry.skipped += 1;
          else if (l.status === 'MISSED') entry.missed += 1;
          else entry.unconfirmed += 1;
        }
      }
    });

    const dailyTrendChartData = Array.from(daysMap.values()).map((day) => ({
      ...day,
      adherenceRate: day.totalEligible > 0 ? Math.round((day.taken / day.totalEligible) * 100) : 100
    }));

    // 7. Weekly Medication Bar Chart (Day of Week Breakdown: Mon-Sun)
    const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weeklyBarData = dayOrder.map((dayName) => {
      const matchingDays = dailyTrendChartData.filter((d) => d.dayOfWeek === dayName);
      const taken = matchingDays.reduce((acc, cur) => acc + cur.taken, 0);
      const skipped = matchingDays.reduce((acc, cur) => acc + cur.skipped, 0);
      const missed = matchingDays.reduce((acc, cur) => acc + cur.missed, 0);
      const unconfirmed = matchingDays.reduce((acc, cur) => acc + cur.unconfirmed, 0);
      const total = taken + skipped + missed + unconfirmed;
      return {
        day: dayName,
        taken,
        skipped,
        missed,
        unconfirmed,
        rate: total > 0 ? Math.round((taken / total) * 100) : 100
      };
    });

    // 8. Medication Status Doughnut Chart
    const statusDoughnutData = [
      { name: 'Taken as Prescribed', value: takenCount, color: '#2B8756', bgColor: '#DDF5E9' },
      { name: 'Skipped with Reason', value: skippedCount, color: '#B85820', bgColor: '#FFE9DC' },
      { name: 'Missed Dose', value: missedCount, color: '#B53364', bgColor: '#FCE4ED' },
      { name: 'Unconfirmed / Pending', value: unconfirmedCount, color: '#7969B5', bgColor: '#E9E3FF' },
      { name: 'Upcoming Scheduled', value: upcomingCount, color: '#2B6EB5', bgColor: '#DFEEFF' }
    ].filter((slice) => slice.value > 0 || totalScheduledDoses === 0);

    // 9. Appointments Overview Statistics & Upcoming Visits
    let appointments: any[] = [];
    if (isDb) {
      appointments = await prisma.appointment.findMany({
        where: { elderlyId: targetElderlyId, deletedAt: null },
        orderBy: { appointmentDate: 'asc' }
      });
    } else {
      appointments = (memoryStore.appointments || []).filter(
        (a) => a.elderlyId === targetElderlyId
      );
    }

    const upcomingAppointments = appointments
      .filter((a) => (a.status === 'UPCOMING' || a.status === 'SCHEDULED') && new Date(a.appointmentDate).getTime() >= now.getTime())
      .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime());

    const completedAppts = appointments.filter((a) => a.status === 'COMPLETED');
    const cancelledAppts = appointments.filter((a) => a.status === 'CANCELLED');
    const rescheduledAppts = appointments.filter((a) => a.status === 'RESCHEDULED');

    // Group appointments by specialty
    const specialtyMap = new Map<string, number>();
    appointments.forEach((a) => {
      const spec = a.specialty || 'General Care';
      specialtyMap.set(spec, (specialtyMap.get(spec) || 0) + 1);
    });
    const appointmentsBySpecialty = Array.from(specialtyMap.entries()).map(([specialty, count]) => ({
      specialty,
      count
    }));

    // 10. Care Activities & Monthly Activity Chart
    let careActivities: any[] = [];
    if (isDb) {
      careActivities = await prisma.careActivity.findMany({
        where: {
          elderlyId: targetElderlyId,
          deletedAt: null,
          scheduledDate: { gte: rangeStart, lte: rangeEnd }
        },
        orderBy: [{ scheduledDate: 'desc' }, { scheduledTime: 'asc' }],
        include: {
          assignedTo: { select: { id: true, name: true, role: true } },
          completedBy: { select: { id: true, name: true, role: true } }
        }
      });
    } else {
      careActivities = (memoryStore.careActivities || [])
        .filter(
          (a) =>
            a.elderlyId === targetElderlyId &&
            new Date(a.scheduledDate).getTime() >= rangeStart.getTime() &&
            new Date(a.scheduledDate).getTime() <= rangeEnd.getTime()
        )
        .map((a) => {
          const assignee = a.assignedToId ? memoryStore.users.find((u) => u.id === a.assignedToId) : null;
          return {
            ...a,
            assignedTo: assignee ? { id: assignee.id, name: assignee.name, role: assignee.role } : null
          };
        });
    }

    const totalActivities = careActivities.length;
    const completedActivities = careActivities.filter((a) => a.status === 'COMPLETED');
    const pendingActivities = careActivities.filter((a) => a.status === 'PENDING' || a.status === 'IN_PROGRESS');

    // Activity breakdown by category for monthly activity chart
    const categoryCounts: Record<string, { total: number; completed: number }> = {
      MOBILITY: { total: 0, completed: 0 },
      MEAL: { total: 0, completed: 0 },
      HYGIENE: { total: 0, completed: 0 },
      CHECKUP: { total: 0, completed: 0 },
      EXERCISE: { total: 0, completed: 0 },
      OTHER: { total: 0, completed: 0 }
    };

    careActivities.forEach((act) => {
      const cat = act.category || 'OTHER';
      if (!categoryCounts[cat]) categoryCounts[cat] = { total: 0, completed: 0 };
      categoryCounts[cat].total += 1;
      if (act.status === 'COMPLETED') categoryCounts[cat].completed += 1;
    });

    const monthlyActivityChartData = Object.entries(categoryCounts).map(([category, stats]) => ({
      category: category.replace('_', ' '),
      completed: stats.completed,
      pending: stats.total - stats.completed,
      total: stats.total,
      completionRate: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
    }));

    // 11. Caretaker Activity Summaries
    const caretakerSummaries = caretakersList.map((ct) => {
      const completedByThisCaretaker = careActivities.filter(
        (a) => a.assignedToId === ct.userId && a.status === 'COMPLETED'
      ).length;
      const pendingForThisCaretaker = careActivities.filter(
        (a) => a.assignedToId === ct.userId && a.status !== 'COMPLETED'
      ).length;
      const notesLogged = careActivities.filter(
        (a) => a.assignedToId === ct.userId && a.notes
      ).length;

      return {
        id: ct.id,
        name: ct.name,
        role: ct.role,
        relationship: ct.relationship,
        avatarUrl: ct.avatarUrl,
        shift: ct.shift,
        tasksCompleted: completedByThisCaretaker,
        tasksPending: pendingForThisCaretaker,
        observationsRecorded: notesLogged,
        activeStatus: 'ON_DUTY'
      };
    });

    // 12. Health Vitals Telemetry for Range
    let vitals: any[] = [];
    if (isDb) {
      vitals = await prisma.healthLog.findMany({
        where: {
          elderlyId: targetElderlyId,
          recordedAt: { gte: rangeStart, lte: rangeEnd }
        },
        orderBy: { recordedAt: 'desc' }
      });
    } else {
      vitals = (memoryStore.healthRecords || []).filter(
        (r) =>
          r.elderlyId === targetElderlyId &&
          new Date(r.recordedAt).getTime() >= rangeStart.getTime() &&
          new Date(r.recordedAt).getTime() <= rangeEnd.getTime()
      );
    }

    // 13. Daily Healthcare Activity Reports (Accordion Feed)
    // Group activities, vitals, and med logs by date (descending)
    const reportDateKeys = Array.from(daysMap.keys()).sort((a, b) => b.localeCompare(a));
    const dailyHealthcareReports = reportDateKeys.slice(0, 14).map((dateStr) => {
      const dayDate = new Date(dateStr);
      const formattedDate = dayDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });

      const dayMeds = medLogs.filter((l) => new Date(l.scheduledFor).toISOString().split('T')[0] === dateStr);
      const dayActs = careActivities.filter((a) => new Date(a.scheduledDate).toISOString().split('T')[0] === dateStr);
      const dayVitals = vitals.filter((v) => new Date(v.recordedAt).toISOString().split('T')[0] === dateStr);

      const dayTaken = dayMeds.filter((m) => m.status === 'TAKEN').length;
      const dayTotalMeds = dayMeds.length;
      const dayCompletedActs = dayActs.filter((a) => a.status === 'COMPLETED').length;
      const dayTotalActs = dayActs.length;

      return {
        date: dateStr,
        formattedDate,
        summary: {
          medicationsTaken: dayTaken,
          medicationsTotal: dayTotalMeds,
          activitiesCompleted: dayCompletedActs,
          activitiesTotal: dayTotalActs,
          vitalsCount: dayVitals.length
        },
        medications: dayMeds.map((m) => ({
          id: m.id,
          name: m.medication?.name || 'Medication',
          dosage: m.medication?.dosage || 'Prescribed dose',
          time: new Date(m.scheduledFor).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          status: m.status,
          skipReason: m.skipReason
        })),
        careActivities: dayActs.map((a) => ({
          id: a.id,
          title: a.title,
          category: a.category,
          time: a.scheduledTime,
          status: a.status,
          notes: a.notes,
          assignedTo: a.assignedTo?.name || 'Care Team'
        })),
        vitals: dayVitals.map((v) => ({
          id: v.id,
          recordedAt: v.recordedAt,
          systolicBp: v.systolicBp,
          diastolicBp: v.diastolicBp,
          heartRate: v.heartRate,
          bloodGlucose: v.bloodGlucose,
          oxygenSaturation: v.oxygenSaturation,
          mood: v.mood,
          painLevel: v.painLevel,
          sleepHours: v.sleepHours,
          isAlert: v.isAlert,
          notes: v.notes
        }))
      };
    });

    return {
      elderlyId: targetElderlyId,
      patientName,
      period,
      range: {
        startDate: (period === 'custom' && options.startDate) ? options.startDate : rangeStart.toISOString().split('T')[0],
        endDate: (period === 'custom' && options.endDate) ? options.endDate : rangeEnd.toISOString().split('T')[0]
      },
      // 6 Dashboard Cards KPIs
      cards: {
        totalScheduledDoses,
        eligibleDoses: totalEligibleDoses,
        takenCount,
        skippedCount,
        missedCount,
        unconfirmedCount,
        missedOrUnconfirmedCount,
        upcomingAppointmentsCount: upcomingAppointments.length,
        activeCaretakersCount: caretakersList.length,
        adherenceRate
      },
      // Adherence Periods
      adherence: {
        overall: adherenceRate,
        daily: dailyAdherence,
        weekly: weeklyAdherence,
        monthly: monthlyAdherence
      },
      // Charts
      charts: {
        adherenceLineTrend: dailyTrendChartData,
        weeklyDayBreakdown: weeklyBarData,
        medicationStatusDonut: statusDoughnutData,
        monthlyActivityBar: monthlyActivityChartData,
        appointmentOverview: {
          upcomingCount: upcomingAppointments.length,
          completedCount: completedAppts.length,
          cancelledCount: cancelledAppts.length,
          rescheduledCount: rescheduledAppts.length,
          bySpecialty: appointmentsBySpecialty,
          nextAppointment: upcomingAppointments[0] || null
        }
      },
      caretakerSummaries,
      dailyHealthcareReports,
      disclaimer:
        'CareNest adherence analytics represent recorded intake entries and observation timestamps. This metric reflects adherence tracking and is not an autonomous clinical diagnosis or medical evaluation. Please consult a licensed physician for clinical decisions.'
    };
  },

  // 2. Generate Printable Healthcare Activity Summary Export Document
  generatePrintableReport: async (options: AnalyticsQueryOptions) => {
    const overview = await analyticsService.getOverview(options);

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>CareNest Healthcare Activity Summary — ${overview.patientName}</title>
  <style>
    @page { size: A4; margin: 20mm; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #34354A;
      background: #FFFFFF;
      line-height: 1.5;
      padding: 0;
      margin: 0;
    }
    .header {
      border-bottom: 2px solid #E9E3FF;
      padding-bottom: 16px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .brand {
      font-size: 24px;
      font-weight: 800;
      color: #554391;
      letter-spacing: -0.5px;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      background: #DDF5E9;
      color: #1F6A42;
    }
    .card-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 24px;
    }
    .card {
      background: #FAF9FF;
      border: 1px solid #E9E3FF;
      border-radius: 12px;
      padding: 12px 16px;
    }
    .card-title {
      font-size: 11px;
      color: #7A7D9D;
      text-transform: uppercase;
      font-weight: 700;
    }
    .card-value {
      font-size: 22px;
      font-weight: 800;
      color: #34354A;
      margin-top: 4px;
    }
    .section-title {
      font-size: 14px;
      font-weight: 700;
      color: #554391;
      border-bottom: 1px solid #FAF9FF;
      padding-bottom: 6px;
      margin-top: 24px;
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
      font-size: 12px;
    }
    th, td {
      border: 1px solid #E5E4F2;
      padding: 8px 10px;
      text-align: left;
    }
    th {
      background: #FAF9FF;
      color: #575973;
      font-weight: 700;
    }
    .status-pill {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 8px;
      font-size: 10px;
      font-weight: 700;
    }
    .status-taken { background: #DDF5E9; color: #1F6A42; }
    .status-skipped { background: #FFE9DC; color: #8E3F10; }
    .status-missed { background: #FCE4ED; color: #8F1E48; }
    .status-unconfirmed { background: #E9E3FF; color: #554391; }
    .disclaimer {
      margin-top: 32px;
      padding: 12px 16px;
      background: #FFF9ED;
      border: 1px solid #FFE9DC;
      border-radius: 8px;
      font-size: 11px;
      color: #8E3F10;
    }
    .signoff {
      margin-top: 40px;
      display: flex;
      justify-content: space-between;
      border-top: 1px dashed #A4A7C5;
      padding-top: 16px;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">CareNest Healthcare Platform</div>
      <div style="font-size: 12px; color: #7A7D9D;">Confidential Clinical Adherence & Care Activity Ledger</div>
    </div>
    <div style="text-align: right;">
      <span class="badge">Official Clinical Summary</span>
      <div style="font-size: 11px; color: #7A7D9D; margin-top: 4px;">Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
    </div>
  </div>

  <div style="margin-bottom: 20px; font-size: 13px;">
    <strong>Patient Name:</strong> ${overview.patientName} &nbsp;|&nbsp;
    <strong>Report Period:</strong> ${overview.range.startDate} to ${overview.range.endDate} (${overview.period.replace('_', ' ')}) &nbsp;|&nbsp;
    <strong>Profile ID:</strong> ${overview.elderlyId}
  </div>

  <div class="card-grid">
    <div class="card">
      <div class="card-title">Medication Adherence</div>
      <div class="card-value" style="color: ${overview.cards.adherenceRate >= 80 ? '#2B8756' : '#B85820'};">
        ${overview.cards.adherenceRate}%
      </div>
      <div style="font-size: 10px; color: #7A7D9D;">${overview.cards.takenCount} taken / ${overview.cards.eligibleDoses} eligible</div>
    </div>
    <div class="card">
      <div class="card-title">Recorded Taken Doses</div>
      <div class="card-value" style="color: #2B8756;">${overview.cards.takenCount}</div>
      <div style="font-size: 10px; color: #7A7D9D;">Of ${overview.cards.totalScheduledDoses} total scheduled doses</div>
    </div>
    <div class="card">
      <div class="card-title">Skipped / Missed Doses</div>
      <div class="card-value" style="color: #B53364;">${overview.cards.skippedCount} / ${overview.cards.missedCount}</div>
      <div style="font-size: 10px; color: #7A7D9D;">Unconfirmed awaiting entry: ${overview.cards.unconfirmedCount}</div>
    </div>
    <div class="card">
      <div class="card-title">Adherence (Daily / Weekly / Mo)</div>
      <div class="card-value" style="font-size: 18px; color: #554391;">
        ${overview.adherence.daily}% / ${overview.adherence.weekly}% / ${overview.adherence.monthly}%
      </div>
      <div style="font-size: 10px; color: #7A7D9D;">Rolling window averages</div>
    </div>
    <div class="card">
      <div class="card-title">Upcoming Appointments</div>
      <div class="card-value" style="color: #2B6EB5;">${overview.cards.upcomingAppointmentsCount}</div>
      <div style="font-size: 10px; color: #7A7D9D;">Scheduled consultations</div>
    </div>
    <div class="card">
      <div class="card-title">Active Care Circle Members</div>
      <div class="card-value" style="color: #7969B5;">${overview.cards.activeCaretakersCount}</div>
      <div style="font-size: 10px; color: #7A7D9D;">Authorized caregivers & family</div>
    </div>
  </div>

  <div class="section-title">Day-by-Day Care Activity & Intake Audit</div>
  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Doses Scheduled</th>
        <th>Taken</th>
        <th>Skipped</th>
        <th>Missed / Unconfirmed</th>
        <th>Daily Adherence</th>
      </tr>
    </thead>
    <tbody>
      ${overview.charts.adherenceLineTrend.slice(-14).map((d: any) => `
        <tr>
          <td><strong>${d.label}</strong> (${d.dayOfWeek})</td>
          <td>${d.totalEligible}</td>
          <td><span class="status-pill status-taken">${d.taken}</span></td>
          <td>${d.skipped > 0 ? `<span class="status-pill status-skipped">${d.skipped}</span>` : '0'}</td>
          <td>${d.missed + d.unconfirmed > 0 ? `<span class="status-pill status-missed">${d.missed} Missed / ${d.unconfirmed} Unconfirmed</span>` : '0'}</td>
          <td><strong>${d.adherenceRate}%</strong></td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="section-title">Care Circle Caretakers Shift Activity</div>
  <table>
    <thead>
      <tr>
        <th>Caretaker Name</th>
        <th>Role</th>
        <th>Shift Hours</th>
        <th>Tasks Completed</th>
        <th>Tasks Pending</th>
        <th>Observations Logged</th>
      </tr>
    </thead>
    <tbody>
      ${overview.caretakerSummaries.map((c: any) => `
        <tr>
          <td><strong>${c.name}</strong></td>
          <td>${c.relationship}</td>
          <td>${c.shift}</td>
          <td>${c.tasksCompleted}</td>
          <td>${c.tasksPending}</td>
          <td>${c.observationsRecorded}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="disclaimer">
    <strong>Clinical & Medical Disclaimer:</strong> ${overview.disclaimer}
  </div>

  <div class="signoff">
    <div>
      <div>______________________________________</div>
      <div style="margin-top: 4px; color: #7A7D9D;">Primary Attending Physician / Care Lead</div>
    </div>
    <div>
      <div>______________________________________</div>
      <div style="margin-top: 4px; color: #7A7D9D;">Family Administrator / Patient Signature</div>
    </div>
  </div>
</body>
</html>
    `;

    return {
      fileName: `carenest-report-${overview.patientName.toLowerCase().replace(/\s+/g, '-')}-${overview.range.startDate}.html`,
      htmlContent,
      overview
    };
  }
};
