import React from 'react';
import { Clock, CheckCircle2, XCircle, AlertCircle, Calendar } from 'lucide-react';
import { AppointmentStatusType } from '../../types/index.ts';

interface CountdownBadgeProps {
  appointmentDate: string;
  status: AppointmentStatusType;
  className?: string;
  size?: 'sm' | 'md';
}

export const getCountdownInfo = (dateStr: string, status: AppointmentStatusType) => {
  if (status === 'COMPLETED') {
    return {
      label: 'Completed',
      variant: 'mint',
      bgClass: 'bg-[#DDF5E9] text-[#1D6A48] border-[#B7E7CE]',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />
    };
  }

  if (status === 'CANCELLED') {
    return {
      label: 'Cancelled',
      variant: 'pink',
      bgClass: 'bg-[#FCE4ED] text-[#A62650] border-[#F7C6D7]',
      icon: <XCircle className="w-3.5 h-3.5" />
    };
  }

  const apptDate = new Date(dateStr);
  const now = new Date();

  // Normalize to local midnight for day-based comparison
  const apptMidnight = new Date(apptDate.getFullYear(), apptDate.getMonth(), apptDate.getDate()).getTime();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  const diffMs = apptMidnight - todayMidnight;
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return {
      label: status === 'RESCHEDULED' ? 'Rescheduled for Today' : 'Today',
      variant: 'peach',
      bgClass: 'bg-[#FFE9DC] text-[#B85820] border-[#FBD2BA] font-black animate-pulse',
      icon: <AlertCircle className="w-3.5 h-3.5 text-[#B85820]" />
    };
  }

  if (diffDays === 1) {
    return {
      label: status === 'RESCHEDULED' ? 'Rescheduled: Tomorrow' : 'Tomorrow',
      variant: 'peach',
      bgClass: 'bg-[#FFE9DC] text-[#B85820] border-[#FBD2BA] font-extrabold',
      icon: <Clock className="w-3.5 h-3.5 text-[#B85820]" />
    };
  }

  if (diffDays === -1) {
    return {
      label: 'Yesterday',
      variant: 'lavender',
      bgClass: 'bg-[#E9E3FF] text-[#55428F] border-[#D1C6F8]',
      icon: <Clock className="w-3.5 h-3.5" />
    };
  }

  if (diffDays > 1) {
    if (diffDays <= 6) {
      return {
        label: `In ${diffDays} days`,
        variant: 'babyBlue',
        bgClass: 'bg-[#DFEEFF] text-[#1B5494] border-[#BDDCFF]',
        icon: <Clock className="w-3.5 h-3.5" />
      };
    } else if (diffDays <= 28) {
      const weeks = Math.round(diffDays / 7);
      return {
        label: `In ${weeks} week${weeks > 1 ? 's' : ''}`,
        variant: 'babyBlue',
        bgClass: 'bg-[#DFEEFF] text-[#1B5494] border-[#BDDCFF]',
        icon: <Calendar className="w-3.5 h-3.5" />
      };
    } else {
      const months = Math.round(diffDays / 30);
      return {
        label: `In ${months} month${months > 1 ? 's' : ''}`,
        variant: 'cream',
        bgClass: 'bg-[#FFF9ED] text-[#8C6D1F] border-[#F7ECCF]',
        icon: <Calendar className="w-3.5 h-3.5" />
      };
    }
  }

  // Past dates
  const pastDays = Math.abs(diffDays);
  return {
    label: `${pastDays} days ago`,
    variant: 'neutral',
    bgClass: 'bg-[#F2F1F8] text-[#575973] border-[#E0DFED]',
    icon: <Clock className="w-3.5 h-3.5" />
  };
};

export const CountdownBadge: React.FC<CountdownBadgeProps> = ({
  appointmentDate,
  status,
  className = '',
  size = 'md'
}) => {
  const info = getCountdownInfo(appointmentDate, status);

  const sizeClasses =
    size === 'sm'
      ? 'px-2.5 py-0.5 text-[11px] gap-1'
      : 'px-3 py-1 text-xs gap-1.5';

  return (
    <span
      className={`inline-flex items-center rounded-xl border font-bold font-heading shadow-2xs transition-all ${info.bgClass} ${sizeClasses} ${className}`}
    >
      {info.icon}
      <span>{info.label}</span>
    </span>
  );
};

