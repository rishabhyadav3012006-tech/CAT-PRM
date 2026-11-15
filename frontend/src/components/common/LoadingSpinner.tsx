import React from 'react';
import { Loader2, Heart } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard.tsx';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading CareNest...',
  size = 'md',
}) => {
  return (
    <GlassCard variant="lavender" padding="lg" rounded="3xl" className="max-w-sm mx-auto my-12 text-center">
      <div className="flex flex-col items-center justify-center">
        <div className="relative w-14 h-14 flex items-center justify-center mb-3">
          <div className="absolute inset-0 rounded-full bg-[#E9E3FF] animate-ping opacity-40" />
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#7969B5] to-[#9E8EE4] text-white flex items-center justify-center shadow-glow-purple">
            <Heart className="w-6 h-6 animate-pulse fill-white" />
          </div>
        </div>
        <p className="text-base font-extrabold font-heading text-[#34354A] mt-1">{message}</p>
        <p className="text-xs font-medium font-body text-[#7A7D9D] mt-1">Bringing your healthcare records together</p>
      </div>
    </GlassCard>
  );
};
