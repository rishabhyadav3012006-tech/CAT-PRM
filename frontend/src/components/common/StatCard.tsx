import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { GlassCard, GlassVariant } from '../ui/GlassCard.tsx';
import { CuteBadge } from '../ui/CuteBadge.tsx';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: GlassVariant;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  onClick?: () => void;
}

const iconColorMap: Record<GlassVariant, { bg: string; text: string }> = {
  default: { bg: 'bg-[#E9E3FF]', text: 'text-[#7969B5]' },
  lavender: { bg: 'bg-[#E9E3FF]', text: 'text-[#7969B5]' },
  mint: { bg: 'bg-[#DDF5E9]', text: 'text-[#2B8756]' },
  babyBlue: { bg: 'bg-[#DFEEFF]', text: 'text-[#2B6EB5]' },
  peach: { bg: 'bg-[#FFE9DC]', text: 'text-[#B85820]' },
  pink: { bg: 'bg-[#FCE4ED]', text: 'text-[#B53364]' },
  cream: { bg: 'bg-[#FFF9ED]', text: 'text-[#997321]' },
  white: { bg: 'bg-[#FAF9FF]', text: 'text-[#7969B5]' },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'default',
  trend,
  onClick,
}) => {
  const iconTheme = iconColorMap[variant] || iconColorMap.default;

  return (
    <GlassCard
      variant={variant}
      interactive={!!onClick}
      padding="md"
      rounded="3xl"
      onClick={onClick}
      className="flex flex-col justify-between"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs sm:text-sm font-bold font-heading text-[#7A7D9D] tracking-tight">
            {title}
          </p>
          <h3 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#34354A] mt-1 tracking-tight">
            {value}
          </h3>
        </div>

        <div
          className={`w-12 h-12 rounded-2xl ${iconTheme.bg} ${iconTheme.text} flex items-center justify-center shadow-xs flex-shrink-0`}
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-white/60 flex items-center justify-between gap-2 flex-wrap">
        {subtitle && (
          <p className="text-xs font-medium font-body text-[#575973]">{subtitle}</p>
        )}
        {trend && (
          <CuteBadge
            variant={trend.isPositive ? 'mint' : 'peach'}
            size="sm"
            dot
          >
            {trend.value}
          </CuteBadge>
        )}
      </div>
    </GlassCard>
  );
};
