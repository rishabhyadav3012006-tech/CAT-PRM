import React from 'react';
import { ConnectedElderlyProfilesWidget } from './ConnectedElderlyProfilesWidget.tsx';
import { MedicationAdherenceChartWidget } from './MedicationAdherenceChartWidget.tsx';
import { MissedMedicationsWidget } from './MissedMedicationsWidget.tsx';
import { UpcomingAppointmentWidget } from './UpcomingAppointmentWidget.tsx';
import { CaretakerActivityWidget } from './CaretakerActivityWidget.tsx';
import { RecentHealthcareUpdatesWidget } from './RecentHealthcareUpdatesWidget.tsx';
import { FamilyCareTimelineWidget } from './FamilyCareTimelineWidget.tsx';
import { EmergencyBannerButton } from '../emergency/EmergencyBannerButton.tsx';
import { Appointment } from '../../types/index.ts';

interface FamilyDashboardProps {
  selectedElderlyId: string;
  onSelectElderly: (id: string) => void;
  adherenceRate: number;
  adherenceSummary: { taken: number; missed: number; total: number };
  upcomingAppointments: Appointment[];
}

export const FamilyDashboard: React.FC<FamilyDashboardProps> = ({
  selectedElderlyId,
  onSelectElderly,
  adherenceRate,
  adherenceSummary,
  upcomingAppointments
}) => {
  const nextAppt = upcomingAppointments[0];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Connected Elderly Profiles Header Card */}
      <ConnectedElderlyProfilesWidget
        selectedElderlyId={selectedElderlyId}
        onSelectElderly={onSelectElderly}
      />

      {/* Priority Emergency Assistance Bar */}
      <EmergencyBannerButton elderlyId={selectedElderlyId} />

      {/* 2. Top Analytics Row: Medication Adherence Percentage + Missed / Unconfirmed Doses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MedicationAdherenceChartWidget
          rate={adherenceRate}
          summary={adherenceSummary}
        />
        <MissedMedicationsWidget />
      </div>

      {/* 3. Middle Coordination Row: Caretaker Activity + Upcoming Doctor Visits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CaretakerActivityWidget />
        <UpcomingAppointmentWidget appointment={nextAppt} />
      </div>

      {/* 4. Bottom Feed Row: Recent Healthcare Updates + Family Care Activity Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentHealthcareUpdatesWidget />
        <FamilyCareTimelineWidget />
      </div>
    </div>
  );
};

