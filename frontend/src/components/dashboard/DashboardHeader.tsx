import React, { useState, useEffect } from 'react';
import { Clock, Calendar as CalendarIcon, Sparkles, User, Heart, Users, Stethoscope } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard.tsx';
import { CuteBadge, BadgeVariant } from '../ui/CuteBadge.tsx';
import { UserRole } from '../../types/index.ts';

interface DashboardHeaderProps {
  userName: string;
  role: UserRole;
  activeRoleView: UserRole;
  onSwitchRoleView: (role: UserRole) => void;
  subtitle?: string;
  patientName?: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  userName,
  role,
  activeRoleView,
  onSwitchRoleView,
  subtitle,
  patientName = 'Eleanor Vance'
}) => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentDateTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const formattedDate = currentDateTime.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const formattedTime = currentDateTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const roleConfig: Record<
    UserRole,
    { title: string; badge: BadgeVariant; icon: React.ReactNode; bg: string; border: string }
  > = {
    ELDERLY: {
      title: 'Elderly Individual Dashboard',
      badge: 'mint',
      icon: <Heart className="w-4 h-4 text-emerald-600 fill-emerald-600/20" />,
      bg: 'from-[#DDF5E9]/80 via-white/80 to-[#E9E3FF]/70',
      border: 'border-[#BBEBCE]'
    },
    FAMILY_MEMBER: {
      title: 'Family Care Circle Dashboard',
      badge: 'babyBlue',
      icon: <Users className="w-4 h-4 text-sky-600" />,
      bg: 'from-[#DFEEFF]/80 via-white/80 to-[#E9E3FF]/70',
      border: 'border-[#C1DEFC]'
    },
    CAREGIVER: {
      title: 'Healthcare Caretaker Dashboard',
      badge: 'lavender',
      icon: <Stethoscope className="w-4 h-4 text-[#7969B5]" />,
      bg: 'from-[#E9E3FF]/80 via-white/80 to-[#FFE9DC]/70',
      border: 'border-[#D2C7FC]'
    },
    DOCTOR: {
      title: 'Physician Clinical Portal',
      badge: 'peach',
      icon: <Stethoscope className="w-4 h-4 text-orange-600" />,
      bg: 'from-[#FFE9DC]/80 via-white/80 to-[#FAF9FF]/70',
      border: 'border-[#FFD7BE]'
    },
    ADMIN: {
      title: 'CareNest Administrator',
      badge: 'cream',
      icon: <Sparkles className="w-4 h-4 text-amber-600" />,
      bg: 'from-[#FFF9ED]/80 via-white/80 to-[#E9E3FF]/70',
      border: 'border-[#FCEAB8]'
    }
  };

  const currentConfig = roleConfig[activeRoleView] || roleConfig.ELDERLY;

  return (
    <div className="space-y-4">
      {/* 1-Click Interactive Role Perspective Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 rounded-2xl bg-white/70 backdrop-blur-md border border-[#E5E4F2] shadow-xs">
        <div className="flex items-center gap-2 pl-2">
          <span className="text-[11px] font-extrabold font-title text-[#7A7D9D] uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#7969B5]" />
            <span>Dashboard Mode:</span>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => onSwitchRoleView('ELDERLY')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold font-heading flex items-center gap-1.5 transition-all cursor-pointer ${
              activeRoleView === 'ELDERLY'
                ? 'bg-[#DDF5E9] text-[#1F6A42] border border-[#22C55E]/40 shadow-xs'
                : 'bg-white/60 text-[#575973] hover:bg-white hover:text-[#34354A]'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-emerald-600" />
            <span>👵 Elderly Individual</span>
          </button>

          <button
            type="button"
            onClick={() => onSwitchRoleView('FAMILY_MEMBER')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold font-heading flex items-center gap-1.5 transition-all cursor-pointer ${
              activeRoleView === 'FAMILY_MEMBER'
                ? 'bg-[#DFEEFF] text-[#1A4E85] border border-[#3B82F6]/40 shadow-xs'
                : 'bg-white/60 text-[#575973] hover:bg-white hover:text-[#34354A]'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-sky-600" />
            <span>👨‍👩‍👧 Family Member</span>
          </button>

          <button
            type="button"
            onClick={() => onSwitchRoleView('CAREGIVER')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold font-heading flex items-center gap-1.5 transition-all cursor-pointer ${
              activeRoleView === 'CAREGIVER'
                ? 'bg-[#E9E3FF] text-[#45347B] border border-[#7969B5]/40 shadow-xs'
                : 'bg-white/60 text-[#575973] hover:bg-white hover:text-[#34354A]'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5 text-[#7969B5]" />
            <span>🩺 Caretaker</span>
          </button>
        </div>
      </div>

      {/* Main Hero Card */}
      <GlassCard
        variant="white"
        padding="lg"
        rounded="3xl"
        className={`relative overflow-hidden bg-gradient-to-r ${currentConfig.bg} border-2 ${currentConfig.border} shadow-glass-md`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10 text-left">
          {/* Left Greeting & Subtitle */}
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <CuteBadge variant={currentConfig.badge} size="md" icon={currentConfig.icon}>
                {currentConfig.title}
              </CuteBadge>
              {patientName && activeRoleView !== 'ELDERLY' && (
                <CuteBadge variant="mint" size="md" dot>
                  Patient: <strong>{patientName}</strong>
                </CuteBadge>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-heading text-[#34354A] tracking-tight">
              {getGreeting()}, <span className="text-[#7969B5]">{userName}</span>! 🌸
            </h1>

            <p className="text-xs sm:text-sm font-medium font-body text-[#575973] leading-relaxed">
              {subtitle ||
                (activeRoleView === 'ELDERLY'
                  ? 'Your daily medications, gentle activities, and appointments are safely coordinated with your family.'
                  : activeRoleView === 'FAMILY_MEMBER'
                  ? "Track Eleanor's daily adherence, review caregiver vitals, and keep the whole family connected."
                  : 'Manage medication administration, fulfill care tasks, and record vitals for your assigned seniors.')}
            </p>
          </div>

          {/* Right Live Clock & Date Badge */}
          <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-2 shrink-0">
            {/* Live Time Display */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/90 backdrop-blur-md border border-white shadow-glass-sm">
              <Clock className="w-4 h-4 text-[#7969B5] animate-pulse" />
              <span className="text-sm sm:text-base font-black font-heading text-[#34354A] tracking-wide">
                {formattedTime}
              </span>
            </div>

            {/* Live Date Display */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/70 border border-[#E5E4F2] text-xs font-bold text-[#575973]">
              <CalendarIcon className="w-3.5 h-3.5 text-[#7969B5]" />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

