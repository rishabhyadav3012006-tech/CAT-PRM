import React, { useRef } from 'react';

interface CodeInputProps {
  value: string;
  onChange: (val: string) => void;
  length?: number;
  disabled?: boolean;
}

export const CodeInput: React.FC<CodeInputProps> = ({
  value,
  onChange,
  length = 6,
  disabled = false
}) => {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const digits = value.split('').slice(0, length);
  while (digits.length < length) {
    digits.push('');
  }

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const char = rawVal.replace(/\D/g, '').slice(-1);

    const newDigits = [...digits];
    newDigits[index] = char;
    const combined = newDigits.join('');
    onChange(combined);

    if (char && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    onChange(pasted);
    const targetFocus = Math.min(pasted.length, length - 1);
    inputsRef.current[targetFocus]?.focus();
  };

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3 my-3">
      {digits.map((digit, idx) => (
        <input
          key={idx}
          ref={(el) => (inputsRef.current[idx] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(idx, e)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onPaste={handlePaste}
          className={`
            w-11 sm:w-13 h-13 sm:h-15 text-center text-xl sm:text-2xl font-black font-heading rounded-2xl
            border-2 transition-all duration-200 shadow-glass-sm focus:outline-none
            ${
              digit
                ? 'border-[#7969B5] bg-white text-[#34354A] shadow-glow-purple/20'
                : 'border-[#E5E4F2] bg-white/80 text-[#34354A] hover:border-[#C2B5F0]'
            }
            focus:border-[#7969B5] focus:ring-4 focus:ring-[#E9E3FF]
          `}
          aria-label={`Digit ${idx + 1}`}
        />
      ))}
    </div>
  );
};

