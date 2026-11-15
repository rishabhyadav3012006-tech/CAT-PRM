import React, { useState } from 'react';
import { AssistantDailySummary, AssistantWellnessDTO } from '../../types/index.ts';
import { Droplets, Smile, Moon, FileText, Plus, Check, Heart, Sparkles } from 'lucide-react';

interface AssistantWellnessTrackerProps {
  summary: AssistantDailySummary | null;
  onLogWellness: (dto: AssistantWellnessDTO) => Promise<void>;
  loading: boolean;
}

const MOOD_OPTIONS = [
  { label: 'Cheerful', emoji: '😊', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { label: 'Calm', emoji: '😌', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { label: 'Neutral', emoji: '😐', color: 'bg-slate-50 text-slate-700 border-slate-200' },
  { label: 'Tired', emoji: '🥱', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { label: 'Anxious', emoji: '😟', color: 'bg-rose-50 text-rose-700 border-rose-200' }
];

export const AssistantWellnessTracker: React.FC<AssistantWellnessTrackerProps> = ({
  summary,
  onLogWellness,
  loading
}) => {
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [sleepHours, setSleepHours] = useState<number>(7.5);
  const [sleepQuality, setSleepQuality] = useState<string>('Restful');
  const [observationText, setObservationText] = useState<string>('');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const waterCount = summary?.todayWaterIntake.glasses ?? 0;
  const targetGlasses = summary?.todayWaterIntake.targetGlasses ?? 8;
  const volumeMl = summary?.todayWaterIntake.volumeMl ?? 0;

  const showToast = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleAddWater = async () => {
    try {
      await onLogWellness({ action: 'LOG_WATER', waterGlasses: 1 });
      showToast('Added 1 glass of water (+250 ml)!');
    } catch {
      showToast('Could not record water.');
    }
  };

  const handleSelectMood = async (mood: string) => {
    setSelectedMood(mood);
    try {
      await onLogWellness({ action: 'LOG_MOOD', mood });
      showToast(`Logged mood: ${mood}`);
    } catch {
      showToast('Could not record mood.');
    }
  };

  const handleSaveSleep = async () => {
    try {
      await onLogWellness({
        action: 'LOG_SLEEP',
        sleepHours,
        sleepQuality
      });
      showToast(`Recorded ${sleepHours} hrs of ${sleepQuality} sleep.`);
    } catch {
      showToast('Could not record sleep.');
    }
  };

  const handleSaveObservation = async () => {
    if (!observationText.trim()) return;
    try {
      await onLogWellness({
        action: 'LOG_OBSERVATION',
        observationNotes: observationText.trim()
      });
      setObservationText('');
      showToast('Health observation recorded in profile.');
    } catch {
      showToast('Could not record observation.');
    }
  };

  return (
    <div className="space-y-4 text-[#34354A]">
      {feedbackMsg && (
        <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2 border border-emerald-200 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* 1. WATER INTAKE TRACKER */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-[#DFEEFF]/60 to-[#E9E3FF]/40 border border-white/90 shadow-glass-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#2B6EB5]/15 text-[#2B6EB5] flex items-center justify-center">
              <Droplets className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#2B6EB5] font-heading">
                Hydration Tracker
              </h4>
              <p className="text-[11px] text-[#5B5D7A]">
                {waterCount} of {targetGlasses} glasses ({volumeMl} / 2,000 ml)
              </p>
            </div>
          </div>
          <button
            onClick={handleAddWater}
            disabled={loading}
            className="flex items-center gap-1 text-xs font-bold text-white bg-[#2B6EB5] hover:bg-[#1E528C] active:scale-95 px-3 py-1.5 rounded-xl shadow-xs transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Drink Glass
          </button>
        </div>

        {/* Visual Glass Indicators */}
        <div className="grid grid-cols-8 gap-1.5 pt-1">
          {Array.from({ length: targetGlasses }).map((_, idx) => {
            const filled = idx < waterCount;
            return (
              <div
                key={idx}
                className={`h-8 rounded-lg flex items-center justify-center transition-all ${
                  filled
                    ? 'bg-[#2B6EB5] text-white shadow-xs scale-105'
                    : 'bg-white/70 border border-white text-gray-300'
                }`}
                title={`Glass ${idx + 1} (250ml)`}
              >
                <Droplets className={`w-3.5 h-3.5 ${filled ? 'fill-current' : ''}`} />
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. MOOD CHECK-IN */}
      <div className="p-4 rounded-2xl bg-white/80 border border-white/90 shadow-glass-sm space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#7969B5]/15 text-[#7969B5] flex items-center justify-center">
            <Smile className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#7969B5] font-heading">
              Daily Mood Check-in
            </h4>
            <p className="text-[11px] text-[#5B5D7A]">
              How are you feeling right now?
            </p>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-1.5 pt-1">
          {MOOD_OPTIONS.map((m) => {
            const isSelected = selectedMood === m.label;
            return (
              <button
                key={m.label}
                onClick={() => handleSelectMood(m.label)}
                disabled={loading}
                className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                  isSelected
                    ? `${m.color} ring-2 ring-purple-400 font-bold scale-105 shadow-xs`
                    : 'bg-white/60 hover:bg-white text-gray-700 border-gray-100'
                }`}
              >
                <span className="text-lg">{m.emoji}</span>
                <span className="text-[10px] font-medium leading-none">{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. SLEEP ROUTINE LOGGING */}
      <div className="p-4 rounded-2xl bg-white/80 border border-white/90 shadow-glass-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#55428F]/15 text-[#55428F] flex items-center justify-center">
              <Moon className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#55428F] font-heading">
                Sleep Routine
              </h4>
              <p className="text-[11px] text-[#5B5D7A]">
                Last night's rest duration & quality
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-[#55428F] bg-[#E9E3FF]/70 px-2 py-0.5 rounded-full">
            {sleepHours} Hours
          </span>
        </div>

        <div className="space-y-2">
          <input
            type="range"
            min="3"
            max="12"
            step="0.5"
            value={sleepHours}
            onChange={(e) => setSleepHours(parseFloat(e.target.value))}
            className="w-full accent-[#7969B5] cursor-pointer"
          />

          <div className="flex items-center justify-between gap-2">
            <div className="flex gap-1">
              {['Restful', 'Fair', 'Restless'].map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setSleepQuality(q)}
                  className={`px-2.5 py-1 text-[11px] rounded-lg font-medium transition-colors ${
                    sleepQuality === q
                      ? 'bg-[#7969B5] text-white shadow-xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
            <button
              onClick={handleSaveSleep}
              disabled={loading}
              className="text-[11px] font-bold text-[#7969B5] bg-[#E9E3FF] hover:bg-[#d6cbff] px-3 py-1 rounded-lg transition-colors"
            >
              Log Sleep
            </button>
          </div>
        </div>
      </div>

      {/* 4. HEALTH OBSERVATIONS */}
      <div className="p-4 rounded-2xl bg-white/80 border border-white/90 shadow-glass-sm space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#B85820]/15 text-[#B85820] flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#B85820] font-heading">
              Optional Health Observation
            </h4>
            <p className="text-[11px] text-[#5B5D7A]">
              Record notes on mobility, appetite, or general comfort
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <textarea
            value={observationText}
            onChange={(e) => setObservationText(e.target.value)}
            placeholder="e.g., Felt energetic after morning walk, slight knee stiffness..."
            rows={2}
            className="w-full p-2.5 text-xs bg-white/90 border border-purple-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7969B5] resize-none"
          />
          <div className="flex justify-end">
            <button
              onClick={handleSaveObservation}
              disabled={loading || !observationText.trim()}
              className="text-xs font-bold text-white bg-[#B85820] hover:bg-[#8f4316] disabled:opacity-50 px-3 py-1.5 rounded-xl shadow-xs transition-colors"
            >
              Record Observation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

