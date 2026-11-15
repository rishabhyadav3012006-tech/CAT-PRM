import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { AuthIllustration } from './AuthIllustration.tsx';
import { FloatingDecorations } from '../ui/FloatingDecorations.tsx';
import { CuteBadge } from '../ui/CuteBadge.tsx';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  badgeText?: string;
  children: React.ReactNode;
  quote?: {
    text: string;
    author: string;
    role: string;
  };
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  title,
  subtitle,
  badgeText = 'Healthcare Management',
  children,
  quote = {
    text: "CareNest gives our whole family peace of mind knowing Mom's medications and appointments are safely coordinated every single day.",
    author: "Sarah Vance",
    role: "Family Care Coordinator"
  }
}) => {
  return (
    <div className="min-h-screen bg-[#FAF9FF] relative overflow-hidden flex flex-col lg:flex-row">
      <FloatingDecorations />

      {/* LEFT SPLIT SCREEN (Branding, Illustration & Care Highlights) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[48%] relative flex-col justify-between p-10 xl:p-14 bg-gradient-to-br from-[#E9E3FF]/70 via-[#FCE4ED]/30 to-[#DDF5E9]/50 border-r border-[#E5E4F2]/80">
        {/* Brand Header */}
        <div className="space-y-6 relative z-10">
          <Link to="/" className="inline-flex items-center gap-3 group focus:outline-none">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#7969B5] to-[#9E8EE4] flex items-center justify-center text-white shadow-glow-purple group-hover:scale-105 transition-transform duration-300">
              <Heart className="w-6 h-6 fill-white" />
            </div>
            <div>
              <span className="text-2xl font-black font-heading text-[#34354A] tracking-tight">
                Care<span className="text-[#7969B5]">Nest</span>
              </span>
              <p className="text-xs font-semibold text-[#7A7D9D] -mt-0.5">
                Elderly Healthcare Management
              </p>
            </div>
          </Link>

          <div className="space-y-3 max-w-md pt-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-[#E5E4F2] text-[#7969B5] text-xs font-bold font-title shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#7969B5]" />
              <span>Compassionate Senior Care Platform</span>
            </div>
            <h2 className="text-3xl xl:text-4xl font-black font-heading text-[#34354A] leading-tight">
              A calmer way to care for those who cared for us.
            </h2>
            <p className="text-sm font-medium font-body text-[#7A7D9D] leading-relaxed">
              Connect seniors, family members, and caretakers in one synchronized circle. Automated reminders, vitals monitoring, and instant alerts.
            </p>
          </div>
        </div>

        {/* Center Cute Vector Healthcare Scene */}
        <div className="py-4 relative z-10">
          <AuthIllustration />
        </div>

        {/* Feature Highlights Grid & Reassuring Testimonial */}
        <div className="space-y-4 relative z-10 max-w-lg">
          <div className="grid grid-cols-2 gap-2 text-xs font-bold font-heading text-[#34354A]">
            <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-white/70 border border-[#E5E4F2]">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Smart Pill Schedules</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-white/70 border border-[#E5E4F2]">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Family Care Circles</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-white/70 border border-[#E5E4F2]">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Vitals & Alert Tracking</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-white/70 border border-[#E5E4F2]">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>1-Tap Emergency SOS</span>
            </div>
          </div>

          {/* Testimonial Quote Card */}
          <div className="p-4 rounded-3xl bg-white/80 backdrop-blur-md border border-[#E5E4F2] shadow-glass-sm flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-[#E9E3FF] flex items-center justify-center text-[#7969B5] font-black text-xs shrink-0">
              SV
            </div>
            <div className="space-y-1">
              <p className="text-xs italic font-medium font-body text-[#34354A] leading-relaxed">
                "{quote.text}"
              </p>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold font-heading text-[#34354A]">{quote.author}</span>
                <span className="text-[10px] text-[#7A7D9D]">• {quote.role}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SPLIT SCREEN (Frosted Glass Form Area) */}
      <div className="w-full lg:w-1/2 xl:w-[52%] flex flex-col justify-center items-center p-4 sm:p-8 lg:p-12 xl:p-16 relative z-10">
        {/* Mobile Header Branding (Visible only on < lg screens) */}
        <div className="lg:hidden w-full max-w-lg mb-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#7969B5] to-[#9E8EE4] flex items-center justify-center text-white shadow-glow-purple">
              <Heart className="w-5 h-5 fill-white" />
            </div>
            <div>
              <span className="text-xl font-black font-heading text-[#34354A]">
                Care<span className="text-[#7969B5]">Nest</span>
              </span>
            </div>
          </Link>
          <CuteBadge variant="lavender" size="sm">Senior Healthcare</CuteBadge>
        </div>

        {/* Central Frosted Glass Card Container */}
        <div className="w-full max-w-xl">
          <div className="bg-white/90 backdrop-blur-xl border-2 border-white/90 rounded-[2.5rem] p-6 sm:p-10 shadow-glass-lg relative overflow-hidden transition-all duration-300">
            {/* Soft subtle card accent line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#7969B5] via-[#9E8EE4] to-[#48BB78]" />

            {/* Form Header */}
            <div className="mb-7 space-y-2 text-left">
              <div className="inline-flex items-center gap-1.5">
                <CuteBadge variant="lavender" size="sm">
                  {badgeText}
                </CuteBadge>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black font-heading text-[#34354A] tracking-tight">
                {title}
              </h1>
              <p className="text-xs sm:text-sm font-medium font-body text-[#7A7D9D]">
                {subtitle}
              </p>
            </div>

            {/* Injected Form Component */}
            {children}
          </div>

          {/* Privacy & Security Reassurance Footer */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-[11px] font-semibold text-[#7A7D9D] select-none text-center">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>256-Bit Encrypted Data</span>
            </div>
            <span>•</span>
            <span>HIPAA-Aligned Privacy</span>
            <span>•</span>
            <Link to="/" className="text-[#7969B5] hover:underline font-bold">
              CareNest Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

