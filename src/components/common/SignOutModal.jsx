import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRightOnRectangleIcon, XMarkIcon } from '@heroicons/react/24/outline';

const SignOutModal = ({ isOpen, onCancel, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-100 dark:bg-[#05050A]/80 backdrop-blur-xl"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.92, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, y: 20, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.15 }}
            className="relative w-full max-w-sm bg-white dark:bg-[#0B0C10]/95 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-[0_0_60px_rgba(244,63,94,0.15)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Glow accents */}
            <div className="absolute top-0 -left-10 w-32 h-32 bg-rose-500/15 rounded-full blur-[50px] pointer-events-none" />
            <div className="absolute bottom-0 -right-10 w-32 h-32 bg-rose-500/10 rounded-full blur-[50px] pointer-events-none" />

            <div className="relative p-8 text-center">
              {/* Close button */}
              <button
                onClick={onCancel}
                className="absolute top-4 right-4 p-1.5 text-slate-500 dark:text-white/50 hover:text-slate-900 dark:text-white hover:bg-slate-200 dark:bg-white/10 rounded-full transition-all"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>

              {/* Icon */}
              <div className="inline-flex items-center justify-center w-14 h-14 bg-rose-500/15 border border-rose-500/30 rounded-2xl mb-5 shadow-[0_0_20px_rgba(244,63,94,0.2)]">
                <ArrowRightOnRectangleIcon className="h-7 w-7 text-rose-400" />
              </div>

              {/* Text */}
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
                Sign Out?
              </h3>
              <p className="text-sm text-slate-600 dark:text-white/70 mb-8 font-medium leading-relaxed max-w-xs mx-auto">
                Are you sure you want to sign out of your account? You'll need to sign in again to access your data.
              </p>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onCancel}
                  className="flex-1 px-5 py-3 text-sm font-bold text-slate-800 dark:text-white/90 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-200 dark:bg-white/10 hover:text-slate-900 dark:text-white transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  className="flex-1 px-5 py-3 text-sm font-bold text-slate-900 dark:text-white bg-rose-500/80 hover:bg-rose-500 border border-rose-400/50 rounded-xl shadow-[0_0_15px_rgba(244,63,94,0.3)] hover:shadow-[0_0_25px_rgba(244,63,94,0.4)] transition-all duration-200"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SignOutModal;
