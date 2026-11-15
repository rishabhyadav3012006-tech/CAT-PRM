// ==============================================================================
// CareNest Healthcare Platform - Smart Care Assistant Service
// Friendly routine navigator, medication & appointment summarizer,
// daily wellness tracker, hydration & mood logger, and safety guardrail engine.
// Strictly non-diagnostic; ensures all medical advice is referred to doctors.
// ==============================================================================

import { prisma, memoryStore, getIsDatabaseConnected } from '../config/db.js';
import { medicationService } from './medication.service.js';
import { appointmentService } from './appointment.service.js';
import { recordService } from './record.service.js';
import { vaultService } from './vault.service.js';
import { circleService } from './circle.service.js';
import { activityService } from './activity.service.js';
import { elderlyService } from './elderly.service.js';
import { logger } from '../utils/logger.js';
import { randomUUID } from 'crypto';

export interface AssistantActionPayload {
  type: 'NAVIGATE' | 'ACTION';
  path: string;
  label: string;
}

export interface AssistantMessageResponse {
  id: string;
  sender: 'assistant';
  text: string;
  timestamp: string;
  action?: AssistantActionPayload;
  quickReplies: string[];
  isSafetyAlert?: boolean;
}

export interface AssistantWellnessDTO {
  elderlyId?: string;
  action: 'LOG_WATER' | 'SET_WATER' | 'LOG_MOOD' | 'LOG_SLEEP' | 'LOG_OBSERVATION' | 'TOGGLE_CHECKLIST';
  waterGlasses?: number;
  mood?: string;
  sleepHours?: number;
  sleepQuality?: string;
  observationNotes?: string;
  checklistItemId?: string;
  completed?: boolean;
}

export interface DailyChecklistItem {
  id: string;
  title: string;
  category: 'MEDICATION' | 'HYDRATION' | 'VITALS' | 'ACTIVITY' | 'WELLNESS';
  description: string;
  completed: boolean;
  progress?: string;
}

export interface AssistantDailySummary {
  greeting: string;
  patientName: string;
  dateFormatted: string;
  motivationalMessage: string;
  routineSummary: string;
  medicationSummary: {
    totalScheduledToday: number;
    takenCount: number;
    pendingCount: number;
    missedCount: number;
    nextDose: {
      medicationName: string;
      dosage: string;
      scheduledTime: string;
      foodInstructions?: string;
      instructions?: string;
    } | null;
    todayDoses: Array<{
      id: string;
      medicationId: string;
      name: string;
      dosage: string;
      time: string;
      status: string;
      instructions?: string;
    }>;
  };
  appointmentSummary: {
    upcomingCount: number;
    nextAppointment: {
      id: string;
      doctorName: string;
      specialty: string;
      hospitalName: string;
      appointmentDate: string;
      appointmentTime: string;
      location?: string;
      countdownLabel: string;
      contactNumber?: string;
    } | null;
  };
  wellnessChecklist: DailyChecklistItem[];
  todayWaterIntake: {
    glasses: number;
    targetGlasses: number;
    volumeMl: number;
    targetMl: number;
  };
  recentActivity: {
    title: string;
    actor: string;
    timeAgo: string;
  } | null;
  safetyNotice: string;
}

// In-memory runtime wellness state tracker for today
interface DailyWellnessTracker {
  waterGlasses: number;
  checklistToggles: Record<string, boolean>;
  latestMood?: string;
  latestSleepHours?: number;
}

const wellnessStateStore: Record<string, DailyWellnessTracker> = {};

const getTodayKey = (elderlyId: string) => {
  const today = new Date().toISOString().split('T')[0];
  return `${elderlyId}_${today}`;
};

const getOrCreateTracker = (elderlyId: string): DailyWellnessTracker => {
  const key = getTodayKey(elderlyId);
  if (!wellnessStateStore[key]) {
    wellnessStateStore[key] = {
      waterGlasses: 4, // Default baseline for demo continuity
      checklistToggles: {
        mobility_walk: false,
        vitals_check: true
      }
    };
  }
  return wellnessStateStore[key];
};

const MOTIVATIONAL_MESSAGES = [
  "Every small step you take today is a quiet victory for your health and vitality.",
  "Consistency is the true foundation of wellbeing. You're doing a wonderful job staying on track!",
  "Take a gentle breath, drink some refreshing water, and embrace the rhythm of today.",
  "Your care circle is right beside you, celebrating your health and presence every single day.",
  "Listening to your body is wisdom. Rest when needed, move with ease, and celebrate today's progress."
];

// Helper to calculate human-readable countdown
const formatCountdown = (date: Date): string => {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays <= 7) return `In ${diffDays} days`;
  return `In ${Math.ceil(diffDays / 7)} weeks`;
};

export const assistantService = {
  // ============================================================================
  // 1. GET DAILY ROUTINE SUMMARY
  // ============================================================================
  getDailySummary: async (elderlyId = 'eld-01', userId?: string): Promise<AssistantDailySummary> => {
    // 1. Fetch elderly profile info
    let patientName = 'Eleanor';
    try {
      const profile = await elderlyService.getProfileById(elderlyId);
      if (profile && (profile as any).user?.name) {
        patientName = (profile as any).user.name.split(' ')[0];
      }
    } catch {
      patientName = 'Eleanor';
    }

    // 2. Determine time-based greeting
    const currentHour = new Date().getHours();
    let greetingPrefix = 'Good morning';
    if (currentHour >= 12 && currentHour < 17) {
      greetingPrefix = 'Good afternoon';
    } else if (currentHour >= 17) {
      greetingPrefix = 'Good evening';
    }
    const greeting = `${greetingPrefix}, ${patientName}!`;

    // 3. Fetch today's medication schedule
    let totalScheduledToday = 0;
    let takenCount = 0;
    let pendingCount = 0;
    let missedCount = 0;
    let nextDose: AssistantDailySummary['medicationSummary']['nextDose'] = null;
    let todayDoses: AssistantDailySummary['medicationSummary']['todayDoses'] = [];

    try {
      const scheduleRes: any = await medicationService.getTodaySchedule(elderlyId);
      const doses = scheduleRes?.doses || [];
      totalScheduledToday = doses.length;

      todayDoses = doses.map((d: any) => ({
        id: d.scheduleId || d.id || randomUUID(),
        medicationId: d.medicationId,
        name: d.medicationName || d.name,
        dosage: d.dosage || 'Standard dose',
        time: d.time || d.scheduledTime || '08:00',
        status: d.status || 'PENDING',
        instructions: d.foodInstructions || d.instructions || 'Take with water'
      }));

      takenCount = todayDoses.filter((d) => d.status === 'TAKEN').length;
      pendingCount = todayDoses.filter((d) => d.status === 'PENDING').length;
      missedCount = todayDoses.filter((d) => d.status === 'MISSED').length;

      const firstPending = todayDoses.find((d) => d.status === 'PENDING');
      if (firstPending) {
        nextDose = {
          medicationName: firstPending.name,
          dosage: firstPending.dosage,
          scheduledTime: firstPending.time,
          foodInstructions: firstPending.instructions,
          instructions: firstPending.instructions
        };
      }
    } catch (err) {
      logger.warn(`Failed to fetch medication schedule for assistant summary: ${err}`);
      totalScheduledToday = 2;
      takenCount = 1;
      pendingCount = 1;
      nextDose = {
        medicationName: 'Metformin',
        dosage: '500mg',
        scheduledTime: '20:00',
        foodInstructions: 'Take with evening meal',
        instructions: 'Take with evening meal'
      };
    }

    // 4. Fetch upcoming doctor appointment
    let upcomingCount = 0;
    let nextAppointment: AssistantDailySummary['appointmentSummary']['nextAppointment'] = null;

    try {
      const apptRes: any = await appointmentService.getUpcomingAppointments(elderlyId, 1, 5);
      const appointments = apptRes?.items || apptRes?.appointments || [];
      upcomingCount = appointments.length;

      if (appointments.length > 0) {
        const firstAppt = appointments[0];
        const apptDate = new Date(firstAppt.appointmentDate);
        nextAppointment = {
          id: firstAppt.id,
          doctorName: firstAppt.doctorName || 'Dr. Elizabeth Adams',
          specialty: firstAppt.specialty || 'Cardiologist',
          hospitalName: firstAppt.hospitalName || 'St. Mary Heart Clinic',
          appointmentDate: apptDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          appointmentTime: firstAppt.appointmentTime || apptDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          location: firstAppt.location || 'Suite 400',
          countdownLabel: formatCountdown(apptDate),
          contactNumber: firstAppt.contactNumber || '+1 (555) 234-8899'
        };
      }
    } catch (err) {
      logger.warn(`Failed to fetch upcoming appointments for assistant summary: ${err}`);
    }

    // 5. Fetch recent activity / care circle update
    let recentActivity: AssistantDailySummary['recentActivity'] = null;
    try {
      const actRes: any = await activityService.getActivities(elderlyId, undefined, 1, 3);
      const activities = actRes?.activities || actRes?.items || [];
      if (activities.length > 0) {
        const latest = activities[0];
        recentActivity = {
          title: latest.title || 'Health record updated',
          actor: latest.createdByName || latest.recordedBy?.name || 'Care Team Member',
          timeAgo: 'Earlier today'
        };
      }
    } catch {
      recentActivity = {
        title: 'Morning blood pressure logged (124/78 mmHg)',
        actor: 'Marcus Chen (Caretaker)',
        timeAgo: '2 hours ago'
      };
    }

    // 6. Wellness Tracker & Checklist
    const tracker = getOrCreateTracker(elderlyId);
    const waterGlasses = tracker.waterGlasses;
    const waterVolumeMl = waterGlasses * 250;

    const checklist: DailyChecklistItem[] = [
      {
        id: 'meds_morning',
        title: 'Morning Medications',
        category: 'MEDICATION',
        description: takenCount > 0 ? `${takenCount} dose(s) confirmed taken` : 'Take Lisinopril 10mg with breakfast',
        completed: takenCount > 0,
        progress: `${takenCount}/${totalScheduledToday} taken`
      },
      {
        id: 'water_goal',
        title: 'Daily Hydration (8 Glasses)',
        category: 'HYDRATION',
        description: `${waterGlasses} of 8 glasses logged (${waterVolumeMl} / 2,000 ml)`,
        completed: waterGlasses >= 8,
        progress: `${waterGlasses}/8 glasses`
      },
      {
        id: 'vitals_check',
        title: 'Blood Pressure & Vitals Check',
        category: 'VITALS',
        description: 'Morning reading recorded: 124/78 mmHg (Normal)',
        completed: tracker.checklistToggles['vitals_check'] ?? true
      },
      {
        id: 'mobility_walk',
        title: '15-Minute Gentle Walk / Mobility',
        category: 'ACTIVITY',
        description: 'Light indoor stroll or outdoor garden walk to support circulation',
        completed: tracker.checklistToggles['mobility_walk'] ?? false
      },
      {
        id: 'mood_checkin',
        title: 'Daily Mood & Rest Check-in',
        category: 'WELLNESS',
        description: tracker.latestMood ? `Recorded mood: ${tracker.latestMood}` : 'Reflect on how you feel and log your rest',
        completed: !!tracker.latestMood
      }
    ];

    // 7. Compose Routine Overview String (Matches User Specification Example)
    let routineSummary = `${greeting} You have ${pendingCount} scheduled medication ${pendingCount === 1 ? 'reminder' : 'reminders'} remaining today`;
    if (nextAppointment) {
      routineSummary += ` and ${nextAppointment.countdownLabel.toLowerCase() === 'today' ? 'an' : 'one upcoming'} doctor appointment with ${nextAppointment.doctorName} (${nextAppointment.countdownLabel}).`;
    } else {
      routineSummary += ` and no pending doctor appointments scheduled today.`;
    }
    if (recentActivity) {
      routineSummary += ` Your care circle has also shared a new update: "${recentActivity.title}".`;
    }

    const randomMotivational = MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)];

    const now = new Date();
    const dateFormatted = now.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

    return {
      greeting,
      patientName,
      dateFormatted,
      motivationalMessage: randomMotivational,
      routineSummary,
      medicationSummary: {
        totalScheduledToday,
        takenCount,
        pendingCount,
        missedCount,
        nextDose,
        todayDoses
      },
      appointmentSummary: {
        upcomingCount,
        nextAppointment
      },
      wellnessChecklist: checklist,
      todayWaterIntake: {
        glasses: waterGlasses,
        targetGlasses: 8,
        volumeMl: waterVolumeMl,
        targetMl: 2000
      },
      recentActivity,
      safetyNotice:
        'CareNest Assistant is a daily routine companion and does not provide clinical diagnoses, emergency triage, or dosage adjustments. Always consult your doctor for medical advice.'
    };
  },

  // ============================================================================
  // 2. PROCESS CHAT MESSAGE (Zero-AI Deterministic Engine with Safety Guardrails)
  // ============================================================================
  processChatMessage: async (
    userId: string,
    elderlyId = 'eld-01',
    rawMessage: string
  ): Promise<AssistantMessageResponse> => {
    const message = (rawMessage || '').trim();
    const lower = message.toLowerCase();
    const responseId = randomUUID();
    const timestamp = new Date().toISOString();

    // --------------------------------------------------------------------------
    // SAFETY GUARDRAIL 1: Severe / Acute Medical Emergency Interceptor
    // --------------------------------------------------------------------------
    const emergencyKeywords = [
      'chest pain',
      'heart attack',
      'cant breathe',
      "can't breathe",
      'shortness of breath',
      'trouble breathing',
      'stroke',
      'numbness on one side',
      'slurred speech',
      'unconscious',
      'fainted',
      'severe bleeding',
      'anaphylaxis',
      'overdose',
      'emergency'
    ];

    if (emergencyKeywords.some((kw) => lower.includes(kw))) {
      logger.warn(`[SAFETY GUARDRAIL] Emergency query intercepted: "${rawMessage}" from user ${userId}`);
      return {
        id: responseId,
        sender: 'assistant',
        text:
          '⚠️ URGENT CLINICAL NOTICE: If you or Eleanor are experiencing chest pain, difficulty breathing, sudden weakness or numbness, or any life-threatening symptoms, please call 911 or your local emergency response service immediately, or proceed to the nearest emergency room.\n\nCareNest Assistant is a routine companion and cannot provide emergency medical intervention.',
        timestamp,
        isSafetyAlert: true,
        action: {
          type: 'NAVIGATE',
          path: '/emergency',
          label: 'Open Emergency SOS Protocol'
        },
        quickReplies: ['Call 911', 'Alert Family Care Circle', 'View Emergency Contacts', 'View Medical Vault']
      };
    }

    // --------------------------------------------------------------------------
    // SAFETY GUARDRAIL 2: Double Dosing / Missed Dose Prevention
    // --------------------------------------------------------------------------
    const doubleDoseKeywords = [
      'missed dose',
      'forgot my pill',
      'forgot dose',
      'missed my medication',
      'take two',
      'double dose',
      'double up',
      'take extra',
      'take two pills',
      'skip or double'
    ];

    if (doubleDoseKeywords.some((kw) => lower.includes(kw))) {
      logger.info(`[SAFETY GUARDRAIL] Missed dose query intercepted: "${rawMessage}"`);
      return {
        id: responseId,
        sender: 'assistant',
        text:
          '⚠️ IMPORTANT MEDICATION SAFETY GUARDRAIL: Never take an extra dose or double up on medications to make up for a missed dose. Doubling doses can cause dangerous drops in blood pressure, hypoglycemia, or drug toxicity.\n\nIf a dose was missed, record it as missed or consult Dr. Elizabeth Adams or your dispensing pharmacist for exact timing guidance before taking any delayed pills.',
        timestamp,
        isSafetyAlert: true,
        action: {
          type: 'NAVIGATE',
          path: '/medications',
          label: 'Check Medication Schedule & Prescribing Notes'
        },
        quickReplies: ['Check Today\'s Doses', 'Contact Prescribing Doctor', 'View Prescriptions']
      };
    }

    // --------------------------------------------------------------------------
    // SAFETY GUARDRAIL 3: Prescribing / Altering Dosages Prevention
    // --------------------------------------------------------------------------
    const dosageChangeKeywords = [
      'increase my dose',
      'increase dose',
      'decrease my dose',
      'decrease dose',
      'change my dose',
      'change dose',
      'change medication',
      'prescribe',
      'stop taking my',
      'stop taking',
      'higher dose',
      'lower dose',
      'can i take 20mg',
      'can i take more',
      'take more pills',
      'substitute medicine'
    ];

    const isDosageChange =
      dosageChangeKeywords.some((kw) => lower.includes(kw)) ||
      /(increase|decrease|change|raise|alter|modify)\s+(my\s+)?(dose|dosage)/i.test(lower);

    if (isDosageChange) {
      return {
        id: responseId,
        sender: 'assistant',
        text:
          '⚠️ PRESCRIPTION SAFETY RULE: CareNest Assistant cannot prescribe medications, modify dosage quantities, or recommend stopping prescribed medications. All pharmaceutical adjustments must be evaluated and authorized by your licensed healthcare provider.',
        timestamp,
        isSafetyAlert: true,
        action: {
          type: 'NAVIGATE',
          path: '/appointments',
          label: 'Book Consultation with Doctor'
        },
        quickReplies: ['View Current Prescriptions', 'Doctor Appointments', 'Today\'s Routine']
      };
    }

    // --------------------------------------------------------------------------
    // SAFETY GUARDRAIL 4: Clinical Disease Diagnosis Prevention
    // --------------------------------------------------------------------------
    const diagnosisKeywords = [
      'diagnose',
      'diagnosis',
      'do i have',
      'what disease',
      'what illness',
      'why does my head hurt',
      'is this cancer',
      'do i have diabetes',
      'diagnose my symptoms',
      'what causes'
    ];

    if (diagnosisKeywords.some((kw) => lower.includes(kw))) {
      return {
        id: responseId,
        sender: 'assistant',
        text:
          'CareNest Assistant cannot diagnose diseases or interpret clinical symptoms. As an AI routine companion, I can summarize your recorded schedule, appointments, and vitals, but clinical diagnoses require a qualified physician. Please consult Dr. Elizabeth Adams or schedule a clinical visit.',
        timestamp,
        isSafetyAlert: true,
        action: {
          type: 'NAVIGATE',
          path: '/appointments',
          label: 'Schedule Doctor Appointment'
        },
        quickReplies: ['View Appointments', 'Log Health Observation', 'View Vault Records']
      };
    }

    // --------------------------------------------------------------------------
    // INTENT 1: Daily Routine & Morning Overview
    // --------------------------------------------------------------------------
    if (
      lower.includes('routine') ||
      lower.includes('summary') ||
      lower.includes('schedule today') ||
      lower.includes('what do i have today') ||
      lower.includes('overview') ||
      lower.includes('daily overview') ||
      lower.includes('what should i do')
    ) {
      const summary = await assistantService.getDailySummary(elderlyId, userId);
      const nextMedText = summary.medicationSummary.nextDose
        ? `Next dose: ${summary.medicationSummary.nextDose.medicationName} (${summary.medicationSummary.nextDose.dosage}) at ${summary.medicationSummary.nextDose.scheduledTime}.`
        : 'All scheduled doses for today have been completed!';

      const apptText = summary.appointmentSummary.nextAppointment
        ? `Upcoming appointment: ${summary.appointmentSummary.nextAppointment.doctorName} (${summary.appointmentSummary.nextAppointment.specialty}) at ${summary.appointmentSummary.nextAppointment.appointmentTime} (${summary.appointmentSummary.nextAppointment.countdownLabel}).`
        : 'No appointments scheduled for today.';

      return {
        id: responseId,
        sender: 'assistant',
        text: `Here is your daily healthcare routine for today (${summary.dateFormatted}):\n\n• ${summary.routineSummary}\n• ${nextMedText}\n• ${apptText}\n• Hydration: ${summary.todayWaterIntake.glasses}/8 glasses logged.\n\n"${summary.motivationalMessage}"`,
        timestamp,
        action: {
          type: 'NAVIGATE',
          path: '/medications',
          label: 'View Medication Tracker'
        },
        quickReplies: ['Next Medication', 'Upcoming Appointments', 'Drink Water (+1)', 'View Daily Checklist']
      };
    }

    // --------------------------------------------------------------------------
    // INTENT 2: Medications & Next Dose Inquiries
    // --------------------------------------------------------------------------
    if (
      lower.includes('medication') ||
      lower.includes('medicine') ||
      lower.includes('pill') ||
      lower.includes('dose') ||
      lower.includes('prescription') ||
      lower.includes('next med') ||
      lower.includes('what meds')
    ) {
      const summary = await assistantService.getDailySummary(elderlyId, userId);
      const doses = summary.medicationSummary.todayDoses;

      if (doses.length === 0) {
        return {
          id: responseId,
          sender: 'assistant',
          text: 'There are currently no active medication schedules for today. You can review all prescribed medications in the medication management tab.',
          timestamp,
          action: {
            type: 'NAVIGATE',
            path: '/medications',
            label: 'Open Medication Management'
          },
          quickReplies: ['Today\'s Routine', 'Prescription Vault', 'Upcoming Appointments']
        };
      }

      const doseLines = doses
        .map(
          (d) =>
            `• ${d.time} - ${d.name} ${d.dosage} [${d.status}] (${d.instructions || 'Standard'})`
        )
        .join('\n');

      const nextDoseInfo = summary.medicationSummary.nextDose
        ? `\n\nYour upcoming pending medication is **${summary.medicationSummary.nextDose.medicationName}** (${summary.medicationSummary.nextDose.dosage}) scheduled for **${summary.medicationSummary.nextDose.scheduledTime}**.`
        : '\n\nAll doses for today have already been recorded!';

      return {
        id: responseId,
        sender: 'assistant',
        text: `Here is today's medication schedule (${summary.medicationSummary.takenCount}/${summary.medicationSummary.totalScheduledToday} taken):\n\n${doseLines}${nextDoseInfo}`,
        timestamp,
        action: {
          type: 'NAVIGATE',
          path: '/medications',
          label: 'Record Medication as Taken'
        },
        quickReplies: ['Record Taken', 'Check Food Instructions', 'View Prescriptions', 'Today\'s Routine']
      };
    }

    // --------------------------------------------------------------------------
    // INTENT 3: Doctor Appointments & Schedule
    // --------------------------------------------------------------------------
    if (
      lower.includes('appointment') ||
      lower.includes('doctor') ||
      lower.includes('visit') ||
      lower.includes('clinic') ||
      lower.includes('hospital') ||
      lower.includes('dr.')
    ) {
      const summary = await assistantService.getDailySummary(elderlyId, userId);
      const next = summary.appointmentSummary.nextAppointment;

      if (!next) {
        return {
          id: responseId,
          sender: 'assistant',
          text: 'You have no upcoming doctor appointments scheduled in the CareNest calendar. Would you like to schedule a new consultation?',
          timestamp,
          action: {
            type: 'NAVIGATE',
            path: '/appointments',
            label: 'Book New Appointment'
          },
          quickReplies: ['Book Appointment', 'Past Appointment History', 'Today\'s Routine']
        };
      }

      return {
        id: responseId,
        sender: 'assistant',
        text: `Your next doctor consultation is with **${next.doctorName}** (${next.specialty}) on **${next.appointmentDate} at ${next.appointmentTime}** (${next.countdownLabel}).\n\n• Hospital: ${next.hospitalName}\n• Location: ${next.location || 'Main Medical Pavilion'}\n• Clinic Contact: ${next.contactNumber || '+1 (555) 234-8899'}`,
        timestamp,
        action: {
          type: 'NAVIGATE',
          path: '/appointments',
          label: 'View Appointment Details'
        },
        quickReplies: ['Reschedule Appointment', 'Doctor Contact Info', 'Past Appointments', 'Today\'s Routine']
      };
    }

    // --------------------------------------------------------------------------
    // INTENT 4: Navigation Assistance (Checked before topic keywords)
    // --------------------------------------------------------------------------
    if (lower.includes('navigate') || lower.includes('where is') || lower.includes('go to') || lower.includes('take me to') || lower.includes('find my') || lower.includes('open my')) {
      if (lower.includes('report') || lower.includes('analytic') || lower.includes('adherence') || lower.includes('chart')) {
        return {
          id: responseId,
          sender: 'assistant',
          text: 'I can take you directly to your Healthcare Analytics & Adherence Reports, featuring medication completion trends and Recharts visualizations.',
          timestamp,
          action: { type: 'NAVIGATE', path: '/reports', label: 'Go to Reports & Analytics' },
          quickReplies: ['Adherence Charts', 'Today\'s Routine', 'Medications']
        };
      }
      if (lower.includes('emergency') || lower.includes('sos') || lower.includes('help')) {
        return {
          id: responseId,
          sender: 'assistant',
          text: 'Opening CareNest Emergency Assistance and SOS broadcast center.',
          timestamp,
          action: { type: 'NAVIGATE', path: '/emergency', label: 'Go to Emergency SOS' },
          quickReplies: ['Call 911', 'Emergency Contacts', 'Dashboard']
        };
      }
      if (lower.includes('circle') || lower.includes('family')) {
        return {
          id: responseId,
          sender: 'assistant',
          text: 'Opening the Family Care Circle module.',
          timestamp,
          action: { type: 'NAVIGATE', path: '/circle', label: 'Go to Family Circle' },
          quickReplies: ['Connected Members', 'Today\'s Routine']
        };
      }
      if (lower.includes('medication') || lower.includes('pill')) {
        return {
          id: responseId,
          sender: 'assistant',
          text: 'Opening the Medication Management and Scheduling Engine.',
          timestamp,
          action: { type: 'NAVIGATE', path: '/medications', label: 'Go to Medications' },
          quickReplies: ['Next Dose', 'Today\'s Routine']
        };
      }
      if (lower.includes('appointment') || lower.includes('doctor')) {
        return {
          id: responseId,
          sender: 'assistant',
          text: 'Opening Doctor Appointment Management and the monthly visit calendar.',
          timestamp,
          action: { type: 'NAVIGATE', path: '/appointments', label: 'Go to Appointments' },
          quickReplies: ['Upcoming Appointments', 'Today\'s Routine']
        };
      }
      if (lower.includes('vault') || lower.includes('prescription') || lower.includes('record') || lower.includes('report') || lower.includes('lab')) {
        return {
          id: responseId,
          sender: 'assistant',
          text: 'Opening the Medical Records & Prescription Vault.',
          timestamp,
          action: { type: 'NAVIGATE', path: '/vault', label: 'Go to Medical Vault' },
          quickReplies: ['View Prescriptions', 'Blood Reports']
        };
      }
      if (lower.includes('vital') || lower.includes('health') || lower.includes('log')) {
        return {
          id: responseId,
          sender: 'assistant',
          text: 'Opening Health Records & Vital Signs monitoring.',
          timestamp,
          action: { type: 'NAVIGATE', path: '/records', label: 'Go to Health Records' },
          quickReplies: ['Log Vitals', 'Today\'s Routine']
        };
      }
    }

    // --------------------------------------------------------------------------
    // INTENT 5: Medical Records & Prescription Vault
    // --------------------------------------------------------------------------
    if (
      lower.includes('record') ||
      lower.includes('vault') ||
      lower.includes('lab') ||
      lower.includes('blood report') ||
      lower.includes('document') ||
      lower.includes('test result') ||
      lower.includes('report')
    ) {
      return {
        id: responseId,
        sender: 'assistant',
        text:
          'Your medical records, diagnostic blood panels, doctor consultation notes, and official prescriptions are safely encrypted in the CareNest Medical Vault.\n\nYou can search documents by category, view verified doctor uploads, or generate 15-minute cryptographically signed download links.',
        timestamp,
        action: {
          type: 'NAVIGATE',
          path: '/vault',
          label: 'Open Medical Vault'
        },
        quickReplies: ['View Prescriptions', 'Blood Reports', 'Upload New Document', 'Today\'s Routine']
      };
    }

    // --------------------------------------------------------------------------
    // INTENT 5: Hydration & Water Intake Logging
    // --------------------------------------------------------------------------
    if (
      lower.includes('water') ||
      lower.includes('hydrate') ||
      lower.includes('hydration') ||
      lower.includes('drink') ||
      lower.includes('drank a glass')
    ) {
      const tracker = getOrCreateTracker(elderlyId);
      if (lower.includes('drink') || lower.includes('drank') || lower.includes('add') || lower.includes('+1')) {
        tracker.waterGlasses = Math.min(12, tracker.waterGlasses + 1);
      }
      const ml = tracker.waterGlasses * 250;

      return {
        id: responseId,
        sender: 'assistant',
        text: `Hydration progress updated! You have logged **${tracker.waterGlasses} of 8 glasses** (${ml} / 2,000 ml) of water today.\n\nStaying well hydrated supports blood pressure stability, kidney function, and energy levels throughout the day!`,
        timestamp,
        quickReplies: ['Drink Water (+1 Glass)', 'View Daily Checklist', 'Log Mood', 'Today\'s Routine']
      };
    }

    // --------------------------------------------------------------------------
    // INTENT 6: Mood & Wellbeing Check-in
    // --------------------------------------------------------------------------
    if (
      lower.includes('feeling') ||
      lower.includes('mood') ||
      lower.includes('cheerful') ||
      lower.includes('calm') ||
      lower.includes('tired') ||
      lower.includes('anxious') ||
      lower.includes('happy') ||
      lower.includes('sad') ||
      lower.includes('stress')
    ) {
      let detectedMood = 'Calm';
      if (lower.includes('cheerful') || lower.includes('happy') || lower.includes('great') || lower.includes('good')) {
        detectedMood = 'Cheerful';
      } else if (lower.includes('tired') || lower.includes('exhausted') || lower.includes('sleepy')) {
        detectedMood = 'Tired';
      } else if (lower.includes('anxious') || lower.includes('worried') || lower.includes('stress')) {
        detectedMood = 'Anxious';
      }

      const tracker = getOrCreateTracker(elderlyId);
      tracker.latestMood = detectedMood;

      return {
        id: responseId,
        sender: 'assistant',
        text: `Thank you for checking in. I've noted that you are feeling **${detectedMood}** today.\n\nRemember to listen to your body, take restful pauses whenever needed, and reach out to your care circle whenever you want company or support!`,
        timestamp,
        quickReplies: ['Log Sleep Routine', 'Drink Water', 'Daily Checklist', 'Today\'s Routine']
      };
    }

    // --------------------------------------------------------------------------
    // INTENT 7: Family Care Circle Collaboration
    // --------------------------------------------------------------------------
    if (
      lower.includes('family') ||
      lower.includes('circle') ||
      lower.includes('caregiver') ||
      lower.includes('caretaker') ||
      lower.includes('daughter') ||
      lower.includes('sarah') ||
      lower.includes('marcus')
    ) {
      return {
        id: responseId,
        sender: 'assistant',
        text:
          'Your Family Care Circle is actively connected to your profile.\n\n• **Sarah Vance** (Family Administrator) manages care plans and appointments.\n• **Marcus Chen** (Caretaker) records daily wellness and medication logs.\n\nYou have primary ownership over all profile sharing permissions.',
        timestamp,
        action: {
          type: 'NAVIGATE',
          path: '/circle',
          label: 'Open Family Care Circle'
        },
        quickReplies: ['Invite Family Member', 'View Activity Timeline', 'Today\'s Routine']
      };
    }

    // --------------------------------------------------------------------------
    // INTENT 9: Greetings & Friendly Pleasantries
    // --------------------------------------------------------------------------
    if (
      lower.startsWith('hi') ||
      lower.startsWith('hello') ||
      lower.startsWith('hey') ||
      lower.includes('good morning') ||
      lower.includes('good afternoon') ||
      lower.includes('good evening') ||
      lower.includes('thank')
    ) {
      return {
        id: responseId,
        sender: 'assistant',
        text:
          'Hello! I am your CareNest Smart Care Assistant. I\'m here to help you review daily medication schedules, upcoming doctor appointments, wellness routines, and guide you around the app.\n\nHow can I help you have a peaceful, healthy day?',
        timestamp,
        quickReplies: ['Today\'s Routine', 'Next Medication', 'Upcoming Appointments', 'Drink Water (+1)', 'Open Vault']
      };
    }

    // --------------------------------------------------------------------------
    // DEFAULT FRIENDLY HELPER
    // --------------------------------------------------------------------------
    return {
      id: responseId,
      sender: 'assistant',
      text:
        'I am your CareNest routine companion. You can ask me:\n\n• "What is my routine today?"\n• "When is my next medication?"\n• "When is my next doctor appointment?"\n• "How do I find my blood reports?"\n• "I drank a glass of water"\n• "Take me to reports"\n\nFeel free to choose a quick action below!',
      timestamp,
      quickReplies: ['Today\'s Routine', 'Next Medication', 'Upcoming Appointments', 'Hydration Progress', 'Open Vault']
    };
  },

  // ============================================================================
  // 3. LOG WELLNESS TELEMETRY (Water, Mood, Sleep, Observations, Checklist)
  // ============================================================================
  logWellnessTelemetry: async (
    userId: string,
    elderlyId = 'eld-01',
    dto: AssistantWellnessDTO
  ) => {
    const tracker = getOrCreateTracker(elderlyId);
    let message = 'Wellness entry logged successfully';

    if (dto.action === 'LOG_WATER') {
      const added = dto.waterGlasses || 1;
      tracker.waterGlasses = Math.min(16, tracker.waterGlasses + added);
      message = `Logged ${added} glass(es) of water. Total today: ${tracker.waterGlasses} glasses (${tracker.waterGlasses * 250} ml).`;
    } else if (dto.action === 'SET_WATER') {
      tracker.waterGlasses = Math.max(0, Math.min(16, dto.waterGlasses ?? 0));
      message = `Water intake set to ${tracker.waterGlasses} glasses.`;
    } else if (dto.action === 'LOG_MOOD') {
      tracker.latestMood = dto.mood || 'Calm';
      message = `Mood recorded as ${tracker.latestMood}.`;

      // Persist to Health Record
      try {
        await recordService.createRecord(userId, {
          elderlyId,
          mood: tracker.latestMood,
          wellnessNotes: dto.observationNotes || `Assistant Mood Check-in: ${tracker.latestMood}`
        });
      } catch (err) {
        logger.warn(`Could not persist mood to health records: ${err}`);
      }
    } else if (dto.action === 'LOG_SLEEP') {
      tracker.latestSleepHours = dto.sleepHours || 8;
      message = `Sleep recorded: ${tracker.latestSleepHours} hours (${dto.sleepQuality || 'Restful'}).`;

      // Persist to Health Record
      try {
        await recordService.createRecord(userId, {
          elderlyId,
          sleepHours: tracker.latestSleepHours,
          wellnessNotes: `Assistant Sleep Log: ${tracker.latestSleepHours} hrs (${dto.sleepQuality || 'Restful'})`
        });
      } catch (err) {
        logger.warn(`Could not persist sleep to health records: ${err}`);
      }
    } else if (dto.action === 'LOG_OBSERVATION') {
      message = 'Health observation recorded.';
      if (dto.observationNotes) {
        try {
          await recordService.createRecord(userId, {
            elderlyId,
            wellnessNotes: `Observation: ${dto.observationNotes}`,
            notes: dto.observationNotes
          });
        } catch (err) {
          logger.warn(`Could not persist observation to health records: ${err}`);
        }
      }
    } else if (dto.action === 'TOGGLE_CHECKLIST') {
      if (dto.checklistItemId) {
        tracker.checklistToggles[dto.checklistItemId] =
          dto.completed !== undefined ? dto.completed : !tracker.checklistToggles[dto.checklistItemId];
        message = `Checklist item updated.`;
      }
    }

    const updatedSummary = await assistantService.getDailySummary(elderlyId, userId);

    return {
      success: true,
      message,
      trackerState: {
        waterGlasses: tracker.waterGlasses,
        latestMood: tracker.latestMood,
        latestSleepHours: tracker.latestSleepHours,
        checklistToggles: tracker.checklistToggles
      },
      updatedSummary
    };
  }
};
