import React, { useState } from 'react';
import { CheckSquare, CheckCircle2, Circle, Clock, Sparkles } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard.tsx';
import { CuteBadge } from '../ui/CuteBadge.tsx';
import { CareActivity } from '../../types/index.ts';

interface DailyCareChecklistWidgetProps {
  activities: CareActivity[];
  onToggleActivity: (id: string, currentStatus: string) => Promise<void>;
}

export const DailyCareChecklistWidget: React.FC<DailyCareChecklistWidgetProps> = ({
  activities,
  onToggleActivity
}) => {
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const completedCount = activities.filter((a) => a.status === 'COMPLETED').length;
  const totalCount = activities.length || 4;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  const handleCheck = async (id: string, status: string) => {
    setTogglingId(id);
    try {
      await onToggleActivity(id, status);
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <GlassCard
      variant="white"
      padding="lg"
      rounded="3xl"
      className="space-y-4 border border-[#E5E4F2] shadow-glass-sm text-left"
    >
      {/* Header & Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FCE4ED] text-[#B53364] flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black font-heading text-[#34354A]">
                Daily Care Checklist
              </h3>
              <p className="text-xs text-[#7A7D9D] font-medium">Gentle wellness routines</p>
            </div>
          </div>

          <CuteBadge variant="pink" size="sm">
            <span>{completedCount} of {totalCount} Done</span>
          </CuteBadge>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#FAF9FF] h-2.5 rounded-full overflow-hidden border border-[#E5E4F2]">
          <div
            className="h-full bg-gradient-to-r from-[#7969B5] to-[#48BB78] rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Checklist Items */}
      <div className="space-y-2">
        {activities.map((act) => {
          const isDone = act.status === 'COMPLETED';

          return (
            <button
              key={act.id}
              type="button"
              disabled={togglingId === act.id}
              onClick={() => handleCheck(act.id, act.status)}
              className={`w-full p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                isDone
                  ? 'bg-[#DDF5E9]/50 border-[#C8EED9] text-[#1F6A42]'
                  : 'bg-[#FAF9FF] border-[#E5E4F2] text-[#34354A] hover:bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                    isDone ? 'bg-emerald-500 text-white' : 'border-2 border-[#D1CEE8] bg-white'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-4 h-4" /> : null}
                </div>

                <div className="space-y-0.5">
                  <p
                    className={`text-xs sm:text-sm font-bold font-heading ${
                      isDone ? 'line-through text-[#575973]' : 'text-[#34354A]'
                    }`}
                  >
                    {act.title}
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-[#7A7D9D] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#7969B5]" />
                    <span>{act.scheduledTime}</span>
                    {act.description && <span>• {act.description}</span>}
                  </p>
                </div>
              </div>

              {isDone && (
                <span className="text-[10px] font-extrabold text-emerald-700 bg-white/80 px-2 py-0.5 rounded-full shrink-0">
                  Completed ✓
                </span>
              )}
            </button>
          );
        })}
      </div>
    </GlassCard>
  );
};

