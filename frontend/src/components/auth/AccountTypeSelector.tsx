import React from 'react';
import { Heart, Users, Stethoscope, Check } from 'lucide-react';
import { UserRole } from '../../types/index.ts';

interface AccountTypeSelectorProps {
  value: UserRole;
  onChange: (role: UserRole) => void;
  error?: string;
}

export const AccountTypeSelector: React.FC<AccountTypeSelectorProps> = ({
  value,
  onChange,
  error
}) => {
  const options = [
    {
      role: 'ELDERLY' as UserRole,
      title: 'Elderly Individual',
      badge: 'Self-Care',
      badgeBg: 'bg-[#E9E3FF] text-[#7969B5]',
      description: 'I manage my own daily medications, vitals & schedule.',
      icon: Heart,
      accent: 'border-[#7969B5] bg-[#FAF9FF]'
    },
    {
      role: 'FAMILY_MEMBER' as UserRole,
      title: 'Family Member',
      badge: 'Care Circle',
      badgeBg: 'bg-[#DDF5E9] text-[#22C55E]',
      description: 'I want to monitor and support a parent or senior loved one.',
      icon: Users,
      accent: 'border-[#48BB78] bg-[#F2FCF6]'
    },
    {
      role: 'CAREGIVER' as UserRole,
      title: 'Caretaker',
      badge: 'Healthcare Aide',
      badgeBg: 'bg-[#FFE9DC] text-[#DD6B20]',
      description: 'I provide professional nursing, therapy or daily elder care.',
      icon: Stethoscope,
      accent: 'border-[#ED8936] bg-[#FFFAF0]'
    }
  ];

  return (
    <div className="space-y-2 text-left">
      <div className="flex items-center justify-between">
        <label className="block text-xs sm:text-sm font-bold font-heading text-[#34354A]">
          Select Account Type <span className="text-rose-500">*</span>
        </label>
        <span className="text-[11px] text-[#7A7D9D] font-medium">Choose your primary role</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {options.map((opt) => {
          const isSelected = value === opt.role;
          const IconComp = opt.icon;

          return (
            <button
              key={opt.role}
              type="button"
              onClick={() => onChange(opt.role)}
              className={`
                relative p-3.5 rounded-2xl text-left border-2 transition-all duration-200 cursor-pointer flex flex-col justify-between
                focus:outline-none focus:ring-4 focus:ring-[#E9E3FF]
                ${
                  isSelected
                    ? `${opt.accent} shadow-glass-sm scale-[1.02]`
                    : 'bg-white/80 border-[#E5E4F2] hover:border-[#D1CEE8] hover:bg-white'
                }
              `}
            >
              {/* Top row: Icon & Selection checkmark */}
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                    isSelected ? 'bg-white shadow-xs text-[#7969B5]' : 'bg-[#FAF9FF] text-[#7A7D9D]'
                  }`}
                >
                  <IconComp className="w-4 h-4" />
                </div>

                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                    isSelected
                      ? 'bg-[#7969B5] border-[#7969B5] text-white'
                      : 'border-[#D1CEE8] bg-white'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>

              {/* Title & Badge */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="text-xs sm:text-sm font-extrabold font-heading text-[#34354A]">
                    {opt.title}
                  </h4>
                </div>
                <p className="text-[11px] font-medium font-body text-[#7A7D9D] line-clamp-2 leading-relaxed">
                  {opt.description}
                </p>
              </div>

              {/* Role badge */}
              <div className="mt-2.5">
                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold font-title ${opt.badgeBg}`}>
                  {opt.badge}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {error && (
        <p className="text-xs font-semibold text-rose-600 flex items-center gap-1 pl-1">
          <span>⚠️</span>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};

