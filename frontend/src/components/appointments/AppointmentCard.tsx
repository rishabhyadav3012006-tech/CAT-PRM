import React from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  Building2,
  FileText,
  CheckCircle2,
  CalendarClock,
  MoreVertical,
  Stethoscope,
  Eye,
  Edit2,
  AlertTriangle
} from 'lucide-react';
import { Appointment } from '../../types/index.ts';
import { GlassCard } from '../ui/GlassCard.tsx';
import { CuteBadge } from '../ui/CuteBadge.tsx';
import { Button } from '../ui/Button.tsx';
import { CountdownBadge } from './CountdownBadge.tsx';

interface AppointmentCardProps {
  appointment: Appointment;
  onViewDetails: (apt: Appointment) => void;
  onEdit: (apt: Appointment) => void;
  onReschedule: (apt: Appointment) => void;
  onCancel: (apt: Appointment) => void;
  onMarkCompleted: (id: string) => void;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onViewDetails,
  onEdit,
  onReschedule,
  onCancel,
  onMarkCompleted
}) => {
  const isActionable =
    appointment.status === 'UPCOMING' ||
    appointment.status === 'SCHEDULED' ||
    appointment.status === 'RESCHEDULED';

  const dateObj = new Date(appointment.appointmentDate);
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const timeString =
    appointment.appointmentTime ||
    dateObj.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });

  // Pick specialty color theme
  const getSpecialtyColor = (spec: string) => {
    const s = spec.toLowerCase();
    if (s.includes('cardio')) return { bg: 'bg-[#FFE9DC]', text: 'text-[#B85820]' };
    if (s.includes('neuro') || s.includes('psy')) return { bg: 'bg-[#E9E3FF]', text: 'text-[#55428F]' };
    if (s.includes('opht') || s.includes('eye')) return { bg: 'bg-[#DFEEFF]', text: 'text-[#1B5494]' };
    if (s.includes('derm')) return { bg: 'bg-[#FCE4ED]', text: 'text-[#A62650]' };
    if (s.includes('phys') || s.includes('therap')) return { bg: 'bg-[#DDF5E9]', text: 'text-[#1D6A48]' };
    return { bg: 'bg-[#DFEEFF]', text: 'text-[#1B5494]' };
  };

  const colorTheme = getSpecialtyColor(appointment.specialty);

  return (
    <GlassCard
      variant="white"
      padding="lg"
      rounded="3xl"
      className="border-2 hover:border-[#C2B5F0] transition-all hover:shadow-glass duration-200 flex flex-col justify-between"
    >
      <div>
        {/* Top Badges & Countdown */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <CountdownBadge
              appointmentDate={appointment.appointmentDate}
              status={appointment.status}
            />

            {appointment.status === 'RESCHEDULED' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-xl text-[11px] font-bold bg-[#FFE9DC] text-[#B85820] border border-[#FBD2BA]">
                <CalendarClock className="w-3 h-3" />
                Rescheduled
              </span>
            )}
          </div>

          <CuteBadge
            variant={
              appointment.status === 'COMPLETED'
                ? 'mint'
                : appointment.status === 'CANCELLED'
                ? 'pink'
                : appointment.status === 'RESCHEDULED'
                ? 'peach'
                : 'babyBlue'
            }
            size="sm"
          >
            {appointment.status}
          </CuteBadge>
        </div>

        {/* Doctor Header */}
        <div className="flex items-start gap-3.5 mb-3.5">
          <div
            className={`w-13 h-13 rounded-2xl ${colorTheme.bg} ${colorTheme.text} flex items-center justify-center flex-shrink-0 shadow-2xs`}
          >
            <Stethoscope className="w-6 h-6" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-black font-heading text-[#34354A] text-lg leading-tight truncate">
                {appointment.doctorName}
              </h3>
            </div>
            <p className="text-xs font-bold font-heading text-[#7969B5] mt-0.5">
              {appointment.specialty}
            </p>
            {appointment.hospitalName && (
              <p className="text-xs font-medium font-body text-[#575973] flex items-center gap-1 mt-1 truncate">
                <Building2 className="w-3.5 h-3.5 text-[#7A7D9D] flex-shrink-0" />
                <span className="truncate">{appointment.hospitalName}</span>
              </p>
            )}
          </div>
        </div>

        {/* Appointment Timing & Location details */}
        <div className="space-y-2 bg-[#FAF9FF] p-3 rounded-2xl border border-[#ECEAF5] mb-3">
          <div className="flex items-center gap-2 text-xs font-bold font-body text-[#34354A]">
            <Calendar className="w-4 h-4 text-[#7969B5] flex-shrink-0" />
            <span>{formattedDate}</span>
            <span className="text-[#A2A1B8]">•</span>
            <Clock className="w-3.5 h-3.5 text-[#7969B5] flex-shrink-0" />
            <span>{timeString}</span>
          </div>

          <div className="flex items-start gap-2 text-xs font-medium font-body text-[#575973]">
            <MapPin className="w-4 h-4 text-[#7A7D9D] flex-shrink-0 mt-0.5" />
            <span className="leading-snug">{appointment.location}</span>
          </div>

          {appointment.contactNumber && (
            <div className="flex items-center gap-2 text-xs font-medium font-body text-[#575973]">
              <Phone className="w-3.5 h-3.5 text-[#2B6EB5] flex-shrink-0" />
              <a
                href={`tel:${appointment.contactNumber}`}
                className="text-[#2B6EB5] hover:underline font-bold"
              >
                {appointment.contactNumber}
              </a>
            </div>
          )}
        </div>

        {/* Notes preview if available */}
        {appointment.notes && (
          <p className="text-xs font-medium font-body text-[#575973] bg-[#FFF9ED] border border-[#F7ECCF] p-2.5 rounded-xl mb-3 leading-relaxed line-clamp-2">
            <strong className="text-[#34354A]">Prep Note:</strong> {appointment.notes}
          </p>
        )}

        {/* Reschedule Reason if available */}
        {appointment.rescheduleReason && appointment.status === 'RESCHEDULED' && (
          <p className="text-xs font-medium font-body text-[#B85820] bg-[#FFE9DC]/60 border border-[#FBD2BA] p-2 rounded-xl mb-3 flex items-start gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-[#B85820]" />
            <span>
              <strong>Note:</strong> {appointment.rescheduleReason}
            </span>
          </p>
        )}

        {/* Cancellation Reason if cancelled */}
        {appointment.cancelReason && appointment.status === 'CANCELLED' && (
          <p className="text-xs font-medium font-body text-[#A62650] bg-[#FCE4ED]/60 border border-[#F7C6D7] p-2 rounded-xl mb-3">
            <strong>Cancelled:</strong> {appointment.cancelReason}
          </p>
        )}

        {/* Documents indicator */}
        {appointment.documents && appointment.documents.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#575973] mb-3">
            <FileText className="w-3.5 h-3.5 text-[#7969B5]" />
            <span>
              {appointment.documents.length} Medical Document
              {appointment.documents.length > 1 ? 's' : ''} Attached
            </span>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-[#ECEAF5] flex flex-wrap items-center justify-between gap-2 mt-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onViewDetails(appointment)}
          leftIcon={<Eye className="w-3.5 h-3.5" />}
          className="rounded-xl flex-1 sm:flex-initial"
        >
          <span>Details</span>
        </Button>

        {isActionable ? (
          <div className="flex items-center gap-1.5 flex-wrap justify-end flex-1">
            <Button
              variant="mint"
              size="sm"
              onClick={() => onMarkCompleted(appointment.id)}
              leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
              className="rounded-xl"
              title="Mark consultation completed"
            >
              <span>Complete</span>
            </Button>

            <Button
              variant="peach"
              size="sm"
              onClick={() => onReschedule(appointment)}
              leftIcon={<CalendarClock className="w-3.5 h-3.5" />}
              className="rounded-xl"
              title="Reschedule appointment"
            >
              <span>Reschedule</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(appointment)}
              leftIcon={<Edit2 className="w-3.5 h-3.5" />}
              className="rounded-xl text-[#575973] hover:text-[#34354A]"
              title="Edit appointment"
            >
              <span>Edit</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCancel(appointment)}
              className="rounded-xl text-rose-600 hover:bg-[#FCE4ED]/60 px-2"
              title="Cancel appointment"
            >
              <span>Cancel</span>
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 ml-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(appointment)}
              leftIcon={<Edit2 className="w-3.5 h-3.5" />}
              className="rounded-xl text-[#575973]"
            >
              <span>Edit Info</span>
            </Button>
          </div>
        )}
      </div>
    </GlassCard>
  );
};

