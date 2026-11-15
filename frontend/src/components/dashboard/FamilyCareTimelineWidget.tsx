import React from 'react';
import { Clock, Pill, Activity, Calendar, Heart, MessageSquare, CheckCircle2 } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard.tsx';
import { CuteBadge } from '../ui/CuteBadge.tsx';

export const FamilyCareTimelineWidget: React.FC = () => {
  const events = [
    {
      id: 'evt-1',
      author: 'Marcus Chen (Caregiver)',
      action: 'Recorded Morning Vitals',
      detail: 'BP: 124/78 mmHg, Glucose: 108 mg/dL, Heart Rate: 72 bpm (Optimal)',
      time: '09:00 AM',
      icon: Activity,
      color: 'bg-[#E9E3FF] text-[#7969B5]'
    },
    {
      id: 'evt-2',
      author: 'Eleanor Vance (Senior)',
      action: 'Confirmed Morning Medication',
      detail: 'Lisinopril 10mg taken with oatmeal & water.',
      time: '08:15 AM',
      icon: Pill,
      color: 'bg-[#DDF5E9] text-emerald-600'
    },
    {
      id: 'evt-3',
      author: 'Sarah Vance (Daughter)',
      action: 'Scheduled Doctor Consultation',
      detail: 'Booked quarterly review with Dr. Elizabeth Adams for tomorrow at 10:30 AM.',
      time: 'Yesterday, 04:30 PM',
      icon: Calendar,
      color: 'bg-[#DFEEFF] text-sky-600'
    },
    {
      id: 'evt-4',
      author: 'Sarah Vance (Daughter)',
      action: 'Visited & Brought Groceries',
      detail: 'Fresh blueberries, Greek yogurt, and low-sodium broth delivered.',
      time: 'Yesterday, 02:00 PM',
      icon: Heart,
      color: 'bg-[#FCE4ED] text-[#B53364]'
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
          <div className="w-8 h-8 rounded-xl bg-[#DFEEFF] text-[#2B6EB5] flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black font-heading text-[#34354A]">
              Family Care Activity Timeline
            </h3>
            <p className="text-xs text-[#7A7D9D] font-medium">Synchronized circle updates</p>
          </div>
        </div>

        <CuteBadge variant="lavender" size="sm">
          <span>Live Feed</span>
        </CuteBadge>
      </div>

      {/* Timeline items */}
      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E5E4F2]">
        {events.map((evt) => {
          const Icon = evt.icon;

          return (
            <div key={evt.id} className="relative group">
              {/* Timeline circle icon */}
              <div
                className={`absolute -left-6 top-0.5 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-white shadow-xs ${evt.color}`}
              >
                <Icon className="w-3 h-3" />
              </div>

              <div className="p-3 rounded-2xl bg-[#FAF9FF] border border-[#E5E4F2] group-hover:bg-white transition-all space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-heading text-[#34354A]">
                    {evt.action}
                  </span>
                  <span className="text-[10px] text-[#7A7D9D] font-medium">{evt.time}</span>
                </div>

                <p className="text-[11px] text-[#575973] font-medium leading-relaxed">
                  {evt.detail}
                </p>

                <p className="text-[10px] font-bold text-[#7969B5] pt-0.5">
                  Logged by {evt.author}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
};

