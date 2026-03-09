import React from 'react';
import { ClockIcon } from '@heroicons/react/24/outline';

const SummaryCard = ({ summary, onClick }) => {
  return (
    <div 
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all cursor-pointer overflow-hidden"
      onClick={onClick}
    >
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
          {summary.title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {summary.preview}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {summary.topics.slice(0, 3).map((topic, index) => (
            <span 
              key={index}
              className="px-2 py-1 bg-primary-50 text-primary-800 text-xs rounded-full"
            >
              {topic}
            </span>
          ))}
          {summary.topics.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              +{summary.topics.length - 3}
            </span>
          )}
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">{summary.date}</span>
          <span className="flex items-center text-gray-500">
            <ClockIcon className="h-4 w-4 mr-1" />
            {summary.duration}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;