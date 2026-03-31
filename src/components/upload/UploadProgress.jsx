import React from 'react';
import { CloudArrowUpIcon, CheckCircleIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const UploadProgress = ({ progress }) => {
  const isComplete = progress === 100;

  return (
    <div className="glass-card rounded-3xl border border-surface-200 overflow-hidden shadow-md">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-4">
            <div className={`
              p-3 rounded-2xl transition-all duration-500 shadow-inner
              ${isComplete ? 'bg-emerald-100 text-emerald-600' : 'bg-brand-100 text-brand-600 animate-pulse'}
            `}>
              {isComplete ? (
                <CheckCircleIcon className="h-6 w-6" />
              ) : (
                <CloudArrowUpIcon className="h-6 w-6" />
              )}
            </div>
            <div>
              <h4 className="text-lg font-bold font-display text-surface-900 tracking-tight">
                {isComplete ? 'Upload Complete!' : 'Uploading your lecture...'}
              </h4>
              <p className="text-sm font-medium text-slate-800 dark:text-white/90">
                {isComplete 
                  ? 'Redirection to summary will begin shortly' 
                  : 'Please do not close this window'
                }
              </p>
            </div>
          </div>
          <span className="text-3xl font-bold font-display tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-accent-600">
            {progress}%
          </span>
        </div>

        {/* Progress Bar Container */}
        <div className="relative h-4 bg-surface-100/80 rounded-full overflow-hidden border border-surface-200 shadow-inner">
          <motion.div 
            className={`
              absolute top-0 left-0 h-full rounded-full
              ${isComplete 
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400' 
                : 'bg-gradient-to-r from-brand-500 to-accent-500'
              }
            `}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {/* Animated Shine Effect */}
            {!isComplete && (
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
            )}
          </motion.div>
        </div>

        {/* Status Messages */}
        <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-surface-200/50 pt-4">
          <span className="text-xs font-bold text-slate-800 dark:text-white/90 flex items-center gap-1.5 uppercase tracking-wider">
            <LockClosedIcon className="h-3.5 w-3.5" /> End-to-end encrypted
          </span>
          {!isComplete && (
            <span className="flex items-center gap-2 text-sm font-bold text-brand-600">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-500"></span>
              </span>
              Processing file chunks...
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadProgress;