import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, ArrowRight } from 'lucide-react';
import { EmergencyAlert } from '../../types/index.ts';
import { Link } from 'react-router-dom';

interface NotificationBannerProps {
  alerts: EmergencyAlert[];
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({ alerts }) => {
  if (!alerts || alerts.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        className="relative z-20 px-4 sm:px-6 py-2.5 bg-gradient-to-r from-[#FCE4ED]/90 via-[#FFE9DC]/80 to-[#FCE4ED]/90 backdrop-blur-md border-b border-[#F9BFD4] shadow-sm"
      >
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 relative flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600" />
            </span>

            <div className="p-1.5 rounded-xl bg-white/70 text-rose-600 shadow-2xs">
              <ShieldAlert className="w-4 h-4" />
            </div>

            <p className="text-xs sm:text-sm font-bold font-heading text-[#8F1E48]">
              {alerts.length} Active Emergency Alert{alerts.length > 1 ? 's' : ''}:{' '}
              <span className="font-medium font-body text-[#34354A]">
                {alerts[0].message || 'Immediate assistance requested.'}
              </span>
            </p>
          </div>

          <Link
            to="/emergency"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#8F1E48] hover:bg-[#B53364] text-white text-xs font-bold font-heading rounded-full shadow-sm transition-all hover:scale-105 active:scale-95"
          >
            <span>Open Emergency Center</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
