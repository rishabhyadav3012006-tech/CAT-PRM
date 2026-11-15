import React, { useEffect, useState } from 'react';
import {
  Calendar,
  CalendarDays,
  CalendarRange,
  Clock,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Stethoscope,
  FileText,
  AlertCircle,
  Building2,
  History
} from 'lucide-react';
import { appointmentsApi } from '../api/client.ts';
import { Appointment } from '../types/index.ts';
import { LoadingSpinner } from '../components/common/LoadingSpinner.tsx';
import { GlassCard } from '../components/ui/GlassCard.tsx';
import { Button } from '../components/ui/Button.tsx';
import { CuteBadge } from '../components/ui/CuteBadge.tsx';

// Appointment Components
import { CountdownBadge } from '../components/appointments/CountdownBadge.tsx';
import { AppointmentCard } from '../components/appointments/AppointmentCard.tsx';
import { AppointmentDetailsModal } from '../components/appointments/AppointmentDetailsModal.tsx';
import { AppointmentFormModal } from '../components/appointments/AppointmentFormModal.tsx';
import { RescheduleModal } from '../components/appointments/RescheduleModal.tsx';
import { CancelAppointmentModal } from '../components/appointments/CancelAppointmentModal.tsx';
import { MonthlyCalendarView } from '../components/appointments/MonthlyCalendarView.tsx';
import { WeeklyCalendarView } from '../components/appointments/WeeklyCalendarView.tsx';
import { AppointmentHistoryView } from '../components/appointments/AppointmentHistoryView.tsx';

type TabView = 'UPCOMING_CARDS' | 'MONTHLY_CALENDAR' | 'WEEKLY_CALENDAR' | 'PAST_HISTORY';

export const AppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabView>('UPCOMING_CARDS');

  // Filter & Search states for Upcoming Cards
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('ALL');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  const [detailsAppointment, setDetailsAppointment] = useState<Appointment | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const [rescheduleAppointment, setRescheduleAppointment] = useState<Appointment | null>(null);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);

  const [cancelAppointment, setCancelAppointment] = useState<Appointment | null>(null);
  const [isCancelOpen, setIsCancelOpen] = useState(false);

  const fetchAppointments = async () => {
    try {
      const res: any = await appointmentsApi.getAll('eld-01');
      if (res.success && res.data) {
        setAppointments(res.data);
      }
    } catch (err) {
      console.error('Failed to load appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleMarkCompleted = async (id: string) => {
    try {
      await appointmentsApi.updateStatus(id, 'COMPLETED');
      fetchAppointments();
    } catch (err) {
      alert('Failed to mark appointment completed');
    }
  };

  const handleOpenEdit = (apt: Appointment) => {
    setEditingAppointment(apt);
    setIsFormOpen(true);
  };

  const handleOpenReschedule = (apt: Appointment) => {
    setRescheduleAppointment(apt);
    setIsRescheduleOpen(true);
  };

  const handleOpenCancel = (apt: Appointment) => {
    setCancelAppointment(apt);
    setIsCancelOpen(true);
  };

  const handleOpenDetails = (apt: Appointment) => {
    setDetailsAppointment(apt);
    setIsDetailsOpen(true);
  };

  // Metrics calculation
  const upcomingAppointments = appointments.filter((a) => {
    return (
      a.status === 'UPCOMING' ||
      a.status === 'SCHEDULED' ||
      a.status === 'RESCHEDULED'
    );
  });

  const nextUpcoming = upcomingAppointments[0];

  const completedCount = appointments.filter((a) => a.status === 'COMPLETED').length;
  const totalDocuments = appointments.reduce(
    (acc, a) => acc + (a.documents ? a.documents.length : 0),
    0
  );

  // Filtered upcoming list
  const filteredUpcoming = upcomingAppointments.filter((apt) => {
    if (selectedSpecialty !== 'ALL' && apt.specialty !== selectedSpecialty) {
      return false;
    }
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      apt.doctorName.toLowerCase().includes(q) ||
      apt.specialty.toLowerCase().includes(q) ||
      (apt.hospitalName && apt.hospitalName.toLowerCase().includes(q)) ||
      (apt.location && apt.location.toLowerCase().includes(q))
    );
  });

  // Unique specialties for filter dropdown
  const uniqueSpecialties = Array.from(new Set(appointments.map((a) => a.specialty)));

  if (loading) {
    return <LoadingSpinner message="Retrieving scheduled medical appointments & clinic calendars..." />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CuteBadge variant="babyBlue" size="sm" icon={<Calendar className="w-3.5 h-3.5" />}>
              Clinical Care Coordination
            </CuteBadge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#34354A] tracking-tight">
            Doctor Appointments & Medical Visits
          </h1>
          <p className="text-sm font-medium font-body text-[#575973]">
            Coordinate clinical consultations, monthly and weekly calendars, doctor details, and medical files
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => {
            setEditingAppointment(null);
            setIsFormOpen(true);
          }}
          leftIcon={<Plus className="w-4 h-4" />}
          className="rounded-2xl shadow-glow-purple self-start sm:self-auto"
        >
          <span>Schedule Appointment</span>
        </Button>
      </div>

      {/* Top Clinical Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Next Visit Banner */}
        <GlassCard variant="peach" padding="md" rounded="2xl" className="border-2 border-[#FBD2BA]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black font-heading uppercase tracking-wider text-[#B85820]">
              Next Consultation
            </span>
            <AlertCircle className="w-4 h-4 text-[#B85820]" />
          </div>
          {nextUpcoming ? (
            <div>
              <p className="font-black font-heading text-lg text-[#34354A] truncate">
                {nextUpcoming.doctorName}
              </p>
              <p className="text-xs font-bold text-[#7969B5]">{nextUpcoming.specialty}</p>
              <div className="mt-2 flex items-center gap-1.5">
                <CountdownBadge
                  appointmentDate={nextUpcoming.appointmentDate}
                  status={nextUpcoming.status}
                  size="sm"
                />
                <span className="text-xs font-medium text-[#575973]">
                  {nextUpcoming.appointmentTime || '10:00 AM'}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs font-bold text-[#7A7D9D] py-2">No upcoming visits scheduled</p>
          )}
        </GlassCard>

        {/* Total Active Prescriptions / Visits */}
        <GlassCard variant="lavender" padding="md" rounded="2xl" className="border-2 border-[#D1C6F8]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black font-heading uppercase tracking-wider text-[#55428F]">
              Active Consultations
            </span>
            <Calendar className="w-4 h-4 text-[#7969B5]" />
          </div>
          <p className="font-black font-heading text-2xl text-[#34354A]">
            {upcomingAppointments.length}
          </p>
          <p className="text-xs font-medium text-[#575973] mt-1">
            Scheduled across {uniqueSpecialties.length} medical specialties
          </p>
        </GlassCard>

        {/* Completed Visits */}
        <GlassCard variant="mint" padding="md" rounded="2xl" className="border-2 border-[#B7E7CE]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black font-heading uppercase tracking-wider text-[#1D6A48]">
              Completed Visits
            </span>
            <CheckCircle2 className="w-4 h-4 text-[#1D6A48]" />
          </div>
          <p className="font-black font-heading text-2xl text-[#34354A]">
            {completedCount}
          </p>
          <p className="text-xs font-medium text-[#575973] mt-1">
            Clinical history & doctor notes archived
          </p>
        </GlassCard>

        {/* Attached Documents */}
        <GlassCard variant="babyBlue" padding="md" rounded="2xl" className="border-2 border-[#BDDCFF]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black font-heading uppercase tracking-wider text-[#1B5494]">
              Attached Records
            </span>
            <FileText className="w-4 h-4 text-[#1B5494]" />
          </div>
          <p className="font-black font-heading text-2xl text-[#34354A]">
            {totalDocuments}
          </p>
          <p className="text-xs font-medium text-[#575973] mt-1">
            ECG strips, lab reports & referrals attached
          </p>
        </GlassCard>
      </div>

      {/* View Switcher Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#ECEAF5] pb-2">
        <button
          onClick={() => setActiveTab('UPCOMING_CARDS')}
          className={`px-4 py-2 text-xs sm:text-sm font-extrabold font-heading rounded-2xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'UPCOMING_CARDS'
              ? 'bg-[#DFEEFF] text-[#1B5494] shadow-glass-sm'
              : 'text-[#7A7D9D] hover:bg-white hover:text-[#34354A]'
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          <span>Upcoming Visits ({upcomingAppointments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('MONTHLY_CALENDAR')}
          className={`px-4 py-2 text-xs sm:text-sm font-extrabold font-heading rounded-2xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'MONTHLY_CALENDAR'
              ? 'bg-[#E9E3FF] text-[#55428F] shadow-glass-sm'
              : 'text-[#7A7D9D] hover:bg-white hover:text-[#34354A]'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          <span>Monthly Calendar</span>
        </button>

        <button
          onClick={() => setActiveTab('WEEKLY_CALENDAR')}
          className={`px-4 py-2 text-xs sm:text-sm font-extrabold font-heading rounded-2xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'WEEKLY_CALENDAR'
              ? 'bg-[#FFE9DC] text-[#B85820] shadow-glass-sm'
              : 'text-[#7A7D9D] hover:bg-white hover:text-[#34354A]'
          }`}
        >
          <CalendarRange className="w-4 h-4" />
          <span>Weekly Schedule</span>
        </button>

        <button
          onClick={() => setActiveTab('PAST_HISTORY')}
          className={`px-4 py-2 text-xs sm:text-sm font-extrabold font-heading rounded-2xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'PAST_HISTORY'
              ? 'bg-[#DDF5E9] text-[#1D6A48] shadow-glass-sm'
              : 'text-[#7A7D9D] hover:bg-white hover:text-[#34354A]'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Past Visit History</span>
        </button>
      </div>

      {/* TAB CONTENT 1: UPCOMING CARDS VIEW */}
      {activeTab === 'UPCOMING_CARDS' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <GlassCard
            variant="white"
            padding="md"
            rounded="2xl"
            className="flex flex-col sm:flex-row items-center justify-between gap-3 border"
          >
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-[#7A7D9D] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search physician, clinic, room..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[#ECEAF5] bg-[#FAF9FF] font-medium text-[#34354A] focus:outline-none focus:border-[#7969B5]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-[#7A7D9D]" />
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-[#ECEAF5] bg-[#FAF9FF] font-bold text-[#34354A] focus:outline-none focus:border-[#7969B5]"
              >
                <option value="ALL">All Specialties</option>
                {uniqueSpecialties.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>
          </GlassCard>

          {/* Cards Grid */}
          {filteredUpcoming.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUpcoming.map((apt) => (
                <AppointmentCard
                  key={apt.id}
                  appointment={apt}
                  onViewDetails={handleOpenDetails}
                  onEdit={handleOpenEdit}
                  onReschedule={handleOpenReschedule}
                  onCancel={handleOpenCancel}
                  onMarkCompleted={handleMarkCompleted}
                />
              ))}
            </div>
          ) : (
            <GlassCard variant="cream" padding="xl" rounded="3xl" className="text-center py-10">
              <Calendar className="w-12 h-12 text-[#B85820] mx-auto mb-3 opacity-60" />
              <p className="font-extrabold font-heading text-[#34354A] text-base">
                No matching upcoming appointments
              </p>
              <p className="text-xs font-medium font-body text-[#7A7D9D] mt-1">
                Clear filters or schedule a new appointment for Eleanor.
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setEditingAppointment(null);
                  setIsFormOpen(true);
                }}
                leftIcon={<Plus className="w-4 h-4" />}
                className="mt-4 rounded-xl shadow-glow-purple mx-auto"
              >
                <span>Schedule Appointment</span>
              </Button>
            </GlassCard>
          )}
        </div>
      )}

      {/* TAB CONTENT 2: MONTHLY CALENDAR VIEW */}
      {activeTab === 'MONTHLY_CALENDAR' && (
        <MonthlyCalendarView
          appointments={appointments}
          onViewDetails={handleOpenDetails}
          onBookAppointment={() => {
            setEditingAppointment(null);
            setIsFormOpen(true);
          }}
        />
      )}

      {/* TAB CONTENT 3: WEEKLY SCHEDULE VIEW */}
      {activeTab === 'WEEKLY_CALENDAR' && (
        <WeeklyCalendarView
          appointments={appointments}
          onViewDetails={handleOpenDetails}
          onBookAppointment={() => {
            setEditingAppointment(null);
            setIsFormOpen(true);
          }}
        />
      )}

      {/* TAB CONTENT 4: PAST VISIT HISTORY VIEW */}
      {activeTab === 'PAST_HISTORY' && (
        <AppointmentHistoryView
          appointments={appointments}
          onViewDetails={handleOpenDetails}
        />
      )}

      {/* 1. Add / Edit Appointment Modal */}
      <AppointmentFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingAppointment(null);
        }}
        onSuccess={fetchAppointments}
        editingAppointment={editingAppointment}
      />

      {/* 2. Comprehensive Details & Dossier Modal */}
      <AppointmentDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setDetailsAppointment(null);
        }}
        appointment={detailsAppointment}
        onRefresh={fetchAppointments}
        onEdit={handleOpenEdit}
        onReschedule={handleOpenReschedule}
        onCancel={handleOpenCancel}
        onMarkCompleted={handleMarkCompleted}
      />

      {/* 3. Reschedule Appointment Modal */}
      <RescheduleModal
        isOpen={isRescheduleOpen}
        onClose={() => {
          setIsRescheduleOpen(false);
          setRescheduleAppointment(null);
        }}
        appointment={rescheduleAppointment}
        onSuccess={fetchAppointments}
      />

      {/* 4. Cancel Appointment Modal */}
      <CancelAppointmentModal
        isOpen={isCancelOpen}
        onClose={() => {
          setIsCancelOpen(false);
          setCancelAppointment(null);
        }}
        appointment={cancelAppointment}
        onSuccess={fetchAppointments}
      />
    </div>
  );
};

export default AppointmentsPage;
