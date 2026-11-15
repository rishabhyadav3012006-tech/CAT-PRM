import React, { useState } from 'react';
import { XCircle, AlertTriangle, Calendar } from 'lucide-react';
import { Appointment } from '../../types/index.ts';
import { Modal } from '../ui/Modal.tsx';
import { Button } from '../ui/Button.tsx';
import { appointmentsApi } from '../../api/client.ts';

interface CancelAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  onSuccess: () => void;
}

const CANCEL_REASONS = [
  'Patient symptoms resolved; consultation not needed',
  'Primary doctor advised postponement',
  'Unexpected family conflict or transport issue',
  'Provider cancelled office hours',
  'Transferred care to alternate medical clinic',
  'Other'
];

export const CancelAppointmentModal: React.FC<CancelAppointmentModalProps> = ({
  isOpen,
  onClose,
  appointment,
  onSuccess
}) => {
  const [selectedReason, setSelectedReason] = useState(CANCEL_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [loading, setLoading] = useState(false);

  if (!appointment) return null;

  const dateStr = new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  const handleConfirmCancel = async () => {
    const finalReason = selectedReason === 'Other' && customReason.trim()
      ? customReason.trim()
      : selectedReason;

    setLoading(true);
    try {
      await appointmentsApi.cancel(appointment.id, finalReason);
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to cancel appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cancel Doctor Appointment"
      subtitle="Safely cancel appointment while recording cancellation reason in the audit history"
      icon={<XCircle className="w-5 h-5 text-[#A62650]" />}
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Warning Callout */}
        <div className="p-3.5 rounded-2xl bg-[#FCE4ED]/70 border border-[#F7C6D7] flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-[#A62650] flex-shrink-0 mt-0.5" />
          <div className="text-xs text-[#A62650]">
            <p className="font-extrabold font-heading text-sm">
              Confirm Cancellation with {appointment.doctorName}
            </p>
            <p className="font-medium mt-0.5">
              Scheduled for <strong>{dateStr}</strong> at {appointment.location}. The slot will be marked as cancelled in the family care log.
            </p>
          </div>
        </div>

        {/* Cancellation Reason Selector */}
        <div>
          <label className="block text-xs sm:text-sm font-bold font-heading text-[#34354A] mb-1.5">
            Select Cancellation Reason
          </label>
          <div className="space-y-2">
            {CANCEL_REASONS.map((reason) => (
              <label
                key={reason}
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                  selectedReason === reason
                    ? 'bg-[#FCE4ED] border-[#F7C6D7] text-[#A62650] font-bold shadow-2xs'
                    : 'bg-white border-[#E5E4F2] text-[#575973] hover:bg-[#FAF9FF]'
                }`}
              >
                <input
                  type="radio"
                  name="cancelReason"
                  checked={selectedReason === reason}
                  onChange={() => setSelectedReason(reason)}
                  className="text-[#A62650] focus:ring-[#A62650]"
                />
                <span>{reason}</span>
              </label>
            ))}
          </div>

          {selectedReason === 'Other' && (
            <input
              type="text"
              placeholder="Enter reason..."
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              className="mt-2 w-full px-3 py-2 text-xs rounded-xl border-2 border-[#E5E4F2] bg-white text-[#34354A] focus:outline-none"
              required
            />
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-[#ECEAF5] flex justify-end gap-2.5">
          <Button type="button" variant="ghost" size="md" onClick={onClose}>
            <span>Keep Appointment</span>
          </Button>

          <Button
            type="button"
            variant="danger"
            size="md"
            disabled={loading}
            onClick={handleConfirmCancel}
            className="rounded-2xl shadow-sm px-6 bg-rose-600 hover:bg-rose-700 text-white"
          >
            <span>{loading ? 'Cancelling...' : 'Confirm Cancellation'}</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
};

