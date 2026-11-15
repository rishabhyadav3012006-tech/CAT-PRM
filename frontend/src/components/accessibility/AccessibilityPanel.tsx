import React, { useEffect, useRef } from 'react';
import { useAccessibility, TextSize } from '../../context/AccessibilityContext.tsx';
import {
  Sliders,
  Type,
  Sun,
  Moon,
  Eye,
  MousePointer,
  RotateCcw,
  X,
  Check,
  Sparkles,
  Volume2,
  Compass,
  Keyboard
} from 'lucide-react';

export const AccessibilityPanel: React.FC = () => {
  const {
    isSettingsOpen,
    closeSettings,
    textSize,
    setTextSize,
    highContrast,
    toggleHighContrast,
    reducedMotion,
    toggleReducedMotion,
    largeTouchTargets,
    toggleLargeTouchTargets,
    simplifiedNavigation,
    toggleSimplifiedNavigation,
    screenReaderHints,
    toggleScreenReaderHints,
    resetDefaults
  } = useAccessibility();

  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSettingsOpen) {
        closeSettings();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSettingsOpen, closeSettings]);

  if (!isSettingsOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="accessibility-panel-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeSettings();
      }}
    >
      <div
        ref={modalRef}
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border-2 border-purple-200 overflow-hidden flex flex-col max-h-[90vh] text-[#34354A]"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#FAF9FF] via-[#E9E3FF] to-[#DFEEFF] border-b border-purple-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#7969B5] text-white flex items-center justify-center shadow-xs">
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <h2
                id="accessibility-panel-title"
                className="text-lg sm:text-xl font-black font-heading tracking-tight text-[#34354A]"
              >
                Accessibility & Display Options
              </h2>
              <p className="text-xs text-[#575973] font-medium font-body">
                Customize CareNest for comfortable reading and effortless navigation
              </p>
            </div>
          </div>
          <button
            onClick={closeSettings}
            className="p-2 rounded-2xl hover:bg-white/80 text-gray-500 hover:text-gray-800 transition-colors"
            aria-label="Close accessibility options"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 scrollbar-thin">
          {/* 1. TEXT SIZE CONTROLS */}
          <div className="space-y-2.5">
            <label className="text-xs font-black uppercase tracking-wider text-[#7969B5] flex items-center gap-2 font-heading">
              <Type className="w-4 h-4" /> Text Size Scale
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {(
                [
                  { id: 'normal', label: 'Default', sample: '100% (A)' },
                  { id: 'large', label: 'Large Text', sample: '118% (A+)' },
                  { id: 'extra-large', label: 'Extra Large', sample: '135% (A++)' }
                ] as const
              ).map((size) => (
                <button
                  key={size.id}
                  onClick={() => setTextSize(size.id)}
                  className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center transition-all ${
                    textSize === size.id
                      ? 'border-[#7969B5] bg-[#E9E3FF]/70 text-[#55428F] font-bold shadow-xs'
                      : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                  }`}
                  aria-pressed={textSize === size.id}
                >
                  <span className="text-xs font-black">{size.label}</span>
                  <span className="text-[11px] font-semibold opacity-75 mt-0.5">
                    {size.sample}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. HIGH CONTRAST MODE */}
          <div className="p-4 rounded-2xl border-2 border-gray-200 bg-gray-50 flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center shrink-0 mt-0.5">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold font-heading text-[#34354A]">
                  High Contrast Mode (WCAG AAA)
                </h3>
                <p className="text-xs text-[#575973] font-body mt-0.5 leading-relaxed">
                  Deep black text on solid pure-white backgrounds with bold outlines for enhanced clarity.
                </p>
              </div>
            </div>
            <button
              onClick={toggleHighContrast}
              role="switch"
              aria-checked={highContrast}
              className={`w-14 h-8 rounded-full p-1 transition-colors shrink-0 flex items-center ${
                highContrast ? 'bg-black justify-end' : 'bg-gray-300 justify-start'
              }`}
              aria-label="Toggle High Contrast Mode"
            >
              <span className="w-6 h-6 rounded-full bg-white shadow-md block" />
            </button>
          </div>

          {/* 3. REDUCED MOTION */}
          <div className="p-4 rounded-2xl border-2 border-gray-200 bg-gray-50 flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#2B6EB5] text-white flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold font-heading text-[#34354A]">
                  Reduced Motion & Visual Calming
                </h3>
                <p className="text-xs text-[#575973] font-body mt-0.5 leading-relaxed">
                  Halts ambient animations, bouncing icons, and pulsing transitions for vestibular comfort.
                </p>
              </div>
            </div>
            <button
              onClick={toggleReducedMotion}
              role="switch"
              aria-checked={reducedMotion}
              className={`w-14 h-8 rounded-full p-1 transition-colors shrink-0 flex items-center ${
                reducedMotion ? 'bg-[#2B6EB5] justify-end' : 'bg-gray-300 justify-start'
              }`}
              aria-label="Toggle Reduced Motion"
            >
              <span className="w-6 h-6 rounded-full bg-white shadow-md block" />
            </button>
          </div>

          {/* 4. LARGE TOUCH TARGETS */}
          <div className="p-4 rounded-2xl border-2 border-gray-200 bg-gray-50 flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#2B8756] text-white flex items-center justify-center shrink-0 mt-0.5">
                <MousePointer className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold font-heading text-[#34354A]">
                  Extra-Large Touch Targets
                </h3>
                <p className="text-xs text-[#575973] font-body mt-0.5 leading-relaxed">
                  Guarantees buttons and links are at least 48px high, making tapping effortless on tablets and phones.
                </p>
              </div>
            </div>
            <button
              onClick={toggleLargeTouchTargets}
              role="switch"
              aria-checked={largeTouchTargets}
              className={`w-14 h-8 rounded-full p-1 transition-colors shrink-0 flex items-center ${
                largeTouchTargets ? 'bg-[#2B8756] justify-end' : 'bg-gray-300 justify-start'
              }`}
              aria-label="Toggle Extra-Large Touch Targets"
            >
              <span className="w-6 h-6 rounded-full bg-white shadow-md block" />
            </button>
          </div>

          {/* 5. SIMPLIFIED SENIOR NAVIGATION */}
          <div className="p-4 rounded-2xl border-2 border-gray-200 bg-gray-50 flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#B85820] text-white flex items-center justify-center shrink-0 mt-0.5">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold font-heading text-[#34354A]">
                  Simplified Senior View
                </h3>
                <p className="text-xs text-[#575973] font-body mt-0.5 leading-relaxed">
                  Streamlines screens to essential buttons with plain wording: "Take Medicine", "Call Doctor", "Help SOS".
                </p>
              </div>
            </div>
            <button
              onClick={toggleSimplifiedNavigation}
              role="switch"
              aria-checked={simplifiedNavigation}
              className={`w-14 h-8 rounded-full p-1 transition-colors shrink-0 flex items-center ${
                simplifiedNavigation ? 'bg-[#B85820] justify-end' : 'bg-gray-300 justify-start'
              }`}
              aria-label="Toggle Simplified Senior Navigation"
            >
              <span className="w-6 h-6 rounded-full bg-white shadow-md block" />
            </button>
          </div>

          {/* 6. KEYBOARD NAVIGATION SHORTCUTS */}
          <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 flex items-start gap-3 text-xs text-[#4A4B65]">
            <Keyboard className="w-5 h-5 text-[#7969B5] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold font-heading text-[#34354A] block">
                Keyboard Shortcuts & Navigation
              </span>
              <p>• Press <kbd className="px-1.5 py-0.5 bg-white border rounded font-mono font-bold text-[10px]">Alt + A</kbd> anywhere to open or close this accessibility panel.</p>
              <p>• Use <kbd className="px-1.5 py-0.5 bg-white border rounded font-mono font-bold text-[10px]">Tab</kbd> and <kbd className="px-1.5 py-0.5 bg-white border rounded font-mono font-bold text-[10px]">Shift + Tab</kbd> to move through buttons with distinct focus rings.</p>
              <p>• Press <kbd className="px-1.5 py-0.5 bg-white border rounded font-mono font-bold text-[10px]">Esc</kbd> to close any open modal.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between shrink-0">
          <button
            onClick={resetDefaults}
            className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-gray-900 px-3 py-2 rounded-xl hover:bg-gray-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset to Defaults
          </button>
          <button
            onClick={closeSettings}
            className="px-5 py-2.5 bg-[#7969B5] hover:bg-[#55428F] text-white text-xs font-bold rounded-2xl shadow-xs transition-colors"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};

