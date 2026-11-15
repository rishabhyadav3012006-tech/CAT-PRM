import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { UserRole, DashboardOverview, Medication, CareActivity, Appointment } from '../types/index.ts';
import { dashboardApi, medicationsApi, activitiesApi } from '../api/client.ts';
import { LoadingSpinner } from '../components/common/LoadingSpinner.tsx';
import { DashboardHeader } from '../components/dashboard/DashboardHeader.tsx';
import { ElderlyDashboard } from '../components/dashboard/ElderlyDashboard.tsx';
import { FamilyDashboard } from '../components/dashboard/FamilyDashboard.tsx';
import { CaretakerDashboard } from '../components/dashboard/CaretakerDashboard.tsx';
import { GlassCard } from '../components/ui/GlassCard.tsx';
import { Button } from '../components/ui/Button.tsx';
import { CuteBadge } from '../components/ui/CuteBadge.tsx';
import { CheckCircle2, AlertCircle, RefreshCw, Heart, Sparkles } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  // Active dashboard view mode (defaults to logged-in user's role)
  const [activeRoleView, setActiveRoleView] = useState<UserRole>(() => {
    if (user?.role === 'FAMILY_MEMBER') return 'FAMILY_MEMBER';
    if (user?.role === 'CAREGIVER') return 'CAREGIVER';
    return 'ELDERLY';
  });

  const [selectedElderlyId, setSelectedElderlyId] = useState<string>('eld-01');
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync role view when user switches login persona
  useEffect(() => {
    if (user?.role) {
      if (user.role === 'FAMILY_MEMBER') setActiveRoleView('FAMILY_MEMBER');
      else if (user.role === 'CAREGIVER') setActiveRoleView('CAREGIVER');
      else setActiveRoleView('ELDERLY');
    }
  }, [user?.role]);

  const fetchDashboardData = async (elderlyId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res: any = await dashboardApi.getOverview(elderlyId);
      if (res.success && res.data) {
        setData(res.data);
      } else {
        throw new Error(res.message || 'Failed to load dashboard metrics');
      }
    } catch (err: any) {
      console.error('Error fetching dashboard overview:', err);
      setError(
        err?.message || 'Unable to retrieve healthcare data. Please check your network connection.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(selectedElderlyId);
  }, [selectedElderlyId]);

  const handleLogMedication = async (medId: string, medName: string) => {
    try {
      await medicationsApi.logAdherence({
        medicationId: medId,
        status: 'TAKEN',
        notes: `Confirmed intake from ${activeRoleView.toLowerCase()} dashboard`
      });
      setToastMessage(`Medication logged: ${medName} taken successfully! 🌸`);
      setTimeout(() => setToastMessage(null), 3500);
      fetchDashboardData(selectedElderlyId);
    } catch (err) {
      alert('Could not log medication intake.');
    }
  };

  const handleCompleteActivity = async (activityId: string, currentStatus: string) => {
    try {
      const nextStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
      await activitiesApi.updateStatus(activityId, nextStatus);
      setToastMessage(
        nextStatus === 'COMPLETED'
          ? 'Care task completed! Family notified. ✓'
          : 'Care task marked as pending.'
      );
      setTimeout(() => setToastMessage(null), 3500);
      fetchDashboardData(selectedElderlyId);
    } catch (err) {
      alert('Could not update task status.');
    }
  };

  // Loading State
  if (loading && !data) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <LoadingSpinner message="Loading your CareNest healthcare dashboard..." />
      </div>
    );
  }

  // Error State with Retry
  if (error && !data) {
    return (
      <div className="py-16 max-w-lg mx-auto">
        <GlassCard variant="white" padding="xl" rounded="3xl" className="space-y-4 border-2 border-rose-200">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black font-heading text-[#34354A]">
            Unable to Connect to Care Cloud
          </h2>
          <p className="text-xs text-[#7A7D9D] leading-relaxed">
            {error}
          </p>
          <Button
            variant="primary"
            size="md"
            onClick={() => fetchDashboardData(selectedElderlyId)}
            leftIcon={<RefreshCw className="w-4 h-4" />}
            className="w-full justify-center"
          >
            Retry Connection
          </Button>
        </GlassCard>
      </div>
    );
  }

  // Safe fallback mock items if overview lists are empty
  const medications: Medication[] = data?.elderly?.medications || [
    {
      id: 'med-01',
      elderlyId: selectedElderlyId,
      name: 'Lisinopril',
      dosage: '10mg (1 tablet)',
      frequency: 'DAILY',
      scheduledTimes: ['08:00 AM'],
      instructions: 'Take every morning with water for blood pressure management.',
      startDate: new Date().toISOString(),
      stockQuantity: 24,
      refillReminderThreshold: 7,
      isActive: true
    },
    {
      id: 'med-02',
      elderlyId: selectedElderlyId,
      name: 'Metformin',
      dosage: '500mg',
      frequency: 'TWICE_DAILY',
      scheduledTimes: ['12:30 PM', '08:00 PM'],
      instructions: 'Take with warm meal to manage blood sugar levels.',
      startDate: new Date().toISOString(),
      stockQuantity: 40,
      refillReminderThreshold: 10,
      isActive: true
    },
    {
      id: 'med-03',
      elderlyId: selectedElderlyId,
      name: 'Atorvastatin',
      dosage: '20mg',
      frequency: 'DAILY',
      scheduledTimes: ['08:00 PM'],
      instructions: 'Cholesterol maintenance, take at bedtime.',
      startDate: new Date().toISOString(),
      stockQuantity: 30,
      refillReminderThreshold: 5,
      isActive: true
    }
  ];

  const activities: CareActivity[] = data?.todayActivities || [];
  const upcomingAppointments: Appointment[] = data?.upcomingAppointments || [];
  const latestVital = data?.latestVital || null;
  const adherenceRate = data?.metrics?.adherenceRate || 94;
  const adherenceSummary = data?.metrics?.adherenceSummary || { taken: 26, missed: 2, total: 28 };

  const currentPatientName = selectedElderlyId === 'eld-02' ? 'Arthur Pendelton' : 'Eleanor Vance';

  return (
    <div className="space-y-6 text-left">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-24 right-4 sm:right-8 z-50 p-4 rounded-2xl bg-white/95 backdrop-blur-xl border border-emerald-300 text-emerald-900 shadow-glass-lg flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-xs sm:text-sm font-bold font-heading">{toastMessage}</span>
        </div>
      )}

      {/* Reusable Dashboard Header with Live Time and Role Switching Tabs */}
      <DashboardHeader
        userName={user?.name || (activeRoleView === 'ELDERLY' ? 'Eleanor' : activeRoleView === 'FAMILY_MEMBER' ? 'Sarah' : 'Marcus')}
        role={user?.role || 'ELDERLY'}
        activeRoleView={activeRoleView}
        onSwitchRoleView={(newRole) => setActiveRoleView(newRole)}
        patientName={currentPatientName}
      />

      {/* Render Specific Dashboard based on Active Role View */}
      {activeRoleView === 'ELDERLY' && (
        <ElderlyDashboard
          medications={medications}
          activities={activities}
          upcomingAppointments={upcomingAppointments}
          latestVital={latestVital}
          onLogMedication={handleLogMedication}
          onToggleActivity={handleCompleteActivity}
        />
      )}

      {activeRoleView === 'FAMILY_MEMBER' && (
        <FamilyDashboard
          selectedElderlyId={selectedElderlyId}
          onSelectElderly={(id) => setSelectedElderlyId(id)}
          adherenceRate={adherenceRate}
          adherenceSummary={adherenceSummary}
          upcomingAppointments={upcomingAppointments}
        />
      )}

      {(activeRoleView === 'CAREGIVER' || activeRoleView === 'DOCTOR' || activeRoleView === 'ADMIN') && (
        <CaretakerDashboard
          selectedElderlyId={selectedElderlyId}
          onSelectElderly={(id) => setSelectedElderlyId(id)}
          tasks={activities}
          onCompleteTask={handleCompleteActivity}
        />
      )}
    </div>
  );
};

export default DashboardPage;
