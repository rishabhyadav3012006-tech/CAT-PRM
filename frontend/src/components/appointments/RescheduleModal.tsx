import React, { useState } from 'react';
import { CalendarClock, AlertCircle, Calendar, Clock } from 'lucide-react';
import { Appointment } from '../../types/index.ts';
import { Modal } from '../ui/Modal.tsx';
import { Button } from '../ui/Button.tsx';
import { InputField } from '../ui/InputField.tsx';
import { appointmentsApi } from '../../api/client.ts';

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  onSuccess: () => void;
}

const RESCHEDULE_REASONS = [
  'Doctor or clinic requested change of schedule',
  'Patient feeling unwell / temporary medical hold',
  'Family caregiver transportation conflict',
  'Fast-tracked to earlier available specialist slot',
  'Awaiting pending blood work or radiology results',
  'Other reason'
];

export const RescheduleModal: React.FC<RescheduleModalProps> = ({
  isOpen,
  onClose,
  appointment,
  onSuccess
}) => {
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('11:00');
  const [selectedReason, setSelectedReason] = useState(RESCHEDULE_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  React.useEffect(() => {
    if (appointment) {
      // Default new date: 3 days after current date
      const cur = new Date(appointment.appointmentDate);
      const nextDate = new Date(cur.getTime() + 3 * 24 * 60 * 60 * 1000);
      setNewDate(nextDate.toISOString().split('T')[0]);
      setNewTime(appointment.appointmentTime || '11:00');
      setSelectedReason(RESCHEDULE_REASONS[0]);
      setCustomReason('');
      setErrorMsg('');
    }
  }, [appointment, isOpen]);

  if (!appointment) return null;

  const curDateStr = new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const handleReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate) {
      setErrorMsg('Please select a new appointment date.');
      return;
    }

    const finalReason = selectedReason === 'Other reason' && customReason.trim()
      ? customReason.trim()
      : selectedReason;

    // Combine date & time
    let isoString: string;
    try {
      const [year, month, day] = newDate.split('-').map(Number);
      let hours = 10;
      let minutes = 0;
      if (newTime.includes(':')) {
        const parts = newTime.split(':');
        hours = parseInt(parts[0], 10) || 10;
        minutes = parseInt(parts[1], 10) || 0;
      }
      isoString = new Date(year, month - 1, day, hours, minutes).toISOString();
    } catch {
      isoString = new Date(newDate).toISOString();
    }

    setLoading(true);
    try {
      await appointmentsApi.reschedule(appointment.id, {
        newDate: isoString,
        newTime,
        reason: finalReason
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to reschedule appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reschedule Doctor Appointment"
      subtitle="Adjust the consultation date and time while logging the adjustment reason"
      icon={<CalendarClock className="w-5 h-5 text-[#B85820]" />}
      maxWidth="md"
    >
      <form onSubmit={handleReschedule} className="space-y-4">
        {errorMsg && (
          <div className="p-3 rounded-2xl bg-[#FCE4ED] border border-[#F7C6D7] text-xs font-bold text-[#A62650]">
            {errorMsg}
          </div>
        )}

        {/* Current appointment recap */}
        <div className="p-3.5 rounded-2xl bg-[#FAF9FF] border border-[#ECEAF5] space-y-1 text-xs">
          <p className="font-bold text-[#34354A]">
            Current Appointment: <span className="text-[#7969B5]">{appointment.doctorName}</span> ({appointment.specialty})
          </p>
          <p className="text-[#575973] flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#7A7D9D]" />
            <span>Currently: {curDateStr} at {appointment.appointmentTime || '10:00 AM'}</span>
          </p>
        </div>

        {/* New Date & Time */}
        <div className="p-3.5 rounded-2xl bg-[#FFE9DC]/30 border border-[#FBD2BA] space-y-3">
          <h4 className="text-xs font-black font-heading text-[#B85820] uppercase tracking-wider flex items-center gap-1.5">
            <CalendarClock className="w-3.5 h-3.5" />
            New Appointment Date & Time
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InputField
              label="New Date *"
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              required
            />

            <InputField
              label="New Time *"
              type="text"
              placeholder="e.g. 02:30 PM"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Reason for rescheduling */}
        <div>
          <label className="block text-xs sm:text-sm font-bold font-heading text-[#34354A] mb-1.5">
            Reason for Rescheduling *
          </label>
          <div className="space-y-2">
            {RESCHEDULE_REASONS.map((reason) => (
              <label
                key={reason}
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                  selectedReason === reason
                    ? 'bg-[#FFE9DC] border-[#FBD2BA] text-[#B85820] font-bold shadow-2xs'
                    : 'bg-white border-[#E5E4F2] text-[#575973] hover:bg-[#FAF9FF]'
                }`}
              >
                <input
                  type="radio"
                  name="rescheduleReason"
                  checked={selectedReason === reason}
                  onChange={() => setSelectedReason(reason)}
                  className="text-[#B85820] focus:ring-[#B85820]"
                />
                <span>{reason}</span>
              </label>
            ))}
          </div>

          {selectedReason === 'Other reason' && (
            <input
              type="text"
              placeholder="Describe reason..."
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              className="mt-2 w-full px-3 py-2 text-xs rounded-xl border-2 border-[#E5E4F2] bg-white text-[#34354A] focus:outline-none"
              required
            />
          )}
        </div>

        <div className="pt-3 border-t border-[#ECEAF5] flex justify-end gap-2.5">
          <Button type="button" variant="ghost" size="md" onClick={onClose}>
            <span>Cancel</span>
          </Button>

          <Button
            type="submit"
            variant="peach"
            size="md"
            disabled={loading}
            className="rounded-2xl shadow-glow-purple px-6"
          >
            <span>{loading ? 'Rescheduling...' : 'Confirm Reschedule'}</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
};

