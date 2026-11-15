import React from 'react';
import { Users, Heart, MapPin, CheckCircle2, ChevronRight, Plus } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard.tsx';
import { CuteBadge } from '../ui/CuteBadge.tsx';
import { Link } from 'react-router-dom';

interface ConnectedElderlyProfilesWidgetProps {
  selectedElderlyId: string;
  onSelectElderly: (id: string) => void;
}

export const ConnectedElderlyProfilesWidget: React.FC<ConnectedElderlyProfilesWidgetProps> = ({
  selectedElderlyId,
  onSelectElderly
}) => {
  const profiles = [
    {
      id: 'eld-01',
      name: 'Eleanor Vance',
      relationship: 'Mother',
      age: 78,
      bloodGroup: 'O+',
      conditions: ['Hypertension', 'Type 2 Diabetes'],
      adherenceRate: 94,
      address: 'Springfield, OR',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80',
      activeCaregiver: 'Marcus Chen (Day Shift)'
    },
    {
      id: 'eld-02',
      name: 'Arthur Pendelton',
      relationship: 'Uncle',
      age: 82,
      bloodGroup: 'A+',
      conditions: ['Parkinsons', 'Mild Hypertension'],
      adherenceRate: 88,
      address: 'Portland, OR',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
      activeCaregiver: 'Elena Rostova (Afternoon)'
    }
  ];

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
          <div className="w-8 h-8 rounded-xl bg-[#DFEEFF] text-[#2B6EB5] flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black font-heading text-[#34354A]">
              Connected Elderly Profiles
            </h3>
            <p className="text-xs text-[#7A7D9D] font-medium">Family members under your care</p>
          </div>
        </div>

        <Link
          to="/join-profile"
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#E9E3FF] text-[#7969B5] hover:bg-[#DDD5F7] text-xs font-bold transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Senior</span>
        </Link>
      </div>

      {/* Profiles Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {profiles.map((p) => {
          const isSelected = selectedElderlyId === p.id;

          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelectElderly(p.id)}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                isSelected
                  ? 'bg-gradient-to-br from-[#FAF9FF] to-[#EFF6FF] border-[#3B82F6] shadow-glass-sm ring-2 ring-[#DFEEFF]'
                  : 'bg-[#FAF9FF] border-[#E5E4F2] hover:bg-white hover:border-[#CBD5E1]'
              }`}
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={p.avatar}
                      alt={p.name}
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-2xs"
                    />
                    <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-extrabold font-heading text-[#34354A]">
                        {p.name}
                      </h4>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-[#7A7D9D] font-medium">
                      {p.relationship} • Age {p.age} • Blood {p.bloodGroup}
                    </p>
                  </div>
                </div>

                <CuteBadge variant={isSelected ? 'mint' : 'babyBlue'} size="sm">
                  {p.adherenceRate}% Adherence
                </CuteBadge>
              </div>

              {/* Conditions & Location */}
              <div className="space-y-1.5 pt-1 border-t border-[#E5E4F2]/70 text-xs text-[#575973]">
                <div className="flex flex-wrap gap-1">
                  {p.conditions.map((c) => (
                    <span
                      key={c}
                      className="px-2 py-0.5 rounded-full bg-white text-[10px] font-bold text-[#575973] border border-[#E5E4F2]"
                    >
                      {c}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-[#7A7D9D] flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#7969B5]" />
                  <span>{p.address} • Aide: {p.activeCaregiver}</span>
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </GlassCard>
  );
};

