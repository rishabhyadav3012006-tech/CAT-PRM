import React from 'react';
import {
  Clock,
  UserPlus,
  UserCheck,
  Shield,
  Sliders,
  UserX,
  Pill,
  Calendar,
  Activity,
  History
} from 'lucide-react';
import { CareCircleActivity } from '../../types/index.ts';
import { GlassCard } from '../ui/GlassCard.tsx';
import { CuteBadge } from '../ui/CuteBadge.tsx';

interface ActivityTimelineProps {
  activities: CareCircleActivity[];
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activities }) => {
  const getActionIcon = (type: CareCircleActivity['actionType']) => {
    switch (type) {
      case 'MEMBER_INVITED':
        return { icon: <UserPlus className="w-4 h-4 text-[#1B5494]" />, bg: 'bg-[#DFEEFF]' };
      case 'MEMBER_JOINED':
        return { icon: <UserCheck className="w-4 h-4 text-[#B85820]" />, bg: 'bg-[#FFE9DC]' };
      case 'REQUEST_APPROVED':
        return { icon: <UserCheck className="w-4 h-4 text-[#1D6A48]" />, bg: 'bg-[#DDF5E9]' };
      case 'REQUEST_REJECTED':
      case 'ACCESS_REVOKED':
        return { icon: <UserX className="w-4 h-4 text-[#A62650]" />, bg: 'bg-[#FCE4ED]' };
      case 'ROLE_UPDATED':
        return { icon: <Shield className="w-4 h-4 text-[#55428F]" />, bg: 'bg-[#E9E3FF]' };
      case 'PERMISSIONS_UPDATED':
        return { icon: <Sliders className="w-4 h-4 text-[#7969B5]" />, bg: 'bg-[#E9E3FF]' };
      case 'MEDICATION_LOGGED':
        return { icon: <Pill className="w-4 h-4 text-[#2B8756]" />, bg: 'bg-[#DDF5E9]' };
      case 'APPOINTMENT_SCHEDULED':
        return { icon: <Calendar className="w-4 h-4 text-[#2B6EB5]" />, bg: 'bg-[#DFEEFF]' };
      case 'VITAL_RECORDED':
        return { icon: <Activity className="w-4 h-4 text-[#B85820]" />, bg: 'bg-[#FFE9DC]' };
      default:
        return { icon: <History className="w-4 h-4 text-[#7969B5]" />, bg: 'bg-[#FAF9FF]' };
    }
  };

  const getRelativeTime = (timeStr: string) => {
    const diffMs = Date.now() - new Date(timeStr).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  return (
    <GlassCard variant="white" padding="lg" rounded="3xl" className="border-2 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-[#7969B5]" />
          <h3 className="font-black font-heading text-[#34354A] text-base">
            Care Circle Activity Ledger
          </h3>
        </div>
        <CuteBadge variant="lavender" size="sm">
          Live Collaboration Stream
        </CuteBadge>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#ECEAF5]">
        {activities.map((act) => {
          const visual = getActionIcon(act.actionType);
          const timeLabel = getRelativeTime(act.timestamp);

          return (
            <div key={act.id} className="relative flex items-start gap-3.5 group">
              {/* Timeline Dot / Icon */}
              <div
                className={`absolute -left-6 w-5 h-5 rounded-full ${visual.bg} border-2 border-white shadow-2xs flex items-center justify-center -translate-x-1/2 mt-1`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
              </div>

              {/* Actor Avatar */}
              {act.actorAvatar ? (
                <img
                  src={act.actorAvatar}
                  alt={act.actorName}
                  className="w-9 h-9 rounded-xl object-cover border border-[#ECEAF5] flex-shrink-0"
                />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-[#FAF9FF] border border-[#ECEAF5] text-[#7969B5] font-black text-xs flex items-center justify-center flex-shrink-0">
                  {act.actorName.substring(0, 2).toUpperCase()}
                </div>
              )}

              {/* Details */}
              <div className="flex-1 bg-[#FAF9FF] p-3 rounded-2xl border border-[#ECEAF5] transition-all hover:border-[#D1C6F8]">
                <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black font-heading text-[#34354A]">
                      {act.actorName}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-white border border-[#ECEAF5] text-[#7969B5]">
                      {act.actorRole.replace('_', ' ')}
                    </span>
                  </div>

                  <span className="text-[10px] font-medium text-[#7A7D9D] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#A2A1B8]" />
                    {timeLabel}
                  </span>
                </div>

                <p className="text-xs font-medium text-[#575973] leading-relaxed">
                  {act.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
};

