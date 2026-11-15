import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Menu, X, ArrowRight, Sparkles, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { Button } from '../ui/Button.tsx';
import { CuteBadge } from '../ui/CuteBadge.tsx';

export const LandingNavbar: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 px-3 sm:px-6 pt-3 pb-2">
      <div className="max-w-7xl mx-auto bg-white/80 backdrop-blur-glass border border-white/90 rounded-3xl shadow-glass px-4 sm:px-6 h-18 flex items-center justify-between transition-all">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group focus:outline-none">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#7969B5] to-[#9E8EE4] flex items-center justify-center text-white shadow-glow-purple group-hover:scale-105 transition-transform">
            <Heart className="w-6 h-6 fill-white" />
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-black font-heading text-[#34354A] tracking-tight">
              Care<span className="text-[#7969B5]">Nest</span>
            </span>
            <span className="block text-[10px] font-bold font-title text-[#7A7D9D] uppercase tracking-wider -mt-1">
              Elderly Health & Care
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          <button
            onClick={() => scrollTo('hero')}
            className="px-3.5 py-2 text-xs sm:text-sm font-bold font-heading text-[#575973] hover:text-[#7969B5] hover:bg-[#E9E3FF]/40 rounded-2xl transition-all cursor-pointer"
          >
            Home
          </button>
          <button
            onClick={() => scrollTo('features')}
            className="px-3.5 py-2 text-xs sm:text-sm font-bold font-heading text-[#575973] hover:text-[#7969B5] hover:bg-[#E9E3FF]/40 rounded-2xl transition-all cursor-pointer"
          >
            Features
          </button>
          <button
            onClick={() => scrollTo('how-it-works')}
            className="px-3.5 py-2 text-xs sm:text-sm font-bold font-heading text-[#575973] hover:text-[#7969B5] hover:bg-[#E9E3FF]/40 rounded-2xl transition-all cursor-pointer"
          >
            How It Works
          </button>
          <button
            onClick={() => scrollTo('collaboration')}
            className="px-3.5 py-2 text-xs sm:text-sm font-bold font-heading text-[#575973] hover:text-[#7969B5] hover:bg-[#E9E3FF]/40 rounded-2xl transition-all cursor-pointer"
          >
            Family Circle
          </button>
          <button
            onClick={() => scrollTo('preview')}
            className="px-3.5 py-2 text-xs sm:text-sm font-bold font-heading text-[#575973] hover:text-[#7969B5] hover:bg-[#E9E3FF]/40 rounded-2xl transition-all cursor-pointer"
          >
            Dashboard
          </button>
          <button
            onClick={() => scrollTo('testimonials')}
            className="px-3.5 py-2 text-xs sm:text-sm font-bold font-heading text-[#575973] hover:text-[#7969B5] hover:bg-[#E9E3FF]/40 rounded-2xl transition-all cursor-pointer"
          >
            Stories
          </button>
          <button
            onClick={() => scrollTo('about')}
            className="px-3.5 py-2 text-xs sm:text-sm font-bold font-heading text-[#575973] hover:text-[#7969B5] hover:bg-[#E9E3FF]/40 rounded-2xl transition-all cursor-pointer"
          >
            About
          </button>
        </nav>

        {/* Action Buttons */}
        <div className="hidden sm:flex items-center gap-2.5">
          {isAuthenticated ? (
            <Link to="/dashboard">
              <Button
                variant="primary"
                size="md"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="rounded-full shadow-glow-purple px-5"
              >
                <span>Open Dashboard</span>
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/login">
                <Button
                  variant="ghost"
                  size="md"
                  className="rounded-2xl text-xs sm:text-sm font-bold text-[#34354A]"
                >
                  <span>Sign In</span>
                </Button>
              </Link>
              <Link to="/register">
                <Button
                  variant="primary"
                  size="md"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  className="rounded-full shadow-glow-purple px-5 text-xs sm:text-sm"
                >
                  <span>Get Started</span>
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden w-11 h-11 rounded-2xl text-[#34354A] hover:bg-[#E9E3FF]/50 flex items-center justify-center transition-colors focus:outline-none"
          aria-label="Toggle mobile menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-2 max-w-7xl mx-auto bg-white/95 backdrop-blur-glass border border-white/90 rounded-3xl shadow-glass-lg p-5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-1">
            <button
              onClick={() => scrollTo('hero')}
              className="text-left px-4 py-2.5 rounded-2xl text-sm font-bold font-heading text-[#34354A] hover:bg-[#E9E3FF]/50"
            >
              Home
            </button>
            <button
              onClick={() => scrollTo('features')}
              className="text-left px-4 py-2.5 rounded-2xl text-sm font-bold font-heading text-[#34354A] hover:bg-[#E9E3FF]/50"
            >
              Features
            </button>
            <button
              onClick={() => scrollTo('how-it-works')}
              className="text-left px-4 py-2.5 rounded-2xl text-sm font-bold font-heading text-[#34354A] hover:bg-[#E9E3FF]/50"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollTo('collaboration')}
              className="text-left px-4 py-2.5 rounded-2xl text-sm font-bold font-heading text-[#34354A] hover:bg-[#E9E3FF]/50"
            >
              Family Collaboration
            </button>
            <button
              onClick={() => scrollTo('preview')}
              className="text-left px-4 py-2.5 rounded-2xl text-sm font-bold font-heading text-[#34354A] hover:bg-[#E9E3FF]/50"
            >
              Dashboard Preview
            </button>
            <button
              onClick={() => scrollTo('testimonials')}
              className="text-left px-4 py-2.5 rounded-2xl text-sm font-bold font-heading text-[#34354A] hover:bg-[#E9E3FF]/50"
            >
              Testimonials
            </button>
            <button
              onClick={() => scrollTo('about')}
              className="text-left px-4 py-2.5 rounded-2xl text-sm font-bold font-heading text-[#34354A] hover:bg-[#E9E3FF]/50"
            >
              About
            </button>
          </div>

          <div className="pt-3 border-t border-[#E5E4F2] flex flex-col gap-2">
            {isAuthenticated ? (
              <Button
                variant="primary"
                size="md"
                fullWidth
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/dashboard');
                }}
              >
                <span>Open Dashboard</span>
              </Button>
            ) : (
              <>
                <Button
                  variant="secondary"
                  size="md"
                  fullWidth
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/login');
                  }}
                >
                  <span>Sign In</span>
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/register');
                  }}
                >
                  <span>Get Started</span>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

