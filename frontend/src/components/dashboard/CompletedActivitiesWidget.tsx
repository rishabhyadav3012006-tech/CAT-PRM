import React from 'react';
import { CheckCircle2, Clock, ShieldCheck, UserCheck } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard.tsx';
import { CuteBadge } from '../ui/CuteBadge.tsx';

interface CompletedActivityItem {
  id: string;
  title: string;
  category: string;
  completedAt: string;
  patient: string;
}

export const CompletedActivitiesWidget: React.FC = () => {
  const completedList: CompletedActivityItem[] = [
    {
      id: 'cmp-1',
      title: 'Morning Hygiene & Bath Assistance',
      category: 'Hygiene',
      completedAt: '08:00 AM',
      patient: 'Eleanor Vance'
    },
    {
      id: 'cmp-2',
      title: 'Nutritious Breakfast & Morning Medication',
      category: 'Nutrition',
      completedAt: '09:00 AM',
      patient: 'Eleanor Vance'
    },
    {
      id: 'cmp-3',
      title: 'Morning Biometrics & Vitals Recording',
      category: 'Clinical',
      completedAt: '09:15 AM',
      patient: 'Eleanor Vance'
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
          <div className="w-8 h-8 rounded-xl bg-[#DDF5E9] text-[#2B8756] flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black font-heading text-[#34354A]">
              Completed Care Activities
            </h3>
            <p className="text-xs text-[#7A7D9D] font-medium">Shift verification & accountability history</p>
          </div>
        </div>

        <CuteBadge variant="mint" size="sm">
          <span>{completedList.length} Verified</span>
        </CuteBadge>
      </div>

      {/* Completed Items */}
      <div className="space-y-2">
        {completedList.map((item) => (
          <div
            key={item.id}
            className="p-3 rounded-2xl bg-[#DDF5E9]/30 border border-emerald-100 flex items-center justify-between gap-3 text-xs"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <p className="font-extrabold font-heading text-[#34354A]">
                  {item.title}
                </p>
                <p className="text-[10px] text-[#7A7D9D] font-medium">
                  {item.patient} • Category: {item.category}
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[10px] font-bold text-emerald-800 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                {item.completedAt}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Caregiver Signature */}
      <div className="pt-2 border-t border-[#FAF9FF] flex items-center justify-between text-[11px] text-[#7A7D9D]">
        <span className="flex items-center gap-1 font-semibold text-emerald-700">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Shift verified by Marcus Chen (Caretaker)</span>
        </span>
        <span>ID: CHW-7809</span>
      </div>
    </GlassCard>
  );
};

