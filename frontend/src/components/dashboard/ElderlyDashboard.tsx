import React from 'react';
import { NextMedicationReminderWidget } from './NextMedicationReminderWidget.tsx';
import { MedicationScheduleWidget } from './MedicationScheduleWidget.tsx';
import { UpcomingAppointmentWidget } from './UpcomingAppointmentWidget.tsx';
import { DailyCareChecklistWidget } from './DailyCareChecklistWidget.tsx';
import { QuickContactFamilyWidget } from './QuickContactFamilyWidget.tsx';
import { PersonalHealthSummaryWidget } from './PersonalHealthSummaryWidget.tsx';
import { EmergencyBannerButton } from '../emergency/EmergencyBannerButton.tsx';
import { Medication, CareActivity, Appointment, HealthRecord } from '../../types/index.ts';

interface ElderlyDashboardProps {
  medications: Medication[];
  activities: CareActivity[];
  upcomingAppointments: Appointment[];
  latestVital: HealthRecord | null;
  onLogMedication: (id: string, name: string) => Promise<void>;
  onToggleActivity: (id: string, status: string) => Promise<void>;
}

export const ElderlyDashboard: React.FC<ElderlyDashboardProps> = ({
  medications,
  activities,
  upcomingAppointments,
  latestVital,
  onLogMedication,
  onToggleActivity
}) => {
  const nextMed = medications[0]
    ? {
        id: medications[0].id,
        name: medications[0].name,
        dosage: medications[0].dosage,
        scheduledTime: medications[0].scheduledTimes[0] || '12:30 PM',
        instructions: medications[0].instructions
      }
    : undefined;

  const nextAppt = upcomingAppointments[0];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Priority Highly Visible Emergency Assistance Trigger */}
      <EmergencyBannerButton elderlyId="eld-01" />

      {/* Top Prominent Row: Next Medication Reminder + Quick Contact Family */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <NextMedicationReminderWidget
          medication={nextMed}
          onConfirmTaken={onLogMedication}
        />
        <QuickContactFamilyWidget />
      </div>

      {/* Middle Row: Today's Medication Schedule + Daily Care Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MedicationScheduleWidget
          medications={medications}
          onLogAdherence={onLogMedication}
        />
        <DailyCareChecklistWidget
          activities={activities}
          onToggleActivity={onToggleActivity}
        />
      </div>

      {/* Bottom Row: Upcoming Doctor Visit + Personal Health Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingAppointmentWidget appointment={nextAppt} />
        <PersonalHealthSummaryWidget latestRecord={latestVital} />
      </div>
    </div>
  );
};

