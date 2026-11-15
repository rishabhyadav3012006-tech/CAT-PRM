import React from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageSquare, CheckCircle2, Shield, Sparkles, Phone, ArrowRight } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard.tsx';
import { CuteBadge } from '../ui/CuteBadge.tsx';
import { Button } from '../ui/Button.tsx';
import { Link } from 'react-router-dom';

export const FamilyCollaborationSection: React.FC = () => {
  return (
    <section id="collaboration" className="py-16 sm:py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Collaboration Value Proposition */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2">
              <CuteBadge variant="peach" size="md" icon={<Heart className="w-3.5 h-3.5 text-[#B85820]" />}>
                Connected Across Any Distance
              </CuteBadge>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-heading text-[#34354A] tracking-tight leading-tight">
              Distance Disappears When Care is Synchronized
            </h2>

            <p className="text-base sm:text-lg font-medium font-body text-[#575973] leading-relaxed">
              Living in another city or balancing a demanding job shouldn't mean constant anxiety over your parent’s health. CareNest connects sons, daughters, and caregivers into a live, transparent care circle.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3.5 p-4 rounded-3xl bg-white/70 border border-[#E9E3FF] shadow-2xs">
                <div className="w-10 h-10 rounded-2xl bg-[#DDF5E9] text-[#2B8756] flex items-center justify-center font-bold flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold font-heading text-base text-[#34354A]">Instant Intake Confirmations</h4>
                  <p className="text-xs sm:text-sm font-medium font-body text-[#575973] mt-0.5">
                    See exactly when Eleanor takes her Lisinopril or Metformin in real time, with no awkward repetitive phone calls.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-3xl bg-white/70 border border-[#DFEEFF] shadow-2xs">
                <div className="w-10 h-10 rounded-2xl bg-[#DFEEFF] text-[#2B6EB5] flex items-center justify-center font-bold flex-shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold font-heading text-base text-[#34354A]">Simultaneous Emergency SOS Broadcast</h4>
                  <p className="text-xs sm:text-sm font-medium font-body text-[#575973] mt-0.5">
                    If an emergency button is pressed, Sarah, Marcus, and emergency dispatchers receive instant notifications with medical allergies and clinical conditions.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-3xl bg-white/70 border border-[#FFE9DC] shadow-2xs">
                <div className="w-10 h-10 rounded-2xl bg-[#FFE9DC] text-[#B85820] flex items-center justify-center font-bold flex-shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold font-heading text-base text-[#34354A]">Shared Caregiver Routine Notes</h4>
                  <p className="text-xs sm:text-sm font-medium font-body text-[#575973] mt-0.5">
                    Marcus logs morning oatmeal, garden walks, and blood pressure checks so the entire family shares in Eleanor’s daily joy.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link to="/register">
                <Button variant="primary" size="lg" className="rounded-full shadow-glow-purple px-7">
                  <span>Invite Your Family Today</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Column: Live Collaboration Network Visual */}
          <div className="lg:col-span-6 relative">
            <GlassCard
              variant="white"
              padding="lg"
              rounded="4xl"
              className="border-2 border-white/95 shadow-glass-lg p-6 sm:p-8 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-[#FAF9FF] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#2B8756] animate-ping" />
                  <span className="text-xs font-black font-heading text-[#34354A]">
                    Live Family Synchronization Stream
                  </span>
                </div>
                <CuteBadge variant="mint" size="sm">Connected Now</CuteBadge>
              </div>

              {/* Feed Item 1: Eleanor Vance */}
              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#DDF5E9]/40 border border-[#DDF5E9]">
                <img
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=128&q=80"
                  alt="Eleanor Vance"
                  className="w-11 h-11 rounded-2xl object-cover border-2 border-white shadow-2xs"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-extrabold font-heading text-[#34354A]">Eleanor Vance (Mom)</span>
                    <span className="text-[10px] text-[#7A7D9D]">8:05 AM</span>
                  </div>
                  <p className="text-xs font-semibold font-body text-[#1F6A42] mt-0.5">
                    ✓ Confirmed morning Lisinopril 10mg with breakfast
                  </p>
                  <p className="text-[11px] text-[#575973]">"Feeling wonderful and looking forward to my garden stroll!"</p>
                </div>
              </div>

              {/* Feed Item 2: Sarah Vance (Daughter) */}
              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#DFEEFF]/40 border border-[#DFEEFF]">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=128&q=80"
                  alt="Sarah Vance"
                  className="w-11 h-11 rounded-2xl object-cover border-2 border-white shadow-2xs"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-extrabold font-heading text-[#34354A]">Sarah Vance (Daughter in Seattle)</span>
                    <span className="text-[10px] text-[#7A7D9D]">8:12 AM</span>
                  </div>
                  <p className="text-xs font-semibold font-body text-[#1B5494] mt-0.5">
                    ❤️ "So happy to see you took your pills on time mom! Love you!"
                  </p>
                  <p className="text-[11px] text-[#7A7D9D]">Scheduled family iPad video call at 4:00 PM</p>
                </div>
              </div>

              {/* Feed Item 3: Marcus Chen (Caregiver) */}
              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#E9E3FF]/40 border border-[#E9E3FF]">
                <img
                  src="https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=128&q=80"
                  alt="Marcus Chen"
                  className="w-11 h-11 rounded-2xl object-cover border-2 border-white shadow-2xs"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-extrabold font-heading text-[#34354A]">Marcus Chen (On-Duty Caregiver)</span>
                    <span className="text-[10px] text-[#7A7D9D]">9:30 AM</span>
                  </div>
                  <p className="text-xs font-semibold font-body text-[#45347B] mt-0.5">
                    🩺 "Recorded Eleanor’s morning blood pressure: 124/78 mmHg. Resting optimal."
                  </p>
                  <CuteBadge variant="mint" size="sm" className="mt-1">
                    Morning Hygiene & Mobility Complete
                  </CuteBadge>
                </div>
              </div>

              {/* Feed Item 4: Dr. Adams */}
              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#FFE9DC]/40 border border-[#FFE9DC]">
                <img
                  src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=128&q=80"
                  alt="Dr. Adams"
                  className="w-11 h-11 rounded-2xl object-cover border-2 border-white shadow-2xs"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-extrabold font-heading text-[#34354A]">Dr. Elizabeth Adams (Cardiologist)</span>
                    <span className="text-[10px] text-[#7A7D9D]">Yesterday</span>
                  </div>
                  <p className="text-xs font-semibold font-body text-[#8E3F10] mt-0.5">
                    🗓️ "Quarterly cardiology review scheduled for Thursday at St. Mary."
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>

        </div>

      </div>
    </section>
  );
};

