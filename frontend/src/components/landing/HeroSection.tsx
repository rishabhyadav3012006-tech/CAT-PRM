import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Heart,
  Pill,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Activity,
  Users,
  ChevronDown
} from 'lucide-react';
import { Button } from '../ui/Button.tsx';
import { GlassCard } from '../ui/GlassCard.tsx';
import { CuteBadge } from '../ui/CuteBadge.tsx';

export const HeroSection: React.FC = () => {
  const scrollToFeatures = () => {
    const el = document.getElementById('features');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" className="relative pt-6 sm:pt-12 pb-16 sm:pb-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Headlines & Call to Actions */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex flex-wrap items-center justify-center lg:justify-start gap-2"
            >
              <CuteBadge variant="lavender" size="md" icon={<Sparkles className="w-3.5 h-3.5 text-[#7969B5]" />}>
                Warm & Thoughtful Healthcare
              </CuteBadge>
              <CuteBadge variant="mint" size="md" dot>
                Trusted by 10,000+ Families
              </CuteBadge>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black font-heading text-[#34354A] tracking-tight leading-[1.12]"
            >
              Caring Made Simple,{' '}
              <span className="bg-gradient-to-r from-[#7969B5] via-[#9E8EE4] to-[#2B8756] bg-clip-text text-transparent">
                Every Day.
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.2 }}
              className="text-lg sm:text-xl font-medium font-body text-[#575973] max-w-xl mx-auto lg:mx-0 leading-relaxed"
            >
              A little care, a little connection, a healthier tomorrow.
              CareNest keeps elderly individuals, family members, and caregivers gracefully synchronized in one calming place.
            </motion.p>

            {/* Dual CTAs & Demo Shortcut */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.3 }}
              className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5"
            >
              <Link to="/register" className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                  className="rounded-full shadow-glow-purple px-8 font-extrabold text-base"
                >
                  <span>Get Started Free</span>
                </Button>
              </Link>

              <Button
                variant="secondary"
                size="lg"
                onClick={scrollToFeatures}
                leftIcon={<ChevronDown className="w-4 h-4 text-[#7969B5]" />}
                className="rounded-full px-7 font-bold text-base w-full sm:w-auto"
              >
                <span>Explore Features</span>
              </Button>
            </motion.div>

            {/* Micro reassurance checklist */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs font-semibold font-body text-[#7A7D9D]"
            >
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#2B8756]" />
                <span>Large senior-friendly fonts</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#2B8756]" />
                <span>One-touch SOS protection</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#2B8756]" />
                <span>Zero hardware required</span>
              </span>
            </motion.div>
          </div>

          {/* Right Column: Beautiful Glassmorphism Elderly Care Illustration Card */}
          <div className="lg:col-span-5 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="relative mx-auto max-w-md lg:max-w-none"
            >
              {/* Main Illustration Surface */}
              <GlassCard
                variant="lavender"
                padding="lg"
                rounded="4xl"
                className="relative overflow-hidden border-2 border-white/95 shadow-glass-lg p-6 sm:p-8"
              >
                {/* Visual Elderly Persona Badge Card */}
                <div className="relative rounded-3xl overflow-hidden shadow-glass-sm border-2 border-white/90 bg-white/70">
                  <img
                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=700&q=80"
                    alt="Eleanor Vance smiling peacefully"
                    className="w-full h-64 sm:h-72 object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#34354A]/80 via-transparent to-transparent flex flex-col justify-end p-5 text-white">
                    <CuteBadge variant="mint" size="sm" dot className="w-fit mb-1">
                      Eleanor Vance • 78 y/o
                    </CuteBadge>
                    <p className="text-sm font-bold font-heading">
                      "My daughter sees my medication checks in Seattle every morning. We feel closer than ever."
                    </p>
                  </div>
                </div>

                {/* Floating Micro-Card 1: Medication Intake Reminder (Top Left Floating) */}
                <motion.div
                  animate={{ y: [-5, 6, -5] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -top-4 -left-4 sm:-left-6 bg-white/95 backdrop-blur-glass p-3.5 rounded-2xl border-2 border-[#DDF5E9] shadow-glass-hover flex items-center gap-3 z-20 max-w-[220px]"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#DDF5E9] text-[#2B8756] flex items-center justify-center font-bold flex-shrink-0 shadow-2xs">
                    <Pill className="w-5 h-5" />
                  </div>
                  <div>
                    <CuteBadge variant="mint" size="sm">Taken 8:00 AM</CuteBadge>
                    <h5 className="font-extrabold font-heading text-xs text-[#34354A] mt-0.5">Lisinopril 10mg</h5>
                  </div>
                </motion.div>

                {/* Floating Micro-Card 2: Blood Pressure & Biometrics (Bottom Right Floating) */}
                <motion.div
                  animate={{ y: [6, -5, 6] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  className="absolute -bottom-5 -right-4 sm:-right-6 bg-white/95 backdrop-blur-glass p-3.5 rounded-2xl border-2 border-[#DFEEFF] shadow-glass-hover flex items-center gap-3 z-20 max-w-[240px]"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#DFEEFF] text-[#2B6EB5] flex items-center justify-center font-bold flex-shrink-0 shadow-2xs">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold font-title text-[#7A7D9D] uppercase">Biometric Status</p>
                    <h5 className="font-black font-heading text-xs sm:text-sm text-[#34354A]">124/78 mmHg • Optimal</h5>
                    <span className="text-[10px] text-[#2B8756] font-semibold">Recorded by Marcus (Caregiver)</span>
                  </div>
                </motion.div>
              </GlassCard>

              {/* Decorative Glow Blob Behind */}
              <div className="absolute -inset-4 bg-gradient-to-r from-[#E9E3FF] via-[#DDF5E9] to-[#FFE9DC] rounded-[2.5rem] -z-10 blur-2xl opacity-70" />
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};

