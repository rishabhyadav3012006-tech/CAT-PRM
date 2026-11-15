import React from 'react';
import { CaretakerSummaryItem } from '../../types/index.ts';
import { Users, CheckCircle2, Clock, FileText, Shield } from 'lucide-react';

interface CaretakerActivitySummaryProps {
  caretakers: CaretakerSummaryItem[];
}

export const CaretakerActivitySummary: React.FC<CaretakerActivitySummaryProps> = ({ caretakers }) => {
  return (
    <div className="bg-white/85 backdrop-blur-glass border border-white/95 rounded-3xl p-5 shadow-glass space-y-4">
      <div className="flex items-center justify-between border-b border-[#FAF9FF] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#E9E3FF] text-[#554391] flex items-center justify-center shadow-2xs">
              <Users className="w-4 h-4" />
            </div>
            <h3 className="text-base font-extrabold font-heading text-[#34354A]">
              Caretaker & Care Circle Activity
            </h3>
          </div>
          <p className="text-xs text-[#7A7D9D] mt-0.5">
            Shift performance, completed care activities, and logged observations
          </p>
        </div>

        <span className="text-[11px] font-bold px-2.5 py-1 bg-[#FAF9FF] text-[#575973] rounded-xl border border-[#E5E4F2]">
          {caretakers.length} Active Members
        </span>
      </div>

      {caretakers.length === 0 ? (
        <div className="p-6 text-center text-xs text-[#7A7D9D] bg-[#FAF9FF] rounded-2xl border border-[#E5E4F2]">
          No active caretakers recorded for this profile yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
          {caretakers.map((ct) => (
            <div
              key={ct.id}
              className="p-4 bg-[#FAF9FF] hover:bg-white border border-[#E5E4F2] hover:border-[#D2C7FC] rounded-2xl transition-all shadow-2xs hover:shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <img
                    src={ct.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80'}
                    alt={ct.name}
                    className="w-10 h-10 rounded-2xl object-cover border-2 border-white shadow-2xs"
                  />
                  <div>
                    <h4 className="text-sm font-extrabold font-heading text-[#34354A] leading-tight">
                      {ct.name}
                    </h4>
                    <div className="text-[11px] text-[#7A7D9D] font-medium flex items-center gap-1.5 mt-0.5">
                      <span className="text-[#554391] font-bold">{ct.relationship}</span>
                      <span>•</span>
                      <span>{ct.shift}</span>
                    </div>
                  </div>
                </div>

                <span className="px-2 py-0.5 bg-[#DDF5E9] text-[#1F6A42] font-bold text-[10px] rounded-full border border-[#BFE7D2]">
                  On Duty
                </span>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white text-center">
                <div className="p-2 rounded-xl bg-white border border-[#F0EFFB]">
                  <div className="text-[10px] font-bold text-[#7A7D9D]">Tasks Done</div>
                  <div className="text-sm font-extrabold text-[#2B8756] mt-0.5 flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{ct.tasksCompleted}</span>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-white border border-[#F0EFFB]">
                  <div className="text-[10px] font-bold text-[#7A7D9D]">Pending</div>
                  <div className="text-sm font-extrabold text-[#7969B5] mt-0.5 flex items-center justify-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{ct.tasksPending}</span>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-white border border-[#F0EFFB]">
                  <div className="text-[10px] font-bold text-[#7A7D9D]">Notes</div>
                  <div className="text-sm font-extrabold text-[#B85820] mt-0.5 flex items-center justify-center gap-1">
                    <FileText className="w-3 h-3" />
                    <span>{ct.observationsRecorded}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

