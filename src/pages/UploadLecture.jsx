import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUpload } from '../hooks/useUpload';
import FileUploader from '../components/upload/FileUploader';
import UploadOptions from '../components/upload/UploadOptions';
import UploadProgress from '../components/upload/UploadProgress';

const UploadLecture = () => {
  const navigate = useNavigate();
  const { uploadFile, uploading, progress } = useUpload();
  const [file, setFile] = useState(null);
  const [options, setOptions] = useState({
    language: 'english',
    extractTasks: true,
    generateSummary: true,
  });

  const handleFileSelect = (selectedFile) => {
    console.log('UploadLecture - handleFileSelect, file:', selectedFile);
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    console.log('UploadLecture - handleUpload, file:', file);
    if (!file) {
      alert('Please select a file first');
      return;
    }

    console.log('UploadLecture - calling uploadFile with options:', options);
    const result = await uploadFile(file, options);
    console.log('UploadLecture - result:', result);

    if (result.success && result.data) {
      const lectureId = result.data.id;
      console.log('UploadLecture - navigating to summary:', lectureId);
      navigate(`/summary/${lectureId}`);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent mb-2">
        Upload Lecture
      </h1>
      <p className="text-gray-500 mb-8">Upload your audio lecture and let AI do the rest</p>

      <div className="space-y-6">
        <FileUploader onFileSelect={handleFileSelect} />
        
        <UploadOptions options={options} setOptions={setOptions} />
        
        {uploading && <UploadProgress progress={progress} />}
        
        <div className="flex justify-end">
          <button
            onClick={handleUpload}
            disabled={uploading || !file}
            className={`
              px-8 py-3 rounded-lg font-semibold transition-all
              ${uploading || !file
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-teal-500 text-white hover:shadow-lg hover:scale-105'
              }
            `}
          >
            {uploading ? 'Uploading...' : 'Upload Lecture'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadLecture;