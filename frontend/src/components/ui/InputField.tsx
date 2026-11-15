import React from 'react';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, helperText, leftIcon, rightIcon, id, className = '', ...props }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full space-y-1.5 text-left">
        <label
          htmlFor={inputId}
          className="block text-xs sm:text-sm font-bold font-heading text-[#34354A]"
        >
          {label}
        </label>

        <div className="relative rounded-2xl">
          {leftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7A7D9D] pointer-events-none">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={`
              w-full min-h-[46px] sm:min-h-[48px] px-4 py-2.5
              ${leftIcon ? 'pl-11' : 'pl-4'}
              ${rightIcon ? 'pr-11' : 'pr-4'}
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

          {rightIcon && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7A7D9D]">
              {rightIcon}
            </div>
          )}
        </div>

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
  }
);

InputField.displayName = 'InputField';

