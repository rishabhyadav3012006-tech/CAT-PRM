import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Pill, Activity, Calendar, CheckCircle2, Clock, ShieldAlert, Sparkles, ArrowRight, Heart } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard.tsx';
import { CuteBadge } from '../ui/CuteBadge.tsx';
import { Button } from '../ui/Button.tsx';
import { Link } from 'react-router-dom';

export const DashboardPreviewSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'meds' | 'vitals' | 'routines'>('meds');
  const [mockTakenMeds, setMockTakenMeds] = useState<Record<string, boolean>>({
    'med-1': true,
    'med-2': true,
    'med-3': false,
    'med-4': false
  });

  const toggleMockMed = (id: string) => {
    setMockTakenMeds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const sampleMeds = [
    { id: 'med-1', name: 'Lisinopril', dosage: '10mg', time: '08:00 AM', instruction: 'Take with warm breakfast toast', category: 'Blood Pressure' },
    { id: 'med-2', name: 'Metformin', dosage: '500mg', time: '08:30 AM', instruction: 'Take with food for diabetes management', category: 'Diabetes' },
    { id: 'med-3', name: 'Vitamin D3 & Calcium', dosage: '1000 IU', time: '12:30 PM', instruction: 'Take with lunch', category: 'Bone Health' },
    { id: 'med-4', name: 'Atorvastatin', dosage: '20mg', time: '09:00 PM', instruction: 'Take at bedtime for cholesterol', category: 'Lipid Care' }
  ];

  return (
    <section id="preview" className="py-16 sm:py-24 relative bg-gradient-to-b from-[#FAF9FF] via-[#E9E3FF]/30 to-[#FAF9FF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-2">
            <CuteBadge variant="lavender" size="md" icon={<Sparkles className="w-3.5 h-3.5 text-[#7969B5]" />}>
              Interactive Interface Preview
            </CuteBadge>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-heading text-[#34354A] tracking-tight">
            Designed to Be Calming, Clear, & Intuitive
          </h2>

          <p className="text-base sm:text-lg font-medium font-body text-[#575973] leading-relaxed">
            See the exact interface Eleanor and her caregivers interact with every day. Try clicking "Confirm Intake" below!
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <button
            onClick={() => setActiveTab('meds')}
            className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-extrabold font-heading transition-all cursor-pointer ${
              activeTab === 'meds'
                ? 'bg-[#7969B5] text-white shadow-glow-purple'
                : 'bg-white/80 text-[#575973] border border-[#E5E4F2] hover:bg-white'
            }`}
          >
            Medication Tracker Preview
          </button>
          <button
            onClick={() => setActiveTab('vitals')}
            className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-extrabold font-heading transition-all cursor-pointer ${
              activeTab === 'vitals'
                ? 'bg-[#7969B5] text-white shadow-glow-purple'
                : 'bg-white/80 text-[#575973] border border-[#E5E4F2] hover:bg-white'
            }`}
          >
            Clinical Vitals Preview
          </button>
          <button
            onClick={() => setActiveTab('routines')}
            className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-extrabold font-heading transition-all cursor-pointer ${
              activeTab === 'routines'
                ? 'bg-[#7969B5] text-white shadow-glow-purple'
                : 'bg-white/80 text-[#575973] border border-[#E5E4F2] hover:bg-white'
            }`}
          >
            Care Routines Preview
          </button>
        </div>

        {/* Visual Dashboard Mockup Frame */}
        <GlassCard
          variant="white"
          padding="lg"
          rounded="4xl"
          className="max-w-5xl mx-auto border-4 border-white/95 shadow-glass-lg p-5 sm:p-8"
        >
          {/* Simulated App Header Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-[#FAF9FF] mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#7969B5] text-white flex items-center justify-center font-bold">
                <Heart className="w-5 h-5 fill-white" />
              </div>
              <div>
                <span className="font-extrabold font-heading text-sm sm:text-base text-[#34354A]">
                  Care<span className="text-[#7969B5]">Nest</span> Live Portal
                </span>
                <span className="block text-[10px] text-[#7A7D9D]">Active Profile: 👵 Eleanor Vance (Age 78)</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <CuteBadge variant="mint" size="sm" dot>Live Sync</CuteBadge>
              <CuteBadge variant="pink" size="sm" icon={<ShieldAlert className="w-3 h-3 text-rose-600" />}>SOS Ready</CuteBadge>
            </div>
          </div>

          {/* Tab 1: Medication Preview */}
          {activeTab === 'meds' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold font-heading text-base sm:text-lg text-[#34354A]">
                    Today's Prescriptions & Dosing
                  </h4>
                  <p className="text-xs text-[#7A7D9D]">Click any intake button to test the one-touch confirmation</p>
                </div>
                <CuteBadge variant="lavender" size="sm">
                  {Object.values(mockTakenMeds).filter(Boolean).length} of 4 Confirmed
                </CuteBadge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {sampleMeds.map((med) => {
                  const isTaken = mockTakenMeds[med.id];
                  return (
                    <div
                      key={med.id}
                      className={`p-4 rounded-3xl border-2 transition-all flex flex-col justify-between gap-3 ${
                        isTaken
                          ? 'bg-[#DDF5E9]/50 border-[#BFE7D2]'
                          : 'bg-white/90 border-[#E5E4F2] hover:border-[#C2B5F0]'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
                              isTaken ? 'bg-[#DDF5E9] text-[#1F6A42]' : 'bg-[#E9E3FF] text-[#7969B5]'
                            }`}
                          >
                            <Pill className="w-5 h-5" />
                          </div>
                          <div>
                            <h5 className="font-extrabold font-heading text-sm text-[#34354A]">{med.name}</h5>
                            <CuteBadge variant="lavender" size="sm" className="mt-0.5">{med.dosage}</CuteBadge>
                          </div>
                        </div>

                        <CuteBadge variant={isTaken ? 'mint' : 'peach'} size="sm">
                          {med.time}
                        </CuteBadge>
                      </div>

                      <p className="text-xs text-[#575973] font-medium leading-relaxed">
                        {med.instruction}
                      </p>

                      <div className="pt-2 border-t border-white/60 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#7A7D9D]">{med.category}</span>
                        <Button
                          variant={isTaken ? 'mint' : 'primary'}
                          size="sm"
                          onClick={() => toggleMockMed(med.id)}
                          leftIcon={isTaken ? <CheckCircle2 className="w-3.5 h-3.5" /> : undefined}
                          className="rounded-full text-xs font-bold"
                        >
                          <span>{isTaken ? 'Taken ✓' : 'Confirm Intake'}</span>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 2: Vitals Preview */}
          {activeTab === 'vitals' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <GlassCard variant="pink" padding="sm" rounded="2xl" className="border-2 text-center">
                  <p className="text-xs font-bold font-heading text-[#7A7D9D]">Blood Pressure</p>
                  <h4 className="text-xl font-black font-heading text-[#34354A] mt-1">124/78</h4>
                  <CuteBadge variant="mint" size="sm">Optimal</CuteBadge>
                </GlassCard>
                <GlassCard variant="peach" padding="sm" rounded="2xl" className="border-2 text-center">
                  <p className="text-xs font-bold font-heading text-[#7A7D9D]">Blood Glucose</p>
                  <h4 className="text-xl font-black font-heading text-[#34354A] mt-1">108</h4>
                  <span className="text-[10px] text-[#7A7D9D]">mg/dL (Fasting)</span>
                </GlassCard>
                <GlassCard variant="babyBlue" padding="sm" rounded="2xl" className="border-2 text-center">
                  <p className="text-xs font-bold font-heading text-[#7A7D9D]">Heart Rate</p>
                  <h4 className="text-xl font-black font-heading text-[#34354A] mt-1">72</h4>
                  <span className="text-[10px] text-[#7A7D9D]">bpm (Resting)</span>
                </GlassCard>
                <GlassCard variant="mint" padding="sm" rounded="2xl" className="border-2 text-center">
                  <p className="text-xs font-bold font-heading text-[#7A7D9D]">Oxygen SpO₂</p>
                  <h4 className="text-xl font-black font-heading text-[#34354A] mt-1">98%</h4>
                  <span className="text-[10px] text-[#2B8756] font-bold">Healthy Range</span>
                </GlassCard>
              </div>

              <div className="p-4 rounded-3xl bg-[#FAF9FF] border border-[#E5E4F2] text-xs font-medium text-[#575973] flex items-center justify-between">
                <span>Last updated 2 hours ago by Marcus Chen (Caregiver)</span>
                <CuteBadge variant="lavender" size="sm">Telehealth Synced</CuteBadge>
              </div>
            </div>
          )}

          {/* Tab 3: Care Routines Preview */}
          {activeTab === 'routines' && (
            <div className="space-y-3">
              {[
                { title: 'Morning Warm Oatmeal & Hydration', time: '08:30 AM', category: 'MEAL', done: true },
                { title: '15-Minute Garden Walk with Cane Support', time: '11:00 AM', category: 'MOBILITY', done: false },
                { title: 'iPad Video Call with Grandchildren', time: '04:00 PM', category: 'MENTAL_HEALTH', done: false }
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-white border border-[#E5E4F2] flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={item.done}
                      readOnly
                      className="w-5 h-5 rounded-lg text-[#7969B5] accent-[#7969B5] cursor-pointer"
                    />
                    <div>
                      <p className={`text-sm font-bold font-heading ${item.done ? 'line-through text-[#7A7D9D]' : 'text-[#34354A]'}`}>
                        {item.title}
                      </p>
                      <p className="text-[11px] text-[#7A7D9D]">Scheduled: {item.time} • Category: {item.category}</p>
                    </div>
                  </div>
                  <CuteBadge variant={item.done ? 'mint' : 'cream'} size="sm">
                    {item.done ? 'Completed' : 'Pending'}
                  </CuteBadge>
                </div>
              ))}
            </div>
          )}

          {/* Bottom Live Action Call */}
          <div className="mt-8 pt-5 border-t border-[#FAF9FF] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#7969B5]" />
              <span className="text-xs font-bold font-heading text-[#575973]">
                Try the full experience with Eleanor Vance's pre-loaded profile
              </span>
            </div>

            <Link to="/login">
              <Button
                variant="primary"
                size="md"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="rounded-full shadow-glow-purple px-6"
              >
                <span>Launch Live Interactive Portal</span>
              </Button>
            </Link>
          </div>
        </GlassCard>

      </div>
    </section>
  );
};
