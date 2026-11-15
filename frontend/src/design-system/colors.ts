/**
 * CareNest Visual Design System — Color Tokens
 * Premium, friendly, modern, cute and calming palette
 */

export const colors = {
  // Specified Soft Pastel Colors
  pastel: {
    lavender: '#E9E3FF',
    mint: '#DDF5E9',
    babyBlue: '#DFEEFF',
    peach: '#FFE9DC',
    cream: '#FFF9ED',
    pink: '#FCE4ED',
  },

  // Primary Purple & Tonal Scales
  primary: {
    purple: '#7969B5',
    dark: '#554391',
    light: '#9E8EE4',
    soft: '#E9E3FF',
  },

  // High-Contrast Accessible Main Text & Greys
  ink: {
    main: '#34354A',       // Main text (WCAG AAA contrast on light pastels)
    secondary: '#575973',  // Secondary labels
    muted: '#7A7D9D',      // Muted metadata
    light: '#A4A7C5',      // Icons & disabled
    border: '#E5E4F2',     // Subtle dividers
  },

  // Semantic Healthcare Accents (high-contrast text pairs on pastel backdrops)
  semantic: {
    success: {
      bg: '#DDF5E9',
      border: '#BFE7D2',
      text: '#1F6A42',
      badge: '#2B8756',
    },
    info: {
      bg: '#DFEEFF',
      border: '#C4E0FF',
      text: '#1B5494',
      badge: '#2B6EB5',
    },
    warning: {
      bg: '#FFE9DC',
      border: '#FFD3BC',
      text: '#8E3F10',
      badge: '#B85820',
    },
    danger: {
      bg: '#FCE4ED',
      border: '#F9BFD4',
      text: '#8F1E48',
      badge: '#B53364',
    },
    neutral: {
      bg: '#FFF9ED',
      border: '#F7ECCF',
      text: '#7A5B15',
      badge: '#997321',
    },
    brand: {
      bg: '#E9E3FF',
      border: '#D2C7FC',
      text: '#4B3C84',
      badge: '#7969B5',
    }
  }
} as const;

export type PastelColor = keyof typeof colors.pastel;

