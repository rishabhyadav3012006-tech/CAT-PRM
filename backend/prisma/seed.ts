// ==============================================================================
// CareNest Healthcare Platform - Complete Demonstration Database Seed Script
// Models: User, ElderlyProfile, CareMember, Invitation, Medication,
//         MedicationSchedule, MedicationLog, Appointment, MedicalRecord,
//         Notification, CareActivity, HealthLog, AuditLog, NotificationPreference
// ==============================================================================

import {
  PrismaClient,
  UserRole,
  MemberRole,
  MembershipStatus,
  InvitationStatus,
  MedicationCategory,
  MedicationForm,
  FoodRequirement,
  MedicationLogStatus,
  AppointmentStatus,
  VaultCategory,
  ActivityCategory,
  ActivityStatus,
  NotificationType,
  NotificationPriority,
  NotificationChannel,
  AuditAction
} from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Helper to hash demonstration invite codes
function hashInviteCode(code: string): string {
  return crypto.createHash('sha256').update(code.trim().toUpperCase()).digest('hex');
}

async function main() {
  console.log('🌱 Starting CareNest comprehensive PostgreSQL database seed...');

  // 1. Clear existing database records in reverse dependency order (if tables exist)
  try {
    await prisma.auditLog.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.notificationPreference.deleteMany();
    await prisma.emergencyAlert.deleteMany();
    await prisma.healthLog.deleteMany();
    await prisma.careActivity.deleteMany();
    await prisma.medicalRecord.deleteMany();
    await prisma.appointment.deleteMany();
    await prisma.medicationLog.deleteMany();
    await prisma.medicationSchedule.deleteMany();
    await prisma.medication.deleteMany();
    await prisma.invitation.deleteMany();
    await prisma.careMember.deleteMany();
    await prisma.elderlyProfile.deleteMany();
    await prisma.user.deleteMany();
    console.log('🧹 Cleaned existing database records.');
  } catch (err: any) {
    console.log('ℹ️ Clean skipped or tables not yet populated:', err.message);
  }

  const defaultPasswordHash = await bcrypt.hash('Password123!', 10);

  // ============================================================================
  // 1. CREATE USERS (Elderly, Family Admin, Caretaker, Physician)
  // ============================================================================
  console.log('👤 Seeding CareNest Users...');

  // User 1: Eleanor Vance (Elderly Individual)
  const eleanorUser = await prisma.user.create({
    data: {
      id: 'usr-elderly-01',
      email: 'eleanor.vance@carenest.health',
      password: defaultPasswordHash,
      fullName: 'Eleanor Vance',
      phone: '+1 (555) 234-5678',
      role: UserRole.ELDERLY,
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80',
      timeZone: 'America/New_York',
      isEmailVerified: true,
      isActive: true,
      lastLoginAt: new Date(),
    }
  });

  // User 2: Sarah Vance (Daughter / Family Administrator)
  const sarahUser = await prisma.user.create({
    data: {
      id: 'usr-family-01',
      email: 'sarah.vance@carenest.health',
      password: defaultPasswordHash,
      fullName: 'Sarah Vance',
      phone: '+1 (555) 345-6789',
      role: UserRole.FAMILY_MEMBER,
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
      timeZone: 'America/New_York',
      isEmailVerified: true,
      isActive: true,
      lastLoginAt: new Date(),
    }
  });

  // User 3: Marcus Chen (Licensed Geriatric Caretaker)
  const marcusUser = await prisma.user.create({
    data: {
      id: 'usr-caretaker-01',
      email: 'marcus.chen@carenest.health',
      password: defaultPasswordHash,
      fullName: 'Marcus Chen',
      phone: '+1 (555) 456-7890',
      role: UserRole.CARETAKER,
      avatarUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=256&q=80',
      timeZone: 'America/New_York',
      isEmailVerified: true,
      isActive: true,
      lastLoginAt: new Date(),
    }
  });

  // User 4: Dr. Robert Harrison (Primary Cardiologist)
  const doctorUser = await prisma.user.create({
    data: {
      id: 'usr-doctor-01',
      email: 'dr.harrison@carenest.health',
      password: defaultPasswordHash,
      fullName: 'Dr. Robert Harrison, MD',
      phone: '+1 (555) 789-0123',
      role: UserRole.DOCTOR,
      avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=256&q=80',
      timeZone: 'America/New_York',
      isEmailVerified: true,
      isActive: true,
      lastLoginAt: new Date(),
    }
  });

  // ============================================================================
  // 2. CREATE ELDERLY PROFILE (Eleanor Vance)
  // ============================================================================
  console.log('👵 Seeding Elderly Clinical Profile...');

  const elderlyProfile = await prisma.elderlyProfile.create({
    data: {
      id: 'eld-01',
      userId: eleanorUser.id,
      dateOfBirth: new Date('1948-04-12T00:00:00Z'),
      gender: 'Female',
      bloodGroup: 'O+',
      allergies: ['Penicillin', 'Sulfa Drugs'],
      chronicConditions: ['Hypertension', 'Type 2 Diabetes', 'Mild Osteoarthritis'],
      address: '742 Evergreen Terrace, Springfield, OR',
      timeZone: 'America/New_York',
      primaryDoctorName: 'Dr. Robert Harrison, MD',
      primaryDoctorContact: '+1 (555) 789-0123',
      emergencyContactName: 'Sarah Vance',
      emergencyContactPhone: '+1 (555) 345-6789',
      emergencyContactRelation: 'Daughter',
      mobilityStatus: 'Assisted Walk (Uses Cane)',
      dietaryRestrictions: 'Low sodium, Diabetic-conscious, Mediterranean diet',
      notes: 'Prefers morning medication with warm oatmeal. Regular blood pressure check required before evening dose.'
    }
  });

  // ============================================================================
  // 3. CREATE CARE MEMBERS (Multi-User Collaboration & Permissions)
  // ============================================================================
  console.log('👨‍👩‍👧 Seeding Care Circle Members & Granular Permissions...');

  // Eleanor herself (Primary Self-Management)
  await prisma.careMember.create({
    data: {
      id: 'mem-01',
      elderlyId: elderlyProfile.id,
      userId: eleanorUser.id,
      role: MemberRole.ELDERLY_SELF,
      relationship: 'Self',
      status: MembershipStatus.ACTIVE,
      canManageMedications: true,
      canLogMedicationIntake: true,
      canManageAppointments: true,
      canViewVitals: true,
      canLogVitals: true,
      canManageCareTasks: true,
      canViewDocuments: true,
      canUploadDocuments: true,
      canInviteMembers: true,
      canTriggerEmergency: true
    }
  });

  // Sarah Vance (Family Administrator)
  await prisma.careMember.create({
    data: {
      id: 'mem-02',
      elderlyId: elderlyProfile.id,
      userId: sarahUser.id,
      role: MemberRole.FAMILY_ADMIN,
      relationship: 'Daughter',
      status: MembershipStatus.ACTIVE,
      canManageMedications: true,
      canLogMedicationIntake: true,
      canManageAppointments: true,
      canViewVitals: true,
      canLogVitals: true,
      canManageCareTasks: true,
      canViewDocuments: true,
      canUploadDocuments: true,
      canInviteMembers: true,
      canTriggerEmergency: true
    }
  });

  // Marcus Chen (Assigned Day Caretaker)
  await prisma.careMember.create({
    data: {
      id: 'mem-03',
      elderlyId: elderlyProfile.id,
      userId: marcusUser.id,
      role: MemberRole.CARETAKER,
      relationship: 'Certified Senior Caregiver',
      status: MembershipStatus.ACTIVE,
      shiftStart: '08:00',
      shiftEnd: '17:00',
      notes: 'Mon-Fri primary daytime shift caregiver.',
      canManageMedications: false,
      canLogMedicationIntake: true,
      canManageAppointments: false,
      canViewVitals: true,
      canLogVitals: true,
      canManageCareTasks: true,
      canViewDocuments: true,
      canUploadDocuments: true,
      canInviteMembers: false,
      canTriggerEmergency: true
    }
  });

  // Dr. Robert Harrison (Consulting Physician)
  await prisma.careMember.create({
    data: {
      id: 'mem-04',
      elderlyId: elderlyProfile.id,
      userId: doctorUser.id,
      role: MemberRole.PHYSICIAN,
      relationship: 'Primary Cardiologist',
      status: MembershipStatus.ACTIVE,
      canManageMedications: true,
      canLogMedicationIntake: false,
      canManageAppointments: true,
      canViewVitals: true,
      canLogVitals: false,
      canManageCareTasks: false,
      canViewDocuments: true,
      canUploadDocuments: true,
      canInviteMembers: false,
      canTriggerEmergency: false
    }
  });

  // ============================================================================
  // 4. CREATE INVITATIONS (Secure Expiring Single-Use Invites)
  // ============================================================================
  console.log('✉️ Seeding Care Circle Invitations...');

  const sampleInviteCode = 'NEST-83DD-9363';
  await prisma.invitation.create({
    data: {
      id: 'inv-01',
      elderlyId: elderlyProfile.id,
      invitedByUserId: sarahUser.id,
      inviteCodeHash: hashInviteCode(sampleInviteCode),
      inviteCodeMask: 'NEST-****-9363',
      targetEmail: 'emily.vance@carenest.health',
      assignedRole: MemberRole.FAMILY_VIEWER,
      status: InvitationStatus.PENDING,
      expiresAt: new Date(Date.now() + 48 * 3600 * 1000), // 48 hours expiry
      permissions: {
        canViewVitals: true,
        canViewDocuments: true,
        canLogMedicationIntake: false
      }
    }
  });

  // ============================================================================
  // 5. CREATE MEDICATIONS & SCHEDULES
  // ============================================================================
  console.log('💊 Seeding Medications & Recurrence Schedules...');

  // Medication 1: Lisinopril
  const lisinopril = await prisma.medication.create({
    data: {
      id: 'med-01',
      elderlyId: elderlyProfile.id,
      createdById: doctorUser.id,
      name: 'Lisinopril',
      genericName: 'Lisinopril Dihydrate',
      category: MedicationCategory.CARDIOVASCULAR,
      dosage: '10mg',
      form: MedicationForm.TABLET,
      instructions: 'Take 1 tablet every morning with a full glass of water. Monitor blood pressure weekly.',
      foodRequirement: FoodRequirement.AFTER_FOOD,
      startDate: new Date('2026-01-01T00:00:00Z'),
      stockQuantity: 28,
      refillReminderThreshold: 7,
      isActive: true,
      schedules: {
        create: [
          {
            id: 'sch-01',
            timeOfDay: '08:00',
            dosageOverride: '10mg',
            label: 'Morning Dose with Breakfast',
            daysOfWeek: [0, 1, 2, 3, 4, 5, 6]
          }
        ]
      }
    }
  });

  // Medication 2: Metformin
  const metformin = await prisma.medication.create({
    data: {
      id: 'med-02',
      elderlyId: elderlyProfile.id,
      createdById: doctorUser.id,
      name: 'Metformin',
      genericName: 'Metformin Hydrochloride Extended-Release',
      category: MedicationCategory.DIABETES,
      dosage: '500mg',
      form: MedicationForm.TABLET,
      instructions: 'Take twice daily with meals to avoid gastrointestinal upset.',
      foodRequirement: FoodRequirement.WITH_FOOD,
      startDate: new Date('2026-01-01T00:00:00Z'),
      stockQuantity: 44,
      refillReminderThreshold: 10,
      isActive: true,
      schedules: {
        create: [
          {
            id: 'sch-02a',
            timeOfDay: '08:30',
            dosageOverride: '500mg',
            label: 'Morning with Breakfast',
            daysOfWeek: [0, 1, 2, 3, 4, 5, 6]
          },
          {
            id: 'sch-02b',
            timeOfDay: '19:30',
            dosageOverride: '500mg',
            label: 'Evening with Dinner',
            daysOfWeek: [0, 1, 2, 3, 4, 5, 6]
          }
        ]
      }
    }
  });

  // Medication 3: Atorvastatin
  const atorvastatin = await prisma.medication.create({
    data: {
      id: 'med-03',
      elderlyId: elderlyProfile.id,
      createdById: doctorUser.id,
      name: 'Atorvastatin',
      genericName: 'Atorvastatin Calcium',
      category: MedicationCategory.CARDIOVASCULAR,
      dosage: '20mg',
      form: MedicationForm.TABLET,
      instructions: 'Take at bedtime. Avoid grapefruit juice.',
      foodRequirement: FoodRequirement.NO_RESTRICTION,
      startDate: new Date('2026-01-01T00:00:00Z'),
      stockQuantity: 18,
      refillReminderThreshold: 5,
      isActive: true,
      schedules: {
        create: [
          {
            id: 'sch-03',
            timeOfDay: '21:00',
            dosageOverride: '20mg',
            label: 'Bedtime Dose',
            daysOfWeek: [0, 1, 2, 3, 4, 5, 6]
          }
        ]
      }
    }
  });

  // Medication 4: Vitamin D3
  const vitaminD = await prisma.medication.create({
    data: {
      id: 'med-04',
      elderlyId: elderlyProfile.id,
      createdById: sarahUser.id,
      name: 'Vitamin D3 & Calcium',
      genericName: 'Cholecalciferol',
      category: MedicationCategory.SUPPLEMENT,
      dosage: '1000 IU',
      form: MedicationForm.CAPSULE,
      instructions: 'Supports bone density and calcium absorption.',
      foodRequirement: FoodRequirement.AFTER_FOOD,
      startDate: new Date('2026-01-01T00:00:00Z'),
      stockQuantity: 52,
      refillReminderThreshold: 10,
      isActive: true,
      schedules: {
        create: [
          {
            id: 'sch-04',
            timeOfDay: '13:00',
            dosageOverride: '1000 IU',
            label: 'Afternoon with Lunch',
            daysOfWeek: [0, 1, 2, 3, 4, 5, 6]
          }
        ]
      }
    }
  });

  // ============================================================================
  // 6. CREATE MEDICATION LOGS (Adherence History & Accountability)
  // ============================================================================
  console.log('📋 Seeding Medication History Logs...');

  const todayStr = new Date().toISOString().split('T')[0];

  // Log 1: Lisinopril Taken this morning
  await prisma.medicationLog.create({
    data: {
      id: 'log-01',
      medicationId: lisinopril.id,
      scheduleId: 'sch-01',
      scheduledFor: new Date(`${todayStr}T08:00:00Z`),
      takenAt: new Date(`${todayStr}T08:08:00Z`),
      status: MedicationLogStatus.TAKEN,
      recordedById: eleanorUser.id,
      recordedByName: 'Eleanor Vance',
      recordedByRole: 'ELDERLY',
      dosageTaken: '10mg',
      notes: 'Taken on time with morning breakfast and water.',
      isConfirmed: true
    }
  });

  // Log 2: Metformin Taken this morning by Caretaker Marcus
  await prisma.medicationLog.create({
    data: {
      id: 'log-02',
      medicationId: metformin.id,
      scheduleId: 'sch-02a',
      scheduledFor: new Date(`${todayStr}T08:30:00Z`),
      takenAt: new Date(`${todayStr}T08:35:00Z`),
      status: MedicationLogStatus.TAKEN,
      recordedById: marcusUser.id,
      recordedByName: 'Marcus Chen',
      recordedByRole: 'CARETAKER',
      dosageTaken: '500mg',
      notes: 'Administered with whole grain toast and tea.',
      isConfirmed: true
    }
  });

  // Log 3: Vitamin D3 Pending for today afternoon
  await prisma.medicationLog.create({
    data: {
      id: 'log-03',
      medicationId: vitaminD.id,
      scheduleId: 'sch-04',
      scheduledFor: new Date(`${todayStr}T13:00:00Z`),
      status: MedicationLogStatus.PENDING,
      dosageTaken: '1000 IU'
    }
  });

  // Log 4: Yesterday skipped dose demonstration
  const yesterday = new Date(Date.now() - 24 * 3600 * 1000).toISOString().split('T')[0];
  await prisma.medicationLog.create({
    data: {
      id: 'log-04',
      medicationId: vitaminD.id,
      scheduleId: 'sch-04',
      scheduledFor: new Date(`${yesterday}T13:00:00Z`),
      status: MedicationLogStatus.SKIPPED,
      recordedById: marcusUser.id,
      recordedByName: 'Marcus Chen',
      recordedByRole: 'CARETAKER',
      skipReason: 'Patient reported mild stomach discomfort after lunch; advised to skip afternoon supplement.',
      notes: 'Notified Sarah via CareNest messaging.'
    }
  });

  // ============================================================================
  // 7. CREATE APPOINTMENTS
  // ============================================================================
  console.log('🩺 Seeding Doctor Appointments...');

  // Appointment 1: Upcoming Cardiology Follow-up
  await prisma.appointment.create({
    data: {
      id: 'apt-01',
      elderlyId: elderlyProfile.id,
      createdById: doctorUser.id,
      doctorName: 'Dr. Robert Harrison, MD',
      specialty: 'Cardiology & Heart Health',
      hospital: 'Springfield Memorial Heart Institute',
      location: 'Suite 400, 100 Medical Center Blvd, Springfield',
      contactPhone: '+1 (555) 789-0123',
      scheduledAt: new Date(Date.now() + 3 * 24 * 3600 * 1000), // In 3 days
      durationMinutes: 45,
      status: AppointmentStatus.UPCOMING,
      reminderSent: true,
      consultationNotes: 'Quarterly review of blood pressure management and cholesterol panel results.'
    }
  });

  // Appointment 2: Upcoming Endocrinology Checkup
  await prisma.appointment.create({
    data: {
      id: 'apt-02',
      elderlyId: elderlyProfile.id,
      createdById: sarahUser.id,
      doctorName: 'Dr. Evelyn Reed',
      specialty: 'Endocrinology & Diabetes',
      hospital: 'Mercy Wellness Clinic',
      location: 'Room 210, 45 Health Park Way, Springfield',
      contactPhone: '+1 (555) 678-9012',
      scheduledAt: new Date(Date.now() + 10 * 24 * 3600 * 1000), // In 10 days
      durationMinutes: 30,
      status: AppointmentStatus.UPCOMING,
      reminderSent: false,
      consultationNotes: 'HbA1c quarterly monitoring and diabetic dietary review.'
    }
  });

  // Appointment 3: Past Completed Visit
  await prisma.appointment.create({
    data: {
      id: 'apt-03',
      elderlyId: elderlyProfile.id,
      createdById: sarahUser.id,
      doctorName: 'Dr. Arthur Pendelton',
      specialty: 'Ophthalmology',
      hospital: 'ClearSight Eye Clinic',
      location: '12 Vision Blvd, Springfield',
      contactPhone: '+1 (555) 890-1234',
      scheduledAt: new Date(Date.now() - 30 * 24 * 3600 * 1000), // 30 days ago
      durationMinutes: 30,
      status: AppointmentStatus.COMPLETED,
      reminderSent: true,
      consultationNotes: 'Vision stable; mild cataracts checked. New reading prescription provided.'
    }
  });

  // ============================================================================
  // 8. CREATE MEDICAL RECORDS (Vault: All 6 Categories)
  // ============================================================================
  console.log('📁 Seeding Medical Records & Prescription Vault...');

  const sampleVaultDocs = [
    {
      id: 'doc-01',
      title: 'Official Lisinopril & Metformin Prescription',
      category: VaultCategory.PRESCRIPTION,
      fileUrl: 'private://vault/eld-01/doc-01-prescription-2026.pdf',
      fileHash: crypto.createHash('sha256').update('doc-01-content').digest('hex'),
      fileName: 'Lisinopril_Metformin_Rx_2026.pdf',
      fileExtension: '.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 1420500,
      doctorName: 'Dr. Robert Harrison, MD',
      facilityName: 'Springfield Memorial Heart Institute',
      documentDate: new Date('2026-01-10T10:00:00Z'),
      tags: ['Prescription', 'Cardiology', 'Active Rx'],
      summary: 'Standard ongoing refill prescription for blood pressure and glycemic stability.'
    },
    {
      id: 'doc-02',
      title: 'Comprehensive Metabolic & Lipid Blood Panel',
      category: VaultCategory.BLOOD_REPORT,
      fileUrl: 'private://vault/eld-01/doc-02-lipid-panel-2026.pdf',
      fileHash: crypto.createHash('sha256').update('doc-02-content').digest('hex'),
      fileName: 'Comprehensive_Lipid_Panel_Jan2026.pdf',
      fileExtension: '.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 2840000,
      doctorName: 'Dr. Evelyn Reed',
      facilityName: 'Quest Diagnostics Central Lab',
      documentDate: new Date('2026-01-15T09:30:00Z'),
      tags: ['Lipid Panel', 'Cholesterol', 'HbA1c', 'Lab Results'],
      summary: 'Total cholesterol 178 mg/dL (Normal). HbA1c 6.4% demonstrating good glycemic control.'
    },
    {
      id: 'doc-03',
      title: 'Comprehensive Geriatric Medical History & Intake',
      category: VaultCategory.MEDICAL_HISTORY,
      fileUrl: 'private://vault/eld-01/doc-03-medical-history.pdf',
      fileHash: crypto.createHash('sha256').update('doc-03-content').digest('hex'),
      fileName: 'Eleanor_Vance_Clinical_History_Summary.pdf',
      fileExtension: '.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 3105000,
      doctorName: 'Dr. Robert Harrison, MD',
      facilityName: 'Springfield General Hospital',
      documentDate: new Date('2025-11-20T14:00:00Z'),
      tags: ['History', 'Intake', 'Allergies', 'Surgical'],
      summary: 'Baseline health ledger documenting appendectomy (1982), osteoarthritis onset (2018), and hypertension management.'
    },
    {
      id: 'doc-04',
      title: 'Transthoracic Echocardiogram (Echo) Diagnostic Report',
      category: VaultCategory.DIAGNOSTIC_REPORT,
      fileUrl: 'private://vault/eld-01/doc-04-echocardiogram.pdf',
      fileHash: crypto.createHash('sha256').update('doc-04-content').digest('hex'),
      fileName: 'Transthoracic_Echo_Imaging_Dec2025.pdf',
      fileExtension: '.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 4520000,
      doctorName: 'Dr. Arthur Martinez, Cardiothoracic Imaging',
      facilityName: 'Pacific Cardiac Diagnostic Center',
      documentDate: new Date('2025-12-05T11:15:00Z'),
      tags: ['Diagnostic', 'Echocardiogram', 'Ultrasound', 'Cardiac'],
      summary: 'Ejection fraction 60-65% (Normal). Mild aortic valve sclerosis without significant stenosis.'
    },
    {
      id: 'doc-05',
      title: 'Post-Observation Hospital Discharge Summary',
      category: VaultCategory.DISCHARGE_SUMMARY,
      fileUrl: 'private://vault/eld-01/doc-05-discharge-summary.pdf',
      fileHash: crypto.createHash('sha256').update('doc-05-content').digest('hex'),
      fileName: 'Hospital_Discharge_Care_Plan_2025.pdf',
      fileExtension: '.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 1850000,
      doctorName: 'Dr. Sarah Al-Mansoor, MD',
      facilityName: 'Springfield Memorial Hospital Inpatient Care',
      documentDate: new Date('2025-10-14T16:00:00Z'),
      tags: ['Discharge', 'Care Plan', 'Inpatient'],
      summary: 'Full discharge notes following 24h hydration observation. Stable discharge status.'
    },
    {
      id: 'doc-06',
      title: 'Medicare Part B & Supplemental Insurance Policy Card',
      category: VaultCategory.OTHER,
      fileUrl: 'private://vault/eld-01/doc-06-medicare-card.jpg',
      fileHash: crypto.createHash('sha256').update('doc-06-content').digest('hex'),
      fileName: 'Medicare_PartB_Card_Copy.jpg',
      fileExtension: '.jpg',
      mimeType: 'image/jpeg',
      sizeBytes: 890000,
      facilityName: 'Centers for Medicare & Medicaid Services',
      documentDate: new Date('2026-01-01T00:00:00Z'),
      tags: ['Insurance', 'Medicare', 'Identification'],
      summary: 'Official card copy for clinic check-ins and laboratory verifications.'
    }
  ];

  for (const doc of sampleVaultDocs) {
    await prisma.medicalRecord.create({
      data: {
        id: doc.id,
        elderlyId: elderlyProfile.id,
        uploadedById: sarahUser.id,
        title: doc.title,
        category: doc.category,
        fileUrl: doc.fileUrl,
        fileHash: doc.fileHash,
        fileName: doc.fileName,
        fileExtension: doc.fileExtension,
        mimeType: doc.mimeType,
        sizeBytes: doc.sizeBytes,
        doctorName: doc.doctorName,
        facilityName: doc.facilityName,
        documentDate: doc.documentDate,
        tags: doc.tags,
        summary: doc.summary,
        isArchived: false
      }
    });
  }

  // ============================================================================
  // 9. CREATE CARE ACTIVITIES (Daily Routine & Senior Care)
  // ============================================================================
  console.log('🚶 Seeding Daily Care Tasks...');

  await prisma.careActivity.create({
    data: {
      id: 'act-01',
      elderlyId: elderlyProfile.id,
      createdById: sarahUser.id,
      assignedToId: marcusUser.id,
      completedById: marcusUser.id,
      title: 'Gentle Morning Garden Walk (15 minutes)',
      description: 'Assisted walk around the sunny backyard garden for fresh air and joint mobility.',
      category: ActivityCategory.MOBILITY,
      scheduledDate: new Date(`${todayStr}T00:00:00Z`),
      scheduledTime: '09:30',
      status: ActivityStatus.COMPLETED,
      completedAt: new Date(`${todayStr}T09:45:00Z`),
      notes: 'Eleanor walked smoothly with cane assistance; cheerful mood.'
    }
  });

  await prisma.careActivity.create({
    data: {
      id: 'act-02',
      elderlyId: elderlyProfile.id,
      createdById: sarahUser.id,
      assignedToId: marcusUser.id,
      title: 'Afternoon Hydration & Herbal Tea',
      description: 'Ensure 350ml of warm water or chamomile tea is consumed.',
      category: ActivityCategory.MEAL,
      scheduledDate: new Date(`${todayStr}T00:00:00Z`),
      scheduledTime: '14:30',
      status: ActivityStatus.PENDING,
      notes: 'Low sodium snack accompanied.'
    }
  });

  await prisma.careActivity.create({
    data: {
      id: 'act-03',
      elderlyId: elderlyProfile.id,
      createdById: sarahUser.id,
      assignedToId: marcusUser.id,
      title: 'Brain Agility Crossword & Memory Game',
      description: '15-20 minutes of leisurely crossword or photo album conversation.',
      category: ActivityCategory.MENTAL_HEALTH,
      scheduledDate: new Date(`${todayStr}T00:00:00Z`),
      scheduledTime: '16:00',
      status: ActivityStatus.PENDING
    }
  });

  // ============================================================================
  // 10. CREATE HEALTH LOGS (Biometric Telehealth Readings)
  // ============================================================================
  console.log('📊 Seeding Biometric Health Telemetry Logs...');

  const healthReadings = [
    {
      systolicBp: 122,
      diastolicBp: 78,
      bloodGlucose: 104,
      heartRate: 72,
      oxygenSaturation: 98.5,
      bodyTemperature: 98.4,
      weight: 64.5,
      recordedAt: new Date(Date.now() - 3 * 3600 * 1000), // 3 hours ago
      notes: 'Morning vitals steady and comfortably within target clinical thresholds.'
    },
    {
      systolicBp: 126,
      diastolicBp: 80,
      bloodGlucose: 112,
      heartRate: 74,
      oxygenSaturation: 98.0,
      bodyTemperature: 98.6,
      weight: 64.6,
      recordedAt: new Date(Date.now() - 24 * 3600 * 1000), // Yesterday
      notes: 'Post-lunch vitals check.'
    },
    {
      systolicBp: 124,
      diastolicBp: 79,
      bloodGlucose: 108,
      heartRate: 70,
      oxygenSaturation: 99.0,
      bodyTemperature: 98.5,
      weight: 64.5,
      recordedAt: new Date(Date.now() - 48 * 3600 * 1000), // 2 days ago
      notes: 'Routine morning biometric log.'
    }
  ];

  for (let i = 0; i < healthReadings.length; i++) {
    const reading = healthReadings[i];
    await prisma.healthLog.create({
      data: {
        id: `hl-0${i + 1}`,
        elderlyId: elderlyProfile.id,
        recordedById: marcusUser.id,
        recordedAt: reading.recordedAt,
        systolicBp: reading.systolicBp,
        diastolicBp: reading.diastolicBp,
        bloodGlucose: reading.bloodGlucose,
        heartRate: reading.heartRate,
        oxygenSaturation: reading.oxygenSaturation,
        bodyTemperature: reading.bodyTemperature,
        weight: reading.weight,
        isAlert: false,
        notes: reading.notes
      }
    });
  }

  // ============================================================================
  // 11. CREATE NOTIFICATIONS
  // ============================================================================
  console.log('🔔 Seeding In-App & Push Notifications...');

  await prisma.notification.create({
    data: {
      id: 'notif-01',
      userId: eleanorUser.id,
      elderlyId: elderlyProfile.id,
      type: NotificationType.MEDICATION_REMINDER,
      title: 'Time for Morning Lisinopril (10mg)',
      message: 'Please take 1 tablet with breakfast and a glass of water.',
      priority: NotificationPriority.HIGH,
      channel: NotificationChannel.IN_APP,
      isRead: true,
      readAt: new Date(`${todayStr}T08:05:00Z`),
      actionUrl: '/medications'
    }
  });

  await prisma.notification.create({
    data: {
      id: 'notif-02',
      userId: sarahUser.id,
      elderlyId: elderlyProfile.id,
      type: NotificationType.APPOINTMENT_REMINDER,
      title: 'Upcoming Cardiology Consultation in 3 Days',
      message: 'Dr. Robert Harrison at Springfield Memorial Heart Institute on Thursday at 10:00 AM.',
      priority: NotificationPriority.NORMAL,
      channel: NotificationChannel.EMAIL,
      isRead: false,
      actionUrl: '/appointments'
    }
  });

  await prisma.notification.create({
    data: {
      id: 'notif-03',
      userId: marcusUser.id,
      elderlyId: elderlyProfile.id,
      type: NotificationType.CARE_ACTIVITY_DUE,
      title: 'Hydration Check Due at 2:30 PM',
      message: 'Afternoon hydration and herbal tea break for Eleanor.',
      priority: NotificationPriority.NORMAL,
      channel: NotificationChannel.IN_APP,
      isRead: false,
      actionUrl: '/activities'
    }
  });

  // ============================================================================
  // 12. CREATE NOTIFICATION PREFERENCES
  // ============================================================================
  console.log('⚙️ Seeding User Notification Preferences...');

  const users = [eleanorUser, sarahUser, marcusUser, doctorUser];
  for (const u of users) {
    await prisma.notificationPreference.create({
      data: {
        id: `pref-${u.id}`,
        userId: u.id,
        emailNotifications: true,
        smsNotifications: u.role === UserRole.FAMILY_MEMBER,
        pushNotifications: true,
        medicationReminders: true,
        missedDoseAlerts: true,
        appointmentReminders: true,
        careActivityUpdates: true,
        emergencyAlerts: true,
        reminderLeadMinutes: 15,
        quietHoursEnabled: true,
        quietHoursStart: '22:00',
        quietHoursEnd: '07:00'
      }
    });
  }

  // ============================================================================
  // 13. CREATE AUDIT LOGS (HIPAA & Security Compliance)
  // ============================================================================
  console.log('🛡️ Seeding Security Audit Logs...');

  const auditEvents = [
    {
      actorId: eleanorUser.id,
      action: AuditAction.LOGIN,
      entityType: 'User',
      entityId: eleanorUser.id,
      description: 'Eleanor Vance logged in via secure biometric password session.',
      ipAddress: '192.168.1.105',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X)'
    },
    {
      actorId: sarahUser.id,
      action: AuditAction.CREATE,
      entityType: 'MedicalRecord',
      entityId: 'doc-01',
      description: 'Uploaded official Lisinopril prescription to Medical Vault.',
      ipAddress: '192.168.1.42',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_3_1)'
    },
    {
      actorId: marcusUser.id,
      action: AuditAction.UPDATE,
      entityType: 'MedicationLog',
      entityId: 'log-02',
      description: 'Logged morning Metformin 500mg intake for Eleanor Vance.',
      ipAddress: '192.168.1.88',
      userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_4 like Mac OS X)'
    },
    {
      actorId: sarahUser.id,
      action: AuditAction.INVITE_SENT,
      entityType: 'Invitation',
      entityId: 'inv-01',
      description: 'Dispatched single-use expiring Care Circle invitation code NEST-****-9363 to emily.vance@carenest.health.',
      ipAddress: '192.168.1.42',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_3_1)'
    }
  ];

  for (let i = 0; i < auditEvents.length; i++) {
    const a = auditEvents[i];
    await prisma.auditLog.create({
      data: {
        id: `aud-0${i + 1}`,
        elderlyId: elderlyProfile.id,
        actorId: a.actorId,
        action: a.action,
        entityType: a.entityType,
        entityId: a.entityId,
        description: a.description,
        ipAddress: a.ipAddress,
        userAgent: a.userAgent
      }
    });
  }

  // ============================================================================
  // 14. CREATE COMPLEMENTARY RESOLVED EMERGENCY ALERT (Demonstration)
  // ============================================================================
  await prisma.emergencyAlert.create({
    data: {
      id: 'alert-demo-01',
      elderlyId: elderlyProfile.id,
      triggeredById: eleanorUser.id,
      triggeredAt: new Date(Date.now() - 14 * 24 * 3600 * 1000), // 14 days ago
      type: 'SOS_BUTTON',
      message: 'Accidental touch during pendant cleaning; patient safe and uninjured.',
      latitude: 44.0521,
      longitude: -123.0868,
      resolved: true,
      resolvedAt: new Date(Date.now() - 14 * 24 * 3600 * 1000 + 180000), // 3 min later
      resolvedNotes: 'Confirmed false alarm via direct phone check with Eleanor.'
    }
  });

  console.log('✅ CareNest database seed successfully completed!');
  console.log('   - 4 Users with hashed credentials');
  console.log('   - 1 Elderly Profile (Eleanor Vance)');
  console.log('   - 4 Care Members with granular permissions');
  console.log('   - 1 Secure Expiring Invitation (hashed token)');
  console.log('   - 4 Medications with 5 recurrent Schedules');
  console.log('   - 4 Medication History Logs');
  console.log('   - 3 Doctor Appointments');
  console.log('   - 6 Categorized Medical Vault Documents');
  console.log('   - 3 Daily Care Tasks');
  console.log('   - 3 Biometric Health Logs');
  console.log('   - 3 In-App / Push Notifications');
  console.log('   - 4 User Notification Preferences');
  console.log('   - 4 Security & Access Audit Logs');
  console.log('   - 1 Resolved Emergency Alert');
}

main()
  .catch((e) => {
    console.error('❌ Error during CareNest database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
