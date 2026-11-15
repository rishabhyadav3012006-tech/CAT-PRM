export enum UserRole {
  ELDERLY = 'ELDERLY',
  FAMILY_MEMBER = 'FAMILY_MEMBER',
  CAREGIVER = 'CAREGIVER',
  CARETAKER = 'CARETAKER',
  DOCTOR = 'DOCTOR',
  ADMIN = 'ADMIN'
}

export enum MemberRole {
  ELDERLY_SELF = 'ELDERLY_SELF',
  PRIMARY_CAREGIVER = 'PRIMARY_CAREGIVER',
  FAMILY_ADMIN = 'FAMILY_ADMIN',
  FAMILY_VIEWER = 'FAMILY_VIEWER',
  CARETAKER = 'CARETAKER',
  PHYSICIAN = 'PHYSICIAN'
}

export interface CareMemberPermissions {
  canManageMedications: boolean;
  canLogMedicationIntake: boolean;
  canManageAppointments: boolean;
  canViewVitals: boolean;
  canLogVitals: boolean;
  canManageCareTasks: boolean;
  canViewDocuments: boolean;
  canUploadDocuments: boolean;
  canInviteMembers: boolean;
  canTriggerEmergency: boolean;
}

export enum MedicationLogStatus {
  UPCOMING = 'UPCOMING',
  PENDING = 'PENDING',
  TAKEN = 'TAKEN',
  SKIPPED = 'SKIPPED',
  MISSED = 'MISSED',
  CANCELLED = 'CANCELLED',
  SNOOZED = 'SNOOZED'
}

export enum AppointmentStatus {
  UPCOMING = 'UPCOMING',
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  RESCHEDULED = 'RESCHEDULED'
}

export enum ActivityCategory {
  HYGIENE = 'HYGIENE',
  MEAL = 'MEAL',
  MOBILITY = 'MOBILITY',
  EXERCISE = 'EXERCISE',
  MENTAL_HEALTH = 'MENTAL_HEALTH',
  CHECKUP = 'CHECKUP',
  OTHER = 'OTHER'
}

export enum ActivityStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  SKIPPED = 'SKIPPED'
}

export enum MembershipStatus {
  ACTIVE = 'ACTIVE',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  REVOKED = 'REVOKED',
  REJECTED = 'REJECTED'
}

export enum InvitationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  EXPIRED = 'EXPIRED',
  REVOKED = 'REVOKED'
}

