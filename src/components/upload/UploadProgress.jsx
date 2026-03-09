import React from 'react';
import { CloudArrowUpIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const UploadProgress = ({ progress }) => {
  const isComplete = progress === 100;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`
              p-2 rounded-lg transition-all duration-500
              ${isComplete ? 'bg-green-100' : 'bg-blue-100 animate-pulse'}
            `}>
              {isComplete ? (
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
              ) : (
                <CloudArrowUpIcon className="h-5 w-5 text-blue-600" />
              )}
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">
                {isComplete ? 'Upload Complete!' : 'Uploading your lecture...'}
              </h4>
              <p className="text-sm text-gray-500">
                {isComplete 
                  ? 'Processing will begin shortly' 
                  : 'Please wait while we upload your file'
                }
              </p>
            </div>
          </div>
          <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-600">
            {progress}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className={`
              absolute top-0 left-0 h-full rounded-full transition-all duration-500
              ${isComplete 
                ? 'bg-gradient-to-r from-green-500 to-teal-500' 
                : 'bg-gradient-to-r from-blue-500 to-teal-500'
              }
            `}
            style={{ width: `${progress}%` }}
          >
            {/* Shine Effect */}
            <div className="absolute top-0 right-0 w-20 h-full bg-white opacity-20 transform skew-x-30 animate-shine"></div>
          </div>
        </div>

        {/* Status Messages */}
        <div className="mt-4 text-xs text-gray-400 flex items-center justify-between">
          <span>🔒 End-to-end encrypted</span>
          {!isComplete && (
            <span className="flex items-center gap-1">
              <span className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></span>
              Uploading...
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadProgress;