import React from 'react';

const TranscriptView = ({ transcript }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Full Transcript</h2>
      <div className="prose max-w-none max-h-96 overflow-y-auto">
        <p className="text-gray-700 whitespace-pre-line">{transcript}</p>
      </div>
    </div>
  );
};

export default TranscriptView;