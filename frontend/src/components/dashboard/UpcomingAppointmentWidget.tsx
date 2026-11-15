import React from 'react';
import { Calendar, Clock, MapPin, Phone, ArrowRight, UserCheck, Stethoscope } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard.tsx';
import { CuteBadge } from '../ui/CuteBadge.tsx';
import { Button } from '../ui/Button.tsx';
import { Link } from 'react-router-dom';
import { Appointment } from '../../types/index.ts';

interface UpcomingAppointmentWidgetProps {
  appointment?: Appointment;
}

export const UpcomingAppointmentWidget: React.FC<UpcomingAppointmentWidgetProps> = ({
  appointment = {
    id: 'apt-01',
    elderlyId: 'eld-01',
    doctorName: 'Dr. Elizabeth Adams',
    specialty: 'Cardiologist',
    location: 'St. Jude Heart Center, Suite 402, Springfield',
    appointmentDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    status: 'SCHEDULED',
    notes: 'Quarterly blood pressure checkup and echocardiogram review. Fasting not required.'
  } as any
}) => {
  const aptDate = new Date(appointment.appointmentDate);
  const formattedDate = aptDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
  const formattedTime = aptDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

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
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black font-heading text-[#34354A]">
              Upcoming Doctor Appointment
            </h3>
            <p className="text-xs text-[#7A7D9D] font-medium">Healthcare visits & consultations</p>
          </div>
        </div>

        <CuteBadge variant="babyBlue" size="sm">
          <span>Tomorrow</span>
        </CuteBadge>
      </div>

      {/* Appointment Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-[#FAF9FF] to-[#F3F6FF] border border-[#E5E4F2] space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white border border-[#DFEEFF] text-[#2B6EB5] flex items-center justify-center shadow-xs shrink-0">
              <Stethoscope className="w-6 h-6 text-[#7969B5]" />
            </div>

            <div>
              <h4 className="text-base font-extrabold font-heading text-[#34354A]">
                {appointment.doctorName}
              </h4>
              <p className="text-xs font-bold text-[#7969B5]">
                {appointment.specialty}
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-xs font-extrabold font-heading text-[#34354A]">{formattedDate}</p>
            <p className="text-xs font-semibold text-[#7A7D9D]">{formattedTime}</p>
          </div>
        </div>

        {/* Location & Instructions */}
        <div className="space-y-1.5 text-xs text-[#575973] pt-1 border-t border-[#E5E4F2]/70">
          <p className="flex items-center gap-1.5 font-medium">
            <MapPin className="w-3.5 h-3.5 text-[#7969B5] shrink-0" />
            <span>{appointment.location}</span>
          </p>
          {appointment.notes && (
            <p className="text-[11px] text-[#7A7D9D] italic pl-5">
              "{appointment.notes}"
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <a
            href="tel:5555678901"
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#E5E4F2] text-xs font-bold text-[#34354A] hover:bg-[#FAF9FF] transition-all shadow-xs"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-600" />
            <span>Call Clinic</span>
          </a>

          <Link
            to="/appointments"
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#7969B5] text-white text-xs font-bold hover:bg-[#6755A4] transition-all shadow-glow-purple/20"
          >
            <span>View All Visits</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </GlassCard>
  );
};

