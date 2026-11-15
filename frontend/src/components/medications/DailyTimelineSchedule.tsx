import React, { useState } from 'react';
import { Clock, Sun, Sunset, Moon, Sunrise, CheckCircle2, AlertTriangle, XCircle, Check } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard.tsx';
import { CuteBadge, BadgeVariant } from '../ui/CuteBadge.tsx';
import { Button } from '../ui/Button.tsx';
import { Medication } from '../../types/index.ts';

interface TimelineDoseItem {
  medicationId: string;
  name: string;
  dosage: string;
  category?: string;
  scheduledTime: string;
  period: 'Morning' | 'Afternoon' | 'Evening' | 'Bedtime';
  foodInstruction: string;
  status: 'UPCOMING' | 'PENDING' | 'TAKEN' | 'SKIPPED' | 'MISSED' | 'CANCELLED';
  skipReason?: string;
}

interface DailyTimelineScheduleProps {
  medications: Medication[];
  onTakeDose: (medId: string, medName: string) => Promise<void>;
  onOpenSkipModal: (med: Medication) => void;
}

export const DailyTimelineSchedule: React.FC<DailyTimelineScheduleProps> = ({
  medications,
  onTakeDose,
  onOpenSkipModal
}) => {
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');

  // Helper to categorize scheduled time into periods
  const categorizePeriod = (timeStr: string): 'Morning' | 'Afternoon' | 'Evening' | 'Bedtime' => {
    const lower = timeStr.toLowerCase();
    if (lower.includes('pm')) {
      const hourPart = parseInt(lower, 10);
      if (hourPart === 12 || hourPart < 5) return 'Afternoon';
      if (hourPart >= 5 && hourPart < 9) return 'Evening';
      return 'Bedtime';
    }
    return 'Morning';
  };

  // Build daily dose schedule instances
  const timelineItems: TimelineDoseItem[] = [];

  medications.forEach((med, idx) => {
    med.scheduledTimes.forEach((time) => {
      const period = categorizePeriod(time);

      // Demo realistic statuses across times
      let status: TimelineDoseItem['status'] = 'UPCOMING';
      if (period === 'Morning') status = idx === 0 ? 'TAKEN' : 'PENDING';
      else if (period === 'Afternoon') status = 'PENDING';
      else if (period === 'Evening') status = idx === 2 ? 'SKIPPED' : 'UPCOMING';
      else status = 'UPCOMING';

      timelineItems.push({
        medicationId: med.id,
        name: med.name,
        dosage: med.dosage,
        category: med.category,
        scheduledTime: time,
        period,
        foodInstruction: med.foodInstructions || 'WITH_MEAL',
        status,
        skipReason: status === 'SKIPPED' ? 'Fasting for laboratory lipid test' : undefined
      });
    });
  });

  // Filter items
  const filteredItems = timelineItems.filter((item) => {
    if (selectedStatusFilter === 'ALL') return true;
    return item.status === selectedStatusFilter;
  });

  const periods: { id: 'Morning' | 'Afternoon' | 'Evening' | 'Bedtime'; title: string; time: string; icon: React.ReactNode; bg: string }[] = [
    {
      id: 'Morning',
      title: 'Morning Doses',
      time: '06:00 AM – 11:59 AM',
      icon: <Sunrise className="w-5 h-5 text-amber-500" />,
      bg: 'from-[#FFF9ED] to-white'
    },
    {
      id: 'Afternoon',
      title: 'Afternoon Doses',
      time: '12:00 PM – 04:59 PM',
      icon: <Sun className="w-5 h-5 text-orange-500" />,
      bg: 'from-[#DDF5E9] to-white'
    },
    {
      id: 'Evening',
      title: 'Evening Doses',
      time: '05:00 PM – 08:59 PM',
      icon: <Sunset className="w-5 h-5 text-[#7969B5]" />,
      bg: 'from-[#DFEEFF] to-white'
    },
    {
      id: 'Bedtime',
      title: 'Night & Bedtime',
      time: '09:00 PM – 11:59 PM',
      icon: <Moon className="w-5 h-5 text-indigo-500" />,
      bg: 'from-[#E9E3FF] to-white'
    }
  ];

  const getStatusBadge = (status: TimelineDoseItem['status']) => {
    switch (status) {
      case 'TAKEN':
        return { variant: 'mint' as BadgeVariant, label: 'Taken ✓' };
      case 'SKIPPED':
        return { variant: 'peach' as BadgeVariant, label: 'Skipped ⚠️' };
      case 'MISSED':
        return { variant: 'danger' as any, label: 'Missed' };
      case 'PENDING':
        return { variant: 'lavender' as BadgeVariant, label: 'Due Now' };
      case 'CANCELLED':
        return { variant: 'cream' as BadgeVariant, label: 'Cancelled' };
      default:
        return { variant: 'babyBlue' as BadgeVariant, label: 'Upcoming' };
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-white border border-[#E5E4F2] shadow-xs">
        <span className="text-xs font-bold text-[#7A7D9D] uppercase tracking-wider">
          Filter by Status:
        </span>

        <div className="flex flex-wrap gap-1.5">
          {['ALL', 'PENDING', 'UPCOMING', 'TAKEN', 'SKIPPED', 'MISSED'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setSelectedStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedStatusFilter === st
                  ? 'bg-[#7969B5] text-white shadow-xs'
                  : 'bg-[#FAF9FF] text-[#575973] hover:bg-[#E9E3FF]/60 hover:text-[#34354A]'
              }`}
            >
              {st === 'ALL' ? 'All Doses' : st.charAt(0) + st.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Grouped Periods */}
      <div className="space-y-6">
        {periods.map((period) => {
          const itemsInPeriod = filteredItems.filter((i) => i.period === period.id);
          if (itemsInPeriod.length === 0 && selectedStatusFilter !== 'ALL') return null;

          return (
            <div key={period.id} className="space-y-3">
              {/* Period Header */}
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white border border-[#E5E4F2] flex items-center justify-center shadow-xs">
                    {period.icon}
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold font-heading text-[#34354A]">
                      {period.title}
                    </h3>
                    <p className="text-[11px] text-[#7A7D9D] font-medium">{period.time}</p>
                  </div>
                </div>

                <CuteBadge variant="lavender" size="sm">
                  {itemsInPeriod.length} {itemsInPeriod.length === 1 ? 'dose' : 'doses'}
                </CuteBadge>
              </div>

              {/* Doses in Period */}
              {itemsInPeriod.length === 0 ? (
                <div className="p-4 rounded-2xl bg-[#FAF9FF] border border-[#E5E4F2] text-xs text-[#7A7D9D] italic text-center">
                  No medications scheduled during {period.title.toLowerCase()}.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {itemsInPeriod.map((dose, idx) => {
                    const statusConfig = getStatusBadge(dose.status);
                    const matchingMed = medications.find((m) => m.id === dose.medicationId);

                    return (
                      <div
                        key={`${dose.medicationId}-${idx}`}
                        className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                          dose.status === 'TAKEN'
                            ? 'bg-[#DDF5E9]/40 border-emerald-200'
                            : dose.status === 'SKIPPED'
                            ? 'bg-amber-50/60 border-amber-200'
                            : 'bg-white border-[#E5E4F2] shadow-xs hover:border-[#D1CEE8]'
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-xs font-black font-heading text-[#7969B5] bg-[#FAF9FF] px-2 py-0.5 rounded-full border border-[#ECEBF8]">
                                {dose.scheduledTime}
                              </span>
                              <h4 className="text-base font-extrabold font-heading text-[#34354A] pt-1">
                                {dose.name}
                              </h4>
                              <p className="text-xs font-bold text-[#7A7D9D]">{dose.dosage}</p>
                            </div>

                            <CuteBadge variant={statusConfig.variant} size="sm">
                              {statusConfig.label}
                            </CuteBadge>
                          </div>

                          {dose.skipReason && (
                            <p className="text-xs text-amber-900 bg-amber-100/70 p-2 rounded-xl">
                              ⚠️ Reason: {dose.skipReason}
                            </p>
                          )}
                        </div>

                        {/* Action Buttons for elderly */}
                        <div className="pt-2 border-t border-[#FAF9FF] flex items-center gap-2">
                          {dose.status !== 'TAKEN' && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => onTakeDose(dose.medicationId, dose.name)}
                              className="flex-1 justify-center text-xs font-bold"
                            >
                              <Check className="w-3.5 h-3.5 mr-1" />
                              <span>Confirm Taken</span>
                            </Button>
                          )}

                          {dose.status !== 'SKIPPED' && matchingMed && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => onOpenSkipModal(matchingMed)}
                              className="text-xs font-semibold"
                            >
                              <span>Skip</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

