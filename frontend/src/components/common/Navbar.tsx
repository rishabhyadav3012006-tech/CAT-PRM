import React, { useState } from 'react';
import { Heart, LogOut, User as UserIcon, ShieldAlert, ChevronDown, Check, Sparkles, Eye } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useAccessibility } from '../../context/AccessibilityContext.tsx';
import { UserRole } from '../../types/index.ts';
import { Link, useNavigate } from 'react-router-dom';
import { CuteBadge, BadgeVariant } from '../ui/CuteBadge.tsx';
import { Button } from '../ui/Button.tsx';
import { NotificationBell } from './NotificationBell.tsx';

export const Navbar: React.FC = () => {
  const { user, logout, switchDemoRole } = useAuth();
  const { openSettings } = useAccessibility();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);

  const roles: { role: UserRole; label: string; desc: string; badge: BadgeVariant }[] = [
    { role: 'ELDERLY', label: 'Eleanor Vance', desc: 'Elderly Individual', badge: 'mint' },
    { role: 'FAMILY_MEMBER', label: 'Sarah Vance', desc: 'Daughter / Family', badge: 'babyBlue' },
    { role: 'CAREGIVER', label: 'Marcus Chen', desc: 'Primary Caregiver', badge: 'lavender' },
    { role: 'DOCTOR', label: 'Dr. Elizabeth Adams', desc: 'Cardiologist', badge: 'peach' },
  ];

  const handleRoleSelect = async (role: UserRole) => {
    setIsRoleMenuOpen(false);
    await switchDemoRole(role);
  };

  const roleBadgeMap: Record<UserRole, BadgeVariant> = {
    ELDERLY: 'mint',
    FAMILY_MEMBER: 'babyBlue',
    CAREGIVER: 'lavender',
    DOCTOR: 'peach',
    ADMIN: 'cream',
  };

  return (
    <header className="sticky top-0 z-30 px-3 sm:px-6 pt-3 pb-2">
      <div className="max-w-7xl mx-auto bg-white/80 backdrop-blur-glass border border-white/90 rounded-3xl shadow-glass px-4 sm:px-6 h-18 flex items-center justify-between transition-all">
        {/* Brand & Active Elderly Persona */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link to="/dashboard" className="flex items-center gap-3 group focus:outline-none">
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

          {/* Active Patient Indicator */}
          <div className="hidden lg:flex items-center ml-4 pl-4 border-l border-[#E5E4F2]">
            <CuteBadge variant="mint" size="md" dot>
              <span>Care Profile: <strong>Eleanor Vance (Age 78)</strong></span>
            </CuteBadge>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Persona Switcher Menu */}
          <div className="relative">
            <button
              onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold font-heading rounded-2xl bg-[#E9E3FF]/70 hover:bg-[#E9E3FF] text-[#45347B] border border-[#D2C7FC] shadow-glass-sm transition-all focus:outline-none"
              title="Switch demo persona view"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#7969B5]" />
              <span>Persona:</span>
              <span className="text-[#7969B5] font-black">{user?.role?.replace('_', ' ')}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#7969B5]" />
            </button>

            {isRoleMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white/95 backdrop-blur-glass rounded-3xl shadow-glass-lg border border-white/90 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2 text-[11px] font-extrabold font-title text-[#7A7D9D] uppercase tracking-wider border-b border-[#FAF9FF]">
                  Switch User Perspective
                </div>
                <div className="space-y-1 mt-1">
                  {roles.map((item) => (
                    <button
                      key={item.role}
                      onClick={() => handleRoleSelect(item.role)}
                      className={`w-full text-left px-3 py-2.5 rounded-2xl text-xs flex items-center justify-between hover:bg-[#FAF9FF] transition-all cursor-pointer ${
                        user?.role === item.role ? 'bg-[#E9E3FF]/60 font-bold text-[#45347B]' : 'text-[#34354A]'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <p className="font-bold font-heading text-sm text-[#34354A]">{item.label}</p>
                        <p className="text-[11px] text-[#7A7D9D]">{item.desc}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <CuteBadge variant={item.badge} size="sm">
                          {item.role.split('_')[0]}
                        </CuteBadge>
                        {user?.role === item.role && <Check className="w-4 h-4 text-[#7969B5]" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Accessibility Settings Shortcut */}
          <button
            onClick={openSettings}
            className="p-2 sm:p-2.5 rounded-2xl bg-[#E9E3FF]/70 hover:bg-[#E9E3FF] text-[#55428F] border border-[#D2C7FC] shadow-glass-sm transition-all focus:outline-none flex items-center gap-1.5"
            title="Accessibility Options (Alt + A)"
            aria-label="Open Accessibility and Display Options"
          >
            <Eye className="w-4 h-4" />
            <span className="hidden xl:inline text-xs font-bold font-heading">Access</span>
          </button>

          {/* Notification Bell */}
          <NotificationBell />

          {/* Rapid Emergency SOS Button */}
          <Button
            variant="danger"
            size="sm"
            onClick={() => navigate('/emergency')}
            leftIcon={<ShieldAlert className="w-4 h-4 animate-pulse" />}
            className="rounded-full shadow-md font-heading font-extrabold px-4"
          >
            <span>SOS</span>
          </Button>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/60 hover:bg-white border border-white/80 transition-all focus:outline-none"
            >
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-9 h-9 rounded-xl object-cover border border-[#E9E3FF] shadow-2xs"
                />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-[#E9E3FF] text-[#7969B5] font-black text-sm flex items-center justify-center font-heading">
                  {user?.name?.charAt(0) || 'U'}
                </div>
              )}
              <div className="hidden md:block text-left pr-1">
                <p className="text-xs font-bold font-heading text-[#34354A] leading-tight truncate max-w-[120px]">
                  {user?.name}
                </p>
                <p className="text-[10px] text-[#7A7D9D] font-medium capitalize">
                  {user?.role?.toLowerCase().replace('_', ' ')}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#7A7D9D]" />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-60 bg-white/95 backdrop-blur-glass rounded-3xl shadow-glass-lg border border-white/90 py-2.5 px-2 z-50">
                <div className="px-3 py-2 border-b border-[#FAF9FF] mb-1">
                  <p className="text-sm font-extrabold font-heading text-[#34354A]">{user?.name}</p>
                  <p className="text-xs text-[#7A7D9D] truncate">{user?.email}</p>
                  {user?.role && (
                    <div className="mt-2">
                      <CuteBadge variant={roleBadgeMap[user.role]} size="sm">
                        {user.role.replace('_', ' ')}
                      </CuteBadge>
                    </div>
                  )}
                </div>

                <Link
                  to="/profile"
                  onClick={() => setIsDropdownOpen(false)}
                  className="w-full text-left px-3 py-2 text-xs font-bold font-heading text-[#34354A] hover:bg-[#E9E3FF]/50 rounded-xl flex items-center gap-2.5 transition-colors"
                >
                  <UserIcon className="w-4 h-4 text-[#7969B5]" />
                  <span>Eleanor's Profile Info</span>
                </Link>

                <Link
                  to="/"
                  onClick={() => setIsDropdownOpen(false)}
                  className="w-full text-left px-3 py-2 text-xs font-bold font-heading text-[#34354A] hover:bg-[#E9E3FF]/50 rounded-xl flex items-center gap-2.5 transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-[#7969B5]" />
                  <span>Public Landing Page</span>
                </Link>

                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-bold font-heading text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-2.5 transition-colors mt-1"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
