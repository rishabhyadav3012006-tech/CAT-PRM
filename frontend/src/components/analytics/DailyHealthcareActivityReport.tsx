import React, { useState } from 'react';
import { DailyHealthcareReportItem } from '../../types/index.ts';
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Pill,
  CheckSquare,
  Activity,
  Heart,
  Moon,
  Smile,
  AlertCircle
} from 'lucide-react';

interface DailyHealthcareActivityReportProps {
  reports: DailyHealthcareReportItem[];
}

export const DailyHealthcareActivityReport: React.FC<DailyHealthcareActivityReportProps> = ({ reports }) => {
  // First item open by default
  const [openDates, setOpenDates] = useState<Record<string, boolean>>({
    [reports[0]?.date || '']: true
  });

  const toggleDate = (date: string) => {
    setOpenDates((prev) => ({ ...prev, [date]: !prev[date] }));
  };

  if (!reports || reports.length === 0) {
    return (
      <div className="bg-white/85 backdrop-blur-glass border border-white/95 rounded-3xl p-6 shadow-glass text-center text-xs text-[#7A7D9D]">
        No daily healthcare telemetry recorded for this timeframe.
      </div>
    );
  }

  return (
    <div className="bg-white/85 backdrop-blur-glass border border-white/95 rounded-3xl p-5 shadow-glass space-y-4">
      <div className="flex items-center justify-between border-b border-[#FAF9FF] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#DDF5E9] text-[#1F6A42] flex items-center justify-center shadow-2xs">
              <Calendar className="w-4 h-4" />
            </div>
            <h3 className="text-base font-extrabold font-heading text-[#34354A]">
              Daily Healthcare Activity Reports
            </h3>
          </div>
          <p className="text-xs text-[#7A7D9D] mt-0.5">
            Combined daily ledger of medication intake, care routine checklists, and vital telemetry
          </p>
        </div>

        <span className="text-[11px] font-bold px-2.5 py-1 bg-[#FAF9FF] text-[#575973] rounded-xl border border-[#E5E4F2]">
          {reports.length} Daily Logs
        </span>
      </div>

      <div className="space-y-3">
        {reports.map((report) => {
          const isOpen = !!openDates[report.date];

          return (
            <div
              key={report.date}
              className="border border-[#E5E4F2] hover:border-[#D2C7FC] rounded-2xl bg-[#FAF9FF] transition-all overflow-hidden"
            >
              {/* Accordion Header */}
              <button
                type="button"
                onClick={() => toggleDate(report.date)}
                className="w-full p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left hover:bg-white transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white text-[#554391] border border-[#E9E3FF] flex items-center justify-center font-extrabold text-xs shadow-2xs">
                    {new Date(report.date).getDate()}
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold font-heading text-[#34354A]">
                      {report.formattedDate}
                    </h4>
                    <div className="text-[11px] text-[#7A7D9D] font-medium flex items-center gap-2 mt-0.5">
                      <span>{report.summary.medicationsTaken}/{report.summary.medicationsTotal} Meds Taken</span>
                      <span>•</span>
                      <span>{report.summary.activitiesCompleted}/{report.summary.activitiesTotal} Tasks Completed</span>
                      <span>•</span>
                      <span>{report.summary.vitalsCount} Vitals Logged</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                      report.summary.medicationsTotal > 0 &&
                      report.summary.medicationsTaken === report.summary.medicationsTotal
                        ? 'bg-[#DDF5E9] text-[#1F6A42] border-[#BFE7D2]'
                        : 'bg-[#FFE9DC] text-[#8E3F10] border-[#FFD3BC]'
                    }`}
                  >
                    {report.summary.medicationsTotal > 0
                      ? `${Math.round((report.summary.medicationsTaken / report.summary.medicationsTotal) * 100)}% Adherence`
                      : 'No Meds Scheduled'}
                  </span>
                  <div className="p-1 rounded-lg text-[#7A7D9D]">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </button>

              {/* Accordion Expanded Body */}
              {isOpen && (
                <div className="p-4 pt-1 bg-white border-t border-[#F0EFFB] space-y-4">
                  {/* Section A: Medications for this day */}
                  <div>
                    <div className="text-[11px] font-extrabold text-[#7A7D9D] uppercase tracking-wider flex items-center gap-1.5 mb-2">
                      <Pill className="w-3.5 h-3.5 text-[#2B8756]" />
                      <span>Scheduled Medications</span>
                    </div>

                    {report.medications.length === 0 ? (
                      <div className="text-xs text-[#7A7D9D] italic pl-2">No medication doses scheduled on this day.</div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {report.medications.map((m) => {
                          const isTaken = m.status === 'TAKEN';
                          const isSkipped = m.status === 'SKIPPED';
                          const isMissed = m.status === 'MISSED';
                          return (
                            <div
                              key={m.id}
                              className="p-2.5 rounded-xl bg-[#FAF9FF] border border-[#E5E4F2] flex items-center justify-between gap-2 text-xs"
                            >
                              <div className="truncate">
                                <div className="font-bold text-[#34354A] truncate">{m.name}</div>
                                <div className="text-[11px] text-[#7A7D9D]">
                                  {m.dosage} • {m.time}
                                </div>
                                {m.skipReason && (
                                  <div className="text-[10px] text-[#B85820] italic mt-0.5 truncate">
                                    Reason: {m.skipReason}
                                  </div>
                                )}
                              </div>
                              <span
                                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md shrink-0 ${
                                  isTaken
                                    ? 'bg-[#DDF5E9] text-[#1F6A42]'
                                    : isSkipped
                                    ? 'bg-[#FFE9DC] text-[#8E3F10]'
                                    : isMissed
                                    ? 'bg-[#FCE4ED] text-[#8F1E48]'
                                    : 'bg-[#E9E3FF] text-[#554391]'
                                }`}
                              >
                                {m.status}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Section B: Care Activities for this day */}
                  <div>
                    <div className="text-[11px] font-extrabold text-[#7A7D9D] uppercase tracking-wider flex items-center gap-1.5 mb-2">
                      <CheckSquare className="w-3.5 h-3.5 text-[#554391]" />
                      <span>Care Tasks & Routine Checklists</span>
                    </div>

                    {report.careActivities.length === 0 ? (
                      <div className="text-xs text-[#7A7D9D] italic pl-2">No routine care tasks scheduled on this day.</div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {report.careActivities.map((a) => (
                          <div
                            key={a.id}
                            className="p-2.5 rounded-xl bg-[#FAF9FF] border border-[#E5E4F2] flex items-center justify-between gap-2 text-xs"
                          >
                            <div>
                              <div className="font-bold text-[#34354A]">{a.title}</div>
                              <div className="text-[11px] text-[#7A7D9D]">
                                {a.category} • {a.time} • Assigned to {a.assignedTo}
                              </div>
                              {a.notes && (
                                <div className="text-[10px] text-[#575973] mt-0.5 italic">
                                  Notes: {a.notes}
                                </div>
                              )}
                            </div>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
                                a.status === 'COMPLETED'
                                  ? 'bg-[#DDF5E9] text-[#1F6A42]'
                                  : 'bg-[#E9E3FF] text-[#554391]'
                              }`}
                            >
                              {a.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Section C: Vitals & Wellness Telemetry for this day */}
                  {report.vitals.length > 0 && (
                    <div>
                      <div className="text-[11px] font-extrabold text-[#7A7D9D] uppercase tracking-wider flex items-center gap-1.5 mb-2">
                        <Activity className="w-3.5 h-3.5 text-[#B85820]" />
                        <span>Clinical Vitals & Wellness Log</span>
                      </div>

                      <div className="space-y-2">
                        {report.vitals.map((v) => (
                          <div
                            key={v.id}
                            className="p-3 rounded-xl bg-[#FAF9FF] border border-[#E5E4F2] text-xs space-y-1.5"
                          >
                            <div className="flex flex-wrap items-center gap-3">
                              {v.systolicBp && v.diastolicBp && (
                                <div className="flex items-center gap-1 text-[#34354A] font-bold">
                                  <Heart className="w-3.5 h-3.5 text-rose-500" />
                                  <span>BP: {v.systolicBp}/{v.diastolicBp} mmHg</span>
                                </div>
                              )}
                              {v.heartRate && (
                                <div className="text-[#34354A] font-medium">
                                  Pulse: <strong className="font-bold">{v.heartRate} bpm</strong>
                                </div>
                              )}
                              {v.bloodGlucose && (
                                <div className="text-[#34354A] font-medium">
                                  Glucose: <strong className="font-bold">{v.bloodGlucose} mg/dL</strong>
                                </div>
                              )}
                              {v.oxygenSaturation && (
                                <div className="text-[#34354A] font-medium">
                                  SpO2: <strong className="font-bold">{v.oxygenSaturation}%</strong>
                                </div>
                              )}
                              {v.mood && (
                                <div className="flex items-center gap-1 text-[#554391] font-semibold">
                                  <Smile className="w-3.5 h-3.5" />
                                  <span>Mood: {v.mood}</span>
                                </div>
                              )}
                              {v.sleepHours !== undefined && (
                                <div className="flex items-center gap-1 text-[#2B6EB5] font-semibold">
                                  <Moon className="w-3.5 h-3.5" />
                                  <span>Sleep: {v.sleepHours} hrs</span>
                                </div>
                              )}
                              {v.painLevel !== undefined && (
                                <div className="text-[#B53364] font-semibold">
                                  Pain: {v.painLevel}/10
                                </div>
                              )}
                            </div>
                            {v.notes && (
                              <div className="text-[11px] text-[#7A7D9D] italic">
                                {v.notes}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

