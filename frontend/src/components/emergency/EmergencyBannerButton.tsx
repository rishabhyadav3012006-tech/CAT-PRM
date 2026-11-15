import React, { useState } from 'react';
import { ShieldAlert, Phone, AlertTriangle } from 'lucide-react';
import { EmergencyConfirmationModal } from './EmergencyConfirmationModal.tsx';

interface EmergencyBannerButtonProps {
  elderlyId?: string;
  onAlertTriggered?: () => void;
}

export const EmergencyBannerButton: React.FC<EmergencyBannerButtonProps> = ({
  elderlyId = 'eld-01',
  onAlertTriggered
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="relative group w-full">
        {/* Ambient Subtle Pulse Ring */}
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-rose-500 via-red-400 to-rose-600 opacity-20 group-hover:opacity-35 blur-sm transition-all animate-pulse" />

        <div className="relative p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#FCE4ED] via-white to-[#FCE4ED] border-3 border-rose-300 shadow-glass-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-rose-600 to-red-500 text-white flex items-center justify-center shrink-0 shadow-glow-pink">
              <ShieldAlert className="w-7 h-7 sm:w-8 sm:h-8 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-rose-700 font-heading bg-rose-100 px-2.5 py-0.5 rounded-full border border-rose-200">
                  Priority Emergency Assistance
                </span>
                <span className="hidden sm:inline-block w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              </div>
              <h3 className="text-lg sm:text-xl font-black font-heading text-rose-950 mt-0.5">
                Need Help? Alert Your Family & Care Circle
              </h3>
              <p className="text-xs sm:text-sm text-rose-700 font-medium font-body max-w-lg leading-snug">
                One-touch notification dispatches urgent alerts and your permitted medical card to Marcus Chen and Sarah Vance.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex-1 sm:flex-none min-h-[52px] px-6 py-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 active:scale-95 text-white font-black font-heading text-sm sm:text-base rounded-2xl shadow-glow-pink flex items-center justify-center gap-2 transition-all cursor-pointer border-2 border-white/80"
              aria-label="Activate Emergency Assistance SOS"
            >
              <ShieldAlert className="w-5 h-5 animate-pulse" />
              <span>REQUEST HELP (SOS)</span>
            </button>
            <a
              href="tel:911"
              className="min-h-[52px] px-4 py-3 bg-white hover:bg-rose-50 text-rose-700 font-black font-heading text-xs sm:text-sm rounded-2xl border-2 border-rose-200 hover:border-rose-300 flex items-center justify-center gap-1.5 transition-all shadow-2xs"
              title="Direct call local emergency services 911"
              aria-label="Call 911 directly"
            >
              <Phone className="w-4 h-4 text-rose-600" />
              <span>911</span>
            </a>
          </div>
        </div>
      </div>

      {/* Emergency Modal with Confirmation, Contacts, Medical Profile & Delivery Status */}
      <EmergencyConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        elderlyId={elderlyId}
        onAlertTriggered={onAlertTriggered}
      />
    </>
  );
};

