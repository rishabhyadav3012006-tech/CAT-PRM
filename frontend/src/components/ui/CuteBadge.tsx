import React from 'react';

export type BadgeVariant =
  | 'lavender'
  | 'mint'
  | 'babyBlue'
  | 'peach'
  | 'cream'
  | 'pink'
  | 'purple';

interface CuteBadgeProps {
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  dot?: boolean;
  pulseDot?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string; border: string; dot: string }> = {
  lavender: {
    bg: 'bg-[#E9E3FF]',
    text: 'text-[#45347B]',
    border: 'border-[#D2C7FC]',
    dot: 'bg-[#7969B5]',
  },
  mint: {
    bg: 'bg-[#DDF5E9]',
    text: 'text-[#1F6A42]',
    border: 'border-[#BFE7D2]',
    dot: 'bg-[#2B8756]',
  },
  babyBlue: {
    bg: 'bg-[#DFEEFF]',
    text: 'text-[#1B5494]',
    border: 'border-[#C4E0FF]',
    dot: 'bg-[#2B6EB5]',
  },
  peach: {
    bg: 'bg-[#FFE9DC]',
    text: 'text-[#8E3F10]',
    border: 'border-[#FFD3BC]',
    dot: 'bg-[#B85820]',
  },
  cream: {
    bg: 'bg-[#FFF9ED]',
    text: 'text-[#7A5B15]',
    border: 'border-[#F7ECCF]',
    dot: 'bg-[#997321]',
  },
  pink: {
    bg: 'bg-[#FCE4ED]',
    text: 'text-[#8F1E48]',
    border: 'border-[#F9BFD4]',
    dot: 'bg-[#B53364]',
  },
  purple: {
    bg: 'bg-[#7969B5]',
    text: 'text-white',
    border: 'border-[#6755A4]',
    dot: 'bg-white',
  },
};

export const CuteBadge: React.FC<CuteBadgeProps> = ({
  variant = 'lavender',
  size = 'md',
  dot = false,
  pulseDot = false,
  icon,
  children,
  className = '',
}) => {
  const scheme = variantStyles[variant];

  const sizeClasses = {
    sm: 'px-2.5 py-0.5 text-[11px] gap-1',
    md: 'px-3 py-1 text-xs gap-1.5',
  };

  return (
    <span
      className={`
        inline-flex items-center font-bold font-heading rounded-full border
        shadow-2xs select-none transition-transform
        ${scheme.bg}
        ${scheme.text}
        ${scheme.border}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {dot && (
        <span className="relative flex h-2 w-2">
          {pulseDot && (
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${scheme.dot}`}
            />
          )}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${scheme.dot}`} />
        </span>
      )}
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};

