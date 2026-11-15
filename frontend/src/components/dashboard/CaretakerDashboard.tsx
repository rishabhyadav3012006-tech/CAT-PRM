import React from 'react';
import { ConnectedElderlyProfilesWidget } from './ConnectedElderlyProfilesWidget.tsx';
import { TodayCareTasksWidget } from './TodayCareTasksWidget.tsx';
import { MedicationAdministrationWidget } from './MedicationAdministrationWidget.tsx';
import { MissedMedicationsWidget } from './MissedMedicationsWidget.tsx';
import { AppointmentCalendarWidget } from './AppointmentCalendarWidget.tsx';
import { DailyCareNotesWidget } from './DailyCareNotesWidget.tsx';
import { CompletedActivitiesWidget } from './CompletedActivitiesWidget.tsx';
import { EmergencyBannerButton } from '../emergency/EmergencyBannerButton.tsx';
import { CareActivity } from '../../types/index.ts';

interface CaretakerDashboardProps {
  selectedElderlyId: string;
  onSelectElderly: (id: string) => void;
  tasks: CareActivity[];
  onCompleteTask: (id: string, status: string) => Promise<void>;
}

export const CaretakerDashboard: React.FC<CaretakerDashboardProps> = ({
  selectedElderlyId,
  onSelectElderly,
  tasks,
  onCompleteTask
}) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Assigned Elderly Profiles */}
      <ConnectedElderlyProfilesWidget
        selectedElderlyId={selectedElderlyId}
        onSelectElderly={onSelectElderly}
      />

      {/* Priority Emergency Assistance Trigger */}
      <EmergencyBannerButton elderlyId={selectedElderlyId} />

      {/* 2. Top Care Tasks & Administration Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TodayCareTasksWidget
          tasks={tasks}
          onCompleteTask={onCompleteTask}
        />
        <MedicationAdministrationWidget />
      </div>

      {/* 3. Pending Confirmations & Appointment Escort Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MissedMedicationsWidget />
        <AppointmentCalendarWidget />
      </div>

      {/* 4. Daily Care Notes & Completed Activities Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DailyCareNotesWidget />
        <CompletedActivitiesWidget />
      </div>
    </div>
  );
};

