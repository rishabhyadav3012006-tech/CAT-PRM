import React from 'react';
import { useAccessibility } from '../../context/AccessibilityContext.tsx';
import { Eye, Sliders } from 'lucide-react';

export const AccessibilityLauncherButton: React.FC = () => {
  const { openSettings, highContrast } = useAccessibility();

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 sm:left-6 z-40">
      <button
        onClick={openSettings}
        className={`group flex items-center gap-2 px-3.5 py-2.5 rounded-full shadow-glass-md transition-all duration-300 border focus:outline-none focus-visible:ring-4 ${
          highContrast
            ? 'bg-black text-white border-2 border-white hover:bg-neutral-900'
            : 'bg-white/95 text-[#55428F] border-white/90 hover:bg-white hover:shadow-lg active:scale-95'
        }`}
        aria-label="Open Accessibility & Display Settings (Shortcut: Alt + A)"
        title="Accessibility Settings (Alt + A)"
      >
        <div className="w-6 h-6 rounded-full bg-[#E9E3FF] text-[#7969B5] flex items-center justify-center shrink-0">
          <Eye className="w-3.5 h-3.5" />
        </div>
        <span className="text-xs font-bold font-heading tracking-wide hidden sm:inline">
          Accessibility
        </span>
      </button>
    </div>
  );
};

