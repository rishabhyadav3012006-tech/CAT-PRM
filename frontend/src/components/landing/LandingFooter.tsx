import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Mail, Phone, MapPin, CheckCircle2, Shield, ArrowUp, ArrowRight } from 'lucide-react';
import { CuteBadge } from '../ui/CuteBadge.tsx';
import { Button } from '../ui/Button.tsx';

export const LandingFooter: React.FC = () => {
  const [emailInput, setEmailInput] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;
    setSubscribed(true);
    setEmailInput('');
    setTimeout(() => setSubscribed(false), 4000);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="pt-16 pb-12 bg-white/70 backdrop-blur-glass border-t border-[#E5E4F2] relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Newsletter / Tips Bar */}
        <div className="p-6 sm:p-8 rounded-4xl bg-gradient-to-r from-[#E9E3FF]/80 via-[#FFF9ED]/80 to-[#DDF5E9]/80 border-2 border-white shadow-glass mb-16 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <CuteBadge variant="purple" size="sm" className="mb-1">
              Caregiver Monthly Digest
            </CuteBadge>
            <h3 className="text-xl sm:text-2xl font-black font-heading text-[#34354A]">
              Get Gentle Healthcare & Elderly Wellness Tips
            </h3>
            <p className="text-xs sm:text-sm font-medium font-body text-[#575973]">
              Curated by geriatric specialists on nutrition, medication routines, and memory wellness.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="w-full md:w-auto flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              required
              placeholder="Enter your email address"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="px-4 py-3 rounded-full border-2 border-white bg-white/95 text-xs sm:text-sm font-medium font-body text-[#34354A] placeholder-[#7A7D9D] focus:outline-none focus:ring-4 focus:ring-[#7969B5]/30 min-w-[260px]"
            />
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="rounded-full shadow-glow-purple px-6 text-xs sm:text-sm font-bold"
            >
              <span>{subscribed ? 'Subscribed ✓' : 'Subscribe Free'}</span>
            </Button>
          </form>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-12 border-b border-[#E5E4F2]">
          
          {/* Col 1 & 2: Brand Info */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#7969B5] to-[#9E8EE4] flex items-center justify-center text-white shadow-glow-purple">
                <Heart className="w-5 h-5 fill-white" />
              </div>
              <span className="text-2xl font-black font-heading text-[#34354A] tracking-tight">
                Care<span className="text-[#7969B5]">Nest</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm font-medium font-body text-[#575973] max-w-sm leading-relaxed">
              CareNest is an accessible, family-centered elderly healthcare management platform connecting seniors, caregivers, and clinicians with clarity and love.
            </p>

            <div className="space-y-1.5 text-xs text-[#575973] pt-1">
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#7969B5]" />
                <span className="font-bold text-[#34354A]">Toll-Free Support:</span> +1 (800) CARE-NEST
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#7969B5]" />
                <span className="font-bold text-[#34354A]">Help Desk:</span> support@carenest.health
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#7969B5]" />
                <span>Springfield & Portland, Oregon</span>
              </p>
            </div>
          </div>

          {/* Col 3: Features */}
          <div className="space-y-3">
            <h4 className="text-xs font-black font-title text-[#34354A] uppercase tracking-wider">
              Care Features
            </h4>
            <ul className="space-y-2 text-xs font-semibold font-body text-[#575973]">
              <li>
                <button onClick={() => scrollToSection('features')} className="hover:text-[#7969B5] transition-colors cursor-pointer">
                  Medication Reminders
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('features')} className="hover:text-[#7969B5] transition-colors cursor-pointer">
                  Doctor Appointments
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('features')} className="hover:text-[#7969B5] transition-colors cursor-pointer">
                  Biometrics & Vitals
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('features')} className="hover:text-[#7969B5] transition-colors cursor-pointer">
                  Family Care Circle
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('features')} className="hover:text-[#7969B5] transition-colors cursor-pointer">
                  Rapid SOS Emergency
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Platform & How it works */}
          <div className="space-y-3">
            <h4 className="text-xs font-black font-title text-[#34354A] uppercase tracking-wider">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs font-semibold font-body text-[#575973]">
              <li>
                <button onClick={() => scrollToSection('how-it-works')} className="hover:text-[#7969B5] transition-colors cursor-pointer">
                  How It Works
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('collaboration')} className="hover:text-[#7969B5] transition-colors cursor-pointer">
                  Family Collaboration
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('preview')} className="hover:text-[#7969B5] transition-colors cursor-pointer">
                  Dashboard Preview
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('testimonials')} className="hover:text-[#7969B5] transition-colors cursor-pointer">
                  Family Reviews
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('about')} className="hover:text-[#7969B5] transition-colors cursor-pointer">
                  About CareNest
                </button>
              </li>
              <li>
                <Link to="/login" className="hover:text-[#7969B5] transition-colors cursor-pointer">
                  Sign In Portal
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-[#7969B5] transition-colors cursor-pointer">
                  Create Account
                </Link>
              </li>
              <li>
                <Link to="/join-profile" className="hover:text-[#7969B5] transition-colors cursor-pointer">
                  Join Care Circle
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Legal & Security */}
          <div className="space-y-3">
            <h4 className="text-xs font-black font-title text-[#34354A] uppercase tracking-wider">
              Trust & Legal
            </h4>
            <ul className="space-y-2 text-xs font-semibold font-body text-[#575973]">
              <li>
                <a href="#about" className="hover:text-[#7969B5] transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-[#7969B5] transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-[#7969B5] transition-colors">
                  HIPAA Security Guidelines
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-[#7969B5] transition-colors">
                  Senior Accessibility Standard
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-[#7969B5] transition-colors">
                  Cookie Preferences
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium font-body text-[#7A7D9D]">
          <p>© {new Date().getFullYear()} CareNest Health Ecosystem Inc. All rights reserved.</p>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-[#2B8756] font-bold">
              <Shield className="w-4 h-4" />
              <span>Encrypted Healthcare Security</span>
            </span>
            <button
              onClick={scrollToTop}
              className="p-2 rounded-xl bg-[#E9E3FF] text-[#7969B5] hover:bg-[#DDD5F7] transition-colors flex items-center justify-center cursor-pointer"
              aria-label="Scroll to top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};

