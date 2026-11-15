import { Request } from 'express';
import { UserRole } from '../constants/roles.js';
import { JwtUserPayload } from '../utils/jwt.js';

export interface AuthenticatedRequest extends Request {
  user?: JwtUserPayload;
}

export interface ElderlyProfileDTO {
  id: string;
  userId: string;
  dateOfBirth?: Date | string;
  bloodGroup?: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  allergies: string[];
  chronicConditions: string[];
  address?: string;
  mobilityStatus?: string;
  notes?: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
}

export interface MedicationDTO {
  id: string;
  elderlyId: string;
  createdById: string;
  name: string;
  dosage: string;
  frequency: string;
  scheduledTimes: string[];
  instructions?: string;
  startDate: string;
  endDate?: string;
  stockQuantity: number;
  refillReminderThreshold: number;
  isActive: boolean;
}

export interface MedicationLogDTO {
  id: string;
  medicationId: string;
  scheduledFor: string;
  takenAt?: string;
  status: 'PENDING' | 'TAKEN' | 'MISSED' | 'SNOOZED';
  loggedById?: string;
  notes?: string;
}

export interface AppointmentDTO {
  id: string;
  elderlyId: string;
  createdById: string;
  doctorName: string;
  specialty: string;
  location: string;
  appointmentDate: string;
  reminderSent: boolean;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
}

export interface HealthRecordDTO {
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
}

export interface CareActivityDTO {
  id: string;
  elderlyId: string;
  createdById: string;
  assignedToId?: string;
  title: string;
  description?: string;
  category: 'HYGIENE' | 'MEAL' | 'MOBILITY' | 'EXERCISE' | 'MENTAL_HEALTH' | 'CHECKUP' | 'OTHER';
  scheduledDate: string;
  scheduledTime: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';
  completedAt?: string;
  notes?: string;
}

export interface EmergencyAlertDTO {
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
}

