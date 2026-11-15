import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, Clock, BellRing, Check } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard.tsx';
import { CuteBadge } from '../ui/CuteBadge.tsx';
import { Button } from '../ui/Button.tsx';

interface MissedMedItem {
  id: string;
  name: string;
  dosage: string;
  scheduledTime: string;
  elderlyName: string;
  reason: string;
}

export const MissedMedicationsWidget: React.FC = () => {
  const [items, setItems] = useState<MissedMedItem[]>([
    {
      id: 'missed-1',
      name: 'Metformin',
      dosage: '500mg (1 tablet)',
      scheduledTime: 'Yesterday, 08:00 PM',
      elderlyName: 'Eleanor Vance',
      reason: 'No log confirmation received from sensor or manual entry'
    }
  ]);
  const [nudged, setNudged] = useState(false);

  const handleConfirm = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
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
          <div className="w-8 h-8 rounded-xl bg-[#FFE9DC] text-[#DD6B20] flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black font-heading text-[#34354A]">
              Missed / Unconfirmed Doses
            </h3>
            <p className="text-xs text-[#7A7D9D] font-medium">Requiring family circle attention</p>
          </div>
        </div>

        {items.length > 0 ? (
          <CuteBadge variant="peach" size="sm">
            {items.length} Pending Attention
          </CuteBadge>
        ) : (
          <CuteBadge variant="mint" size="sm">
            All Clear
          </CuteBadge>
        )}
      </div>

      {/* Content */}
      {items.length === 0 ? (
        <div className="p-5 rounded-2xl bg-[#DDF5E9]/60 border border-emerald-200/60 text-center space-y-1.5">
          <CheckCircle2 className="w-7 h-7 text-emerald-600 mx-auto" />
          <p className="text-sm font-extrabold font-heading text-emerald-900">
            Zero Missed Medications! 🎉
          </p>
          <p className="text-xs text-emerald-800">
            All scheduled prescriptions for Eleanor have been confirmed by her care team.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-950 space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-sm font-black font-heading flex items-center gap-2">
                    <span>{item.name} {item.dosage}</span>
                  </h4>
                  <p className="text-xs text-amber-900 font-medium">{item.scheduledTime}</p>
                </div>
                <CuteBadge variant="peach" size="sm">
                  Unconfirmed
                </CuteBadge>
              </div>

              <p className="text-xs text-amber-800 bg-white/70 p-2 rounded-xl border border-amber-100">
                ⚠️ {item.reason}
              </p>

              <div className="flex items-center gap-2 pt-1">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleConfirm(item.id)}
                  className="flex-1 justify-center text-xs"
                >
                  <Check className="w-3.5 h-3.5 mr-1" />
                  <span>Verify as Taken</span>
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setNudged(true)}
                  className="justify-center text-xs"
                >
                  <BellRing className="w-3.5 h-3.5 mr-1" />
                  <span>{nudged ? 'Nudged Marcus ✓' : 'Nudge Caregiver'}</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
};

