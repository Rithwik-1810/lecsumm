import React from 'react';

const SummaryView = ({ summary }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Lecture Summary</h2>
      <div className="prose max-w-none">
        <p className="text-gray-700 leading-relaxed">{summary}</p>
      </div>
    </div>
  );
};

export default SummaryView;