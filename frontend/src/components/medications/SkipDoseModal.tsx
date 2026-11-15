import React, { useState } from 'react';
import { AlertTriangle, X, Check } from 'lucide-react';
import { Modal } from '../ui/Modal.tsx';
import { Button } from '../ui/Button.tsx';

interface SkipDoseModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicationName: string;
  dosage: string;
  onConfirmSkip: (reason: string, notes?: string) => Promise<void>;
}

export const SkipDoseModal: React.FC<SkipDoseModalProps> = ({
  isOpen,
  onClose,
  medicationName,
  dosage,
  onConfirmSkip
}) => {
  const [selectedReason, setSelectedReason] = useState<string>(
    'Doctor or nurse advised to hold dose'
  );
  const [customNotes, setCustomNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const presetReasons = [
    'Doctor or nurse advised to hold dose',
    'Fasting for blood laboratory test',
    'Feeling nauseous / upset stomach',
    'Ran out of medication stock (refill pending)',
    'Blood pressure / glucose already low',
    'Other clinical or personal reason'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onConfirmSkip(selectedReason, customNotes.trim() || undefined);
      onClose();
    } catch (err) {
      // handled
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Skipped Dose"
      subtitle={`${medicationName} (${dosage})`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            Recording a skipped dose preserves medical accuracy and notifies the family and care team without penalizing overall adherence unnecessarily.
          </span>
        </div>

        {/* Reason Presets */}
        <div className="space-y-2">
          <label className="block text-xs sm:text-sm font-bold font-heading text-[#34354A]">
            Select Reason for Skipping <span className="text-rose-500">*</span>
          </label>
          <div className="space-y-1.5">
            {presetReasons.map((reason) => (
              <label
                key={reason}
                className={`flex items-center gap-2.5 p-3 rounded-2xl border transition-all cursor-pointer text-xs font-semibold ${
                  selectedReason === reason
                    ? 'bg-[#E9E3FF]/70 border-[#7969B5] text-[#34354A] shadow-xs'
                    : 'bg-[#FAF9FF] border-[#E5E4F2] text-[#575973] hover:bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="skipReason"
                  checked={selectedReason === reason}
                  onChange={() => setSelectedReason(reason)}
                  className="w-4 h-4 text-[#7969B5] border-[#D1CEE8] focus:ring-[#7969B5] cursor-pointer"
                />
                <span>{reason}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Optional Notes */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold font-heading text-[#34354A]">
            Additional Notes for Care Team (Optional)
          </label>
          <textarea
            rows={2}
            value={customNotes}
            onChange={(e) => setCustomNotes(e.target.value)}
            placeholder="e.g. Dr. Adams advised skipping today due to fasting lab draw at 10 AM..."
            className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FAF9FF] border border-[#E5E4F2] text-xs text-[#34354A] placeholder-[#9497B5] focus:outline-none focus:ring-4 focus:ring-[#E9E3FF] transition-all resize-none"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button type="button" variant="secondary" size="md" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSubmitting}
            leftIcon={<Check className="w-4 h-4" />}
          >
            Record Skipped Dose
          </Button>
        </div>
      </form>
    </Modal>
  );
};
