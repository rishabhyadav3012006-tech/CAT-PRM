import React, { useState } from 'react';
import { RefreshCw, AlertTriangle, CheckCircle2, Phone, MapPin, Pill, ArrowRight, Plus } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard.tsx';
import { CuteBadge } from '../ui/CuteBadge.tsx';
import { Button } from '../ui/Button.tsx';
import { Medication } from '../../types/index.ts';

interface MedicationRefillTrackerProps {
  medications: Medication[];
  onRefill: (medId: string, quantity: number) => Promise<void>;
}

export const MedicationRefillTracker: React.FC<MedicationRefillTrackerProps> = ({
  medications,
  onRefill
}) => {
  const [refillingId, setRefillingId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const handleRefillAction = async (medId: string, medName: string, amount: number = 30) => {
    setRefillingId(medId);
    try {
      await onRefill(medId, amount);
      setSuccessToast(`Refilled ${medName} (+${amount} doses)! Supply updated.`);
      setTimeout(() => setSuccessToast(null), 3500);
    } catch (err) {
      alert('Could not update refill supply.');
    } finally {
      setRefillingId(null);
    }
  };

  const lowStockMeds = medications.filter(
    (m) => m.stockQuantity <= m.refillReminderThreshold
  );

  return (
    <div className="space-y-6 text-left">
      {/* Toast */}
      {successToast && (
        <div className="p-3.5 rounded-2xl bg-[#DDF5E9] border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Top Pharmacy Information Banner */}
      <GlassCard
        variant="white"
        padding="lg"
        rounded="3xl"
        className="p-5 bg-gradient-to-r from-[#FAF9FF] to-[#F1EEFC] border border-[#D2C7FC] shadow-glass-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CuteBadge variant="lavender" size="sm">
              Designated Family Pharmacy
            </CuteBadge>
            {lowStockMeds.length > 0 && (
              <CuteBadge variant="peach" size="sm" icon={<AlertTriangle className="w-3 h-3" />}>
                {lowStockMeds.length} Prescription Needs Refill
              </CuteBadge>
            )}
          </div>
          <h3 className="text-lg font-black font-heading text-[#34354A]">
            Walgreens Pharmacy #402 (Springfield)
          </h3>
          <p className="text-xs text-[#575973] font-medium flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-[#7969B5]" />
            <span>1200 Main Street, Springfield, OR • Mon–Sat 8AM–9PM</span>
          </p>
        </div>

        <a
          href="tel:5557892244"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#7969B5] text-white text-xs font-extrabold hover:bg-[#6755A4] transition-all shadow-glow-purple/20 shrink-0"
        >
          <Phone className="w-4 h-4" />
          <span>Call Pharmacist (555) 789-2244</span>
        </a>
      </GlassCard>

      {/* Medication Stock Supply Grid */}
      <div className="space-y-3">
        <h4 className="text-sm font-extrabold font-heading text-[#34354A]">
          Active Prescriptions & Bottle Supply
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {medications.map((med) => {
            const isLow = med.stockQuantity <= med.refillReminderThreshold;
            const percentRemaining = Math.min(100, Math.round((med.stockQuantity / 45) * 100));

            return (
              <GlassCard
                key={med.id}
                variant="white"
                padding="md"
                rounded="2xl"
                className={`border space-y-3 transition-all ${
                  isLow
                    ? 'border-amber-300 bg-amber-50/40 shadow-xs'
                    : 'border-[#E5E4F2] bg-white'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isLow ? 'bg-amber-100 text-amber-800' : 'bg-[#E9E3FF] text-[#7969B5]'
                      }`}
                    >
                      <Pill className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black font-heading text-[#34354A]">
                        {med.name}
                      </h4>
                      <p className="text-xs text-[#7A7D9D] font-bold">{med.dosage}</p>
                    </div>
                  </div>

                  <CuteBadge variant={isLow ? 'peach' : 'mint'} size="sm">
                    {isLow ? 'Low Supply' : 'Adequate'}
                  </CuteBadge>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-[#575973]">Remaining Doses:</span>
                    <span className={isLow ? 'text-rose-600 font-black' : 'text-[#34354A]'}>
                      {med.stockQuantity} tablets
                    </span>
                  </div>

                  <div className="w-full bg-[#FAF9FF] h-2.5 rounded-full overflow-hidden border border-[#E5E4F2]">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isLow
                          ? 'bg-gradient-to-r from-rose-500 to-amber-500'
                          : 'bg-gradient-to-r from-[#7969B5] to-[#48BB78]'
                      }`}
                      style={{ width: `${percentRemaining}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-[#7A7D9D] pt-0.5">
                    <span>Threshold: {med.refillReminderThreshold} doses</span>
                    <span>~{med.stockQuantity} days supply remaining</span>
                  </div>
                </div>

                {/* Action Row */}
                <div className="pt-2 border-t border-[#FAF9FF] flex items-center justify-between gap-2">
                  <span className="text-[11px] text-[#7A7D9D]">
                    {med.lastRefillDate
                      ? `Last filled: ${new Date(med.lastRefillDate).toLocaleDateString()}`
                      : 'Prescription active'}
                  </span>

                  <Button
                    variant={isLow ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => handleRefillAction(med.id, med.name, 30)}
                    isLoading={refillingId === med.id}
                    className="text-xs px-3"
                  >
                    <RefreshCw className="w-3.5 h-3.5 mr-1" />
                    <span>Confirm Refill (+30)</span>
                  </Button>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </div>
  );
};

