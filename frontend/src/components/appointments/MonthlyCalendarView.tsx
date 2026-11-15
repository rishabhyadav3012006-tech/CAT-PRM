import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Stethoscope,
  Eye,
  CalendarClock
} from 'lucide-react';
import { Appointment } from '../../types/index.ts';
import { GlassCard } from '../ui/GlassCard.tsx';
import { Button } from '../ui/Button.tsx';
import { CountdownBadge } from './CountdownBadge.tsx';

interface MonthlyCalendarViewProps {
  appointments: Appointment[];
  onViewDetails: (apt: Appointment) => void;
  onBookAppointment: () => void;
}

export const MonthlyCalendarView: React.FC<MonthlyCalendarViewProps> = ({
  appointments,
  onViewDetails,
  onBookAppointment
}) => {
  const [currentDate, setCurrentDate] = useState(() => {
    // If there are appointments, pick the month of the first upcoming one, or today
    const upcoming = appointments.find((a) => a.status === 'UPCOMING' || a.status === 'SCHEDULED');
    return upcoming ? new Date(upcoming.appointmentDate) : new Date();
  });

  const [selectedDayDate, setSelectedDayDate] = useState<Date | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDayDate(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDayDate(null);
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDayDate(today);
  };

  // Calendar calculations
  const firstDayOfMonth = new Date(year, month, 1);
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sun, 1 = Mon ...
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  // Map appointments by YYYY-MM-DD
  const apptMap: Record<string, Appointment[]> = {};
  appointments.forEach((apt) => {
    const d = new Date(apt.appointmentDate);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate()
    ).padStart(2, '0')}`;
    if (!apptMap[key]) apptMap[key] = [];
    apptMap[key].push(apt);
  });

  // Generate calendar days
  const calendarCells = [];

  // Previous month trailing days
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const dateObj = new Date(year, month - 1, d);
    calendarCells.push({
      date: dateObj,
      isCurrentMonth: false,
      dayNum: d
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, month, d);
    calendarCells.push({
      date: dateObj,
      isCurrentMonth: true,
      dayNum: d
    });
  }

  // Next month leading days to complete 35 or 42 cells
  const remaining = (7 - (calendarCells.length % 7)) % 7;
  for (let d = 1; d <= remaining; d++) {
    const dateObj = new Date(year, month + 1, d);
    calendarCells.push({
      date: dateObj,
      isCurrentMonth: false,
      dayNum: d
    });
  }

  const today = new Date();
  const isToday = (d: Date) =>
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();

  const isSelected = (d: Date) =>
    selectedDayDate &&
    d.getDate() === selectedDayDate.getDate() &&
    d.getMonth() === selectedDayDate.getMonth() &&
    d.getFullYear() === selectedDayDate.getFullYear();

  // Selected date's appointments
  const selectedKey = selectedDayDate
    ? `${selectedDayDate.getFullYear()}-${String(selectedDayDate.getMonth() + 1).padStart(
        2,
        '0'
      )}-${String(selectedDayDate.getDate()).padStart(2, '0')}`
    : null;

  const dayAppointments = selectedKey ? apptMap[selectedKey] || [] : [];

  return (
    <div className="space-y-4">
      {/* Calendar Header Controls */}
      <GlassCard
        variant="white"
        padding="md"
        rounded="2xl"
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E9E3FF] text-[#7969B5] flex items-center justify-center font-bold shadow-2xs">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black font-heading text-[#34354A]">
              {monthName} {year}
            </h2>
            <p className="text-xs font-semibold text-[#575973]">
              {appointments.filter((a) => {
                const ad = new Date(a.appointmentDate);
                return ad.getMonth() === month && ad.getFullYear() === year;
              }).length}{' '}
              medical consultation(s) this month
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={goToToday} className="rounded-xl text-xs">
            <span>Today</span>
          </Button>

          <div className="flex items-center rounded-xl border border-[#ECEAF5] bg-white p-0.5">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg text-[#575973] hover:bg-[#FAF9FF] hover:text-[#34354A] transition-colors cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg text-[#575973] hover:bg-[#FAF9FF] hover:text-[#34354A] transition-colors cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Calendar Grid */}
      <GlassCard variant="white" padding="md" rounded="3xl" className="border-2 overflow-hidden">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 text-center font-black font-heading text-[11px] sm:text-xs text-[#7A7D9D] uppercase tracking-wider py-2 border-b border-[#ECEAF5]">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dow) => (
            <div key={dow}>{dow}</div>
          ))}
        </div>

        {/* Day Cells */}
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5 pt-2">
          {calendarCells.map((cell, idx) => {
            const cellKey = `${cell.date.getFullYear()}-${String(
              cell.date.getMonth() + 1
            ).padStart(2, '0')}-${String(cell.date.getDate()).padStart(2, '0')}`;
            const cellAppts = apptMap[cellKey] || [];
            const cellIsToday = isToday(cell.date);
            const cellIsSelected = isSelected(cell.date);

            return (
              <div
                key={idx}
                onClick={() => setSelectedDayDate(cell.date)}
                className={`min-h-[72px] sm:min-h-[96px] p-1.5 sm:p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  !cell.isCurrentMonth
                    ? 'bg-[#FAF9FF]/40 border-transparent text-[#A2A1B8] opacity-60'
                    : cellIsSelected
                    ? 'bg-[#E9E3FF]/70 border-[#7969B5] shadow-glass-sm'
                    : cellIsToday
                    ? 'bg-[#DFEEFF]/50 border-[#BDDCFF] text-[#1B5494]'
                    : 'bg-white border-[#ECEAF5] hover:border-[#D1C6F8] hover:bg-[#FAF9FF]'
                }`}
              >
                {/* Day Number Header */}
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-black font-heading ${
                      cellIsToday
                        ? 'bg-[#7969B5] text-white shadow-2xs'
                        : cellIsSelected
                        ? 'bg-[#55428F] text-white'
                        : 'text-[#34354A]'
                    }`}
                  >
                    {cell.dayNum}
                  </span>

                  {cellAppts.length > 0 && (
                    <span className="hidden sm:inline-block w-2 h-2 rounded-full bg-[#7969B5]" />
                  )}
                </div>

                {/* Appointment Chips in Cell */}
                <div className="space-y-1 mt-1 overflow-hidden">
                  {cellAppts.slice(0, 2).map((apt) => (
                    <div
                      key={apt.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDetails(apt);
                      }}
                      className={`px-1.5 py-0.5 rounded-lg text-[10px] font-bold truncate flex items-center gap-1 shadow-2xs hover:scale-105 transition-transform ${
                        apt.status === 'COMPLETED'
                          ? 'bg-[#DDF5E9] text-[#1D6A48] border border-[#B7E7CE]'
                          : apt.status === 'CANCELLED'
                          ? 'bg-[#FCE4ED] text-[#A62650] border border-[#F7C6D7]'
                          : apt.status === 'RESCHEDULED'
                          ? 'bg-[#FFE9DC] text-[#B85820] border border-[#FBD2BA]'
                          : 'bg-[#DFEEFF] text-[#1B5494] border border-[#BDDCFF]'
                      }`}
                      title={`${apt.doctorName} (${apt.specialty})`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />
                      <span className="truncate">{apt.doctorName.replace('Dr. ', '')}</span>
                    </div>
                  ))}

                  {cellAppts.length > 2 && (
                    <div className="text-[9px] font-bold text-[#7969B5] text-center">
                      +{cellAppts.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* Selected Day Agenda Drawer */}
      {selectedDayDate && (
        <GlassCard
          variant="lavender"
          padding="lg"
          rounded="3xl"
          className="border-2 border-[#D1C6F8] space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-[#7969B5]" />
              <h3 className="font-black font-heading text-[#34354A] text-base">
                Agenda for {selectedDayDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </h3>
            </div>
            <button
              onClick={() => setSelectedDayDate(null)}
              className="text-xs font-bold text-[#7969B5] hover:underline"
            >
              Dismiss
            </button>
          </div>

          {dayAppointments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {dayAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="p-3.5 rounded-2xl bg-white border border-[#D1C6F8] shadow-glass-sm flex flex-col justify-between space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-[#DFEEFF] text-[#1B5494] flex items-center justify-center font-bold flex-shrink-0">
                        <Stethoscope className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-black font-heading text-sm text-[#34354A]">
                          {apt.doctorName}
                        </h4>
                        <p className="text-xs font-bold text-[#7969B5]">{apt.specialty}</p>
                      </div>
                    </div>
                    <CountdownBadge
                      appointmentDate={apt.appointmentDate}
                      status={apt.status}
                      size="sm"
                    />
                  </div>

                  <div className="text-xs font-medium text-[#575973] space-y-1">
                    <p className="flex items-center gap-1.5 font-bold text-[#34354A]">
                      <Clock className="w-3.5 h-3.5 text-[#7969B5]" />
                      <span>{apt.appointmentTime || '10:00 AM'}</span>
                    </p>
                    <p className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-[#7A7D9D] flex-shrink-0" />
                      <span className="truncate">{apt.location}</span>
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#ECEAF5] flex justify-end">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onViewDetails(apt)}
                      leftIcon={<Eye className="w-3.5 h-3.5" />}
                      className="rounded-xl text-xs py-1 px-3 shadow-glow-purple"
                    >
                      <span>View Full Details</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-white/60 border border-[#D1C6F8]/60 text-center py-6">
              <p className="text-xs font-bold text-[#575973]">
                No appointments scheduled on this date.
              </p>
              <button
                onClick={onBookAppointment}
                className="mt-2 text-xs font-black text-[#7969B5] hover:underline cursor-pointer"
              >
                + Schedule consultation for this day
              </button>
            </div>
          )}
        </GlassCard>
      )}
    </div>
  );
};

