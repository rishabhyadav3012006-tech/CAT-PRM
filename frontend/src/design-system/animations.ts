import { Variants, Transition } from 'framer-motion';

/**
 * Reusable animation presets for Framer Motion
 * Gentle, organic, calming micro-interactions tailored for elderly healthcare
 */

export const springGentle: Transition = {
  type: 'spring',
  damping: 24,
  stiffness: 260,
  mass: 0.8,
};

export const springBouncy: Transition = {
  type: 'spring',
  damping: 18,
  stiffness: 300,
};

// Gentle organic floating animation for cute background shapes & cards
export const floatingVariant = (yOffset: number = 10, duration: number = 4, delay: number = 0): Variants => ({
  initial: { y: 0 },
  animate: {
    y: [-yOffset, yOffset, -yOffset],
    transition: {
      duration,
      repeat: Infinity,
      ease: 'easeInOut',
      delay,
    },
  },
});

// Smooth page transition
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 12,
    scale: 0.99,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.35,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.2,
      ease: 'easeInOut',
    },
  },
};

// Card / Element fade & slide in
export const fadeSlideUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (custom: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: custom * 0.06,
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

// Modal spring pop-in
export const modalScale: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.92,
    y: 16,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 26,
      stiffness: 320,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.94,
    y: 10,
    transition: {
      duration: 0.2,
      ease: 'easeInOut',
    },
  },
};

// Backdrop fade
export const backdropFade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

// Stagger container for list items
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

// Button / Interactive Hover & Tap
export const buttonInteraction = {
  hover: {
    scale: 1.025,
    transition: { duration: 0.2, ease: 'easeOut' },
  },
  tap: {
    scale: 0.97,
    transition: { duration: 0.1, ease: 'easeIn' },
  },
};

