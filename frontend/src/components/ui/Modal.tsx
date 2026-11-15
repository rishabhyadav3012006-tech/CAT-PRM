import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { modalScale, backdropFade } from '../../design-system/animations.ts';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

const maxWidthMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Frosted Backdrop */}
          <motion.div
            variants={backdropFade}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
            className="fixed inset-0 bg-[#34354A]/35 backdrop-blur-md"
          />

          {/* Frosted Glass Dialog */}
          <motion.div
            variants={modalScale}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`
              relative w-full ${maxWidthMap[maxWidth]}
              bg-white/95 backdrop-blur-glass
              border-2 border-white/90
              rounded-3xl shadow-glass-lg
              z-10 overflow-hidden my-8
            `}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-[#E9E3FF]/70 bg-gradient-to-r from-[#FAF9FF] to-[#E9E3FF]/30">
              <div className="flex items-center gap-3">
                {icon && (
                  <div className="w-10 h-10 rounded-2xl bg-[#E9E3FF] text-[#7969B5] flex items-center justify-center font-bold shadow-xs">
                    {icon}
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-extrabold font-heading text-[#34354A] tracking-tight">
                    {title}
                  </h3>
                  {subtitle && (
                    <p className="text-xs font-medium font-body text-[#7A7D9D] mt-0.5">
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>

              {/* Large accessible close button */}
              <button
                onClick={onClose}
                className="w-11 h-11 rounded-2xl text-[#7A7D9D] hover:text-[#34354A] hover:bg-[#E9E3FF]/60 flex items-center justify-center transition-colors focus:outline-none"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 sm:p-8 max-h-[calc(85vh-8rem)] overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

