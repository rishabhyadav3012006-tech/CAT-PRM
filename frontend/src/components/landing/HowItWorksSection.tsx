import React from 'react';
import { motion } from 'framer-motion';
import { UserCheck, Users, HeartHandshake, CheckCircle2, ArrowRight } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard.tsx';
import { CuteBadge } from '../ui/CuteBadge.tsx';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button.tsx';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      number: '01',
      title: 'Create a Healthcare Profile',
      subtitle: 'Personalized Medical Care Card',
      description:
        'Set up Eleanor’s profile in 2 minutes. Add chronic conditions (Hypertension, Diabetes), drug allergies, blood group, and daily prescribed medications.',
      icon: UserCheck,
      variant: 'lavender' as const,
      badge: 'lavender' as const,
      preview: {
        title: 'Eleanor Vance • 78 y/o',
        detail: 'Blood Group O+ • Needs Cane',
        tag: 'Profile Active'
      }
    },
    {
      number: '02',
      title: 'Invite Family & Caretakers',
      subtitle: 'Synchronized Care Circle',
      description:
        'Connect daughters, sons, spouses, and dedicated aides to Eleanor’s unified Care Circle with role-based access so everyone stays on the same page.',
      icon: Users,
      variant: 'mint' as const,
      badge: 'mint' as const,
      preview: {
        title: 'Care Circle Connected',
        detail: 'Sarah (Family) + Marcus (Caregiver)',
        tag: 'Live Sync'
      }
    },
    {
      number: '03',
      title: 'Manage Daily Care Together',
      subtitle: 'Peace of Mind Every Day',
      description:
        'Confirm morning pills with 1 touch, track daily exercise strolls, receive appointment notifications, and rely on 24/7 one-touch emergency SOS.',
      icon: HeartHandshake,
      variant: 'babyBlue' as const,
      badge: 'babyBlue' as const,
      preview: {
        title: 'Morning Routine Checked',
        detail: 'Lisinopril taken & garden stroll done',
        tag: '100% Adherence'
      }
    }
  ];

  return (
    <section id="how-it-works" className="py-16 sm:py-24 relative bg-gradient-to-b from-transparent via-[#E9E3FF]/20 to-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <div className="inline-flex items-center gap-2">
            <CuteBadge variant="mint" size="md" dot>
              Gentle 3-Step Setup
            </CuteBadge>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-heading text-[#34354A] tracking-tight">
            How CareNest Brings Peace of Mind
          </h2>

          <p className="text-base sm:text-lg font-medium font-body text-[#575973] leading-relaxed">
            No complicated technical jargon or clunky medical software. Just three clear steps to unified family healthcare.
          </p>
        </div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className="relative"
              >
                <GlassCard
                  variant={step.variant}
                  padding="lg"
                  rounded="3xl"
                  className="h-full flex flex-col justify-between border-2 space-y-6"
                >
                  <div className="space-y-4">
                    {/* Header: Step Number & Icon */}
                    <div className="flex items-center justify-between">
                      <div className="w-14 h-14 rounded-3xl bg-white text-[#7969B5] font-black font-heading text-xl flex items-center justify-center shadow-glass-sm border border-white">
                        {step.number}
                      </div>

                      <div className="w-12 h-12 rounded-2xl bg-white/80 text-[#7969B5] flex items-center justify-center font-bold">
                        <Icon className="w-6 h-6" />
                      </div>
                    </div>

                    <div>
                      <CuteBadge variant={step.badge} size="sm" className="mb-2">
                        {step.subtitle}
                      </CuteBadge>
                      <h3 className="text-xl sm:text-2xl font-black font-heading text-[#34354A] tracking-tight">
                        {step.title}
                      </h3>
                      <p className="text-sm font-medium font-body text-[#575973] mt-2.5 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Interactive Micro Card Preview */}
                  <div className="bg-white/90 p-4 rounded-2xl border border-white shadow-2xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h5 className="font-extrabold font-heading text-xs text-[#34354A]">{step.preview.title}</h5>
                      <CuteBadge variant={step.badge} size="sm">
                        {step.preview.tag}
                      </CuteBadge>
                    </div>
                    <p className="text-[11px] font-medium font-body text-[#7A7D9D]">{step.preview.detail}</p>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA Banner */}
        <div className="mt-14 text-center">
          <Link to="/register">
            <Button
              variant="primary"
              size="lg"
              rightIcon={<ArrowRight className="w-5 h-5" />}
              className="rounded-full shadow-glow-purple px-8 font-extrabold"
            >
              <span>Set Up Your Family Circle Free</span>
            </Button>
          </Link>
        </div>

      </div>
    </section>
  );
};

