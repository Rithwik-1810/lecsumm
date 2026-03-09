import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { CloudArrowUpIcon, MusicalNoteIcon, XMarkIcon } from '@heroicons/react/24/outline';

const FileUploader = ({ onFileSelect }) => {
  const [selectedFile, setSelectedFile] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    console.log('FileUploader onDrop - acceptedFiles:', acceptedFiles);
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      console.log('FileUploader - file selected:', file.name);
      setSelectedFile(file);
      onFileSelect(file); // crucial: pass file to parent
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.flac', '.wma']
    },
    maxSize: 500 * 1024 * 1024,
    multiple: false
  });

  const removeFile = () => {
    setSelectedFile(null);
    onFileSelect(null);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="w-full">
      {!selectedFile ? (
        <div
          {...getRootProps()}
          className={`
            relative overflow-hidden rounded-2xl border-2 border-dashed p-12
            transition-all duration-300 cursor-pointer
            ${isDragActive 
              ? 'border-teal-500 bg-teal-50 scale-102 shadow-lg' 
              : 'border-gray-300 bg-white hover:border-teal-400 hover:bg-gray-50 hover:shadow-md'
            }
          `}
        >
          <input {...getInputProps()} />
          <div className="relative text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-r from-teal-500 to-purple-500 p-4 rounded-full">
                <CloudArrowUpIcon className="h-12 w-12 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              {isDragActive ? 'Drop to Upload' : 'Upload Your Audio Lecture'}
            </h3>
            <p className="text-gray-600 mb-6">
              <span className="font-medium text-teal-600">Click to browse</span> or drag and drop
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <span className="px-4 py-2 bg-teal-100 text-teal-700 rounded-full text-sm font-medium">
                MP3, WAV, M4A
              </span>
              <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                AAC, OGG, FLAC
              </span>
              <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                Up to 500MB
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-teal-50 to-purple-50 rounded-2xl p-6 border-2 border-teal-200 shadow-md">
          <div className="flex items-center gap-5">
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <MusicalNoteIcon className="h-8 w-8 text-teal-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-gray-800 mb-1 line-clamp-1">
                {selectedFile.name}
              </h4>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-600 font-medium">
                  {formatFileSize(selectedFile.size)}
                </span>
                <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                <span className="text-gray-600">Audio Lecture</span>
                <span className="px-2 py-0.5 bg-teal-100 text-teal-700 rounded-full text-xs">
                  {selectedFile.name.split('.').pop().toUpperCase()}
                </span>
              </div>
            </div>
            <button
              onClick={removeFile}
              className="p-3 hover:bg-white rounded-xl transition hover:shadow-md"
            >
              <XMarkIcon className="h-5 w-5 text-gray-500 hover:text-red-500" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;