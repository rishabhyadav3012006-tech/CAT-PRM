import React, { useEffect, useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar.tsx';
import { Sidebar } from '../components/common/Sidebar.tsx';
import { NotificationBanner } from '../components/common/NotificationBanner.tsx';
import { FloatingDecorations } from '../components/ui/FloatingDecorations.tsx';
import { SmartCareAssistantWidget } from '../components/assistant/SmartCareAssistantWidget.tsx';
import { AccessibilityPanel } from '../components/accessibility/AccessibilityPanel.tsx';
import { AccessibilityLauncherButton } from '../components/accessibility/AccessibilityLauncherButton.tsx';
import { alertsApi } from '../api/client.ts';
import { EmergencyAlert } from '../types/index.ts';
import { LayoutDashboard, Pill, Calendar, Activity, ShieldAlert, BarChart2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { pageVariants } from '../design-system/animations.ts';

export const DashboardLayout: React.FC = () => {
  const [activeAlerts, setActiveAlerts] = useState<EmergencyAlert[]>([]);

  useEffect(() => {
    const fetchActiveAlerts = async () => {
      try {
        const res: any = await alertsApi.getActive();
        if (res.success && res.data) {
          setActiveAlerts(res.data);
        }
      } catch (err) {
        // Silently handle
      }
    };

    fetchActiveAlerts();
    const interval = setInterval(fetchActiveAlerts, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF9FF] relative overflow-x-hidden flex flex-col font-body text-[#34354A]">
      {/* Ambient Floating Pastel Decorations */}
      <FloatingDecorations />

      {/* Sticky Frosted Header */}
      <Navbar />

      {/* Emergency Active Alert Toast Banner */}
      <NotificationBanner alerts={activeAlerts} />

      {/* Main Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-2 sm:px-4 relative z-10 pb-24 md:pb-8">
        <Sidebar />
        <main className="flex-1 p-2 sm:p-4 md:p-6 overflow-x-hidden">
          <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      {/* Optional Smart Care Routine Assistant Widget */}
      <SmartCareAssistantWidget />

      {/* Global Universal Accessibility System */}
      <AccessibilityLauncherButton />
      <AccessibilityPanel />

      {/* Mobile Frosted Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-3 left-3 right-3 bg-white/85 backdrop-blur-glass border border-white/95 z-40 px-3 py-2 rounded-3xl flex items-center justify-around shadow-glass-lg">
        <NavLink
          to="/dashboard"
          end
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 text-[11px] font-bold font-heading p-1.5 rounded-2xl transition-all ${
              isActive ? 'text-[#7969B5] bg-[#E9E3FF]/70' : 'text-[#7A7D9D]'
            }`
          }
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Home</span>
        </NavLink>
        <NavLink
          to="/medications"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 text-[11px] font-bold font-heading p-1.5 rounded-2xl transition-all ${
              isActive ? 'text-[#2B8756] bg-[#DDF5E9]/70' : 'text-[#7A7D9D]'
            }`
          }
        >
          <Pill className="w-5 h-5" />
          <span>Meds</span>
        </NavLink>
        <NavLink
          to="/appointments"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 text-[11px] font-bold font-heading p-1.5 rounded-2xl transition-all ${
              isActive ? 'text-[#2B6EB5] bg-[#DFEEFF]/70' : 'text-[#7A7D9D]'
            }`
          }
        >
          <Calendar className="w-5 h-5" />
          <span>Visits</span>
        </NavLink>
        <NavLink
          to="/records"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 text-[11px] font-bold font-heading p-1.5 rounded-2xl transition-all ${
              isActive ? 'text-[#B85820] bg-[#FFE9DC]/70' : 'text-[#7A7D9D]'
            }`
          }
        >
          <Activity className="w-5 h-5" />
          <span>Vitals</span>
        </NavLink>
        <NavLink
          to="/reports"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 text-[11px] font-bold font-heading p-1.5 rounded-2xl transition-all ${
              isActive ? 'text-[#55428F] bg-[#E9E3FF]/70' : 'text-[#7A7D9D]'
            }`
          }
        >
          <BarChart2 className="w-5 h-5" />
          <span>Reports</span>
        </NavLink>
        <NavLink
          to="/emergency"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 text-[11px] font-extrabold font-heading p-1.5 rounded-2xl transition-all ${
              isActive ? 'text-rose-700 bg-[#FCE4ED]' : 'text-rose-600'
            }`
          }
        >
          <ShieldAlert className="w-5 h-5 animate-pulse text-rose-600" />
          <span>SOS</span>
        </NavLink>
      </div>
    </div>
  );
};
