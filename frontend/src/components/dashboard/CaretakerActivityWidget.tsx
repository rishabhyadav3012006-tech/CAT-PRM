import React from 'react';
import { UserCheck, Clock, Phone, MessageSquare, CheckCircle2, ShieldCheck } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard.tsx';
import { CuteBadge } from '../ui/CuteBadge.tsx';

export const CaretakerActivityWidget: React.FC = () => {
  const caregiver = {
    name: 'Marcus Chen',
    title: 'Certified Healthcare Aide',
    shift: '08:00 AM – 02:00 PM (Morning & Lunch)',
    status: 'Currently On Duty',
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=256&q=80',
    phone: '+1 (555) 456-7890',
    completedToday: [
      { task: 'Assisted with warm bath & skin lotion', time: '07:45 AM' },
      { task: 'Prepared blueberry oatmeal & morning meds', time: '08:30 AM' },
      { task: 'Logged vitals: BP 124/78, Pulse 72 bpm', time: '09:00 AM' }
    ]
  };

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
          <div className="w-8 h-8 rounded-xl bg-[#E9E3FF] text-[#7969B5] flex items-center justify-center">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black font-heading text-[#34354A]">
              Caretaker Shift & Activity
            </h3>
            <p className="text-xs text-[#7A7D9D] font-medium">On-duty caregiver progress</p>
          </div>
        </div>

        <CuteBadge variant="mint" size="sm" dot>
          <span>On Duty</span>
        </CuteBadge>
      </div>

      {/* Caregiver Card */}
      <div className="p-4 rounded-2xl bg-[#FAF9FF] border border-[#E5E4F2] space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={caregiver.avatar}
                alt={caregiver.name}
                className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-2xs"
              />
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
            </div>

            <div>
              <h4 className="text-sm sm:text-base font-extrabold font-heading text-[#34354A]">
                {caregiver.name}
              </h4>
              <p className="text-xs text-[#7969B5] font-bold">{caregiver.title}</p>
              <p className="text-[11px] text-[#7A7D9D] font-medium">{caregiver.shift}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <a
              href={`tel:${caregiver.phone.replace(/\D/g, '')}`}
              className="p-2.5 rounded-xl bg-white border border-[#E5E4F2] text-[#7969B5] hover:bg-[#E9E3FF]/50 transition-all shadow-xs"
              title="Call Caretaker"
            >
              <Phone className="w-4 h-4" />
            </a>
            <a
              href={`sms:${caregiver.phone.replace(/\D/g, '')}`}
              className="p-2.5 rounded-xl bg-white border border-[#E5E4F2] text-[#575973] hover:bg-[#FAF9FF] transition-all shadow-xs"
              title="Send Text Message"
            >
              <MessageSquare className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Shift Tasks Completed */}
        <div className="pt-2 border-t border-[#E5E4F2] space-y-2">
          <p className="text-xs font-bold text-[#34354A]">Recent Shift Actions by Marcus:</p>
          <div className="space-y-1.5">
            {caregiver.completedToday.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-xl bg-white border border-[#ECEBF8] text-xs"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="text-[#34354A] font-medium">{item.task}</span>
                </div>
                <span className="text-[10px] text-[#7A7D9D] font-bold shrink-0">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

