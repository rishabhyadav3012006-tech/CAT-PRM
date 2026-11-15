import React from 'react';
import { DailyChecklistItem } from '../../types/index.ts';
import { CheckCircle2, Circle, Pill, Droplets, Activity, Footprints, Smile, Sparkles } from 'lucide-react';

interface AssistantChecklistProps {
  items: DailyChecklistItem[];
  onToggleItem: (itemId: string, completed: boolean) => Promise<void>;
  loading: boolean;
}

const getCategoryIcon = (category: DailyChecklistItem['category']) => {
  switch (category) {
    case 'MEDICATION':
      return <Pill className="w-4 h-4 text-[#2B8756]" />;
    case 'HYDRATION':
      return <Droplets className="w-4 h-4 text-[#2B6EB5]" />;
    case 'VITALS':
      return <Activity className="w-4 h-4 text-[#7969B5]" />;
    case 'ACTIVITY':
      return <Footprints className="w-4 h-4 text-[#B85820]" />;
    case 'WELLNESS':
      return <Smile className="w-4 h-4 text-[#C24177]" />;
    default:
      return <Sparkles className="w-4 h-4 text-[#7969B5]" />;
  }
};

export const AssistantChecklist: React.FC<AssistantChecklistProps> = ({
  items,
  onToggleItem,
  loading
}) => {
  const completedCount = items.filter((i) => i.completed).length;
  const totalCount = items.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-4 text-[#34354A]">
      {/* Header & Progress Bar */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#E9E3FF]/70 via-[#FCE4ED]/50 to-[#DDF5E9]/70 border border-white/90 shadow-glass-sm space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#55428F] font-heading">
              Daily Wellness Checklist
            </h4>
            <p className="text-[11px] text-[#5B5D7A]">
              Gentle routine goals for today's health
            </p>
          </div>
          <span className="text-xs font-extrabold text-[#55428F] bg-white/80 px-2.5 py-1 rounded-full shadow-xs">
            {completedCount} of {totalCount} Done ({progressPercent}%)
          </span>
        </div>

        <div className="w-full bg-white/60 h-2 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-[#7969B5] to-[#2B8756] h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Checklist Item Cards */}
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => !loading && onToggleItem(item.id, !item.completed)}
            className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
              item.completed
                ? 'bg-emerald-50/50 border-emerald-200/60 shadow-xs'
                : 'bg-white/80 border-white/90 hover:bg-white shadow-xs'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0">
                {item.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-300 hover:text-purple-400" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  {getCategoryIcon(item.category)}
                  <span
                    className={`text-xs font-bold font-heading ${
                      item.completed ? 'line-through text-gray-400' : 'text-[#34354A]'
                    }`}
                  >
                    {item.title}
                  </span>
                </div>
                <p className="text-[11px] text-[#7A7D9D] mt-0.5">
                  {item.description}
                </p>
              </div>
            </div>

            {item.progress && (
              <span className="text-[10px] font-bold text-[#7969B5] bg-purple-50 px-2 py-0.5 rounded-full shrink-0">
                {item.progress}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

