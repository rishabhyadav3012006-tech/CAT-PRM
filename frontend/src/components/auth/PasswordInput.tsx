import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Check, X } from 'lucide-react';

interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  error?: string;
  helperText?: string;
  showStrengthMeter?: boolean;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  error,
  helperText,
  showStrengthMeter = false,
  value = '',
  id,
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');
  const passString = String(value || '');

  // Calculate strength criteria
  const hasMinLength = passString.length >= 6;
  const hasLetter = /[a-zA-Z]/.test(passString);
  const hasNumber = /\d/.test(passString);
  const hasSpecial = /[^a-zA-Z0-9]/.test(passString);

  const strengthScore = [hasMinLength, hasLetter, hasNumber, hasSpecial].filter(Boolean).length;

  const strengthLabels = ['Too Weak', 'Weak', 'Good', 'Strong', 'Very Strong'];
  const strengthColors = ['bg-rose-400', 'bg-orange-400', 'bg-amber-400', 'bg-emerald-500', 'bg-emerald-600'];

  return (
    <div className="w-full space-y-1.5 text-left">
      <div className="flex items-center justify-between">
        <label
          htmlFor={inputId}
          className="block text-xs sm:text-sm font-bold font-heading text-[#34354A]"
        >
          {label}
        </label>
      </div>

      <div className="relative rounded-2xl">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7A7D9D] pointer-events-none">
          <Lock className="w-4 h-4" />
        </div>

        <input
          id={inputId}
          type={showPassword ? 'text' : 'password'}
          value={value}
          className={`
            w-full min-h-[46px] sm:min-h-[48px] pl-11 pr-12 py-2.5
            bg-white/85 backdrop-blur-sm
            border-2 rounded-2xl
            text-sm sm:text-base font-medium font-body text-[#34354A]
            placeholder-[#9497B5]
            transition-all duration-200
            shadow-glass-sm
            ${
              error
                ? 'border-rose-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-200/50'
                : 'border-[#E5E4F2] hover:border-[#C2B5F0] focus:border-[#7969B5] focus:ring-4 focus:ring-[#E9E3FF]/80'
            }
            focus:outline-none
            ${className}
          `}
          {...props}
        />

        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 rounded-xl text-[#7A7D9D] hover:text-[#34354A] hover:bg-[#FAF9FF] transition-colors focus:outline-none"
          title={showPassword ? 'Hide password' : 'Show password'}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {/* Optional Password Strength Indicator */}
      {showStrengthMeter && passString.length > 0 && (
        <div className="pt-1.5 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold">
            <span className="text-[#7A7D9D]">Password Strength:</span>
            <span className={strengthScore >= 3 ? 'text-emerald-600' : 'text-amber-600'}>
              {strengthLabels[strengthScore] || 'Weak'}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
            {[0, 1, 2, 3].map((step) => (
              <div
                key={step}
                className={`h-full rounded-full transition-all duration-300 ${
                  strengthScore > step ? strengthColors[strengthScore] : 'bg-[#E5E4F2]'
                }`}
              />
            ))}
          </div>

          <div className="grid grid-cols-2 gap-1 text-[11px] text-[#7A7D9D] pt-0.5">
            <span className={`flex items-center gap-1 ${hasMinLength ? 'text-emerald-600 font-semibold' : ''}`}>
              {hasMinLength ? <Check className="w-3 h-3" /> : <X className="w-3 h-3 text-[#A0A3BD]" />} At least 6 chars
            </span>
            <span className={`flex items-center gap-1 ${hasNumber ? 'text-emerald-600 font-semibold' : ''}`}>
              {hasNumber ? <Check className="w-3 h-3" /> : <X className="w-3 h-3 text-[#A0A3BD]" />} Number included
            </span>
          </div>
        </div>
      )}

      {error ? (
        <p className="text-xs font-semibold text-rose-600 flex items-center gap-1 pl-1">
          <span>⚠️</span>
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p className="text-xs text-[#7A7D9D] pl-1">{helperText}</p>
      ) : null}
    </div>
  );
};

