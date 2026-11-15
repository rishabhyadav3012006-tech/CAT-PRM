import React from 'react';
import { motion } from 'framer-motion';

export const AuthIllustration: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative w-full max-w-md mx-auto aspect-square flex items-center justify-center select-none ${className}`}>
      {/* Background Soft Glow Orbs */}
      <motion.div
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.6, 0.8, 0.6],
        }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute w-72 h-72 rounded-full bg-gradient-to-tr from-[#E9E3FF] via-[#DFEEFF] to-[#DDF5E9] blur-3xl -z-10"
      />

      <motion.div
        animate={{
          scale: [1, 1.12, 1],
          x: [0, 10, 0],
          y: [0, -10, 0],
        }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute w-56 h-56 rounded-full bg-gradient-to-br from-[#FFE9DC] via-[#FCE4ED] to-[#E9E3FF] blur-2xl -z-10 -bottom-4 -right-4 opacity-70"
      />

      {/* SVG Healthcare Scene */}
      <svg
        viewBox="0 0 500 500"
        className="w-full h-full drop-shadow-xl"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7969B5" />
            <stop offset="100%" stopColor="#9B8BD6" />
          </linearGradient>
          <linearGradient id="mintGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#48BB78" />
            <stop offset="100%" stopColor="#68D391" />
          </linearGradient>
          <linearGradient id="peachGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F6AD55" />
            <stop offset="100%" stopColor="#FBD38D" />
          </linearGradient>
          <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#F8F6FF" stopOpacity="0.9" />
          </linearGradient>
          <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#7969B5" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* Outer Circular Frosted Boundary */}
        <circle cx="250" cy="250" r="210" fill="url(#cardGrad)" stroke="#E5E4F2" strokeWidth="2.5" />
        <circle cx="250" cy="250" r="185" fill="#FAF9FF" fillOpacity="0.6" stroke="#ECEBF8" strokeWidth="1.5" strokeDasharray="6 6" />

        {/* Central Floating Healthcare Tablet / Dashboard Card */}
        <g filter="url(#softShadow)">
          <rect x="110" y="100" width="280" height="300" rx="36" fill="white" stroke="#E5E4F2" strokeWidth="2" />
          
          {/* Header Bar */}
          <rect x="135" y="130" width="80" height="12" rx="6" fill="#E9E3FF" />
          <circle cx="360" cy="136" r="8" fill="#DDF5E9" />
          <circle cx="338" cy="136" r="8" fill="#FFE9DC" />
          <circle cx="316" cy="136" r="8" fill="#FCE4ED" />

          {/* Vitals Line Chart */}
          <rect x="135" y="160" width="230" height="74" rx="20" fill="#FAF9FF" stroke="#ECEBF8" strokeWidth="1.5" />
          <path
            d="M 150 200 L 180 200 L 195 180 L 210 215 L 225 170 L 240 205 L 255 195 L 275 200 L 350 200"
            fill="none"
            stroke="url(#purpleGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="225" cy="170" r="5" fill="#7969B5" />
          <circle cx="225" cy="170" r="8" fill="#7969B5" fillOpacity="0.25" />

          {/* Daily Schedule Card Preview */}
          <g>
            <rect x="135" y="250" width="230" height="58" rx="18" fill="#F3F0FF" />
            <circle cx="165" cy="279" r="16" fill="url(#purpleGrad)" />
            {/* Pill Icon in Circle */}
            <path d="M 160 274 L 170 284" stroke="white" strokeWidth="3" strokeLinecap="round" />
            <rect x="192" y="268" width="105" height="10" rx="5" fill="#34354A" />
            <rect x="192" y="284" width="65" height="8" rx="4" fill="#7A7D9D" />
            {/* Checkmark Badge */}
            <circle cx="338" cy="279" r="12" fill="#DDF5E9" />
            <path d="M 333 279 L 336 282 L 343 275" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </g>

          {/* Appointment / Activity Bar */}
          <g>
            <rect x="135" y="322" width="230" height="52" rx="18" fill="#F0FDF4" />
            <circle cx="165" cy="348" r="16" fill="#DDF5E9" />
            <circle cx="165" cy="348" r="8" fill="#22C55E" />
            <rect x="192" y="338" width="95" height="10" rx="5" fill="#34354A" />
            <rect x="192" y="354" width="75" height="8" rx="4" fill="#7A7D9D" />
            <circle cx="338" cy="348" r="8" fill="#BEE3F8" />
          </g>
        </g>

        {/* Floating Heart & Stethoscope Badge Top Right */}
        <motion.g
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          filter="url(#softShadow)"
        >
          <rect x="340" y="60" width="100" height="70" rx="24" fill="white" stroke="#E5E4F2" strokeWidth="1.5" />
          <circle cx="372" cy="95" r="18" fill="#FCE4ED" />
          {/* Heart SVG */}
          <path
            d="M 372 101 C 372 101 364 96 364 91 C 364 88 366.5 86 369.5 86 C 371 86 372 87.5 372 87.5 C 372 87.5 373 86 374.5 86 C 377.5 86 380 88 380 91 C 380 96 372 101 372 101 Z"
            fill="#E53E3E"
          />
          <rect x="398" y="87" width="26" height="8" rx="4" fill="#34354A" />
          <rect x="398" y="99" width="18" height="6" rx="3" fill="#22C55E" />
        </motion.g>

        {/* Floating Medication Reminder Badge Bottom Left */}
        <motion.g
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          filter="url(#softShadow)"
        >
          <rect x="45" y="270" width="125" height="75" rx="24" fill="white" stroke="#E5E4F2" strokeWidth="1.5" />
          <circle cx="78" cy="307" r="18" fill="#FFE9DC" />
          {/* Pill Outline */}
          <rect x="71" y="300" width="14" height="14" rx="7" fill="#F6AD55" />
          <rect x="104" y="298" width="48" height="8" rx="4" fill="#34354A" />
          <rect x="104" y="310" width="34" height="6" rx="3" fill="#7A7D9D" />
        </motion.g>

        {/* Floating Family Member Avatar Circle Top Left */}
        <motion.g
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          filter="url(#softShadow)"
        >
          <circle cx="95" cy="115" r="32" fill="white" stroke="#E5E4F2" strokeWidth="2" />
          <circle cx="95" cy="115" r="26" fill="#E9E3FF" />
          {/* Cute Smile / Avatar */}
          <circle cx="95" cy="108" r="8" fill="#7969B5" />
          <path d="M 85 127 C 85 120 90 118 95 118 C 100 118 105 120 105 127 Z" fill="#7969B5" />
          {/* Green Online Dot */}
          <circle cx="116" cy="128" r="6" fill="#22C55E" stroke="white" strokeWidth="2" />
        </motion.g>
      </svg>
    </div>
  );
};

