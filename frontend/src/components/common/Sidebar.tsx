import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Pill,
  Calendar,
  Activity,
  FolderLock,
  CheckSquare,
  BarChart2,
  UserCheck,
  Users,
  ShieldAlert,
  Sparkles,
  Heart,
  Globe
} from 'lucide-react';
import { CuteBadge } from '../ui/CuteBadge.tsx';

export const Sidebar: React.FC = () => {
  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'text-[#7969B5]' },
    { to: '/medications', label: 'Medications', icon: Pill, color: 'text-[#2B8756]' },
    { to: '/appointments', label: 'Appointments', icon: Calendar, color: 'text-[#2B6EB5]' },
    { to: '/records', label: 'Health Vitals', icon: Activity, color: 'text-[#B85820]' },
    { to: '/vault', label: 'Medical Vault', icon: FolderLock, color: 'text-[#1B5494]' },
    { to: '/activities', label: 'Daily Care Tasks', icon: CheckSquare, color: 'text-[#B53364]' },
    { to: '/reports', label: 'Reports & Analytics', icon: BarChart2, color: 'text-[#55428F]' },
    { to: '/circle', label: 'Family Care Circle', icon: Users, color: 'text-[#55428F]' },
    { to: '/profile', label: 'Elderly Profile', icon: UserCheck, color: 'text-[#997321]' },
    { to: '/emergency', label: 'Emergency SOS', icon: ShieldAlert, color: 'text-rose-600', alert: true },
  ];

  return (
    <aside className="w-68 min-h-[calc(100vh-6rem)] hidden md:flex flex-col justify-between p-3">
      {/* Floating Glass Navigation Container */}
      <div className="bg-white/80 backdrop-blur-glass border border-white/90 rounded-3xl p-3.5 shadow-glass space-y-1.5">
        <div className="px-3 pt-2 pb-1 text-[11px] font-extrabold font-title text-[#7A7D9D] uppercase tracking-wider flex items-center justify-between">
          <span>Care Navigation</span>
          <Sparkles className="w-3.5 h-3.5 text-[#7969B5]" />
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/dashboard'}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-extrabold font-heading transition-all duration-200 select-none min-h-[46px] ${
                  isActive
                    ? item.alert
                      ? 'bg-[#FCE4ED] text-[#8F1E48] shadow-sm border border-[#F9BFD4]'
                      : 'bg-[#E9E3FF] text-[#45347B] shadow-sm border border-[#D2C7FC]'
                    : 'text-[#575973] hover:bg-white hover:text-[#34354A] border border-transparent'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center transition-transform ${
                        isActive
                          ? item.alert
                            ? 'bg-rose-200 text-rose-800'
                            : 'bg-white text-[#7969B5] shadow-2xs'
                          : 'bg-[#FAF9FF] text-[#7A7D9D]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="tracking-tight">{item.label}</span>
                  </div>

                  {item.alert && (
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}

        <div className="pt-2 border-t border-[#FAF9FF]">
          <Link
            to="/"
            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold font-heading text-[#7A7D9D] hover:text-[#7969B5] hover:bg-[#FAF9FF] transition-all"
          >
            <Globe className="w-4 h-4 text-[#7969B5]" />
            <span>← Public Landing Page</span>
          </Link>
        </div>
      </div>

      {/* Calming System Status Box */}
      <div className="mt-4 bg-gradient-to-br from-[#DDF5E9]/80 via-white/85 to-[#E9E3FF]/80 backdrop-blur-glass border border-white/90 rounded-3xl p-4 shadow-glass space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#DDF5E9] text-[#2B8756] flex items-center justify-center shadow-2xs">
            <Heart className="w-3.5 h-3.5 fill-[#2B8756]" />
          </div>
          <div>
            <p className="text-xs font-black font-heading text-[#34354A]">Care Team Connected</p>
            <p className="text-[10px] text-[#2B8756] font-bold">All Vitals & Meds Monitored</p>
          </div>
        </div>
        <p className="text-[11px] font-medium font-body text-[#575973] leading-relaxed">
          Sarah, Marcus, and Dr. Adams are synchronized in real-time.
        </p>
      </div>
    </aside>
  );
};
