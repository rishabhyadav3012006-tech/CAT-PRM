import React, { useState } from 'react';
import {
  Pill,
  Clock,
  Utensils,
  CheckCircle2,
  AlertTriangle,
  MoreVertical,
  Calendar,
  Edit,
  Archive,
  RefreshCw,
  Eye,
  Check,
  ShieldAlert
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard.tsx';
import { CuteBadge, BadgeVariant } from '../ui/CuteBadge.tsx';
import { Button } from '../ui/Button.tsx';
import { Medication } from '../../types/index.ts';

interface MedicationCardProps {
  medication: Medication;
  onTakeDose: (medId: string, medName: string) => Promise<void>;
  onOpenSkipModal: (med: Medication) => void;
  onOpenDetails: (med: Medication) => void;
  onOpenEdit: (med: Medication) => void;
  onRefill: (medId: string, name: string) => void;
  onArchive: (medId: string, name: string) => void;
}

export const MedicationCard: React.FC<MedicationCardProps> = ({
  medication,
  onTakeDose,
  onOpenSkipModal,
  onOpenDetails,
  onOpenEdit,
  onRefill,
  onArchive
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTaking, setIsTaking] = useState(false);

  const isLowStock = medication.stockQuantity <= medication.refillReminderThreshold;

  const handleTake = async () => {
    setIsTaking(true);
    try {
      await onTakeDose(medication.id, medication.name);
    } finally {
      setIsTaking(false);
    }
  };

  const getCategoryBadgeVariant = (category?: string): BadgeVariant => {
    switch (category?.toLowerCase()) {
      case 'cardiovascular':
        return 'lavender';
      case 'diabetes':
        return 'babyBlue';
      case 'supplements':
        return 'mint';
      case 'respiratory':
        return 'peach';
      default:
        return 'cream';
    }
  };

  const getFoodInstructionLabel = (instruction?: string) => {
    switch (instruction) {
      case 'BEFORE_MEAL':
        return '30m Before Meal';
      case 'AFTER_MEAL':
        return 'Take After Meal';
      case 'WITH_MEAL':
        return 'Take With Warm Meal';
      case 'BEFORE_BED':
        return 'Take at Bedtime';
      case 'EMPTY_STOMACH':
        return 'Empty Stomach';
      default:
        return 'Anytime / Independent';
    }
  };

  return (
    <GlassCard
      variant="white"
      padding="lg"
      rounded="3xl"
      className="relative overflow-hidden border border-[#E5E4F2] hover:border-[#D1CEE8] shadow-glass-sm hover:shadow-glass-md transition-all duration-300 flex flex-col justify-between text-left group"
    >
      {/* Low Stock Top Warning Ribbon */}
      {isLowStock && (
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400" />
      )}

      <div className="space-y-3.5">
        {/* Header: Icon, Name, Category & Overflow Menu */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#7969B5] to-[#9E8EE4] text-white flex items-center justify-center shadow-glow-purple/20 shrink-0">
              <Pill className="w-6 h-6" />
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black font-heading text-[#34354A] leading-tight">
                  {medication.name}
                </h3>
                {medication.category && (
                  <CuteBadge variant={getCategoryBadgeVariant(medication.category)} size="sm">
                    {medication.category}
                  </CuteBadge>
                )}
              </div>
              <p className="text-xs font-extrabold text-[#7969B5]">
                {medication.dosage} • {medication.frequency.replace('_', ' ')}
              </p>
            </div>
          </div>

          {/* Action Menu Toggle */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1.5 rounded-xl hover:bg-[#FAF9FF] text-[#7A7D9D] hover:text-[#34354A] transition-colors focus:outline-none cursor-pointer"
              aria-label="Medication actions"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {isMenuOpen && (
              <div
                className="absolute right-0 mt-1 w-44 bg-white/95 backdrop-blur-xl rounded-2xl shadow-glass-lg border border-[#E5E4F2] p-1.5 z-40 text-xs font-bold text-[#34354A] animate-in fade-in duration-100"
                onMouseLeave={() => setIsMenuOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenDetails(medication);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#FAF9FF] flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-[#7969B5]" />
                  <span>View Details</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenEdit(medication);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#FAF9FF] flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5 text-sky-600" />
                  <span>Edit Schedule</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onRefill(medication.id, medication.name);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#FAF9FF] flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Refill Stock (+30)</span>
                </button>

                <div className="h-px bg-[#FAF9FF] my-1" />

                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onArchive(medication.id, medication.name);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-50 text-rose-600 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Archive className="w-3.5 h-3.5 text-rose-500" />
                  <span>Archive Medicine</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Timings and Food Instructions */}
        <div className="flex flex-wrap gap-2 text-xs">
          {/* Scheduled Times */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FAF9FF] border border-[#E5E4F2] text-[#34354A] font-bold">
            <Clock className="w-3.5 h-3.5 text-[#7969B5]" />
            <span>{medication.scheduledTimes.join(' • ')}</span>
          </div>

          {/* Food Instruction */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FAF9FF] border border-[#E5E4F2] text-[#575973] font-semibold">
            <Utensils className="w-3.5 h-3.5 text-amber-600" />
            <span>{getFoodInstructionLabel(medication.foodInstructions)}</span>
          </div>
        </div>

        {/* Doctor Instructions Note */}
        {medication.instructions && (
          <p className="text-xs text-[#575973] bg-[#FAF9FF] p-2.5 rounded-2xl border border-[#ECEBF8] line-clamp-2 leading-relaxed">
            💡 <strong>Advice:</strong> {medication.instructions}
          </p>
        )}

        {/* Stock & Refill Status */}
        <div className="flex items-center justify-between text-xs pt-1 border-t border-[#FAF9FF]">
          <div className="flex items-center gap-2">
            <span className="text-[#7A7D9D] font-medium">Stock:</span>
            <span
              className={`font-black ${
                isLowStock ? 'text-rose-600' : 'text-[#34354A]'
              }`}
            >
              {medication.stockQuantity} pills remaining
            </span>
          </div>

          {isLowStock ? (
            <CuteBadge variant="peach" size="sm" icon={<AlertTriangle className="w-3 h-3" />}>
              Refill Needed
            </CuteBadge>
          ) : (
            <span className="text-[11px] text-emerald-700 font-bold">
              ✓ Good Supply
            </span>
          )}
        </div>
      </div>

      {/* Large Accessible Action Buttons for Elderly & Caregiver */}
      <div className="pt-4 mt-3 border-t border-[#E5E4F2]/70 flex items-center gap-2.5">
        <Button
          variant="primary"
          size="md"
          onClick={handleTake}
          isLoading={isTaking}
          leftIcon={<Check className="w-4 h-4" />}
          className="flex-1 justify-center font-extrabold text-xs sm:text-sm"
        >
          <span>Take Dose</span>
        </Button>

        <Button
          variant="secondary"
          size="md"
          onClick={() => onOpenSkipModal(medication)}
          className="justify-center text-xs font-bold"
        >
          <span>Skip</span>
        </Button>

        <Button
          variant="ghost"
          size="md"
          onClick={() => onOpenDetails(medication)}
          className="px-2 text-xs font-bold"
          title="Full prescription details"
        >
          <span>Details</span>
        </Button>
      </div>
    </GlassCard>
  );
};

