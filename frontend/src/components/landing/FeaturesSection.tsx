import React from 'react';
import { motion } from 'framer-motion';
import {
  Pill,
  Calendar,
  Users,
  FileText,
  Activity,
  Bell,
  CheckCircle2,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { GlassCard, GlassVariant } from '../ui/GlassCard.tsx';
import { CuteBadge, BadgeVariant } from '../ui/CuteBadge.tsx';
import { Link } from 'react-router-dom';

interface FeatureItem {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  variant: GlassVariant;
  badge: BadgeVariant;
  badgeText: string;
  details: string[];
  samplePill: string;
}

export const FeaturesSection: React.FC = () => {
  const features: FeatureItem[] = [
    {
      id: 'medication',
      title: 'Smart Medication Reminders',
      description:
        'Never miss or double-dose again. Scheduled intake times, visual prescription color tags, and automated low-stock refill reminders keep seniors safe.',
      icon: Pill,
      variant: 'mint',
      badge: 'mint',
      badgeText: 'Prescription Safety',
      details: [
        'One-touch intake confirmation',
        'Automatic low-stock pharmacy refill alerts',
        'Dietary instructions & meal sync'
      ],
      samplePill: 'Next: 12:30 PM • Vitamin D3'
    },
    {
      id: 'appointments',
      title: 'Doctor Appointment Management',
      description:
        'Coordinated calendar for specialist visits, checkups, and teleconsultations with automated 24-hour and 1-hour email reminders to family and caregivers.',
      icon: Calendar,
      variant: 'babyBlue',
      badge: 'babyBlue',
      badgeText: 'Calendar Sync',
      details: [
        'Specialty categorization (Cardiology, Eye, PT)',
        'Clinic location maps & notes for driver',
        'Pre-visit clinical preparation guidance'
      ],
      samplePill: 'Dr. Adams (Cardiologist) in 2 days'
    },
    {
      id: 'family-circle',
      title: 'Family Care Circle',
      description:
        'Connect children, spouses, and dedicated aides in a shared care team. Everyone sees live updates, eliminating constant status texting and uncertainty.',
      icon: Users,
      variant: 'lavender',
      badge: 'lavender',
      badgeText: 'Connected Care',
      details: [
        'Multi-member role-based permissions',
        'Real-time check-off notifications',
        'Shared notes for peaceful collaboration'
      ],
      samplePill: 'Sarah & Marcus synced now'
    },
    {
      id: 'records',
      title: 'Comprehensive Medical Records',
      description:
        'Centralized medical summary featuring chronic baseline conditions, known drug allergies (Penicillin, Sulfa), and emergency contact coordinates ready for EMS.',
      icon: FileText,
      variant: 'peach',
      badge: 'peach',
      badgeText: 'Medical Archive',
      details: [
        'Allergy warnings flagged on new prescriptions',
        'Doctor-ready exportable clinical summaries',
        'Direct emergency responder quick sheet'
      ],
      samplePill: 'Allergies & Baseline Secured'
    },
    {
      id: 'vitals',
      title: 'Health Tracking & Biometrics',
      description:
        'Monitor longitudinal blood pressure, blood glucose, heart rate, SpO₂, and body weight with automatic clinical threshold anomaly alarms.',
      icon: Activity,
      variant: 'pink',
      badge: 'pink',
      badgeText: 'Vital Telehealth',
      details: [
        'Interactive longitudinal trend graphs',
        'Abnormal vital auto-alert notifications',
        'Comfortable oral & resting range targets'
      ],
      samplePill: 'BP: 124/78 mmHg • Optimal'
    },
    {
      id: 'notifications',
      title: 'Smart Notifications & Rapid SOS',
      description:
        'Automated BullMQ background reminders, transactional emails via Nodemailer, and an instant one-touch emergency SOS button for urgent help.',
      icon: Bell,
      variant: 'cream',
      badge: 'cream',
      badgeText: '24/7 Protection',
      details: [
        'Rapid multi-channel emergency broadcast',
        'Daily morning & evening family digest summaries',
        'Zero spam, gentle accessible notification tones'
      ],
      samplePill: 'One-touch SOS Rapid Dispatch'
    }
  ];

  return (
    <section id="features" className="py-16 sm:py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <div className="inline-flex items-center gap-2">
            <CuteBadge variant="lavender" size="md" icon={<Sparkles className="w-3.5 h-3.5 text-[#7969B5]" />}>
              Thoughtful Care Features
            </CuteBadge>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-heading text-[#34354A] tracking-tight">
            Everything Your Loved One Needs to Flourish
          </h2>

          <p className="text-base sm:text-lg font-medium font-body text-[#575973] leading-relaxed">
            Engineered with large typography, gentle visual contrasts, and zero unnecessary complexity so seniors can focus on wellness.
          </p>
        </div>

        {/* 6 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
              >
                <GlassCard
                  variant={item.variant}
                  padding="lg"
                  rounded="3xl"
                  interactive
                  className="h-full flex flex-col justify-between border-2 space-y-5"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-13 h-13 rounded-2xl bg-white/90 text-[#7969B5] flex items-center justify-center font-bold shadow-2xs">
                        <Icon className="w-6 h-6" />
                      </div>
                      <CuteBadge variant={item.badge} size="sm">
                        {item.badgeText}
                      </CuteBadge>
                    </div>

                    <div>
                      <h3 className="text-xl font-black font-heading text-[#34354A] tracking-tight">
                        {item.title}
                      </h3>
                      <p className="text-sm font-medium font-body text-[#575973] mt-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {/* Feature Details List */}
                    <div className="space-y-2 pt-2 border-t border-white/60">
                      {item.details.map((detail, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs font-semibold font-body text-[#34354A]">
                          <CheckCircle2 className="w-4 h-4 text-[#2B8756] flex-shrink-0" />
                          <span>{detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Micro Sample Preview Pill */}
                  <div className="pt-3 border-t border-white/60 flex items-center justify-between">
                    <span className="text-[11px] font-bold font-heading text-[#7A7D9D] bg-white/80 px-3 py-1 rounded-full border border-white">
                      {item.samplePill}
                    </span>
                    <Link
                      to="/register"
                      className="text-xs font-extrabold font-heading text-[#7969B5] hover:text-[#554391] flex items-center gap-1 group"
                    >
                      <span>Try it</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

