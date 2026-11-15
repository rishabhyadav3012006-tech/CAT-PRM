import React from 'react';
import { Info, ShieldCheck } from 'lucide-react';

export const MedicalDisclaimerBanner: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-[#FFF9ED] via-white/80 to-[#E9E3FF]/60 border border-[#FFE9DC] rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#575973]">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-[#FFE9DC] text-[#B85820] flex items-center justify-center shrink-0 shadow-2xs mt-0.5 sm:mt-0">
          <Info className="w-4 h-4" />
        </div>
        <div className="space-y-0.5">
          <span className="font-extrabold text-[#34354A] font-heading flex items-center gap-1.5">
            Clinical Telemetry & Record Disclaimer
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-[#DDF5E9] text-[#1F6A42] rounded-full border border-[#BFE7D2]">
              <ShieldCheck className="w-3 h-3" /> HIPAA Compliant
            </span>
          </span>
          <p className="text-[11px] text-[#7A7D9D] leading-relaxed">
            Adherence metrics reflect caregiver and patient log entries recorded in CareNest. Unrecorded entries are classified as <strong className="text-[#554391]">Unconfirmed</strong> and not presumed missed. These figures are for healthcare tracking purposes only and do not constitute an independent medical diagnosis or assessment.
          </p>
        </div>
      </div>
    </div>
  );
};

