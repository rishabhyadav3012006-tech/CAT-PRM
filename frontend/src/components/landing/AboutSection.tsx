import React from 'react';
import { motion } from 'framer-motion';
import { Heart, ShieldCheck, Smile, Award, Sparkles, CheckCircle2 } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard.tsx';
import { CuteBadge } from '../ui/CuteBadge.tsx';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-16 sm:py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <GlassCard
          variant="lavender"
          padding="xl"
          rounded="4xl"
          className="border-2 border-[#D2C7FC] relative overflow-hidden"
        >
          <div className="max-w-3xl mx-auto text-center space-y-5 relative z-10">
            <div className="inline-flex items-center gap-2">
              <CuteBadge variant="purple" size="md" icon={<Sparkles className="w-3.5 h-3.5" />}>
                Our Mission & Purpose
              </CuteBadge>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-heading text-[#34354A] tracking-tight">
              Honoring Aging with Dignity, Simplicity, & Love
            </h2>

            <p className="text-base sm:text-lg font-medium font-body text-[#575973] leading-relaxed">
              CareNest was created with a heartfelt belief: healthcare technology for the elderly shouldn't look like an intimidating hospital monitor or an overwhelming spreadsheet. It should feel like a warm, supportive hug—friendly, clear, and reassuring.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-left">
              <div className="p-4 rounded-3xl bg-white/80 border border-white space-y-1.5 shadow-2xs">
                <div className="w-10 h-10 rounded-2xl bg-[#DDF5E9] text-[#2B8756] flex items-center justify-center font-bold">
                  <Smile className="w-5 h-5" />
                </div>
                <h4 className="font-extrabold font-heading text-base text-[#34354A]">Dignity First</h4>
                <p className="text-xs text-[#575973] leading-relaxed">
                  Seniors control their schedule with large, friendly buttons, preserving independence.
                </p>
              </div>

              <div className="p-4 rounded-3xl bg-white/80 border border-white space-y-1.5 shadow-2xs">
                <div className="w-10 h-10 rounded-2xl bg-[#DFEEFF] text-[#2B6EB5] flex items-center justify-center font-bold">
                  <Heart className="w-5 h-5" />
                </div>
                <h4 className="font-extrabold font-heading text-base text-[#34354A]">Family Unity</h4>
                <p className="text-xs text-[#575973] leading-relaxed">
                  Bridges the gap across miles, letting children and grandkids share in daily wellness.
                </p>
              </div>

              <div className="p-4 rounded-3xl bg-white/80 border border-white space-y-1.5 shadow-2xs">
                <div className="w-10 h-10 rounded-2xl bg-[#FFE9DC] text-[#B85820] flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="font-extrabold font-heading text-base text-[#34354A]">Clinical Rigor</h4>
                <p className="text-xs text-[#575973] leading-relaxed">
                  Built to clinical standards with automated BullMQ medication reminders and SOS response.
                </p>
              </div>
            </div>
          </div>
        </GlassCard>

      </div>
    </section>
  );
};

