export type UserRole = 'ELDERLY' | 'FAMILY_MEMBER' | 'CAREGIVER' | 'DOCTOR' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  avatarUrl?: string;
  elderlyProfile?: ElderlyProfile;
}

export interface ElderlyProfile {
  id: string;
  userId: string;
  dateOfBirth?: string;
  bloodGroup?: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  allergies: string[];
  chronicConditions: string[];
  address?: string;
  mobilityStatus?: string;
  notes?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    avatarUrl?: string;
  };
  medications?: Medication[];
  appointments?: Appointment[];
  healthRecords?: HealthRecord[];
}

export interface Medication {
  id: string;
  elderlyId: string;
  name: string;
  category?: string;
  dosage: string;
  frequency: string;
  scheduledTimes: string[];
  foodInstructions?: 'BEFORE_MEAL' | 'AFTER_MEAL' | 'WITH_MEAL' | 'EMPTY_STOMACH' | 'ANYTIME' | string;
  doctorInstructions?: string;
  prescriptionUrl?: string;
  instructions?: string;
  startDate: string;
  endDate?: string;
  stockQuantity: number;
  refillReminderThreshold: number;
  lastRefillDate?: string;
  isActive: boolean;
  logs?: MedicationLog[];
  createdAt?: string;
  updatedAt?: string;
}

export interface MedicationLog {
  id: string;
  medicationId: string;
  scheduledFor: string;
  takenAt?: string;
  status: 'UPCOMING' | 'PENDING' | 'TAKEN' | 'SKIPPED' | 'MISSED' | 'CANCELLED' | 'SNOOZED';
  loggedById?: string;
  loggedByName?: string;
  skipReason?: string;
  notes?: string;
  medication?: Medication;
  loggedBy?: {
    id: string;
    name: string;
    role: string;
  };
  createdAt?: string;
}

export interface AppointmentDocument {
  id: string;
  name: string;
  type: string;
  size?: string;
  url?: string;
  uploadedAt: string;
}

export type AppointmentStatusType = 'UPCOMING' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';

export interface Appointment {
  id: string;
  elderlyId: string;
  createdById?: string;
  doctorName: string;
  specialty: string;
  hospitalName?: string;
  contactNumber?: string;
  location: string;
  appointmentDate: string;
  appointmentTime?: string;
  reminderSent?: boolean;
  status: AppointmentStatusType;
  notes?: string;
  consultationNotes?: string;
  documents?: AppointmentDocument[];
  rescheduledFrom?: string;
  rescheduleReason?: string;
  cancelReason?: string;
  createdAt?: string;
  updatedAt?: string;
  elderly?: {
    id: string;
    user?: {
      name: string;
      phone?: string;
    };
  };
}

export interface HealthRecord {
  id: string;
  elderlyId: string;
  recordedById: string;
  recordedAt: string;
  systolicBp?: number;
  diastolicBp?: number;
  bloodGlucose?: number;
  heartRate?: number;
  oxygenSaturation?: number;
  bodyTemperature?: number;
  weight?: number;
  isAlert: boolean;
  notes?: string;
  recordedBy?: {
    name: string;
    role: string;
  };
}

export interface CareActivity {
  id: string;
  elderlyId: string;
  assignedToId?: string;
  title: string;
  description?: string;
  category: 'HYGIENE' | 'MEAL' | 'MOBILITY' | 'EXERCISE' | 'MENTAL_HEALTH' | 'CHECKUP' | 'OTHER';
  scheduledDate: string;
  scheduledTime: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';
  completedAt?: string;
  notes?: string;
  assignedTo?: {
    name: string;
    role: string;
  };
}

export interface EmergencyAlert {
  id: string;
  elderlyId: string;
  triggeredById: string;
  triggeredAt: string;
  type: string;
  message?: string;
  latitude?: number;
  longitude?: number;
  resolved: boolean;
  resolvedAt?: string;
  resolvedNotes?: string;
  elderly?: {
    emergencyContactPhone: string;
    user?: {
      name: string;
      phone?: string;
    };
  };
}

export interface DashboardOverview {
  elderly: ElderlyProfile;
  metrics: {
    totalMedications: number;
    adherenceRate: number;
    adherenceSummary: {
      taken: number;
      missed: number;
      total: number;
    };
    upcomingAppointmentsCount: number;
    pendingActivitiesCount: number;
    activeAlertsCount: number;
  };
  latestVital?: HealthRecord;
  upcomingAppointments: Appointment[];
  todayActivities: CareActivity[];
  activeAlerts: EmergencyAlert[];
}

// Care Circle Collaboration Types
export type CircleRole = 'ELDERLY_OWNER' | 'FAMILY_ADMIN' | 'FAMILY_VIEWER' | 'CARETAKER';
export type CircleMemberStatus = 'ACTIVE' | 'PENDING_APPROVAL' | 'REVOKED' | 'REJECTED';

export interface CirclePermissions {
  canManageMedications: boolean;
  canManageAppointments: boolean;
  canViewVitals: boolean;
  canRecordVitals: boolean;
  canManageActivities: boolean;
  receivesAlerts: boolean;
}

export interface CareCircleMember {
  id: string;
  elderlyId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  avatarUrl?: string;
  relationship: string;
  circleRole: CircleRole;
  status: CircleMemberStatus;
  permissions: CirclePermissions;
  joinedAt: string;
  invitedById?: string;
  invitedByName?: string;
  approvedAt?: string;
  approvedById?: string;
  shiftInfo?: string;
  notes?: string;
}

export interface CareCircleInvite {
  id: string;
  elderlyId: string;
  code: string;
  targetRole: CircleRole;
  targetRelationship: string;
  invitedEmail?: string;
  invitedPhone?: string;
  defaultPermissions: CirclePermissions;
  createdById: string;
  createdByName: string;
  expiresAt: string;
  isSingleUse: boolean;
  isUsed: boolean;
  isRevoked: boolean;
  isExpired?: boolean;
  createdAt: string;
}

export interface CareCircleActivity {
  id: string;
  elderlyId: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  actorAvatar?: string;
  actionType:
    | 'MEMBER_INVITED'
    | 'MEMBER_JOINED'
    | 'REQUEST_APPROVED'
    | 'REQUEST_REJECTED'
    | 'ROLE_UPDATED'
    | 'PERMISSIONS_UPDATED'
    | 'ACCESS_REVOKED'
    | 'MEDICATION_LOGGED'
    | 'APPOINTMENT_SCHEDULED'
    | 'VITAL_RECORDED';
  description: string;
  metadata?: any;
  timestamp: string;
}

// Medical Records & Prescription Vault Types
export type VaultCategory =
  | 'PRESCRIPTION'
  | 'BLOOD_REPORT'
  | 'MEDICAL_HISTORY'
  | 'DIAGNOSTIC_REPORT'
  | 'DISCHARGE_SUMMARY'
  | 'OTHER';

export interface VaultDocument {
  id: string;
  elderlyId: string;
  title: string;
  category: VaultCategory;
  doctorName?: string;
  facilityName?: string;
  documentDate: string;
  fileName: string;
  fileType: string;
  fileSize: string;
  storageKey: string;
  previewUrl?: string;
  tags: string[];
  notes?: string;
  isArchived: boolean;
  archivedAt?: string;
  archivedById?: string;
  uploadedById: string;
  uploadedByName: string;
  uploadedByRole: string;
  createdAt: string;
  updatedAt: string;
}

export interface VaultAccessLog {
  id: string;
  documentId: string;
  documentTitle: string;
  elderlyId: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: 'UPLOADED' | 'VIEWED' | 'DOWNLOADED' | 'ARCHIVED' | 'RESTORED';
  details?: string;
  timestamp: string;
}

export interface AnalyticsCards {
  totalScheduledDoses: number;
  eligibleDoses: number;
  takenCount: number;
  skippedCount: number;
  missedCount: number;
  unconfirmedCount: number;
  missedOrUnconfirmedCount: number;
  upcomingAppointmentsCount: number;
  activeCaretakersCount: number;
  adherenceRate: number;
}

export interface AnalyticsAdherence {
  overall: number;
  daily: number;
  weekly: number;
  monthly: number;
}

export interface DailyTrendPoint {
  date: string;
  label: string;
  dayOfWeek: string;
  taken: number;
  skipped: number;
  missed: number;
  unconfirmed: number;
  totalEligible: number;
  adherenceRate: number;
}

export interface WeeklyDayPoint {
  day: string;
  taken: number;
  skipped: number;
  missed: number;
  unconfirmed: number;
  rate: number;
}

export interface StatusDonutSlice {
  name: string;
  value: number;
  color: string;
  bgColor?: string;
}

export interface MonthlyActivityItem {
  category: string;
  completed: number;
  pending: number;
  total: number;
  completionRate: number;
}

export interface AppointmentOverviewData {
  upcomingCount: number;
  completedCount: number;
  cancelledCount: number;
  rescheduledCount: number;
  bySpecialty: Array<{ specialty: string; count: number }>;
  nextAppointment: any | null;
}

export interface CaretakerSummaryItem {
  id: string;
  name: string;
  role: string;
  relationship: string;
  avatarUrl?: string;
  shift: string;
  tasksCompleted: number;
  tasksPending: number;
  observationsRecorded: number;
  activeStatus: string;
}

export interface DailyHealthcareReportItem {
  date: string;
  formattedDate: string;
  summary: {
    medicationsTaken: number;
    medicationsTotal: number;
    activitiesCompleted: number;
    activitiesTotal: number;
    vitalsCount: number;
  };
  medications: Array<{
    id: string;
    name: string;
    dosage: string;
    time: string;
    status: string;
    skipReason?: string;
  }>;
  careActivities: Array<{
    id: string;
    title: string;
    category: string;
    time: string;
    status: string;
    notes?: string;
    assignedTo: string;
  }>;
  vitals: Array<{
    id: string;
    recordedAt: string;
    systolicBp?: number;
    diastolicBp?: number;
    heartRate?: number;
    bloodGlucose?: number;
    oxygenSaturation?: number;
    mood?: string;
    painLevel?: number;
    sleepHours?: number;
    isAlert: boolean;
    notes?: string;
  }>;
}

export interface AnalyticsOverview {
  elderlyId: string;
  patientName: string;
  period: 'today' | 'this_week' | 'this_month' | 'custom';
  range: {
    startDate: string;
    endDate: string;
  };
  cards: AnalyticsCards;
  adherence: AnalyticsAdherence;
  charts: {
    adherenceLineTrend: DailyTrendPoint[];
    weeklyDayBreakdown: WeeklyDayPoint[];
    medicationStatusDonut: StatusDonutSlice[];
    monthlyActivityBar: MonthlyActivityItem[];
    appointmentOverview: AppointmentOverviewData;
  };
  caretakerSummaries: CaretakerSummaryItem[];
  dailyHealthcareReports: DailyHealthcareReportItem[];
  disclaimer: string;
}


// ==========================================
// Smart Care Assistant Types
// ==========================================

export interface AssistantActionPayload {
  type: 'NAVIGATE' | 'ACTION';
  path: string;
  label: string;
}

export interface AssistantChatMessage {
  id: string;
  sender: 'assistant' | 'user';
  text: string;
  timestamp: string;
  action?: AssistantActionPayload;
  quickReplies?: string[];
  isSafetyAlert?: boolean;
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

// ==========================================
// Emergency Assistance & Profile Types
// ==========================================

export interface EmergencyContactInfo {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  isPrimary: boolean;
  priorityOrder: number;
}

export interface EmergencyProfileData {
  patient: {
    id: string;
    name: string;
    dateOfBirth?: string;
    bloodGroup?: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
    emergencyContactRelation: string;
    address?: string;
  };
  emergencyContacts: EmergencyContactInfo[];
  knownAllergies: string[];
  relevantMedicalInfo: string[];
  currentMedications: Array<{
    id: string;
    name: string;
    dosage: string;
    frequency: string;
    scheduledTimes: string[];
    instructions?: string;
  }>;
  disclaimer: string;
}

export interface NotificationDeliveryStatus {
  contactName: string;
  relationship: string;
  phone: string;
  channel: string;
  status: 'DELIVERED' | 'QUEUED' | 'LOGGED' | 'FAILED';
  deliveredAt: string;
  details: string;
}

export interface SosTriggerResult {
  alert: EmergencyAlert;
  emergencyProfile: EmergencyProfileData;
  careActivityId: string;
  notificationDeliveries: NotificationDeliveryStatus[];
  allContactsNotified: boolean;
  emergencyServices: {
    contacted: boolean;
    serviceName: string;
    verifiedIntegration: boolean;
    message: string;
  };
}
