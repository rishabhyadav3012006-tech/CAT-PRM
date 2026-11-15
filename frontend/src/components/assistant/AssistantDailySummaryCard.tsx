import React from 'react';
import { AssistantDailySummary } from '../../types/index.ts';
import { Sparkles, Pill, Calendar, Heart, Clock, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AssistantDailySummaryCardProps {
  summary: AssistantDailySummary | null;
  loading: boolean;
  onSelectAction?: (prompt: string) => void;
}

export const AssistantDailySummaryCard: React.FC<AssistantDailySummaryCardProps> = ({
  summary,
  loading,
  onSelectAction
}) => {
  const navigate = useNavigate();

  if (loading || !summary) {
    return (
      <div className="p-6 text-center animate-pulse space-y-4">
        <div className="h-6 bg-purple-100 rounded-full w-2/3 mx-auto" />
        <div className="h-20 bg-purple-50 rounded-2xl w-full" />
        <div className="h-16 bg-purple-50 rounded-2xl w-full" />
      </div>
    );
  }

  const { medicationSummary, appointmentSummary, todayWaterIntake } = summary;
  const nextMed = medicationSummary.nextDose;
  const nextAppt = appointmentSummary.nextAppointment;

  return (
    <div className="space-y-4 text-[#34354A]">
      {/* Motivational Quote Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#E9E3FF]/70 via-[#FCE4ED]/60 to-[#DDF5E9]/70 border border-white/80 shadow-sm relative overflow-hidden">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-white/90 text-[#7969B5] flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#7969B5] font-heading">
              Daily Encouragement • {summary.dateFormatted}
            </p>
            <p className="text-sm font-medium text-[#4A4B65] mt-0.5 italic">
              "{summary.motivationalMessage}"
            </p>
          </div>
        </div>
      </div>

      {/* Routine Overview Box */}
      <div className="p-4 rounded-2xl bg-white/80 border border-white/90 shadow-glass-sm space-y-2">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-rose-400" />
          <h4 className="text-sm font-bold font-heading text-[#34354A]">
            {summary.greeting}
          </h4>
        </div>
        <p className="text-xs sm:text-sm text-[#5B5D7A] leading-relaxed">
          {summary.routineSummary}
        </p>
      </div>

      {/* Next Medication Spotlight */}
      <div className="p-4 rounded-2xl bg-[#DDF5E9]/50 border border-[#DDF5E9] shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#2B8756]/15 text-[#2B8756] flex items-center justify-center">
              <Pill className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#2B8756] font-heading uppercase tracking-wider">
                Upcoming Medication
              </span>
              <p className="text-xs text-[#5B5D7A]">
                {medicationSummary.takenCount} of {medicationSummary.totalScheduledToday} dose(s) recorded today
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/medications')}
            className="text-[11px] font-bold text-[#2B8756] hover:text-[#1F633E] flex items-center gap-0.5 bg-white/70 px-2.5 py-1 rounded-full shadow-xs"
          >
            Manage <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {nextMed ? (
          <div className="bg-white/80 rounded-xl p-3 border border-white/90 flex items-center justify-between">
            <div>
              <div className="font-bold text-sm text-[#34354A] font-heading">
                {nextMed.medicationName}{' '}
                <span className="text-xs font-semibold text-[#7969B5]">({nextMed.dosage})</span>
              </div>
              <div className="text-[11px] text-[#7A7D9D] flex items-center gap-1.5 mt-0.5">
                <Clock className="w-3 h-3 text-[#2B8756]" />
                <span>Scheduled for {nextMed.scheduledTime}</span>
                {nextMed.foodInstructions && (
                  <span>• {nextMed.foodInstructions}</span>
                )}
              </div>
            </div>
            {onSelectAction && (
              <button
                onClick={() => onSelectAction(`When is my next dose of ${nextMed.medicationName}?`)}
                className="text-[11px] font-bold text-[#7969B5] bg-[#E9E3FF]/70 hover:bg-[#E9E3FF] px-2.5 py-1 rounded-lg transition-colors"
              >
                Details
              </button>
            )}
          </div>
        ) : (
          <div className="p-3 bg-white/70 rounded-xl text-xs text-[#2B8756] font-medium flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            All scheduled medication doses for today have been completed!
          </div>
        )}
      </div>

      {/* Next Appointment Spotlight */}
      <div className="p-4 rounded-2xl bg-[#DFEEFF]/50 border border-[#DFEEFF] shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#2B6EB5]/15 text-[#2B6EB5] flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#2B6EB5] font-heading uppercase tracking-wider">
                Doctor Consultation
              </span>
              <p className="text-xs text-[#5B5D7A]">
                {appointmentSummary.upcomingCount} upcoming visit(s)
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/appointments')}
            className="text-[11px] font-bold text-[#2B6EB5] hover:text-[#1E528C] flex items-center gap-0.5 bg-white/70 px-2.5 py-1 rounded-full shadow-xs"
          >
            Calendar <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {nextAppt ? (
          <div className="bg-white/80 rounded-xl p-3 border border-white/90">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-sm text-[#34354A] font-heading">
                  {nextAppt.doctorName}
                </span>
                <span className="ml-1.5 text-xs text-[#2B6EB5] font-medium">
                  ({nextAppt.specialty})
                </span>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide bg-[#2B6EB5]/10 text-[#2B6EB5] rounded-full">
                {nextAppt.countdownLabel}
              </span>
            </div>
            <div className="text-[11px] text-[#7A7D9D] mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>{nextAppt.hospitalName}</span>
              <span>•</span>
              <span>{nextAppt.appointmentTime}</span>
              {nextAppt.contactNumber && (
                <>
                  <span>•</span>
                  <span>{nextAppt.contactNumber}</span>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="p-3 bg-white/70 rounded-xl text-xs text-[#7A7D9D] font-medium">
            No pending appointments on your immediate calendar.
          </div>
        )}
      </div>

      {/* Recent Care Circle Activity */}
      {summary.recentActivity && (
        <div className="p-3 rounded-xl bg-white/80 border border-white/90 text-xs flex items-center justify-between text-[#5B5D7A]">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-[#7969B5]" />
            <div>
              <span className="font-bold text-[#34354A] font-heading">Care Update: </span>
              <span>{summary.recentActivity.title}</span>
            </div>
          </div>
          <span className="text-[10px] text-[#7A7D9D] shrink-0 font-medium ml-2">
            {summary.recentActivity.timeAgo}
          </span>
        </div>
      )}

      {/* Hydration Mini Counter */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-[#E9E3FF]/40 border border-[#E9E3FF] text-xs">
        <span className="font-semibold text-[#55428F]">
          Daily Hydration: {todayWaterIntake.glasses} / {todayWaterIntake.targetGlasses} glasses ({todayWaterIntake.volumeMl} ml)
        </span>
        {onSelectAction && (
          <button
            onClick={() => onSelectAction('I drank a glass of water')}
            className="text-[11px] font-bold text-[#55428F] bg-white/80 hover:bg-white px-2.5 py-1 rounded-lg shadow-xs transition-colors"
          >
            +1 Glass
          </button>
        )}
      </div>
    </div>
  );
};

