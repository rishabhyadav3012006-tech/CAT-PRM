import React from 'react';
import { Pill, CheckCircle2, Clock, AlertTriangle, ArrowRight, Check } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard.tsx';
import { CuteBadge, BadgeVariant } from '../ui/CuteBadge.tsx';
import { Button } from '../ui/Button.tsx';
import { Link } from 'react-router-dom';
import { Medication } from '../../types/index.ts';

interface MedicationScheduleWidgetProps {
  medications: Medication[];
  onLogAdherence: (medId: string, medName: string) => Promise<void>;
}

export const MedicationScheduleWidget: React.FC<MedicationScheduleWidgetProps> = ({
  medications,
  onLogAdherence
}) => {
  const getStatusBadge = (index: number) => {
    // Demo statuses: first taken, others pending
    if (index === 0) {
      return { variant: 'mint' as BadgeVariant, label: 'Taken 08:15 AM', icon: <CheckCircle2 className="w-3 h-3" /> };
    }
    if (index === 1) {
      return { variant: 'lavender' as BadgeVariant, label: 'Due 12:30 PM', icon: <Clock className="w-3 h-3" /> };
    }
    return { variant: 'peach' as BadgeVariant, label: 'Evening 08:00 PM', icon: <Clock className="w-3 h-3" /> };
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
          <div className="w-8 h-8 rounded-xl bg-[#DDF5E9] text-[#2B8756] flex items-center justify-center">
            <Pill className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black font-heading text-[#34354A]">
              Today's Medication Schedule
            </h3>
            <p className="text-xs text-[#7A7D9D] font-medium">Daily prescription tracker</p>
          </div>
        </div>

        <Link
          to="/medications"
          className="text-xs font-bold text-[#7969B5] hover:text-[#6755A4] flex items-center gap-1 hover:underline"
        >
          <span>All Prescriptions</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Medication List */}
      <div className="space-y-2.5">
        {medications.length === 0 ? (
          <div className="p-6 text-center text-xs text-[#7A7D9D] bg-[#FAF9FF] rounded-2xl">
            No medications scheduled for today.
          </div>
        ) : (
          medications.map((med, idx) => {
            const status = getStatusBadge(idx);
            const isTaken = idx === 0;

            return (
              <div
                key={med.id}
                className="p-3.5 rounded-2xl bg-[#FAF9FF] hover:bg-white border border-[#E5E4F2] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                      isTaken ? 'bg-[#DDF5E9] text-[#22C55E]' : 'bg-[#E9E3FF] text-[#7969B5]'
                    }`}
                  >
                    <Pill className="w-5 h-5" />
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-extrabold font-heading text-[#34354A]">
                        {med.name}
                      </h4>
                      <span className="text-xs font-bold text-[#7A7D9D] bg-white px-2 py-0.5 rounded-full border border-[#ECEBF8]">
                        {med.dosage}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#575973] font-medium line-clamp-1">
                      {med.instructions || 'Take as instructed by your physician'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
                  <CuteBadge variant={status.variant} size="sm" icon={status.icon}>
                    {status.label}
                  </CuteBadge>

                  {!isTaken && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onLogAdherence(med.id, med.name)}
                      className="text-xs px-3"
                    >
                      <Check className="w-3 h-3 mr-1" />
                      <span>Take</span>
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </GlassCard>
  );
};

