// ==============================================================================
// CareNest Healthcare Platform - Universal Accessibility Context
// Large Text Scaling, High-Contrast AAA Mode, Reduced Motion, Large Touch Targets,
// Screen-Reader Live Region Announcements, and Simple Navigation for Seniors.
// ==============================================================================

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type TextSize = 'normal' | 'large' | 'extra-large';

export interface AccessibilitySettings {
  textSize: TextSize;
  highContrast: boolean;
  reducedMotion: boolean;
  screenReaderHints: boolean;
  largeTouchTargets: boolean;
  simplifiedNavigation: boolean;
}

interface AccessibilityContextType extends AccessibilitySettings {
  isSettingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
  toggleSettings: () => void;
  setTextSize: (size: TextSize) => void;
  setHighContrast: (enabled: boolean) => void;
  toggleHighContrast: () => void;
  setReducedMotion: (enabled: boolean) => void;
  toggleReducedMotion: () => void;
  toggleScreenReaderHints: () => void;
  toggleLargeTouchTargets: () => void;
  toggleSimplifiedNavigation: () => void;
  resetDefaults: () => void;
  announcement: string;
  announce: (message: string) => void;
}

const STORAGE_KEY = 'carenest_accessibility_prefs';

const defaultSettings: AccessibilitySettings = {
  textSize: 'normal',
  highContrast: false,
  reducedMotion: false,
  screenReaderHints: true,
  largeTouchTargets: true,
  simplifiedNavigation: false
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...defaultSettings, ...JSON.parse(stored) };
      }
    } catch {
      // Fallback
    }
    return defaultSettings;
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  const announce = useCallback((message: string) => {
    setAnnouncement(message);
    const timer = setTimeout(() => setAnnouncement(''), 4000);
    return () => clearTimeout(timer);
  }, []);

  // Synchronize CSS class modifiers to document.documentElement
  useEffect(() => {
    const root = document.documentElement;

    // 1. Text scale classes
    root.classList.remove('accessibility-text-lg', 'accessibility-text-xl');
    if (settings.textSize === 'large') {
      root.classList.add('accessibility-text-lg');
    } else if (settings.textSize === 'extra-large') {
      root.classList.add('accessibility-text-xl');
    }

    // 2. High contrast
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // 3. Reduced motion
    if (settings.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    // 4. Large touch targets
    if (settings.largeTouchTargets) {
      root.classList.add('large-touch-targets');
    } else {
      root.classList.remove('large-touch-targets');
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Ignore quota errors
    }
  }, [settings]);

  // Global Keyboard Navigation Shortcut (Alt + A toggles accessibility panel)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        setIsSettingsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const openSettings = () => setIsSettingsOpen(true);
  const closeSettings = () => setIsSettingsOpen(false);
  const toggleSettings = () => setIsSettingsOpen((prev) => !prev);

  const setTextSize = (textSize: TextSize) => {
    setSettings((prev) => ({ ...prev, textSize }));
    announce(`Text size set to ${textSize}`);
  };

  const setHighContrast = (highContrast: boolean) => {
    setSettings((prev) => ({ ...prev, highContrast }));
    announce(`High contrast mode ${highContrast ? 'enabled' : 'disabled'}`);
  };

  const toggleHighContrast = () => {
    setSettings((prev) => {
      const next = !prev.highContrast;
      announce(`High contrast mode ${next ? 'enabled' : 'disabled'}`);
      return { ...prev, highContrast: next };
    });
  };

  const setReducedMotion = (reducedMotion: boolean) => {
    setSettings((prev) => ({ ...prev, reducedMotion }));
    announce(`Reduced motion ${reducedMotion ? 'enabled' : 'disabled'}`);
  };

  const toggleReducedMotion = () => {
    setSettings((prev) => {
      const next = !prev.reducedMotion;
      announce(`Reduced motion ${next ? 'enabled' : 'disabled'}`);
      return { ...prev, reducedMotion: next };
    });
  };

  const toggleScreenReaderHints = () => {
    setSettings((prev) => {
      const next = !prev.screenReaderHints;
      announce(`Screen reader assistive hints ${next ? 'enabled' : 'disabled'}`);
      return { ...prev, screenReaderHints: next };
    });
  };

  const toggleLargeTouchTargets = () => {
    setSettings((prev) => {
      const next = !prev.largeTouchTargets;
      announce(`Large touch target buttons ${next ? 'enabled' : 'disabled'}`);
      return { ...prev, largeTouchTargets: next };
    });
  };

  const toggleSimplifiedNavigation = () => {
    setSettings((prev) => {
      const next = !prev.simplifiedNavigation;
      announce(`Simple senior navigation layout ${next ? 'enabled' : 'disabled'}`);
      return { ...prev, simplifiedNavigation: next };
    });
  };

  const resetDefaults = () => {
    setSettings(defaultSettings);
    announce('Accessibility preferences reset to default');
  };

  return (
    <AccessibilityContext.Provider
      value={{
        ...settings,
        isSettingsOpen,
        openSettings,
        closeSettings,
        toggleSettings,
        setTextSize,
        setHighContrast,
        toggleHighContrast,
        setReducedMotion,
        toggleReducedMotion,
        toggleScreenReaderHints,
        toggleLargeTouchTargets,
        toggleSimplifiedNavigation,
        resetDefaults,
        announcement,
        announce
      }}
    >
      {/* Universal Screen Reader Live Announcer Region */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        id="carenest-live-announcer"
      >
        {announcement}
      </div>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

