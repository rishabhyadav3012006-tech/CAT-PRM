import React from 'react';
import { Pill, CheckCircle2, AlertTriangle, HelpCircle, Calendar, Users, TrendingUp } from 'lucide-react';
import { AnalyticsCards } from '../../types/index.ts';

interface MetricCardsGridProps {
  cards: AnalyticsCards;
  periodLabel: string;
}

export const MetricCardsGrid: React.FC<MetricCardsGridProps> = ({ cards, periodLabel }) => {
  const adherenceColor =
    cards.adherenceRate >= 80 ? 'text-[#2B8756]' : cards.adherenceRate >= 60 ? 'text-[#B85820]' : 'text-[#B53364]';
  const adherenceBadgeBg =
    cards.adherenceRate >= 80 ? 'bg-[#DDF5E9] text-[#1F6A42]' : cards.adherenceRate >= 60 ? 'bg-[#FFE9DC] text-[#8E3F10]' : 'bg-[#FCE4ED] text-[#8F1E48]';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
      {/* 1. Total Scheduled Doses */}
      <div className="bg-white/85 backdrop-blur-glass border border-white/95 rounded-3xl p-4 shadow-glass hover:shadow-glass-lg transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold font-title text-[#7A7D9D] uppercase tracking-wider">
            Total Doses
          </span>
          <div className="w-8 h-8 rounded-2xl bg-[#DFEEFF] text-[#2B6EB5] flex items-center justify-center shadow-2xs">
            <Pill className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-extrabold font-heading text-[#34354A]">
            {cards.totalScheduledDoses}
          </div>
          <div className="text-[11px] text-[#7A7D9D] font-medium mt-0.5">
            {cards.eligibleDoses} eligible in {periodLabel.toLowerCase()}
          </div>
        </div>
      </div>

      {/* 2. Doses Recorded as Taken */}
      <div className="bg-white/85 backdrop-blur-glass border border-white/95 rounded-3xl p-4 shadow-glass hover:shadow-glass-lg transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold font-title text-[#7A7D9D] uppercase tracking-wider">
            Recorded Taken
          </span>
          <div className="w-8 h-8 rounded-2xl bg-[#DDF5E9] text-[#2B8756] flex items-center justify-center shadow-2xs">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold font-heading text-[#2B8756]">
              {cards.takenCount}
            </span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${adherenceBadgeBg}`}>
              {cards.adherenceRate}%
            </span>
          </div>
          <div className="text-[11px] text-[#7A7D9D] font-medium mt-0.5 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-[#2B8756]" />
            <span>Confirmed taken</span>
          </div>
        </div>
      </div>

      {/* 3. Skipped Doses */}
      <div className="bg-white/85 backdrop-blur-glass border border-white/95 rounded-3xl p-4 shadow-glass hover:shadow-glass-lg transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold font-title text-[#7A7D9D] uppercase tracking-wider">
            Skipped Doses
          </span>
          <div className="w-8 h-8 rounded-2xl bg-[#FFE9DC] text-[#B85820] flex items-center justify-center shadow-2xs">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-extrabold font-heading text-[#B85820]">
            {cards.skippedCount}
          </div>
          <div className="text-[11px] text-[#7A7D9D] font-medium mt-0.5">
            Recorded with clinical reasons
          </div>
        </div>
      </div>

      {/* 4. Missed or Unconfirmed Doses */}
      <div className="bg-white/85 backdrop-blur-glass border border-white/95 rounded-3xl p-4 shadow-glass hover:shadow-glass-lg transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold font-title text-[#7A7D9D] uppercase tracking-wider">
            Missed / Pending
          </span>
          <div className="w-8 h-8 rounded-2xl bg-[#FCE4ED] text-[#B53364] flex items-center justify-center shadow-2xs">
            <HelpCircle className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-extrabold font-heading text-[#B53364]">
            {cards.missedOrUnconfirmedCount}
          </div>
          <div className="text-[10px] text-[#7A7D9D] font-semibold mt-0.5 flex items-center justify-between">
            <span className="text-[#8F1E48]">{cards.missedCount} Missed</span>
            <span>•</span>
            <span className="text-[#554391]">{cards.unconfirmedCount} Unconfirmed</span>
          </div>
        </div>
      </div>

      {/* 5. Upcoming Appointments */}
      <div className="bg-white/85 backdrop-blur-glass border border-white/95 rounded-3xl p-4 shadow-glass hover:shadow-glass-lg transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold font-title text-[#7A7D9D] uppercase tracking-wider">
            Appointments
          </span>
          <div className="w-8 h-8 rounded-2xl bg-[#E9E3FF] text-[#7969B5] flex items-center justify-center shadow-2xs">
            <Calendar className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-extrabold font-heading text-[#7969B5]">
            {cards.upcomingAppointmentsCount}
          </div>
          <div className="text-[11px] text-[#7A7D9D] font-medium mt-0.5">
            Upcoming doctor visits
          </div>
        </div>
      </div>

      {/* 6. Active Caretakers */}
      <div className="bg-white/85 backdrop-blur-glass border border-white/95 rounded-3xl p-4 shadow-glass hover:shadow-glass-lg transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold font-title text-[#7A7D9D] uppercase tracking-wider">
            Caretakers
          </span>
          <div className="w-8 h-8 rounded-2xl bg-[#DDF5E9] text-[#2B8756] flex items-center justify-center shadow-2xs">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-extrabold font-heading text-[#34354A]">
            {cards.activeCaretakersCount}
          </div>
          <div className="text-[11px] text-[#7A7D9D] font-medium mt-0.5">
            Active care circle members
          </div>
        </div>
      </div>
    </div>
  );
};

