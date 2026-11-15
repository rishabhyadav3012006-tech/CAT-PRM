import React, { useState } from 'react';
import { Pill, ShieldCheck, CheckCircle2, Clock, AlertCircle, Check } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard.tsx';
import { CuteBadge } from '../ui/CuteBadge.tsx';
import { Button } from '../ui/Button.tsx';

interface MedicationAdminItem {
  id: string;
  patientName: string;
  medName: string;
  dosage: string;
  route: string;
  time: string;
  status: 'ADMINISTERED' | 'DUE' | 'PENDING';
  instructions: string;
}

export const MedicationAdministrationWidget: React.FC = () => {
  const [items, setItems] = useState<MedicationAdminItem[]>([
    {
      id: 'adm-1',
      patientName: 'Eleanor Vance',
      medName: 'Lisinopril',
      dosage: '10mg',
      route: 'Oral Tablet',
      time: '08:00 AM',
      status: 'ADMINISTERED',
      instructions: 'Give with full cup of water post-breakfast'
    },
    {
      id: 'adm-2',
      patientName: 'Eleanor Vance',
      medName: 'Metformin',
      dosage: '500mg',
      route: 'Oral Tablet',
      time: '12:30 PM',
      status: 'DUE',
      instructions: 'Administer with lunch meal to prevent stomach upset'
    },
    {
      id: 'adm-3',
      patientName: 'Arthur Pendelton',
      medName: 'Levodopa / Carbidopa',
      dosage: '25/100mg',
      route: 'Oral Tablet',
      time: '02:00 PM',
      status: 'PENDING',
      instructions: 'Take 30 mins prior to afternoon physical balance session'
    }
  ]);

  const handleAdminister = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: 'ADMINISTERED' } : item
      )
    );
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
            <Pill className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black font-heading text-[#34354A]">
              Medication Administration Schedule (eMAR)
            </h3>
            <p className="text-xs text-[#7A7D9D] font-medium">Caregiver verification & administration log</p>
          </div>
        </div>

        <CuteBadge variant="mint" size="sm" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
          <span>Allergies Verified</span>
        </CuteBadge>
      </div>

      {/* Admin Table / Cards */}
      <div className="space-y-2.5">
        {items.map((item) => {
          const isDone = item.status === 'ADMINISTERED';
          const isDue = item.status === 'DUE';

          return (
            <div
              key={item.id}
              className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isDone
                  ? 'bg-[#DDF5E9]/40 border-emerald-200'
                  : isDue
                  ? 'bg-amber-50/70 border-amber-200 shadow-2xs'
                  : 'bg-[#FAF9FF] border-[#E5E4F2]'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold font-title text-[#7969B5] bg-white px-2 py-0.5 rounded-full border border-[#ECEBF8]">
                    {item.patientName}
                  </span>
                  <h4 className="text-sm font-extrabold font-heading text-[#34354A]">
                    {item.medName} {item.dosage}
                  </h4>
                  <span className="text-[11px] text-[#7A7D9D]">({item.route})</span>
                </div>

                <p className="text-[11px] text-[#575973] font-medium">
                  {item.instructions}
                </p>

                <p className="text-[10px] text-[#7A7D9D] font-bold flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#7969B5]" />
                  <span>Scheduled Time: {item.time}</span>
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                {isDone ? (
                  <CuteBadge variant="mint" size="sm" icon={<CheckCircle2 className="w-3 h-3" />}>
                    <span>Administered ✓</span>
                  </CuteBadge>
                ) : (
                  <Button
                    variant={isDue ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => handleAdminister(item.id)}
                    className="text-xs px-3"
                  >
                    <Check className="w-3.5 h-3.5 mr-1" />
                    <span>{isDue ? 'Administer & Confirm' : 'Confirm Early'}</span>
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
};

