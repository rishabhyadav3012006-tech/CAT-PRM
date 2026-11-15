import React from 'react';
import { motion } from 'framer-motion';

export const FloatingDecorations: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Ambient Large Blurred Gradient Orbs */}
      <motion.div
        animate={{
          scale: [1, 1.08, 1],
          x: [0, 15, 0],
          y: [0, -15, 0],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-[#E9E3FF]/70 to-[#DFEEFF]/60 blur-3xl opacity-75"
      />

      <motion.div
        animate={{
          scale: [1, 1.12, 1],
          x: [0, -20, 0],
          y: [0, 20, 0],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute top-1/4 -left-36 w-96 h-96 rounded-full bg-gradient-to-tr from-[#DDF5E9]/70 to-[#FFF9ED]/60 blur-3xl opacity-75"
      />

      <motion.div
        animate={{
          scale: [1, 1.06, 1],
          x: [0, 10, 0],
          y: [0, -10, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        className="absolute -bottom-36 right-1/4 w-[28rem] h-[28rem] rounded-full bg-gradient-to-tl from-[#FFE9DC]/60 via-[#FCE4ED]/60 to-[#E9E3FF]/50 blur-3xl opacity-65"
      />

      {/* Cute Floating Mini SVG Shapes */}
      {/* 1. Cute Pill Icon (Top Left) */}
      <motion.div
        animate={{
          y: [-8, 8, -8],
          rotate: [0, 6, 0],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="hidden lg:block absolute top-28 left-72 w-10 h-10 opacity-40 text-[#7969B5]"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/>
          <path d="m8.5 8.5 7 7"/>
        </svg>
      </motion.div>

      {/* 2. Cute Soft Heart (Top Right) */}
      <motion.div
        animate={{
          y: [6, -8, 6],
          rotate: [-4, 4, -4],
        }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="hidden xl:block absolute top-36 right-24 w-8 h-8 opacity-40 text-[#F43F5E]"
      >
        <svg viewBox="0 0 24 24" fill="#FCE4ED" stroke="#F43F5E" strokeWidth="1.75">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
        </svg>
      </motion.div>

      {/* 3. Cute Botanical Leaf (Bottom Left) */}
      <motion.div
        animate={{
          y: [-6, 6, -6],
          rotate: [0, -8, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="hidden lg:block absolute bottom-24 left-80 w-8 h-8 opacity-40 text-[#2B8756]"
      >
        <svg viewBox="0 0 24 24" fill="#DDF5E9" stroke="#2B8756" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 20A7 7 0 0 1 4 13C4 6 11 3 20 3c0 9-3 16-9 17Z"/>
          <path d="M4 21c2-3 4-6 7-8"/>
        </svg>
      </motion.div>

      {/* 4. Cute Sparkle / Star (Bottom Right) */}
      <motion.div
        animate={{
          scale: [0.9, 1.15, 0.9],
          rotate: [0, 15, 0],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
        className="hidden xl:block absolute bottom-36 right-80 w-6 h-6 opacity-40 text-[#7969B5]"
      >
        <svg viewBox="0 0 24 24" fill="#E9E3FF" stroke="#7969B5" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07l14.14-14.14"/>
        </svg>
      </motion.div>
    </div>
  );
};

