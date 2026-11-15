import React from 'react';
import {
  Pill,
  Clock,
  Utensils,
  Calendar,
  FileText,
  AlertTriangle,
  RefreshCw,
  Edit,
  Archive,
  ShieldCheck,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { Modal } from '../ui/Modal.tsx';
import { CuteBadge, BadgeVariant } from '../ui/CuteBadge.tsx';
import { Button } from '../ui/Button.tsx';
import { Medication } from '../../types/index.ts';

interface MedicationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  medication: Medication | null;
  onEdit: (med: Medication) => void;
  onRefill: (medId: string, name: string) => void;
  onArchive: (medId: string, name: string) => void;
}

export const MedicationDetailsModal: React.FC<MedicationDetailsModalProps> = ({
  isOpen,
  onClose,
  medication,
  onEdit,
  onRefill,
  onArchive
}) => {
  if (!medication) return null;

  const isLowStock = medication.stockQuantity <= medication.refillReminderThreshold;

  const getFoodInstructionLabel = (instruction?: string) => {
    switch (instruction) {
      case 'BEFORE_MEAL':
        return 'Take 30 minutes before meals for optimal gastric absorption.';
      case 'AFTER_MEAL':
        return 'Take after food to protect stomach lining.';
      case 'WITH_MEAL':
        return 'Take during meal with warm water or nourishment.';
      case 'BEFORE_BED':
        return 'Take at bedtime for overnight lipid/metabolic maintenance.';
      case 'EMPTY_STOMACH':
        return 'Take on an empty stomach with a full glass of water.';
      default:
        return 'May be taken with or without food as preferred.';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={medication.name}
      subtitle={`${medication.dosage} • ${medication.category || 'Prescription'}`}
      maxWidth="lg"
    >
      <div className="space-y-5 text-left max-h-[75vh] overflow-y-auto pr-1">
        {/* Top Header Card */}
        <div className="p-4 rounded-3xl bg-gradient-to-br from-[#E9E3FF]/60 to-[#FAF9FF] border border-[#D2C7FC] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-[#7969B5] text-white flex items-center justify-center shadow-glow-purple/20 shrink-0">
              <Pill className="w-7 h-7" />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-xl font-black font-heading text-[#34354A]">
                {medication.name}
              </h3>
              <p className="text-xs font-bold text-[#7969B5]">
                {medication.dosage} • {medication.frequency.replace('_', ' ')}
              </p>
            </div>
          </div>

          <div className="text-right space-y-1">
            <CuteBadge variant="mint" size="md" dot>
              Active Routine
            </CuteBadge>
            <p className="text-[10px] text-[#7A7D9D] font-bold">Rx Verified</p>
          </div>
        </div>

        {/* Schedule & Food Instructions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-[#FAF9FF] border border-[#E5E4F2] space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-[#34354A]">
              <Clock className="w-4 h-4 text-[#7969B5]" />
              <span>Intake Timings</span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {medication.scheduledTimes.map((t) => (
                <span
                  key={t}
                  className="px-2.5 py-1 rounded-xl bg-white border border-[#E5E4F2] font-black text-[#7969B5]"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FAF9FF] border border-[#E5E4F2] space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-[#34354A]">
              <Utensils className="w-4 h-4 text-amber-600" />
              <span>Food Guidelines</span>
            </div>
            <p className="text-xs text-[#575973] font-medium leading-relaxed">
              {getFoodInstructionLabel(medication.foodInstructions)}
            </p>
          </div>
        </div>

        {/* Doctor Instructions & Clinical Advice */}
        <div className="p-4 rounded-2xl bg-white border border-[#E5E4F2] space-y-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h4 className="text-xs font-bold font-heading text-[#34354A]">
              Doctor & Pharmacist Instructions
            </h4>
          </div>
          <p className="text-xs text-[#575973] leading-relaxed font-medium bg-[#FAF9FF] p-3 rounded-xl border border-[#ECEBF8]">
            {medication.doctorInstructions ||
              medication.instructions ||
              'Take exactly as directed by your physician. Do not alter dosages without consulting Dr. Elizabeth Adams.'}
          </p>
        </div>

        {/* Stock & Refill Tracker */}
        <div className="p-4 rounded-2xl bg-[#FAF9FF] border border-[#E5E4F2] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#34354A]">Medication Supply Level</span>
            {isLowStock ? (
              <CuteBadge variant="peach" size="sm" icon={<AlertTriangle className="w-3 h-3" />}>
                Low Supply ({medication.stockQuantity} remaining)
              </CuteBadge>
            ) : (
              <span className="text-xs font-bold text-emerald-700">
                {medication.stockQuantity} tablets in bottle
              </span>
            )}
          </div>

          <div className="w-full bg-white h-3 rounded-full overflow-hidden border border-[#E5E4F2]">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isLowStock ? 'bg-gradient-to-r from-rose-500 to-amber-500' : 'bg-gradient-to-r from-[#7969B5] to-[#48BB78]'
              }`}
              style={{ width: `${Math.min(100, (medication.stockQuantity / 45) * 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#7A7D9D]">
            <span>Refill Threshold: {medication.refillReminderThreshold} doses</span>
            <span>Pharmacy: Walgreens Rx #882914</span>
          </div>
        </div>

        {/* Prescription Document Scan Preview */}
        <div className="p-3.5 rounded-2xl bg-[#FAF9FF] border border-[#E5E4F2] flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white border border-[#E5E4F2] text-[#7969B5] flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-[#34354A]">Clinical Rx Document on File</p>
              <p className="text-[10px] text-[#7A7D9D]">Signed by Dr. Elizabeth Adams, MD</p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1 text-[#7969B5] hover:underline font-bold text-xs cursor-pointer">
            <span>Verified Rx</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </span>
        </div>

        {/* Bottom Actions */}
        <div className="pt-3 border-t border-[#FAF9FF] flex flex-wrap items-center justify-between gap-2.5">
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={() => {
              onClose();
              onArchive(medication.id, medication.name);
            }}
            leftIcon={<Archive className="w-3.5 h-3.5" />}
          >
            Archive Medicine
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                onClose();
                onRefill(medication.id, medication.name);
              }}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Refill (+30)
            </Button>

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => {
                onClose();
                onEdit(medication);
              }}
              leftIcon={<Edit className="w-3.5 h-3.5" />}
            >
              Edit Prescription
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
