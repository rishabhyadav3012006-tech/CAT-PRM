import React from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  helperText?: string;
  options: { value: string; label: string }[];
}

export const SelectField = React.forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ label, error, helperText, options, id, className = '', ...props }, ref) => {
    const selectId = id || label.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full space-y-1.5 text-left">
        <label
          htmlFor={selectId}
          className="block text-xs sm:text-sm font-bold font-heading text-[#34354A]"
        >
          {label}
        </label>

        <div className="relative rounded-2xl">
          <select
            ref={ref}
            id={selectId}
            className={`
              w-full min-h-[46px] sm:min-h-[48px] px-4 py-2.5 pr-10
              appearance-none
              bg-white/90 backdrop-blur-sm
              border-2 rounded-2xl
              text-sm sm:text-base font-medium font-body text-[#34354A]
              transition-all duration-200
              shadow-glass-sm cursor-pointer
              ${
                error
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-200/50'
                  : 'border-[#E5E4F2] hover:border-[#C2B5F0] focus:border-[#7969B5] focus:ring-4 focus:ring-[#E9E3FF]/80'
              }
              focus:outline-none
              ${className}
            `}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <ChevronDown className="w-4 h-4 text-[#7A7D9D] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {error ? (
          <p className="text-xs font-semibold text-rose-600 pl-1">⚠️ {error}</p>
        ) : helperText ? (
          <p className="text-xs text-[#7A7D9D] pl-1">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

SelectField.displayName = 'SelectField';

