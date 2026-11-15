import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Stethoscope,
  Plus,
  Eye
} from 'lucide-react';
import { Appointment } from '../../types/index.ts';
import { GlassCard } from '../ui/GlassCard.tsx';
import { Button } from '../ui/Button.tsx';
import { CountdownBadge } from './CountdownBadge.tsx';

interface WeeklyCalendarViewProps {
  appointments: Appointment[];
  onViewDetails: (apt: Appointment) => void;
  onBookAppointment: () => void;
}

export const WeeklyCalendarView: React.FC<WeeklyCalendarViewProps> = ({
  appointments,
  onViewDetails,
  onBookAppointment
}) => {
  // Start week at current Sunday or Monday
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const d = new Date();
    const day = d.getDay(); // 0 is Sunday
    const diff = d.getDate() - day; // Adjust to Sunday
    return new Date(d.getFullYear(), d.getMonth(), diff);
  });

  const prevWeek = () => {
    const prev = new Date(currentWeekStart);
    prev.setDate(prev.getDate() - 7);
    setCurrentWeekStart(prev);
  };

  const nextWeek = () => {
    const next = new Date(currentWeekStart);
    next.setDate(next.getDate() + 7);
    setCurrentWeekStart(next);
  };

  const goToThisWeek = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day;
    setCurrentWeekStart(new Date(d.getFullYear(), d.getMonth(), diff));
  };

  // Generate 7 days of this week
  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const dateObj = new Date(currentWeekStart);
    dateObj.setDate(dateObj.getDate() + i);
    weekDays.push(dateObj);
  }

  const endOfWeek = weekDays[6];
  const weekRangeStr = `${weekDays[0].toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })} – ${endOfWeek.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })}`;

  const today = new Date();
  const isToday = (d: Date) =>
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();

  // Map appointments to date string key
  const apptMap: Record<string, Appointment[]> = {};
  appointments.forEach((apt) => {
    const d = new Date(apt.appointmentDate);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate()
    ).padStart(2, '0')}`;
    if (!apptMap[key]) apptMap[key] = [];
    apptMap[key].push(apt);
  });

  return (
    <div className="space-y-4">
      {/* Weekly Header Bar */}
      <GlassCard
        variant="white"
        padding="md"
        rounded="2xl"
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#DFEEFF] text-[#1B5494] flex items-center justify-center font-bold shadow-2xs">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black font-heading text-[#34354A]">
              Week of {weekRangeStr}
            </h2>
            <p className="text-xs font-semibold text-[#575973]">
              7-day visual consultation schedule
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={goToThisWeek}
            className="rounded-xl text-xs"
          >
            <span>This Week</span>
          </Button>

          <div className="flex items-center rounded-xl border border-[#ECEAF5] bg-white p-0.5">
            <button
              onClick={prevWeek}
              className="p-1.5 rounded-lg text-[#575973] hover:bg-[#FAF9FF] hover:text-[#34354A] transition-colors cursor-pointer"
              title="Previous Week"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextWeek}
              className="p-1.5 rounded-lg text-[#575973] hover:bg-[#FAF9FF] hover:text-[#34354A] transition-colors cursor-pointer"
              title="Next Week"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </GlassCard>

      {/* 7-Column Weekly Grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        {weekDays.map((dayDate, idx) => {
          const key = `${dayDate.getFullYear()}-${String(dayDate.getMonth() + 1).padStart(
            2,
            '0'
          )}-${String(dayDate.getDate()).padStart(2, '0')}`;
          const dayAppts = apptMap[key] || [];
          const isCurrentDay = isToday(dayDate);

          return (
            <GlassCard
              key={idx}
              variant={isCurrentDay ? 'babyBlue' : 'white'}
              padding="sm"
              rounded="2xl"
              className={`border-2 flex flex-col justify-between min-h-[300px] ${
                isCurrentDay ? 'border-[#7969B5] shadow-glass-sm' : 'border-[#ECEAF5]'
              }`}
            >
              <div>
                {/* Column Day Header */}
                <div
                  className={`text-center py-2 px-1 rounded-xl mb-2.5 ${
                    isCurrentDay
                      ? 'bg-[#7969B5] text-white shadow-2xs'
                      : 'bg-[#FAF9FF] text-[#34354A]'
                  }`}
                >
                  <p className="text-[11px] font-black font-heading uppercase tracking-wider">
                    {dayDate.toLocaleDateString('en-US', { weekday: 'short' })}
                  </p>
                  <p className="text-base font-black font-heading">
                    {dayDate.getDate()}
                  </p>
                  {isCurrentDay && (
                    <span className="text-[10px] font-extrabold uppercase tracking-wide opacity-90">
                      Today
                    </span>
                  )}
                </div>

                {/* List of Appointments on this day */}
                <div className="space-y-2">
                  {dayAppts.length > 0 ? (
                    dayAppts.map((apt) => (
                      <div
                        key={apt.id}
                        onClick={() => onViewDetails(apt)}
                        className={`p-2.5 rounded-xl border text-left transition-all hover:scale-102 cursor-pointer shadow-2xs space-y-1.5 ${
                          apt.status === 'COMPLETED'
                            ? 'bg-[#DDF5E9] border-[#B7E7CE] text-[#1D6A48]'
                            : apt.status === 'CANCELLED'
                            ? 'bg-[#FCE4ED] border-[#F7C6D7] text-[#A62650]'
                            : apt.status === 'RESCHEDULED'
                            ? 'bg-[#FFE9DC] border-[#FBD2BA] text-[#B85820]'
                            : 'bg-white border-[#BDDCFF] text-[#1B5494]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {apt.appointmentTime || '10:00 AM'}
                          </span>
                          <CountdownBadge
                            appointmentDate={apt.appointmentDate}
                            status={apt.status}
                            size="sm"
                          />
                        </div>

                        <div>
                          <p className="text-xs font-black font-heading truncate text-[#34354A]">
                            {apt.doctorName}
                          </p>
                          <p className="text-[10px] font-bold text-[#7969B5] truncate">
                            {apt.specialty}
                          </p>
                        </div>

                        <p className="text-[10px] font-medium text-[#575973] truncate flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#7A7D9D] flex-shrink-0" />
                          <span className="truncate">{apt.hospitalName || apt.location}</span>
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-[#A2A1B8]">
                      <p className="text-xs font-medium italic">No visits</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick schedule slot button */}
              <div className="pt-2 mt-auto border-t border-[#ECEAF5]">
                <button
                  type="button"
                  onClick={onBookAppointment}
                  className="w-full py-1 text-[11px] font-bold text-[#7969B5] hover:text-[#55428F] hover:bg-white rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add</span>
                </button>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
};

