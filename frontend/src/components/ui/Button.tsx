import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'mint'
  | 'peach'
  | 'pink'
  | 'danger'
  | 'ghost';

export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
  fullWidth?: boolean;
  className?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-[#7969B5] hover:bg-[#6755A4] active:bg-[#554391] text-white shadow-glow-purple border border-[#6755A4]/30',
  secondary:
    'bg-[#E9E3FF] hover:bg-[#DDD5F7] active:bg-[#C2B5F0] text-[#45347B] border border-[#C2B5F0] shadow-glass-sm',
  mint:
    'bg-[#DDF5E9] hover:bg-[#C8EED9] active:bg-[#B3E7CA] text-[#1F6A42] border border-[#B3E7CA] shadow-glass-sm',
  peach:
    'bg-[#FFE9DC] hover:bg-[#FFDCC7] active:bg-[#FFCFB2] text-[#8E3F10] border border-[#FFCFB2] shadow-glass-sm',
  pink:
    'bg-[#FCE4ED] hover:bg-[#F9D0DF] active:bg-[#F6BCD1] text-[#8F1E48] border border-[#F6BCD1] shadow-glass-sm',
  danger:
    'bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-700 hover:to-red-600 text-white shadow-md shadow-rose-500/25 border border-rose-600',
  ghost:
    'bg-transparent hover:bg-[#E9E3FF]/50 text-[#34354A] border border-transparent',
};

// Elderly-accessible touch heights: min 44px on md, 52px on lg
const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3.5 py-1.5 text-xs rounded-xl min-h-[36px] font-semibold gap-1.5',
  md: 'px-5 py-2.5 text-sm sm:text-base rounded-2xl min-h-[46px] font-bold gap-2',
  lg: 'px-7 py-3.5 text-base sm:text-lg rounded-3xl min-h-[54px] font-extrabold gap-2.5',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  return (
    <motion.button
      whileHover={!disabled && !isLoading ? { scale: 1.02, y: -1, transition: { duration: 0.15 } } : undefined}
      whileTap={!disabled && !isLoading ? { scale: 0.98, transition: { duration: 0.1 } } : undefined}
      disabled={disabled || isLoading}
      className={`
        inline-flex items-center justify-center
        font-heading tracking-tight
        transition-all duration-200 cursor-pointer
        select-none focus:outline-none
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed filter grayscale-[30%]' : ''}
        ${className}
      `}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-current" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </>
      )}
    </motion.button>
  );
};

