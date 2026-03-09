import React from 'react';
import { CheckCircleIcon, LanguageIcon, SparklesIcon, CalendarIcon } from '@heroicons/react/24/outline';

const UploadOptions = ({ options, setOptions }) => {
  const languages = [
    { value: 'english', label: '🇬🇧 English', flag: '🇬🇧' },
    { value: 'hindi', label: '🇮🇳 Hindi', flag: '🇮🇳' },
    { value: 'telugu', label: '🇮🇳 Telugu', flag: '🇮🇳' },
    { value: 'tamil', label: '🇮🇳 Tamil', flag: '🇮🇳' },
    { value: 'spanish', label: '🇪🇸 Spanish', flag: '🇪🇸' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-blue-500 to-teal-500 p-2 rounded-lg">
            <SparklesIcon className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Processing Options</h3>
        </div>
        <p className="text-sm text-gray-500 mt-1 ml-10">
          Customize how your lecture will be processed
        </p>
      </div>

      {/* Options */}
      <div className="p-6 space-y-6">
        {/* Extract Tasks Option */}
        <label className="group flex items-start gap-4 cursor-pointer p-4 rounded-xl hover:bg-gradient-to-r hover:from-orange-50 hover:to-transparent transition">
          <div className="relative">
            <input
              type="checkbox"
              checked={options.extractTasks}
              onChange={(e) => setOptions({ ...options, extractTasks: e.target.checked })}
              className="sr-only"
            />
            <div className={`
              w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all
              ${options.extractTasks 
                ? 'bg-gradient-to-r from-orange-500 to-red-500 border-orange-500 scale-110 shadow-md' 
                : 'border-gray-300 group-hover:border-orange-300'
              }
            `}>
              {options.extractTasks && <CheckCircleIcon className="h-4 w-4 text-white" />}
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CalendarIcon className="h-4 w-4 text-orange-500" />
              <span className="font-semibold text-gray-800 group-hover:text-orange-600 transition">
                Extract tasks and deadlines
              </span>
            </div>
            <p className="text-sm text-gray-500">
              Automatically identify assignments, quizzes, and due dates from your lecture
            </p>
          </div>
        </label>

        {/* Generate Summary Option */}
        <label className="group flex items-start gap-4 cursor-pointer p-4 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition">
          <div className="relative">
            <input
              type="checkbox"
              checked={options.generateSummary}
              onChange={(e) => setOptions({ ...options, generateSummary: e.target.checked })}
              className="sr-only"
            />
            <div className={`
              w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all
              ${options.generateSummary 
                ? 'bg-gradient-to-r from-blue-500 to-teal-500 border-blue-500 scale-110 shadow-md' 
                : 'border-gray-300 group-hover:border-blue-300'
              }
            `}>
              {options.generateSummary && <CheckCircleIcon className="h-4 w-4 text-white" />}
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <SparklesIcon className="h-4 w-4 text-blue-500" />
              <span className="font-semibold text-gray-800 group-hover:text-blue-600 transition">
                Generate lecture summary
              </span>
            </div>
            <p className="text-sm text-gray-500">
              Create a concise, easy-to-read summary of the key points from your lecture
            </p>
          </div>
        </label>

        {/* Language Selection */}
        <div className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <LanguageIcon className="h-5 w-5 text-purple-500" />
            <span className="font-semibold text-gray-800">Lecture Language</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {languages.map((lang) => (
              <button
                key={lang.value}
                onClick={() => setOptions({ ...options, language: lang.value })}
                className={`
                  px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all
                  ${options.language === lang.value
                    ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-md scale-105'
                    : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 text-gray-600'
                  }
                `}
              >
                <span className="mr-1">{lang.flag}</span>
                {lang.label.split(' ')[1]}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
            Select the primary language spoken in your lecture for better transcription accuracy
          </p>
        </div>
      </div>
    </div>
  );
};

export default UploadOptions;