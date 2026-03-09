import React from 'react';
import { TagIcon } from '@heroicons/react/24/outline';

const KeyTopics = ({ topics }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <TagIcon className="h-5 w-5 text-primary-800" />
        Key Topics
      </h2>
      <div className="flex flex-wrap gap-2">
        {topics?.map((topic, index) => (
          <span 
            key={index}
            className="px-3 py-1.5 bg-primary-50 text-primary-800 text-sm rounded-lg"
          >
            {topic}
          </span>
        ))}
      </div>
    </div>
  );
};

export default KeyTopics;