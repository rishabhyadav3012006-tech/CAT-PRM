import { PrismaClient } from '@prisma/client';
import { env } from './env.js';
import { logger } from '../utils/logger.js';
import { UserRole, MedicationLogStatus, AppointmentStatus, ActivityCategory, ActivityStatus } from '../constants/roles.js';
import bcrypt from 'bcryptjs';
import { createHash } from 'crypto';

export const hashInvitationCode = (code: string): string => {
  return createHash('sha256').update(code.trim().toUpperCase()).digest('hex');
};

// Global singleton PrismaClient
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error']
  });

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

let isDatabaseConnected = false;

export const checkDatabaseConnection = async (): Promise<boolean> => {
  if (env.DB_MODE === 'mock') {
    logger.info('DB_MODE is explicitly set to mock. Running with CareNest in-memory repository.');
    return false;
  }

  try {
    // Attempt a light query to verify PostgreSQL availability
    await prisma.$queryRaw`SELECT 1`;
    isDatabaseConnected = true;
    logger.info('Connected successfully to PostgreSQL database via Prisma.');
    return true;
  } catch (error: any) {
    logger.warn('PostgreSQL database connection could not be established.');
    logger.warn(`Reason: ${error.message || error}`);
    logger.info('CareNest is switching to high-fidelity In-Memory Data Store so the system runs smoothly without interruption.');
    isDatabaseConnected = false;
    return false;
  }
};

export const getIsDatabaseConnected = () => isDatabaseConnected;

// ==========================================
// In-Memory Data Store (Used for auto-fallback)
// ==========================================
export interface MemoryUser {
  id: string;
  email: string;
  password: string;
  name: string;
  phone?: string;
  role: UserRole;
  avatarUrl?: string;
  timeZone?: string;
  isEmailVerified?: boolean;
  isActive: boolean;
  lastLoginAt?: Date | null;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MemoryElderlyProfile {
  id: string;
  userId: string;
  inviteCode?: string;
  dateOfBirth?: Date;
  bloodGroup?: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  allergies: string[];
  chronicConditions: string[];
  address?: string;
  mobilityStatus?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MemoryMedication {
  id: string;
  elderlyId: string;
  createdById: string;
  name: string;
  category?: string;
  dosage: string;
  frequency: string;
  scheduledTimes: string[];
  foodInstructions?: string;
  doctorInstructions?: string;
  prescriptionUrl?: string;
  instructions?: string;
  startDate: Date;
  endDate?: Date;
  stockQuantity: number;
  refillReminderThreshold: number;
  lastRefillDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MemoryMedicationSchedule {
  id: string;
  medicationId: string;
  timeOfDay: string;
  dosageOverride?: string;
  daysOfWeek: number[];
  label?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MemoryMedicationLog {
  id: string;
  medicationId: string;
  scheduledFor: Date;
  takenAt?: Date;
  status: MedicationLogStatus;
  loggedById?: string;
  loggedByName?: string;
  skipReason?: string;
  notes?: string;
  createdAt: Date;
}

export interface AppointmentDocument {
  id: string;
  name: string;
  type: string;
  size?: string;
  url: string;
  uploadedAt: Date;
}

export interface MemoryAppointment {
  id: string;
  elderlyId: string;
  createdById: string;
  doctorName: string;
  specialty: string;
  hospitalName?: string;
  contactNumber?: string;
  location: string;
  appointmentDate: Date;
  appointmentTime?: string;
  reminderSent: boolean;
  status: AppointmentStatus;
  notes?: string;
  consultationNotes?: string;
  documents?: AppointmentDocument[];
  rescheduledFrom?: Date;
  rescheduleReason?: string;
  cancelReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MemoryHealthRecord {
  id: string;
  elderlyId: string;
  recordedById: string;
  recordedAt: Date;
  systolicBp?: number;
  diastolicBp?: number;
  bloodGlucose?: number;
  heartRate?: number;
  oxygenSaturation?: number;
  bodyTemperature?: number;
  weight?: number;
  mood?: string;
  painLevel?: number;
  sleepHours?: number;
  isAlert: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface MemoryCareActivity {
  id: string;
  elderlyId: string;
  createdById: string;
  assignedToId?: string;
  title: string;
  description?: string;
  category: ActivityCategory;
  scheduledDate: Date;
  scheduledTime: string;
  status: ActivityStatus;
  completedAt?: Date;
  notes?: string;
  observations?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MemoryEmergencyAlert {
  id: string;
  elderlyId: string;
  triggeredById: string;
  triggeredAt: Date;
  type: string;
  message?: string;
  latitude?: number;
  longitude?: number;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedNotes?: string;
  createdAt: Date;
}

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
  joinedAt: Date;
  invitedById?: string;
  invitedByName?: string;
  approvedAt?: Date;
  approvedById?: string;
  shiftInfo?: string;
  notes?: string;
}

export interface CareCircleInvite {
  id: string;
  elderlyId: string;
  code: string;
  hashedCode: string;
  targetRole: CircleRole;
  targetRelationship: string;
  invitedEmail?: string;
  invitedPhone?: string;
  defaultPermissions: CirclePermissions;
  createdById: string;
  createdByName: string;
  expiresAt: Date;
  isSingleUse: boolean;
  isUsed: boolean;
  usedAt?: Date;
  usedById?: string;
  isRevoked: boolean;
  createdAt: Date;
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
  timestamp: Date;
}

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
  documentDate: Date;
  fileName: string;
  fileType: string;
  fileSize: string;
  storageKey: string;
  previewUrl?: string;
  tags: string[];
  notes?: string;
  isArchived: boolean;
  archivedAt?: Date;
  archivedById?: string;
  uploadedById: string;
  uploadedByName: string;
  uploadedByRole: string;
  createdAt: Date;
  updatedAt: Date;
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
  timestamp: Date;
}

export interface MemoryFamilyLink {
  id: string;
  elderlyId: string;
  familyMemberId: string;
  relationship: string;
  canManageMedications: boolean;
  receivesAlerts: boolean;
  createdAt: Date;
}

export interface MemoryCaregiverAssignment {
  id: string;
  elderlyId: string;
  caregiverId: string;
  shiftStart?: string;
  shiftEnd?: string;
  status: string;
  notes?: string;
  createdAt: Date;
}

export interface MemoryPasswordResetToken {
  token: string;
  email: string;
  expiresAt: Date;
}

export interface MemoryVerificationCode {
  email: string;
  code: string;
  expiresAt: Date;
}

export interface MemoryNotification {
  id: string;
  userId: string;
  elderlyId?: string;
  type: string;
  title: string;
  message: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  channel: 'IN_APP' | 'EMAIL' | 'SMS' | 'PUSH';
  isRead: boolean;
  readAt?: Date;
  actionUrl?: string;
  metadata?: {
    emailTo?: string;
    deliveryStatus?: 'PENDING' | 'SENT' | 'FAILED' | 'SKIPPED_PREFERENCE';
    error?: string;
    eventId?: string;
    medicationId?: string;
    appointmentId?: string;
    activityId?: string;
    retryCount?: number;
    [key: string]: any;
  };
  sentAt: Date;
  createdAt: Date;
}

export interface MemoryNotificationPreference {
  id: string;
  userId: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  medicationReminders: boolean;
  missedDoseAlerts: boolean;
  appointmentReminders: boolean;
  careActivityUpdates: boolean;
  emergencyAlerts: boolean;
  reminderLeadMinutes: number;
  quietHoursEnabled: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Initial Mock Seed Data
const defaultHashedPassword = bcrypt.hashSync('Password123!', 10);

export const memoryStore = {
  users: [
    {
      id: 'usr-elderly-01',
      email: 'eleanor.vance@carenest.health',
      password: defaultHashedPassword,
      name: 'Eleanor Vance',
      phone: '+1 (555) 234-5678',
      role: UserRole.ELDERLY,
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80',
      isActive: true,
      createdAt: new Date('2026-01-10'),
      updatedAt: new Date('2026-01-10')
    },
    {
      id: 'usr-family-01',
      email: 'sarah.vance@carenest.health',
      password: defaultHashedPassword,
      name: 'Sarah Vance',
      phone: '+1 (555) 345-6789',
      role: UserRole.FAMILY_MEMBER,
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
      isActive: true,
      createdAt: new Date('2026-01-10'),
      updatedAt: new Date('2026-01-10')
    },
    {
      id: 'usr-caregiver-01',
      email: 'marcus.chen@carenest.health',
      password: defaultHashedPassword,
      name: 'Marcus Chen',
      phone: '+1 (555) 456-7890',
      role: UserRole.CAREGIVER,
      avatarUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=256&q=80',
      isActive: true,
      createdAt: new Date('2026-01-12'),
      updatedAt: new Date('2026-01-12')
    },
    {
      id: 'usr-doctor-01',
      email: 'dr.adams@carenest.health',
      password: defaultHashedPassword,
      name: 'Dr. Elizabeth Adams',
      phone: '+1 (555) 567-8901',
      role: UserRole.DOCTOR,
      avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=256&q=80',
      isActive: true,
      createdAt: new Date('2026-01-15'),
      updatedAt: new Date('2026-01-15')
    },
    {
      id: 'usr-elderly-02',
      email: 'arthur.pendelton@carenest.health',
      password: defaultHashedPassword,
      name: 'Arthur Pendelton',
      phone: '+1 (555) 678-9012',
      role: UserRole.ELDERLY,
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
      isActive: true,
      createdAt: new Date('2026-01-20'),
      updatedAt: new Date('2026-01-20')
    }
  ] as MemoryUser[],

  elderlyProfiles: [
    {
      id: 'eld-01',
      userId: 'usr-elderly-01',
      inviteCode: 'ELD-VANCE-78',
      dateOfBirth: new Date('1948-04-12'),
      bloodGroup: 'O+',
      emergencyContactName: 'Sarah Vance (Daughter)',
      emergencyContactPhone: '+1 (555) 345-6789',
      emergencyContactRelation: 'Daughter',
      allergies: ['Penicillin', 'Sulfa Drugs'],
      chronicConditions: ['Hypertension', 'Type 2 Diabetes', 'Mild Osteoarthritis'],
      address: '742 Evergreen Terrace, Springfield, OR',
      mobilityStatus: 'Needs Cane',
      notes: 'Prefers morning medication with warm oatmeal. Alert on high blood pressure.',
      createdAt: new Date('2026-01-10'),
      updatedAt: new Date('2026-01-10')
    },
    {
      id: 'eld-02',
      userId: 'usr-elderly-02',
      inviteCode: 'ELD-PEND-82',
      dateOfBirth: new Date('1944-09-18'),
      bloodGroup: 'A+',
      emergencyContactName: 'Robert Pendelton (Son)',
      emergencyContactPhone: '+1 (555) 789-0123',
      emergencyContactRelation: 'Son',
      allergies: ['Latex'],
      chronicConditions: ['Parkinsons', 'Mild Hypertension'],
      address: '104 Oak Ridge Way, Portland, OR',
      mobilityStatus: 'Walker Required',
      notes: 'Requires physical balance support during afternoon walk. Afternoon Levodopa critical.',
      createdAt: new Date('2026-01-20'),
      updatedAt: new Date('2026-01-20')
    }
  ] as MemoryElderlyProfile[],

  medications: [
    {
      id: 'med-01',
      elderlyId: 'eld-01',
      createdById: 'usr-doctor-01',
      name: 'Lisinopril',
      category: 'Cardiovascular',
      dosage: '10mg',
      frequency: 'DAILY',
      scheduledTimes: ['08:00 AM'],
      foodInstructions: 'AFTER_MEAL',
      doctorInstructions: 'Prescribed by Dr. Elizabeth Adams for arterial hypertension control.',
      instructions: 'Take 1 tablet every morning with a full glass of water for blood pressure management.',
      startDate: new Date('2026-01-01'),
      stockQuantity: 24,
      refillReminderThreshold: 7,
      lastRefillDate: new Date('2026-01-15'),
      isActive: true,
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01')
    },
    {
      id: 'med-02',
      elderlyId: 'eld-01',
      createdById: 'usr-doctor-01',
      name: 'Metformin',
      category: 'Diabetes',
      dosage: '500mg',
      frequency: 'TWICE_DAILY',
      scheduledTimes: ['08:30 AM', '07:30 PM'],
      foodInstructions: 'WITH_MEAL',
      doctorInstructions: 'Take with warm meal to manage type 2 blood glucose.',
      instructions: 'Take with food to avoid gastrointestinal discomfort.',
      startDate: new Date('2026-01-01'),
      stockQuantity: 18,
      refillReminderThreshold: 10,
      lastRefillDate: new Date('2026-01-10'),
      isActive: true,
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01')
    },
    {
      id: 'med-03',
      elderlyId: 'eld-01',
      createdById: 'usr-doctor-01',
      name: 'Atorvastatin',
      category: 'Cardiovascular',
      dosage: '20mg',
      frequency: 'DAILY',
      scheduledTimes: ['09:00 PM'],
      foodInstructions: 'BEFORE_BED',
      doctorInstructions: 'Prescribed for LDL cholesterol control. Take consistently at bedtime.',
      instructions: 'Take at bedtime for cholesterol control.',
      startDate: new Date('2026-01-01'),
      stockQuantity: 6, // Low stock triggers reminder
      refillReminderThreshold: 7,
      lastRefillDate: new Date('2026-01-02'),
      isActive: true,
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01')
    },
    {
      id: 'med-04',
      elderlyId: 'eld-01',
      createdById: 'usr-caregiver-01',
      name: 'Vitamin D3 & Calcium',
      category: 'Supplements',
      dosage: '1000 IU / 500mg',
      frequency: 'DAILY',
      scheduledTimes: ['12:30 PM'],
      foodInstructions: 'WITH_MEAL',
      doctorInstructions: 'Bone density and joint strength maintenance.',
      instructions: 'Take with midday lunch.',
      startDate: new Date('2026-01-05'),
      stockQuantity: 45,
      refillReminderThreshold: 10,
      lastRefillDate: new Date('2026-01-05'),
      isActive: true,
      createdAt: new Date('2026-01-05'),
      updatedAt: new Date('2026-01-05')
    }
  ] as MemoryMedication[],

  medicationLogs: [
    {
      id: 'log-01',
      medicationId: 'med-01',
      scheduledFor: new Date(new Date().setHours(8, 0, 0, 0)),
      takenAt: new Date(new Date().setHours(8, 5, 0, 0)),
      status: MedicationLogStatus.TAKEN,
      loggedById: 'usr-elderly-01',
      notes: 'Taken with breakfast toast and water',
      createdAt: new Date()
    },
    {
      id: 'log-02',
      medicationId: 'med-02',
      scheduledFor: new Date(new Date().setHours(8, 30, 0, 0)),
      takenAt: new Date(new Date().setHours(8, 35, 0, 0)),
      status: MedicationLogStatus.TAKEN,
      loggedById: 'usr-caregiver-01',
      notes: 'Administered by Marcus',
      createdAt: new Date()
    },
    {
      id: 'log-03',
      medicationId: 'med-04',
      scheduledFor: new Date(new Date().setHours(12, 30, 0, 0)),
      status: MedicationLogStatus.PENDING,
      createdAt: new Date()
    },
    {
      id: 'log-04',
      medicationId: 'med-02',
      scheduledFor: new Date(new Date().setHours(19, 30, 0, 0)),
      status: MedicationLogStatus.PENDING,
      createdAt: new Date()
    },
    {
      id: 'log-05',
      medicationId: 'med-03',
      scheduledFor: new Date(new Date().setHours(21, 0, 0, 0)),
      status: MedicationLogStatus.PENDING,
      createdAt: new Date()
    }
  ] as MemoryMedicationLog[],

  appointments: [
    {
      id: 'apt-01',
      elderlyId: 'eld-01',
      createdById: 'usr-family-01',
      doctorName: 'Dr. Elizabeth Adams',
      specialty: 'Cardiologist',
      hospitalName: 'St. Mary Heart & Vascular Hospital',
      contactNumber: '+1 (555) 234-8899',
      location: 'Cardiovascular Center, Suite 410, 100 Health Blvd',
      appointmentDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
      appointmentTime: '10:30 AM',
      reminderSent: true,
      status: AppointmentStatus.UPCOMING,
      notes: 'Quarterly hypertension review & resting ECG check. Fasting 8 hours prior.',
      consultationNotes: '',
      documents: [
        {
          id: 'doc-01',
          name: 'Previous_Resting_ECG_Report.pdf',
          type: 'Lab Report',
          size: '1.4 MB',
          url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80',
          uploadedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      ],
      createdAt: new Date('2026-02-01'),
      updatedAt: new Date('2026-02-01')
    },
    {
      id: 'apt-02',
      elderlyId: 'eld-01',
      createdById: 'usr-caregiver-01',
      doctorName: 'Dr. Robert Harrison',
      specialty: 'Ophthalmologist',
      hospitalName: 'Vision Eye Specialty Institute',
      contactNumber: '+1 (555) 882-3490',
      location: 'Vision Eye Associates, Suite 204, Springfield',
      appointmentDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // In 3 days
      appointmentTime: '02:15 PM',
      reminderSent: false,
      status: AppointmentStatus.UPCOMING,
      notes: 'Annual diabetic retinopathy dilated eye exam. Arrange transport.',
      consultationNotes: '',
      documents: [],
      createdAt: new Date('2026-02-03'),
      updatedAt: new Date('2026-02-03')
    },
    {
      id: 'apt-03',
      elderlyId: 'eld-01',
      createdById: 'usr-doctor-01',
      doctorName: 'Dr. James Lin',
      specialty: 'Physical Therapist',
      hospitalName: 'CareNest Wellness Rehabilitation Pavilion',
      contactNumber: '+1 (555) 441-9021',
      location: 'Rehabilitation Gym A, Ground Floor',
      appointmentDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      appointmentTime: '11:00 AM',
      reminderSent: true,
      status: AppointmentStatus.COMPLETED,
      notes: 'Gait balance evaluation and bilateral knee resistance assessment.',
      consultationNotes: 'Patient demonstrated excellent improvement in posture and 20% increased stability during walker-assisted stride. Recommended 15 min daily seated resistance band exercises.',
      documents: [
        {
          id: 'doc-02',
          name: 'Mobility_Assessment_Chart.pdf',
          type: 'Physical Therapy Notes',
          size: '820 KB',
          url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80',
          uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        }
      ],
      createdAt: new Date('2026-01-20'),
      updatedAt: new Date('2026-02-10')
    },
    {
      id: 'apt-04',
      elderlyId: 'eld-01',
      createdById: 'usr-family-01',
      doctorName: 'Dr. Emily Watson',
      specialty: 'Endocrinologist',
      hospitalName: 'Springfield Diabetes & Metabolic Center',
      contactNumber: '+1 (555) 771-4455',
      location: 'Suite 310, Medical Arts Tower',
      appointmentDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // In 6 days
      appointmentTime: '03:30 PM',
      reminderSent: true,
      status: AppointmentStatus.RESCHEDULED,
      rescheduledFrom: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      rescheduleReason: 'Doctor attending emergency endocrine conference; adjusted to Friday afternoon slot.',
      notes: 'HbA1c review and insulin/Metformin dosage validation. Bring past 30-day glucose logs.',
      consultationNotes: '',
      documents: [
        {
          id: 'doc-03',
          name: 'Quarterly_HbA1c_Blood_Work.pdf',
          type: 'Lab Report',
          size: '2.1 MB',
          url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&q=80',
          uploadedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
        }
      ],
      createdAt: new Date('2026-01-25'),
      updatedAt: new Date('2026-02-08')
    },
    {
      id: 'apt-05',
      elderlyId: 'eld-01',
      createdById: 'usr-family-01',
      doctorName: 'Dr. Michael Chang',
      specialty: 'Dermatologist',
      hospitalName: 'Downtown Skin Health Clinic',
      contactNumber: '+1 (555) 302-8877',
      location: 'Building B, Suite 105',
      appointmentDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
      appointmentTime: '09:00 AM',
      reminderSent: false,
      status: AppointmentStatus.CANCELLED,
      cancelReason: 'Patient had mild seasonal cold; rescheduled following consultation with primary physician.',
      notes: 'Routine check of skin lesion on left forearm.',
      consultationNotes: '',
      documents: [],
      createdAt: new Date('2026-01-15'),
      updatedAt: new Date('2026-02-02')
    }
  ] as MemoryAppointment[],

  healthRecords: [
    {
      id: 'rec-01',
      elderlyId: 'eld-01',
      recordedById: 'usr-caregiver-01',
      recordedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      systolicBp: 124,
      diastolicBp: 78,
      bloodGlucose: 108,
      heartRate: 72,
      oxygenSaturation: 98,
      bodyTemperature: 98.4,
      weight: 64.5,
      isAlert: false,
      notes: 'Morning vitals optimal. Eleanor reports feeling rested.',
      createdAt: new Date()
    },
    {
      id: 'rec-02',
      elderlyId: 'eld-01',
      recordedById: 'usr-caregiver-01',
      recordedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      systolicBp: 132,
      diastolicBp: 84,
      bloodGlucose: 122,
      heartRate: 76,
      oxygenSaturation: 97,
      bodyTemperature: 98.6,
      weight: 64.6,
      isAlert: false,
      notes: 'Slightly higher glucose after dinner; advised gentle stroll.',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
    },
    {
      id: 'rec-03',
      elderlyId: 'eld-01',
      recordedById: 'usr-elderly-01',
      recordedAt: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
      systolicBp: 120,
      diastolicBp: 80,
      bloodGlucose: 110,
      heartRate: 70,
      oxygenSaturation: 99,
      bodyTemperature: 98.2,
      weight: 64.4,
      isAlert: false,
      notes: 'Self-check blood pressure monitor.',
      createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000)
    }
  ] as MemoryHealthRecord[],

  careActivities: [
    {
      id: 'act-01',
      elderlyId: 'eld-01',
      createdById: 'usr-caregiver-01',
      assignedToId: 'usr-caregiver-01',
      title: 'Morning Hygiene & Bath Assistance',
      description: 'Assist with warm bath, slip-resistant floor mats, and gentle skin moisturizing.',
      category: ActivityCategory.HYGIENE,
      scheduledDate: new Date(),
      scheduledTime: '07:30',
      status: ActivityStatus.COMPLETED,
      completedAt: new Date(new Date().setHours(8, 0, 0, 0)),
      notes: 'Completed smoothly with no discomfort.',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'act-02',
      elderlyId: 'eld-01',
      createdById: 'usr-family-01',
      assignedToId: 'usr-caregiver-01',
      title: 'Nutritious Breakfast & Hydration',
      description: 'Oatmeal with blueberries, boiled egg, herbal tea, and 250ml water.',
      category: ActivityCategory.MEAL,
      scheduledDate: new Date(),
      scheduledTime: '08:30',
      status: ActivityStatus.COMPLETED,
      completedAt: new Date(new Date().setHours(9, 0, 0, 0)),
      notes: 'Ate full portion and took morning medications.',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'act-03',
      elderlyId: 'eld-01',
      createdById: 'usr-caregiver-01',
      assignedToId: 'usr-caregiver-01',
      title: 'Gentle Mobility & Garden Stroll',
      description: '15-minute garden walk with cane support and ankle rotation exercises.',
      category: ActivityCategory.EXERCISE,
      scheduledDate: new Date(),
      scheduledTime: '11:00',
      status: ActivityStatus.PENDING,
      notes: 'Weather is sunny; take light cardigan.',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'act-04',
      elderlyId: 'eld-01',
      createdById: 'usr-family-01',
      assignedToId: 'usr-caregiver-01',
      title: 'Mental Wellness & Video Call with Grandkids',
      description: 'Setup iPad call with grandchildren in Seattle.',
      category: ActivityCategory.MENTAL_HEALTH,
      scheduledDate: new Date(),
      scheduledTime: '16:00',
      status: ActivityStatus.PENDING,
      notes: 'Scheduled for 30 minutes.',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ] as MemoryCareActivity[],

  emergencyAlerts: [] as MemoryEmergencyAlert[],

  familyLinks: [
    {
      id: 'link-01',
      elderlyId: 'eld-01',
      familyMemberId: 'usr-family-01',
      relationship: 'Daughter',
      canManageMedications: true,
      receivesAlerts: true,
      createdAt: new Date('2026-01-10')
    }
  ] as MemoryFamilyLink[],

  caregiverAssignments: [
    {
      id: 'assign-01',
      elderlyId: 'eld-01',
      caregiverId: 'usr-caregiver-01',
      shiftStart: '08:00',
      shiftEnd: '14:00',
      status: 'ACTIVE',
      notes: 'Morning Shift - Vitals & Medication',
      createdAt: new Date('2026-01-12')
    },
    {
      id: 'assign-02',
      elderlyId: 'eld-02',
      caregiverId: 'usr-caregiver-01',
      shiftStart: '14:30',
      shiftEnd: '18:30',
      status: 'ACTIVE',
      notes: 'Afternoon Shift - Mobility & Physical Therapy',
      createdAt: new Date('2026-01-20')
    }
  ] as MemoryCaregiverAssignment[],

  passwordResetTokens: [] as MemoryPasswordResetToken[],
  emailVerificationCodes: [] as MemoryVerificationCode[],

  careCircleMembers: [
    {
      id: 'mem-01',
      elderlyId: 'eld-01',
      userId: 'usr-elderly-01',
      userName: 'Eleanor Vance',
      userEmail: 'eleanor.vance@carenest.health',
      userPhone: '+1 (555) 234-5678',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80',
      relationship: 'Self (Profile Owner)',
      circleRole: 'ELDERLY_OWNER',
      status: 'ACTIVE',
      permissions: {
        canManageMedications: true,
        canManageAppointments: true,
        canViewVitals: true,
        canRecordVitals: true,
        canManageActivities: true,
        receivesAlerts: true
      },
      joinedAt: new Date('2026-01-01'),
      notes: 'Primary healthcare account holder & decision maker.'
    },
    {
      id: 'mem-02',
      elderlyId: 'eld-01',
      userId: 'usr-family-01',
      userName: 'Sarah Vance',
      userEmail: 'sarah.vance@carenest.health',
      userPhone: '+1 (555) 345-6789',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
      relationship: 'Daughter (Primary Guardian)',
      circleRole: 'FAMILY_ADMIN',
      status: 'ACTIVE',
      permissions: {
        canManageMedications: true,
        canManageAppointments: true,
        canViewVitals: true,
        canRecordVitals: true,
        canManageActivities: true,
        receivesAlerts: true
      },
      joinedAt: new Date('2026-01-05'),
      approvedAt: new Date('2026-01-05'),
      notes: 'Full administrative access to manage schedules, doctors, and caretakers.'
    },
    {
      id: 'mem-03',
      elderlyId: 'eld-01',
      userId: 'usr-caregiver-01',
      userName: 'Marcus Chen',
      userEmail: 'marcus.chen@carenest.health',
      userPhone: '+1 (555) 456-7890',
      avatarUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=256&q=80',
      relationship: 'Certified Senior Care Specialist',
      circleRole: 'CARETAKER',
      status: 'ACTIVE',
      shiftInfo: 'Mon - Fri 08:00 - 16:00',
      permissions: {
        canManageMedications: true,
        canManageAppointments: true,
        canViewVitals: true,
        canRecordVitals: true,
        canManageActivities: true,
        receivesAlerts: true
      },
      joinedAt: new Date('2026-01-12'),
      approvedAt: new Date('2026-01-12'),
      approvedById: 'usr-family-01',
      notes: 'Assigned to morning vitals, mobility exercises, and meal administration.'
    },
    {
      id: 'mem-04',
      elderlyId: 'eld-01',
      userId: 'usr-family-02',
      userName: 'Robert Vance',
      userEmail: 'robert.vance@gmail.com',
      userPhone: '+1 (555) 789-0123',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
      relationship: 'Son (Seattle, WA)',
      circleRole: 'FAMILY_VIEWER',
      status: 'ACTIVE',
      permissions: {
        canManageMedications: false,
        canManageAppointments: false,
        canViewVitals: true,
        canRecordVitals: false,
        canManageActivities: false,
        receivesAlerts: true
      },
      joinedAt: new Date('2026-01-18'),
      approvedAt: new Date('2026-01-18'),
      approvedById: 'usr-elderly-01',
      notes: 'View-only permissions with emergency SMS notifications enabled.'
    },
    {
      id: 'mem-05',
      elderlyId: 'eld-01',
      userId: 'usr-nurse-02',
      userName: 'Clara Oswald',
      userEmail: 'clara.nurse@portlandcare.org',
      userPhone: '+1 (555) 890-1234',
      avatarUrl: 'https://images.unsplash.com/photo-1594824813571-638f02636132?auto=format&fit=crop&w=256&q=80',
      relationship: 'Weekend Relief Nurse',
      circleRole: 'CARETAKER',
      status: 'PENDING_APPROVAL',
      shiftInfo: 'Sat - Sun 09:00 - 15:00',
      permissions: {
        canManageMedications: true,
        canManageAppointments: false,
        canViewVitals: true,
        canRecordVitals: true,
        canManageActivities: true,
        receivesAlerts: false
      },
      joinedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      notes: 'Submitted join request via invite code NEST-WEEKEND-77.'
    }
  ] as CareCircleMember[],

  careCircleInvites: [
    {
      id: 'inv-01',
      elderlyId: 'eld-01',
      code: 'NEST-FAM-8201',
      hashedCode: hashInvitationCode('NEST-FAM-8201'),
      targetRole: 'FAMILY_ADMIN',
      targetRelationship: 'Family Trustee / Legal Guardian',
      invitedEmail: 'david.vance@family.org',
      defaultPermissions: {
        canManageMedications: true,
        canManageAppointments: true,
        canViewVitals: true,
        canRecordVitals: true,
        canManageActivities: true,
        receivesAlerts: true
      },
      createdById: 'usr-elderly-01',
      createdByName: 'Eleanor Vance',
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours
      isSingleUse: true,
      isUsed: false,
      isRevoked: false,
      createdAt: new Date()
    },
    {
      id: 'inv-02',
      elderlyId: 'eld-01',
      code: 'NEST-CARE-4412',
      hashedCode: hashInvitationCode('NEST-CARE-4412'),
      targetRole: 'CARETAKER',
      targetRelationship: 'Certified Nursing Assistant',
      invitedEmail: 'rachel.adams@portlandnursing.com',
      defaultPermissions: {
        canManageMedications: true,
        canManageAppointments: true,
        canViewVitals: true,
        canRecordVitals: true,
        canManageActivities: true,
        receivesAlerts: true
      },
      createdById: 'usr-family-01',
      createdByName: 'Sarah Vance',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      isSingleUse: true,
      isUsed: false,
      isRevoked: false,
      createdAt: new Date()
    }
  ] as CareCircleInvite[],

  careCircleActivities: [
    {
      id: 'cca-01',
      elderlyId: 'eld-01',
      actorId: 'usr-family-01',
      actorName: 'Sarah Vance',
      actorRole: 'FAMILY_ADMIN',
      actorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
      actionType: 'MEMBER_INVITED',
      description: 'Generated secure single-use invitation code NEST-CARE-4412 for a new home nurse.',
      timestamp: new Date(Date.now() - 30 * 60 * 1000)
    },
    {
      id: 'cca-02',
      elderlyId: 'eld-01',
      actorId: 'usr-nurse-02',
      actorName: 'Clara Oswald',
      actorRole: 'CARETAKER',
      actorAvatar: 'https://images.unsplash.com/photo-1594824813571-638f02636132?auto=format&fit=crop&w=256&q=80',
      actionType: 'MEMBER_JOINED',
      description: 'Submitted join request as Weekend Relief Nurse (pending approval).',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000)
    },
    {
      id: 'cca-03',
      elderlyId: 'eld-01',
      actorId: 'usr-caregiver-01',
      actorName: 'Marcus Chen',
      actorRole: 'CARETAKER',
      actorAvatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=256&q=80',
      actionType: 'MEDICATION_LOGGED',
      description: 'Logged morning administration of Lisinopril 10mg with breakfast.',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000)
    },
    {
      id: 'cca-04',
      elderlyId: 'eld-01',
      actorId: 'usr-elderly-01',
      actorName: 'Eleanor Vance',
      actorRole: 'ELDERLY_OWNER',
      actorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80',
      actionType: 'PERMISSIONS_UPDATED',
      description: 'Configured emergency alert broadcasting preferences for family circle members.',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
    },
    {
      id: 'cca-05',
      elderlyId: 'eld-01',
      actorId: 'usr-family-01',
      actorName: 'Sarah Vance',
      actorRole: 'FAMILY_ADMIN',
      actorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
      actionType: 'REQUEST_APPROVED',
      description: 'Approved Marcus Chen as certified daytime caregiver.',
      timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000)
    }
  ] as CareCircleActivity[],

  vaultDocuments: [
    {
      id: 'doc-v01',
      elderlyId: 'eld-01',
      title: 'Quarterly Lisinopril & Atorvastatin Prescription',
      category: 'PRESCRIPTION',
      doctorName: 'Dr. Elizabeth Adams',
      facilityName: 'St. Mary Heart & Vascular Hospital',
      documentDate: new Date('2026-01-15'),
      fileName: 'Lisinopril_Atorvastatin_Quarterly_Prescription.pdf',
      fileType: 'application/pdf',
      fileSize: '1.4 MB',
      storageKey: 'vault/eld-01/rx/doc-v01-lisinopril-atorvastatin.pdf',
      previewUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80',
      tags: ['Cardiology', 'Hypertension', 'Refill', 'Quarterly Rx'],
      notes: 'Prescribed Lisinopril 10mg daily morning and Atorvastatin 20mg bedtime for blood pressure and LDL cholesterol management.',
      isArchived: false,
      uploadedById: 'usr-doctor-01',
      uploadedByName: 'Dr. Elizabeth Adams',
      uploadedByRole: 'DOCTOR',
      createdAt: new Date('2026-01-15'),
      updatedAt: new Date('2026-01-15')
    },
    {
      id: 'doc-v02',
      elderlyId: 'eld-01',
      title: 'Comprehensive Metabolic Panel & Lipid Profile',
      category: 'BLOOD_REPORT',
      doctorName: 'Dr. Emily Watson',
      facilityName: 'Quest Diagnostics Clinical Pathology Lab',
      documentDate: new Date('2026-02-01'),
      fileName: 'Comprehensive_Metabolic_Lipid_Panel_Report.pdf',
      fileType: 'application/pdf',
      fileSize: '2.2 MB',
      storageKey: 'vault/eld-01/lab/doc-v02-metabolic-panel.pdf',
      previewUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&q=80',
      tags: ['Lipids', 'HbA1c', 'Glucose', 'Blood Chemistry', 'Fasting'],
      notes: 'Fasting blood glucose: 108 mg/dL; HbA1c: 6.4%; Total Cholesterol: 185 mg/dL; Kidney function normal (eGFR > 75).',
      isArchived: false,
      uploadedById: 'usr-family-01',
      uploadedByName: 'Sarah Vance',
      uploadedByRole: 'FAMILY_ADMIN',
      createdAt: new Date('2026-02-01'),
      updatedAt: new Date('2026-02-01')
    },
    {
      id: 'doc-v03',
      elderlyId: 'eld-01',
      title: 'Resting 12-Lead ECG Rhythm Strip Analysis',
      category: 'DIAGNOSTIC_REPORT',
      doctorName: 'Dr. Elizabeth Adams',
      facilityName: 'St. Mary Cardiovascular Center',
      documentDate: new Date('2026-01-20'),
      fileName: 'Resting_12_Lead_ECG_Rhythm_Strip_Analysis.pdf',
      fileType: 'application/pdf',
      fileSize: '3.8 MB',
      storageKey: 'vault/eld-01/diag/doc-v03-ecg-rhythm.pdf',
      previewUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80',
      tags: ['ECG', 'Cardiology', 'Sinus Rhythm', 'Diagnostics'],
      notes: 'Normal sinus rhythm at 72 bpm. PR interval 160ms, QTc 410ms. No ST-segment elevation or ischemic changes observed.',
      isArchived: false,
      uploadedById: 'usr-doctor-01',
      uploadedByName: 'Dr. Elizabeth Adams',
      uploadedByRole: 'DOCTOR',
      createdAt: new Date('2026-01-20'),
      updatedAt: new Date('2026-01-20')
    },
    {
      id: 'doc-v04',
      elderlyId: 'eld-01',
      title: 'Annual Comprehensive Geriatric Health History Dossier',
      category: 'MEDICAL_HISTORY',
      doctorName: 'Dr. Robert Harrison',
      facilityName: 'Portland Senior Health Care Alliance',
      documentDate: new Date('2025-11-10'),
      fileName: 'Annual_Geriatric_Health_Assessment_History.pdf',
      fileType: 'application/pdf',
      fileSize: '4.2 MB',
      storageKey: 'vault/eld-01/history/doc-v04-annual-geriatric.pdf',
      previewUrl: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=600&q=80',
      tags: ['Annual Exam', 'Medical History', 'Immunizations', 'Chronic Care'],
      notes: 'Comprehensive annual record covering past medical history, family cardiac history, documented drug allergies (Penicillin), and baseline cognitive evaluation.',
      isArchived: false,
      uploadedById: 'usr-elderly-01',
      uploadedByName: 'Eleanor Vance',
      uploadedByRole: 'ELDERLY',
      createdAt: new Date('2025-11-10'),
      updatedAt: new Date('2025-11-10')
    },
    {
      id: 'doc-v05',
      elderlyId: 'eld-01',
      title: 'Physical Therapy Knee Mobility & Balance Discharge Summary',
      category: 'DISCHARGE_SUMMARY',
      doctorName: 'Dr. James Lin',
      facilityName: 'CareNest Wellness Rehabilitation Center',
      documentDate: new Date('2026-01-28'),
      fileName: 'Knee_Joint_Mobility_Rehabilitation_Discharge.pdf',
      fileType: 'application/pdf',
      fileSize: '1.9 MB',
      storageKey: 'vault/eld-01/discharge/doc-v05-pt-discharge.pdf',
      previewUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80',
      tags: ['Physical Therapy', 'Discharge Summary', 'Mobility', 'Gait'],
      notes: 'Discharge criteria achieved. Patient demonstrated independent ambulation with walker and satisfactory knee extension strength. Home exercise regime provided.',
      isArchived: false,
      uploadedById: 'usr-caregiver-01',
      uploadedByName: 'Marcus Chen',
      uploadedByRole: 'CAREGIVER',
      createdAt: new Date('2026-01-28'),
      updatedAt: new Date('2026-01-28')
    },
    {
      id: 'doc-v06',
      elderlyId: 'eld-01',
      title: 'Updated Influenza & Covid-19 Immunization Certificate',
      category: 'OTHER',
      doctorName: 'Nurse Practitioner Clara Oswald',
      facilityName: 'Springfield Community Health Clinic',
      documentDate: new Date('2025-10-14'),
      fileName: 'Covid19_Influenza_Immunization_Record.pdf',
      fileType: 'application/pdf',
      fileSize: '840 KB',
      storageKey: 'vault/eld-01/other/doc-v06-immunizations.pdf',
      previewUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80',
      tags: ['Immunizations', 'Vaccines', 'Preventative Care'],
      notes: 'Administered annual High-Dose Fluzone and updated Omicron booster. No adverse side effects reported.',
      isArchived: false,
      uploadedById: 'usr-family-01',
      uploadedByName: 'Sarah Vance',
      uploadedByRole: 'FAMILY_ADMIN',
      createdAt: new Date('2025-10-14'),
      updatedAt: new Date('2025-10-14')
    },
    {
      id: 'doc-v07',
      elderlyId: 'eld-01',
      title: 'Metformin Initial 250mg Titration Schedule (Superseded)',
      category: 'PRESCRIPTION',
      doctorName: 'Dr. Emily Watson',
      facilityName: 'Springfield Diabetes Clinic',
      documentDate: new Date('2025-06-12'),
      fileName: 'Metformin_Initial_Titration_Schedule_2025.pdf',
      fileType: 'application/pdf',
      fileSize: '1.1 MB',
      storageKey: 'vault/eld-01/archived/doc-v07-metformin-old.pdf',
      previewUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80',
      tags: ['Diabetes', 'Superseded', 'Archived Rx'],
      notes: 'Initial 250mg titration prescription. Superseded by current 500mg twice daily protocol on Jan 1, 2026.',
      isArchived: true,
      archivedAt: new Date('2026-01-01'),
      archivedById: 'usr-family-01',
      uploadedById: 'usr-family-01',
      uploadedByName: 'Sarah Vance',
      uploadedByRole: 'FAMILY_ADMIN',
      createdAt: new Date('2025-06-12'),
      updatedAt: new Date('2026-01-01')
    }
  ] as VaultDocument[],

  vaultAccessLogs: [
    {
      id: 'val-01',
      documentId: 'doc-v01',
      documentTitle: 'Quarterly Lisinopril & Atorvastatin Prescription',
      elderlyId: 'eld-01',
      actorId: 'usr-doctor-01',
      actorName: 'Dr. Elizabeth Adams',
      actorRole: 'DOCTOR',
      action: 'UPLOADED',
      details: 'Prescription document encrypted and uploaded to private clinical vault storage.',
      timestamp: new Date('2026-01-15T09:30:00Z')
    },
    {
      id: 'log-val-02',
      documentId: 'doc-v02',
      documentTitle: 'Comprehensive Metabolic Panel & Lipid Profile',
      elderlyId: 'eld-01',
      actorId: 'usr-family-01',
      actorName: 'Sarah Vance',
      actorRole: 'FAMILY_ADMIN',
      action: 'VIEWED',
      details: 'Reviewed blood chemistry panel and fasting glucose indicators.',
      timestamp: new Date('2026-02-01T14:15:00Z')
    },
    {
      id: 'log-val-03',
      documentId: 'doc-v03',
      documentTitle: 'Resting 12-Lead ECG Rhythm Strip Analysis',
      elderlyId: 'eld-01',
      actorId: 'usr-caregiver-01',
      actorName: 'Marcus Chen',
      actorRole: 'CAREGIVER',
      action: 'DOWNLOADED',
      details: 'Downloaded via 15-minute cryptographically signed download link for clinical appointment review.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      id: 'log-val-04',
      documentId: 'doc-v07',
      documentTitle: 'Metformin Initial 250mg Titration Schedule (Superseded)',
      elderlyId: 'eld-01',
      actorId: 'usr-family-01',
      actorName: 'Sarah Vance',
      actorRole: 'FAMILY_ADMIN',
      action: 'ARCHIVED',
      details: 'Moved to archived storage after prescription was upgraded to 500mg.',
      timestamp: new Date('2026-01-01T10:00:00Z')
    }
  ] as VaultAccessLog[],

  medicationSchedules: [
    {
      id: 'sch-01',
      medicationId: 'med-01',
      timeOfDay: '08:00',
      dosageOverride: '10mg',
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      label: 'Morning with Breakfast',
      isActive: true,
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01')
    },
    {
      id: 'sch-02a',
      medicationId: 'med-02',
      timeOfDay: '08:30',
      dosageOverride: '500mg',
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      label: 'Morning with Breakfast',
      isActive: true,
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01')
    },
    {
      id: 'sch-02b',
      medicationId: 'med-02',
      timeOfDay: '19:30',
      dosageOverride: '500mg',
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      label: 'Evening with Dinner',
      isActive: true,
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01')
    },
    {
      id: 'sch-03',
      medicationId: 'med-03',
      timeOfDay: '21:00',
      dosageOverride: '20mg',
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      label: 'Bedtime Dose',
      isActive: true,
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01')
    },
    {
      id: 'sch-04',
      medicationId: 'med-04',
      timeOfDay: '13:00',
      dosageOverride: '1000 IU',
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      label: 'Afternoon with Lunch',
      isActive: true,
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01')
    }
  ] as MemoryMedicationSchedule[],

  notifications: [
    {
      id: 'notif-01',
      userId: 'usr-elderly-01',
      elderlyId: 'eld-01',
      type: 'MEDICATION_REMINDER',
      title: 'Medication Reminder',
      message: 'Scheduled reminder to take Lisinopril 10mg with breakfast.',
      priority: 'NORMAL',
      channel: 'EMAIL',
      isRead: true,
      readAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      actionUrl: '/medications',
      metadata: {
        emailTo: 'eleanor.vance@carenest.health',
        deliveryStatus: 'SENT',
        medicationId: 'med-01',
        retryCount: 0
      },
      sentAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000)
    },
    {
      id: 'notif-02',
      userId: 'usr-family-01',
      elderlyId: 'eld-01',
      type: 'MEDICATION_CONFIRMATION',
      title: 'Medication Confirmed',
      message: 'Marcus Chen recorded Lisinopril 10mg as taken for Eleanor Vance.',
      priority: 'LOW',
      channel: 'EMAIL',
      isRead: false,
      actionUrl: '/medications',
      metadata: {
        emailTo: 'sarah.vance@carenest.health',
        deliveryStatus: 'SENT',
        medicationId: 'med-01',
        retryCount: 0
      },
      sentAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000)
    },
    {
      id: 'notif-03',
      userId: 'usr-family-01',
      elderlyId: 'eld-01',
      type: 'APPOINTMENT_REMINDER',
      title: 'Upcoming Appointment Tomorrow',
      message: 'Dr. Gregory House consultation scheduled tomorrow at 11:30 AM.',
      priority: 'NORMAL',
      channel: 'EMAIL',
      isRead: false,
      actionUrl: '/appointments',
      metadata: {
        emailTo: 'sarah.vance@carenest.health',
        deliveryStatus: 'SENT',
        appointmentId: 'apt-01',
        retryCount: 0
      },
      sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
    }
  ] as MemoryNotification[],

  notificationPreferences: [
    {
      id: 'pref-01',
      userId: 'usr-elderly-01',
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      medicationReminders: true,
      missedDoseAlerts: true,
      appointmentReminders: true,
      careActivityUpdates: true,
      emergencyAlerts: true,
      reminderLeadMinutes: 15,
      quietHoursEnabled: false,
      quietHoursStart: '22:00',
      quietHoursEnd: '07:00',
      createdAt: new Date('2026-01-10'),
      updatedAt: new Date('2026-01-10')
    },
    {
      id: 'pref-02',
      userId: 'usr-family-01',
      emailNotifications: true,
      smsNotifications: true,
      pushNotifications: true,
      medicationReminders: true,
      missedDoseAlerts: true,
      appointmentReminders: true,
      careActivityUpdates: true,
      emergencyAlerts: true,
      reminderLeadMinutes: 30,
      quietHoursEnabled: true,
      quietHoursStart: '23:00',
      quietHoursEnd: '06:30',
      createdAt: new Date('2026-01-10'),
      updatedAt: new Date('2026-01-10')
    },
    {
      id: 'pref-03',
      userId: 'usr-caregiver-01',
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      medicationReminders: true,
      missedDoseAlerts: true,
      appointmentReminders: true,
      careActivityUpdates: true,
      emergencyAlerts: true,
      reminderLeadMinutes: 15,
      quietHoursEnabled: false,
      createdAt: new Date('2026-01-12'),
      updatedAt: new Date('2026-01-12')
    }
  ] as MemoryNotificationPreference[]
};

