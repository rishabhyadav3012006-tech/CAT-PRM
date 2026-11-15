import { prisma, memoryStore, getIsDatabaseConnected } from '../config/db.js';

export const elderlyService = {
  getAllElderly: async () => {
    const isDb = getIsDatabaseConnected();
    if (isDb) {
      return prisma.elderlyProfile.findMany({
        include: {
          user: {
            select: { id: true, name: true, email: true, phone: true, avatarUrl: true }
          }
        }
      });
    }

    return memoryStore.elderlyProfiles.map((p) => {
      const user = memoryStore.users.find((u) => u.id === p.userId);
      return {
        ...p,
        user: user
          ? {
              id: user.id,
              name: user.name,
              email: user.email,
              phone: user.phone,
              avatarUrl: user.avatarUrl
            }
          : undefined
      };
    });
  },

  getProfileById: async (elderlyId: string) => {
    const isDb = getIsDatabaseConnected();
    if (isDb) {
      const profile = await prisma.elderlyProfile.findUnique({
        where: { id: elderlyId },
        include: {
          user: {
            select: { id: true, name: true, email: true, phone: true, avatarUrl: true }
          },
          medications: { where: { isActive: true } },
          appointments: { orderBy: { appointmentDate: 'asc' }, take: 5 },
          healthLogs: { orderBy: { recordedAt: 'desc' }, take: 5 }
        }
      });
      if (!profile) throw new Error('Elderly profile not found.');
      return profile;
    }

    const profile = memoryStore.elderlyProfiles.find((p) => p.id === elderlyId || p.userId === elderlyId);
    if (!profile) throw new Error('Elderly profile not found.');

    const user = memoryStore.users.find((u) => u.id === profile.userId);
    const medications = memoryStore.medications.filter((m) => m.elderlyId === profile.id && m.isActive);
    const appointments = memoryStore.appointments.filter((a) => a.elderlyId === profile.id);
    const healthRecords = memoryStore.healthRecords.filter((r) => r.elderlyId === profile.id);

    return {
      ...profile,
      user,
      medications,
      appointments,
      healthRecords
    };
  },

  updateProfile: async (elderlyId: string, data: Partial<{
    emergencyContactName: string;
    emergencyContactPhone: string;
    emergencyContactRelation: string;
    bloodGroup: string;
    allergies: string[];
    chronicConditions: string[];
    mobilityStatus: string;
    address: string;
    notes: string;
  }>) => {
    const isDb = getIsDatabaseConnected();
    if (isDb) {
      return prisma.elderlyProfile.update({
        where: { id: elderlyId },
        data: {
          ...data,
          updatedAt: new Date()
        }
      });
    }

    const index = memoryStore.elderlyProfiles.findIndex((p) => p.id === elderlyId || p.userId === elderlyId);
    if (index === -1) throw new Error('Elderly profile not found.');

    memoryStore.elderlyProfiles[index] = {
      ...memoryStore.elderlyProfiles[index],
      ...data,
      updatedAt: new Date()
    };

    return memoryStore.elderlyProfiles[index];
  }
};

