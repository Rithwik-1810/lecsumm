import React from 'react';
import { CheckCircleIcon, LanguageIcon, SparklesIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const UploadOptions = ({ options, setOptions }) => {
  const languages = [
    { value: 'english', label: '🇬🇧 English', flag: '🇬🇧' },
    { value: 'hindi', label: '🇮🇳 Hindi', flag: '🇮🇳' },
    { value: 'telugu', label: '🇮🇳 Telugu', flag: '🇮🇳' },
    { value: 'tamil', label: '🇮🇳 Tamil', flag: '🇮🇳' },
    { value: 'spanish', label: '🇪🇸 Spanish', flag: '🇪🇸' },
  ];

  return (
    <div className="glass-card rounded-3xl border border-surface-200 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="bg-white/40 backdrop-blur-md px-6 py-5 border-b border-surface-200/50 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-brand-400 to-accent-500 p-2.5 rounded-xl shadow-inner">
            <SparklesIcon className="h-6 w-6 text-slate-900 dark:text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-display text-surface-900 tracking-tight">Processing Options</h3>
            <p className="text-sm font-medium text-slate-800 dark:text-white/90 mt-0.5">
              Customize how your lecture will be analyzed
            </p>
          </div>
        </div>
      </div>

      {/* Options */}
      <div className="p-6 space-y-4">
        {/* Extract Tasks Option */}
        <label className="group flex items-start gap-4 cursor-pointer p-4 rounded-2xl hover:bg-slate-100 dark:bg-white/50 border border-transparent hover:border-surface-200 transition-all duration-300">
          <div className="relative mt-0.5">
            <input
              type="checkbox"
              checked={options.extractTasks}
              onChange={(e) => setOptions({ ...options, extractTasks: e.target.checked })}
              className="sr-only"
            />
            <div className={`
              w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300
              ${options.extractTasks 
                ? 'bg-gradient-to-r from-accent-500 to-brand-500 border-transparent shadow-[0_0_15px_rgba(99,102,241,0.3)]' 
                : 'border-surface-300 bg-white group-hover:border-accent-400'
              }
            `}>
              <motion.div
                initial={false}
                animate={{ scale: options.extractTasks ? 1 : 0, opacity: options.extractTasks ? 1 : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <CheckCircleIcon className="h-4 w-4 text-slate-900 dark:text-white" />
              </motion.div>
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CalendarIcon className="h-5 w-5 text-accent-500" />
              <span className="font-bold text-surface-900 group-hover:text-accent-600 transition-colors">
                Extract tasks and deadlines
              </span>
            </div>
            <p className="text-sm font-medium text-slate-800 dark:text-white/90 leading-relaxed">
              Automatically identify assignments, quizzes, reading materials and due dates mentioned in this lecture.
            </p>
          </div>
        </label>

        {/* Generate Summary Option */}
        <label className="group flex items-start gap-4 cursor-pointer p-4 rounded-2xl hover:bg-slate-100 dark:bg-white/50 border border-transparent hover:border-surface-200 transition-all duration-300">
          <div className="relative mt-0.5">
            <input
              type="checkbox"
              checked={options.generateSummary}
              onChange={(e) => setOptions({ ...options, generateSummary: e.target.checked })}
              className="sr-only"
            />
            <div className={`
              w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300
              ${options.generateSummary 
                ? 'bg-gradient-to-r from-brand-500 to-accent-400 border-transparent shadow-[0_0_15px_rgba(99,102,241,0.3)]' 
                : 'border-surface-300 bg-white group-hover:border-brand-400'
              }
            `}>
              <motion.div
                initial={false}
                animate={{ scale: options.generateSummary ? 1 : 0, opacity: options.generateSummary ? 1 : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <CheckCircleIcon className="h-4 w-4 text-slate-900 dark:text-white" />
              </motion.div>
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <SparklesIcon className="h-5 w-5 text-brand-500" />
              <span className="font-bold text-surface-900 group-hover:text-brand-600 transition-colors">
                Generate lecture summary
              </span>
            </div>
            <p className="text-sm font-medium text-slate-800 dark:text-white/90 leading-relaxed">
              Create a concise, highly-readable study note containing all key concepts discussed during the lecture.
            </p>
          </div>
        </label>

        {/* Language Selection Spacer */}
        <div className="w-full h-px bg-surface-200/60 my-2"></div>

        {/* Language Selection */}
        <div className="p-5 bg-white/30 backdrop-blur-sm rounded-2xl border border-surface-200/50">
          <div className="flex items-center gap-2 mb-4">
            <LanguageIcon className="h-5 w-5 text-brand-600" />
            <span className="font-bold text-surface-900">Primary Spoken Language</span>
          </div>
          
          <div className="flex flex-wrap gap-2.5">
            {languages.map((lang) => (
              <button
                key={lang.value}
                onClick={() => setOptions({ ...options, language: lang.value })}
                className={`
                  px-4 py-2 rounded-xl text-sm font-bold tracking-wide transition-all duration-200
                  ${options.language === lang.value
                    ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-slate-900 dark:text-white shadow-md shadow-brand-500/20 scale-105 border border-transparent'
                    : 'bg-white text-surface-600 border border-surface-200 hover:border-brand-300 hover:text-brand-600 hover:shadow-sm'
                  }
                `}
              >
                <span className="mr-1.5">{lang.flag}</span>
                {lang.label.split(' ')[1]}
              </button>
            ))}
          </div>
          <div className="mt-4 flex items-start gap-2 text-xs font-semibold text-slate-800 dark:text-white/90 bg-surface-50/50 p-3 rounded-lg border border-surface-100">
            <span className="flex-shrink-0 mt-0.5 w-1.5 h-1.5 bg-brand-400 rounded-full"></span>
            <p>Selecting the correct language significantly improves transcription accuracy and ensures higher quality summaries.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadOptions;