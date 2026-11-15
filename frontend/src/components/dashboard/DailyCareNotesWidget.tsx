import React, { useState } from 'react';
import { FileText, Send, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard.tsx';
import { CuteBadge } from '../ui/CuteBadge.tsx';
import { Button } from '../ui/Button.tsx';

interface CareNote {
  id: string;
  author: string;
  content: string;
  time: string;
  patient: string;
}

export const DailyCareNotesWidget: React.FC = () => {
  const [notes, setNotes] = useState<CareNote[]>([
    {
      id: 'note-1',
      author: 'Marcus Chen',
      patient: 'Eleanor Vance',
      content: 'Eleanor rested well overnight. Morning oatmeal and water taken cheerfully. Blood pressure steady at 124/78 mmHg.',
      time: 'Today, 09:15 AM'
    },
    {
      id: 'note-2',
      author: 'Marcus Chen',
      patient: 'Eleanor Vance',
      content: 'Applied light warm compress to right knee after garden mobility stroll. Reported immediate relief.',
      time: 'Yesterday, 03:30 PM'
    }
  ]);

  const [inputNote, setInputNote] = useState('');
  const [patientChoice, setPatientChoice] = useState('Eleanor Vance');
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const handlePostNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputNote.trim()) return;

    const newNote: CareNote = {
      id: `note-${Date.now()}`,
      author: 'Marcus Chen',
      patient: patientChoice,
      content: inputNote.trim(),
      time: 'Just now'
    };

    setNotes([newNote, ...notes]);
    setInputNote('');
    setSuccessNotice('Care note posted to family feed!');
    setTimeout(() => setSuccessNotice(null), 3000);
  };

  return (
    <GlassCard
      variant="white"
      padding="lg"
      rounded="3xl"
      className="space-y-4 border border-[#E5E4F2] shadow-glass-sm text-left"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#FFF9ED] text-[#B7791F] flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black font-heading text-[#34354A]">
              Daily Care Notes & Observations
            </h3>
            <p className="text-xs text-[#7A7D9D] font-medium">Caregiver shift logs shared with family</p>
          </div>
        </div>

        <CuteBadge variant="cream" size="sm">
          <span>Shift Handover</span>
        </CuteBadge>
      </div>

      {successNotice && (
        <div className="p-3 rounded-2xl bg-[#DDF5E9] border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handlePostNote} className="space-y-2">
        <div className="flex items-center gap-2">
          <select
            value={patientChoice}
            onChange={(e) => setPatientChoice(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-white border border-[#E5E4F2] text-xs font-bold text-[#34354A] focus:outline-none"
          >
            <option value="Eleanor Vance">Eleanor Vance</option>
            <option value="Arthur Pendelton">Arthur Pendelton</option>
          </select>
          <span className="text-[11px] text-[#7A7D9D]">Choose recipient profile</span>
        </div>

        <div className="relative">
          <textarea
            rows={2}
            value={inputNote}
            onChange={(e) => setInputNote(e.target.value)}
            placeholder="Record a care observation, appetite note, or mobility check..."
            className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FAF9FF] border border-[#E5E4F2] text-xs sm:text-sm text-[#34354A] placeholder-[#9497B5] focus:outline-none focus:ring-4 focus:ring-[#E9E3FF] transition-all resize-none"
          />
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={!inputNote.trim()}
            rightIcon={<Send className="w-3.5 h-3.5" />}
          >
            <span>Post to Care Circle</span>
          </Button>
        </div>
      </form>

      {/* Recent Notes List */}
      <div className="space-y-2 pt-2 border-t border-[#FAF9FF]">
        {notes.map((note) => (
          <div
            key={note.id}
            className="p-3 rounded-2xl bg-[#FAF9FF] border border-[#E5E4F2] space-y-1 text-xs"
          >
            <div className="flex items-center justify-between">
              <span className="font-extrabold font-heading text-[#7969B5]">
                {note.patient} • <span className="text-[#34354A]">{note.author}</span>
              </span>
              <span className="text-[10px] text-[#7A7D9D] font-medium">{note.time}</span>
            </div>
            <p className="text-[#575973] font-medium leading-relaxed">{note.content}</p>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};

