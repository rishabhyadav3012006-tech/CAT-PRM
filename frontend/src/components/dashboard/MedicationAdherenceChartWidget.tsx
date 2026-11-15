import React from 'react';
import { Pill, CheckCircle2, TrendingUp, AlertCircle, Sparkles } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard.tsx';
import { CuteBadge } from '../ui/CuteBadge.tsx';

interface MedicationAdherenceChartWidgetProps {
  rate?: number;
  summary?: {
    taken: number;
    missed: number;
    total: number;
  };
}

export const MedicationAdherenceChartWidget: React.FC<MedicationAdherenceChartWidgetProps> = ({
  rate = 94,
  summary = { taken: 26, missed: 2, total: 28 }
}) => {
  // 7-day adherence bars
  const weeklyData = [
    { day: 'Mon', rate: 100 },
    { day: 'Tue', rate: 100 },
    { day: 'Wed', rate: 90 },
    { day: 'Thu', rate: 100 },
    { day: 'Fri', rate: 95 },
    { day: 'Sat', rate: 85 },
    { day: 'Sun', rate: 100 }
  ];

  // SVG Circular progress math
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (rate / 100) * circumference;

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
          <div className="w-8 h-8 rounded-xl bg-[#DDF5E9] text-[#2B8756] flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black font-heading text-[#34354A]">
              Medication Adherence
            </h3>
            <p className="text-xs text-[#7A7D9D] font-medium">Weekly prescription compliance</p>
          </div>
        </div>

        <CuteBadge variant="mint" size="sm" icon={<Sparkles className="w-3 h-3" />}>
          <span>Optimal Routine</span>
        </CuteBadge>
      </div>

      {/* Main Stats Row: Circular Ring + Summary */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-4 rounded-2xl bg-[#FAF9FF] border border-[#E5E4F2]">
        {/* SVG Circular Ring */}
        <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            {/* Background Track */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              className="text-[#E9E3FF]"
              strokeWidth="9"
              stroke="currentColor"
              fill="transparent"
            />
            {/* Progress Arc */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="#22C55E"
              strokeWidth="9"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-2xl font-black font-heading text-[#34354A]">{rate}%</span>
            <span className="text-[10px] font-bold text-[#7A7D9D] uppercase">Weekly</span>
          </div>
        </div>

        {/* Breakdown Stats */}
        <div className="space-y-2 flex-1 w-full text-xs">
          <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-[#ECEBF8]">
            <span className="text-[#575973] font-medium flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Doses Taken On-Time</span>
            </span>
            <span className="font-extrabold text-[#34354A]">{summary.taken} doses</span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-[#ECEBF8]">
            <span className="text-[#575973] font-medium flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
              <span>Missed / Snoozed</span>
            </span>
            <span className="font-extrabold text-[#34354A]">{summary.missed} doses</span>
          </div>

          <p className="text-[11px] text-emerald-700 font-semibold pt-0.5">
            ✓ Eleanor is 14% higher than the clinical target for senior adherence!
          </p>
        </div>
      </div>

      {/* 7-Day Mini Bar Chart */}
      <div className="space-y-2 pt-1">
        <p className="text-xs font-bold text-[#34354A]">7-Day Adherence Trend</p>
        <div className="grid grid-cols-7 gap-2 h-20 items-end pt-2">
          {weeklyData.map((w) => (
            <div key={w.day} className="flex flex-col items-center gap-1 h-full justify-end">
              <div className="w-full bg-[#FAF9FF] rounded-lg h-14 relative flex items-end overflow-hidden border border-[#ECEBF8]">
                <div
                  className="w-full bg-gradient-to-t from-[#7969B5] to-[#9E8EE4] rounded-lg transition-all duration-500"
                  style={{ height: `${w.rate}%` }}
                />
              </div>
              <span className="text-[10px] font-bold text-[#7A7D9D]">{w.day}</span>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
};

