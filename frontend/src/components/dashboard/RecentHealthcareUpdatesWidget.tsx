import React from 'react';
import { Sparkles, Pill, Activity, Calendar, ShieldCheck, ArrowRight } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard.tsx';
import { CuteBadge } from '../ui/CuteBadge.tsx';
import { Link } from 'react-router-dom';

export const RecentHealthcareUpdatesWidget: React.FC = () => {
  const updates = [
    {
      id: 'upd-1',
      title: 'Prescription Refill Requested',
      description: 'Lisinopril 10mg has 6 tablets remaining. Automated refill sent to Walgreens Pharmacy #402.',
      category: 'Medication',
      badge: 'peach' as const,
      time: 'Today, 09:30 AM',
      icon: Pill
    },
    {
      id: 'upd-2',
      title: '14-Day Vitals Stability Milestone',
      description: 'Eleanor has maintained optimal systolic BP under 130 mmHg for 2 consecutive weeks.',
      category: 'Clinical',
      badge: 'mint' as const,
      time: 'Today, 09:00 AM',
      icon: Activity
    },
    {
      id: 'upd-3',
      title: 'Home Safety Inspection Completed',
      description: 'Marcus checked shower grab bars, walker rubber tips, and hallway nightlights.',
      category: 'Safety',
      badge: 'lavender' as const,
      time: 'Yesterday',
      icon: ShieldCheck
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
          <div className="w-8 h-8 rounded-xl bg-[#FFF9ED] text-[#B7791F] flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black font-heading text-[#34354A]">
              Recent Healthcare Updates
            </h3>
            <p className="text-xs text-[#7A7D9D] font-medium">Prescriptions, clinical alerts & milestones</p>
          </div>
        </div>

        <CuteBadge variant="cream" size="sm">
          <span>3 New</span>
        </CuteBadge>
      </div>

      {/* Updates List */}
      <div className="space-y-2.5">
        {updates.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="p-3.5 rounded-2xl bg-[#FAF9FF] border border-[#E5E4F2] hover:bg-white transition-all space-y-1.5 shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-[#7969B5]" />
                  <h4 className="text-xs sm:text-sm font-extrabold font-heading text-[#34354A]">
                    {item.title}
                  </h4>
                </div>
                <CuteBadge variant={item.badge} size="sm">
                  {item.category}
                </CuteBadge>
              </div>

              <p className="text-xs font-medium font-body text-[#575973] leading-relaxed">
                {item.description}
              </p>

              <span className="text-[10px] text-[#7A7D9D] font-semibold block pt-0.5">
                {item.time}
              </span>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
};

