import React, { useState } from 'react';
import { Pill, Clock, CheckCircle2, BellRing, Sparkles, AlertCircle } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard.tsx';
import { CuteBadge } from '../ui/CuteBadge.tsx';
import { Button } from '../ui/Button.tsx';

interface NextMedicationReminderWidgetProps {
  medication?: {
    id: string;
    name: string;
    dosage: string;
    scheduledTime: string;
    instructions?: string;
  };
  onConfirmTaken: (id: string, name: string) => Promise<void>;
}

export const NextMedicationReminderWidget: React.FC<NextMedicationReminderWidgetProps> = ({
  medication = {
    id: 'med-01',
    name: 'Lisinopril',
    dosage: '10mg (1 tablet)',
    scheduledTime: '12:30 PM',
    instructions: 'Take with lunch and a full glass of water for blood pressure management.'
  },
  onConfirmTaken
}) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [snoozed, setSnoozed] = useState(false);

  const handleTake = async () => {
    setIsConfirming(true);
    try {
      await onConfirmTaken(medication.id, medication.name);
      setConfirmed(true);
    } catch (err) {
      // handled
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <GlassCard
      variant="white"
      padding="lg"
      rounded="3xl"
      className="relative overflow-hidden border-2 border-[#D2C7FC] shadow-glass-md text-left"
    >
      {/* Decorative background glow */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#E9E3FF] rounded-full blur-2xl opacity-60 pointer-events-none" />

      <div className="relative z-10 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-[#E9E3FF] text-[#7969B5] flex items-center justify-center shadow-xs">
              <BellRing className="w-5 h-5 text-[#7969B5] animate-bounce" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black font-heading text-[#34354A]">
                Next Medication Reminder
              </h3>
              <p className="text-xs text-[#7A7D9D] font-medium">Scheduled for your routine</p>
            </div>
          </div>

          <CuteBadge variant="lavender" size="md">
            <Clock className="w-3.5 h-3.5 mr-1" />
            <span>{medication.scheduledTime}</span>
          </CuteBadge>
        </div>

        {confirmed ? (
          /* Confirmation Success Banner */
          <div className="p-4 rounded-2xl bg-[#DDF5E9] border border-emerald-200 text-emerald-900 space-y-2 animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span className="font-extrabold font-heading text-sm">
                Medication Intake Confirmed!
              </span>
            </div>
            <p className="text-xs text-emerald-800">
              Great job, Eleanor! We notified Sarah and Marcus that you took your {medication.name}.
            </p>
          </div>
        ) : (
          <>
            {/* Medication Card Details */}
            <div className="p-4 rounded-2xl bg-[#FAF9FF] border border-[#E5E4F2] space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#7969B5] to-[#9E8EE4] text-white flex items-center justify-center shadow-xs">
                    <Pill className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base sm:text-lg font-extrabold font-heading text-[#34354A]">
                      {medication.name}
                    </h4>
                    <span className="text-xs font-bold text-[#7969B5] bg-white px-2 py-0.5 rounded-full border border-[#E5E4F2]">
                      {medication.dosage}
                    </span>
                  </div>
                </div>

                <CuteBadge variant="mint" size="sm">
                  Upcoming
                </CuteBadge>
              </div>

              {medication.instructions && (
                <p className="text-xs font-medium font-body text-[#575973] bg-white/80 p-2.5 rounded-xl border border-[#ECEBF8] leading-relaxed">
                  💡 <strong>Instructions:</strong> {medication.instructions}
                </p>
              )}
            </div>

            {/* Action Buttons: Big Accessible Targets */}
            <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
              <Button
                variant="primary"
                size="lg"
                onClick={handleTake}
                isLoading={isConfirming}
                leftIcon={<CheckCircle2 className="w-5 h-5" />}
                className="flex-1 justify-center text-sm sm:text-base font-extrabold"
              >
                <span>I Took This Medication</span>
              </Button>

              <Button
                variant="secondary"
                size="lg"
                onClick={() => setSnoozed(true)}
                className="justify-center text-xs sm:text-sm font-bold"
              >
                <span>{snoozed ? 'Snoozed (15m)' : 'Remind in 15m'}</span>
              </Button>
            </div>
          </>
        )}
      </div>
    </GlassCard>
  );
};

