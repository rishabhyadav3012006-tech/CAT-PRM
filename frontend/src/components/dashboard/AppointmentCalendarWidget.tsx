import React from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, User, Car, ArrowRight } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard.tsx';
import { CuteBadge } from '../ui/CuteBadge.tsx';
import { Link } from 'react-router-dom';

export const AppointmentCalendarWidget: React.FC = () => {
  const appointments = [
    {
      id: 'apt-c1',
      patientName: 'Eleanor Vance',
      doctor: 'Dr. Elizabeth Adams (Cardiology)',
      time: 'Tomorrow, 10:30 AM',
      location: 'St. Jude Heart Center, Suite 402',
      transport: 'Escort Needed • Wheelchair Van',
      badge: 'babyBlue' as const
    },
    {
      id: 'apt-c2',
      patientName: 'Arthur Pendelton',
      doctor: 'Dr. Robert Keller (Neurology)',
      time: 'Thursday, 02:00 PM',
      location: 'Portland Health Plaza, Rm 310',
      transport: 'Escort Needed • Walker Support',
      badge: 'peach' as const
    }
  ];

  return (
    <GlassCard
      variant="white"
      padding="lg"
      rounded="3xl"
      className="space-y-4 border border-[#E5E4F2] shadow-glass-sm text-left"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#DFEEFF] text-[#2B6EB5] flex items-center justify-center">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black font-heading text-[#34354A]">
              Care Escort & Appointment Calendar
            </h3>
            <p className="text-xs text-[#7A7D9D] font-medium">Assigned patient clinical appointments</p>
          </div>
        </div>

        <Link
          to="/appointments"
          className="text-xs font-bold text-[#7969B5] hover:text-[#6755A4] flex items-center gap-1 hover:underline"
        >
          <span>All Visits</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Appointment Cards */}
      <div className="space-y-2.5">
        {appointments.map((apt) => (
          <div
            key={apt.id}
            className="p-3.5 rounded-2xl bg-[#FAF9FF] border border-[#E5E4F2] hover:bg-white transition-all space-y-2 shadow-2xs"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-[#7969B5] bg-white px-2 py-0.5 rounded-full border border-[#ECEBF8]">
                  {apt.patientName}
                </span>
                <h4 className="text-xs sm:text-sm font-extrabold font-heading text-[#34354A] pt-1">
                  {apt.doctor}
                </h4>
              </div>
              <CuteBadge variant={apt.badge} size="sm">
                {apt.time}
              </CuteBadge>
            </div>

            <div className="space-y-1 text-xs text-[#575973]">
              <p className="flex items-center gap-1.5 font-medium">
                <MapPin className="w-3.5 h-3.5 text-[#7969B5] shrink-0" />
                <span>{apt.location}</span>
              </p>
              <p className="flex items-center gap-1.5 text-[11px] text-[#7A7D9D] font-bold">
                <Car className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{apt.transport}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};

