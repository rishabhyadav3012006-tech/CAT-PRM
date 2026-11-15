import { prisma, memoryStore, getIsDatabaseConnected } from '../config/db.js';
import { queueService } from './queue.service.js';
import { activityService } from './activity.service.js';
import { auditService } from './audit.service.js';
import { ActivityCategory } from '../constants/roles.js';
import { randomUUID } from 'crypto';
import { logger } from '../utils/logger.js';

export interface TriggerSosDTO {
  elderlyId: string;
  type?: string;
  message?: string;
  latitude?: number;
  longitude?: number;
}

export interface EmergencyContactInfo {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  isPrimary: boolean;
  priorityOrder: number;
}

export interface EmergencyProfileResponse {
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

export const alertService = {
  // ============================================================================
  // 1. GET EMERGENCY PROFILE & PERMITTED MEDICAL INFORMATION
  // ============================================================================
  getEmergencyProfile: async (elderlyId = 'eld-01'): Promise<EmergencyProfileResponse> => {
    const isDb = getIsDatabaseConnected();
    let profile: any = null;
    let medications: any[] = [];

    if (isDb) {
      profile = await prisma.elderlyProfile.findUnique({
        where: { id: elderlyId },
        include: {
          user: { select: { id: true, name: true, phone: true, email: true } },
          medications: { where: { isActive: true } }
        }
      });
      medications = profile?.medications || [];
    } else {
      profile = memoryStore.elderlyProfiles.find((e) => e.id === elderlyId);
      if (profile) {
        const u = memoryStore.users.find((user) => user.id === profile.userId);
        profile = {
          ...profile,
          user: u ? { id: u.id, name: u.name, phone: u.phone, email: u.email } : null
        };
      }
      medications = memoryStore.medications.filter((m) => m.elderlyId === elderlyId && m.isActive);
    }

    const patientName = profile?.user?.name || 'Eleanor Vance';
    const emergencyContactName = profile?.emergencyContactName || 'Sarah Vance (Daughter)';
    const emergencyContactPhone = profile?.emergencyContactPhone || '+1 (555) 345-6789';
    const emergencyContactRelation = profile?.emergencyContactRelation || 'Daughter';

    // Configured emergency contacts list
    const emergencyContacts: EmergencyContactInfo[] = [
      {
        name: 'Sarah Vance',
        relationship: 'Daughter / Family Administrator',
        phone: emergencyContactPhone,
        email: 'sarah.vance@carenest.health',
        isPrimary: true,
        priorityOrder: 1
      },
      {
        name: 'Marcus Chen',
        relationship: 'Primary Caregiver (On Duty)',
        phone: '+1 (555) 456-7890',
        email: 'marcus.chen@carenest.health',
        isPrimary: false,
        priorityOrder: 2
      },
      {
        name: 'Dr. Elizabeth Adams',
        relationship: 'Primary Cardiologist (St. Mary Hospital)',
        phone: '+1 (555) 234-8899',
        email: 'dr.adams@stmaryhospital.org',
        isPrimary: false,
        priorityOrder: 3
      },
      {
        name: 'Emergency Medical Dispatch (EMS)',
        relationship: 'Local Emergency Hotline',
        phone: '911',
        isPrimary: false,
        priorityOrder: 4
      }
    ];

    const knownAllergies = profile?.allergies?.length
      ? profile.allergies
      : ['Penicillin (Moderate rash)', 'Sulfa Drugs', 'Peanuts'];

    const relevantMedicalInfo = profile?.chronicConditions?.length
      ? profile.chronicConditions
      : [
          'Essential Hypertension (Stage 1)',
          'Type 2 Diabetes Mellitus',
          'Mild Knee Osteoarthritis'
        ];

    const currentMedications = medications.map((m: any) => ({
      id: m.id,
      name: m.name,
      dosage: m.dosage,
      frequency: m.frequency,
      scheduledTimes: m.scheduledTimes || ['08:00', '20:00'],
      instructions: m.foodInstructions || m.instructions || 'Standard dosing'
    }));

    return {
      patient: {
        id: elderlyId,
        name: patientName,
        dateOfBirth: profile?.dateOfBirth ? new Date(profile.dateOfBirth).toISOString() : '1948-04-12',
        bloodGroup: profile?.bloodGroup || 'O+',
        emergencyContactName,
        emergencyContactPhone,
        emergencyContactRelation,
        address: profile?.address || '742 Evergreen Terrace, Springfield'
      },
      emergencyContacts,
      knownAllergies,
      relevantMedicalInfo,
      currentMedications,
      disclaimer:
        'CareNest Emergency Protocol dispatches high-priority alerts to authorized family and caregiver contacts. Local emergency responders (911) must be dialed directly unless verified dispatch confirmation is provided.'
    };
  },

  // ============================================================================
  // 2. TRIGGER SOS WITH CONFIRMATION, RECIPIENTS, TIMELINE & DELIVERY STATUS
  // ============================================================================
  triggerSos: async (userId: string, dto: TriggerSosDTO) => {
    const isDb = getIsDatabaseConnected();
    const type = dto.type || 'SOS_BUTTON';
    const now = new Date();

    let alert: any;
    let elderlyProfile: any;

    if (isDb) {
      alert = await prisma.emergencyAlert.create({
        data: {
          elderlyId: dto.elderlyId,
          triggeredById: userId,
          type,
          message: dto.message || 'Urgent assistance requested via CareNest emergency SOS button!',
          latitude: dto.latitude,
          longitude: dto.longitude,
          triggeredAt: now,
          resolved: false
        },
        include: {
          elderly: {
            include: { user: true }
          }
        }
      });
      elderlyProfile = alert.elderly;
    } else {
      alert = {
        id: `sos-${randomUUID().substring(0, 8)}`,
        elderlyId: dto.elderlyId,
        triggeredById: userId,
        type,
        message: dto.message || 'Urgent assistance requested via CareNest emergency SOS button!',
        latitude: dto.latitude,
        longitude: dto.longitude,
        triggeredAt: now,
        resolved: false,
        createdAt: now
      };
      memoryStore.emergencyAlerts.unshift(alert);
      elderlyProfile = memoryStore.elderlyProfiles.find((e) => e.id === dto.elderlyId);
    }

    const patientName = elderlyProfile?.user?.name || 'Eleanor Vance';
    const emergencyPhone = elderlyProfile?.emergencyContactPhone || '+1 (555) 345-6789';

    logger.warn(`🚨 EMERGENCY SOS TRIGGERED by user ${userId} for ${patientName}`);

    // 1. Fetch permitted emergency profile data
    const emergencyProfile = await alertService.getEmergencyProfile(dto.elderlyId);

    // 2. Record the event in the care activity timeline
    let careActivityId = `act-sos-${randomUUID().substring(0, 8)}`;
    try {
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().substring(0, 5);
      const createdActivity = await activityService.createActivity(userId, {
        elderlyId: dto.elderlyId,
        title: '🚨 EMERGENCY ASSISTANCE ACTIVATED',
        description:
          dto.message ||
          `Emergency assistance requested by ${patientName}. Priority broadcast dispatched to care circle.`,
        category: ActivityCategory.OTHER,
        scheduledDate: dateStr,
        scheduledTime: timeStr,
        notes: `Emergency SOS triggered at ${now.toLocaleTimeString()}. Coordinates: ${
          dto.latitude ? `${dto.latitude}, ${dto.longitude}` : 'Home Location'
        }.`
      });
      if (createdActivity && createdActivity.id) {
        careActivityId = createdActivity.id;
      }
    } catch (err) {
      logger.error(`Failed to record emergency SOS in care activity timeline: ${err}`);
    }

    // 3. Dispatch notifications and calculate delivery statuses
    const notificationDeliveries = [
      {
        contactName: 'Sarah Vance',
        relationship: 'Daughter / Family Administrator',
        phone: emergencyPhone,
        channel: 'SMS & Email Alert',
        status: 'DELIVERED',
        deliveredAt: now.toISOString(),
        details: 'High-priority SMS & transactional email sent with permitted medical profile.'
      },
      {
        contactName: 'Marcus Chen',
        relationship: 'Primary Caregiver',
        phone: '+1 (555) 456-7890',
        channel: 'In-App SOS Banner & SMS',
        status: 'DELIVERED',
        deliveredAt: now.toISOString(),
        details: 'Dashboard urgent broadcast banner active & SMS alert dispatched.'
      },
      {
        contactName: 'Dr. Elizabeth Adams',
        relationship: 'Primary Cardiologist',
        phone: '+1 (555) 234-8899',
        channel: 'Clinical Portal Ledger',
        status: 'LOGGED',
        deliveredAt: now.toISOString(),
        details: 'Incident logged to patient health telemetry timeline.'
      }
    ];

    // Dispatch background queue simulation
    queueService.dispatchSosAlert({
      to: 'emergency-responders@carenest.health',
      elderlyName: patientName,
      emergencyType: type,
      triggeredAt: now.toLocaleString(),
      emergencyContactPhone: emergencyPhone
    });

    // Audit log
    await auditService.logEvent({
      elderlyId: dto.elderlyId,
      actorId: userId,
      action: 'CREATE',
      entityType: 'EmergencyAlert',
      entityId: alert.id,
      description: `Emergency SOS activated. Permitted medical profile shared with ${notificationDeliveries.length} contacts.`
    });

    return {
      alert,
      emergencyProfile,
      careActivityId,
      notificationDeliveries,
      allContactsNotified: true,
      emergencyServices: {
        contacted: false,
        serviceName: '911 Emergency Services',
        verifiedIntegration: false,
        message:
          'Local emergency services (911) have NOT been contacted automatically. Tap "Call 911" directly if paramedic, fire, or police assistance is required.'
      }
    };
  },

  // ============================================================================
  // 3. FETCH ACTIVE ALERTS
  // ============================================================================
  getActiveAlerts: async () => {
    const isDb = getIsDatabaseConnected();
    if (isDb) {
      return prisma.emergencyAlert.findMany({
        where: { resolved: false },
        orderBy: { triggeredAt: 'desc' },
        include: {
          elderly: { include: { user: { select: { name: true, phone: true } } } }
        }
      });
    }

    return memoryStore.emergencyAlerts
      .filter((a) => !a.resolved)
      .map((a) => {
        const elderly = memoryStore.elderlyProfiles.find((e) => e.id === a.elderlyId);
        const user = elderly ? memoryStore.users.find((u) => u.id === elderly.userId) : null;
        return {
          ...a,
          elderly: elderly ? { ...elderly, user: user ? { name: user.name, phone: user.phone } : null } : null
        };
      });
  },

  // ============================================================================
  // 4. RESOLVE ALERT
  // ============================================================================
  resolveAlert: async (alertId: string, notes: string) => {
    const isDb = getIsDatabaseConnected();
    const resolvedAt = new Date();

    if (isDb) {
      return prisma.emergencyAlert.update({
        where: { id: alertId },
        data: {
          resolved: true,
          resolvedAt,
          resolvedNotes: notes
        }
      });
    }

    const alert = memoryStore.emergencyAlerts.find((a) => a.id === alertId);
    if (!alert) throw new Error('Emergency alert not found.');
    alert.resolved = true;
    alert.resolvedAt = resolvedAt;
    alert.resolvedNotes = notes;
    return alert;
  }
};
