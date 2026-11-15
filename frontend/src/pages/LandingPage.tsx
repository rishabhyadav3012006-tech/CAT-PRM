import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FloatingDecorations } from '../components/ui/FloatingDecorations.tsx';
import { LandingNavbar } from '../components/landing/LandingNavbar.tsx';
import { HeroSection } from '../components/landing/HeroSection.tsx';
import { FeaturesSection } from '../components/landing/FeaturesSection.tsx';
import { HowItWorksSection } from '../components/landing/HowItWorksSection.tsx';
import { FamilyCollaborationSection } from '../components/landing/FamilyCollaborationSection.tsx';
import { DashboardPreviewSection } from '../components/landing/DashboardPreviewSection.tsx';
import { TestimonialsSection } from '../components/landing/TestimonialsSection.tsx';
import { AboutSection } from '../components/landing/AboutSection.tsx';
import { LandingFooter } from '../components/landing/LandingFooter.tsx';

export const LandingPage: React.FC = () => {
  useEffect(() => {
    document.title = 'CareNest — Caring Made Simple, Every Day';
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF9FF] relative overflow-x-hidden font-body text-[#34354A] selection:bg-[#7969B5] selection:text-white">
      {/* Gentle Ambient Pastel Mesh Gradient Orbs & Floating SVGs */}
      <FloatingDecorations />

      {/* 1. Landing Navigation */}
      <LandingNavbar />

      <main className="relative z-10">
        {/* 2. Hero Section */}
        <HeroSection />

        {/* 3. Features Section */}
        <FeaturesSection />

        {/* 4. How It Works */}
        <HowItWorksSection />

        {/* 5. Family Collaboration Section */}
        <FamilyCollaborationSection />

        {/* 6. Dashboard Preview */}
        <DashboardPreviewSection />

        {/* 7. Sample Testimonials */}
        <TestimonialsSection />

        {/* 8. Mission & About */}
        <AboutSection />
      </main>

      {/* 9. Landing Footer */}
      <LandingFooter />
    </div>
  );
};

export default LandingPage;

