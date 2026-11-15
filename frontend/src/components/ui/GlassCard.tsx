import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

export type GlassVariant =
  | 'default'
  | 'lavender'
  | 'mint'
  | 'babyBlue'
  | 'peach'
  | 'cream'
  | 'pink'
  | 'white';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  variant?: GlassVariant;
  interactive?: boolean;
  glow?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'xl' | '2xl' | '3xl' | '4xl' | 'full';
  className?: string;
  children: React.ReactNode;
}

const variantStyles: Record<GlassVariant, string> = {
  default:
    'bg-white/75 backdrop-blur-glass border border-white/80 shadow-glass',
  lavender:
    'bg-gradient-to-br from-[#E9E3FF]/70 via-white/80 to-[#E9E3FF]/40 backdrop-blur-glass border border-[#E9E3FF] shadow-glass',
  mint:
    'bg-gradient-to-br from-[#DDF5E9]/70 via-white/80 to-[#DDF5E9]/40 backdrop-blur-glass border border-[#DDF5E9] shadow-glass',
  babyBlue:
    'bg-gradient-to-br from-[#DFEEFF]/70 via-white/80 to-[#DFEEFF]/40 backdrop-blur-glass border border-[#DFEEFF] shadow-glass',
  peach:
    'bg-gradient-to-br from-[#FFE9DC]/70 via-white/80 to-[#FFE9DC]/40 backdrop-blur-glass border border-[#FFE9DC] shadow-glass',
  cream:
    'bg-gradient-to-br from-[#FFF9ED]/85 via-white/85 to-[#FFF9ED]/50 backdrop-blur-glass border border-[#FFF9ED] shadow-glass',
  pink:
    'bg-gradient-to-br from-[#FCE4ED]/70 via-white/80 to-[#FCE4ED]/40 backdrop-blur-glass border border-[#FCE4ED] shadow-glass',
  white:
    'bg-white/90 backdrop-blur-glass border border-white shadow-glass',
};

const paddingStyles = {
  none: 'p-0',
  sm: 'p-3 sm:p-4',
  md: 'p-5 sm:p-6',
  lg: 'p-6 sm:p-8',
  xl: 'p-8 sm:p-10',
};

const roundedStyles = {
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  '3xl': 'rounded-3xl',
  '4xl': 'rounded-4xl',
  full: 'rounded-full',
};

export const GlassCard: React.FC<GlassCardProps> = ({
  variant = 'default',
  interactive = false,
  glow = false,
  padding = 'md',
  rounded = '3xl',
  className = '',
  children,
  ...props
}) => {
  return (
    <motion.div
      whileHover={interactive ? { y: -3, scale: 1.008, transition: { duration: 0.2 } } : undefined}
      whileTap={interactive ? { scale: 0.99, transition: { duration: 0.1 } } : undefined}
      className={`
        relative
        ${variantStyles[variant]}
        ${paddingStyles[padding]}
        ${roundedStyles[rounded]}
        ${glow ? 'shadow-glow-purple' : ''}
        ${interactive ? 'cursor-pointer hover:shadow-glass-hover transition-all' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  );
};
