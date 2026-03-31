import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { CloudArrowUpIcon, MusicalNoteIcon, XMarkIcon, DocumentIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const FileUploader = ({ onFileSelect }) => {
  const [selectedFile, setSelectedFile] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.flac', '.wma'],
      'video/*': ['.mp4', '.mkv', '.avi', '.mov']
    },
    maxSize: 500 * 1024 * 1024,
    multiple: false
  });

  const removeFile = (e) => {
    e.stopPropagation();
    setSelectedFile(null);
    onFileSelect(null);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const isVideo = selectedFile?.type.startsWith('video');

  return (
    <div className="w-full">
      {!selectedFile ? (
        <motion.div
           whileHover={{ scale: 1.01 }}
           whileTap={{ scale: 0.99 }}
          {...getRootProps()}
          className={`
            relative overflow-hidden rounded-3xl border-2 border-dashed p-10 md:p-14
            transition-all duration-300 cursor-pointer glass-card
            ${isDragActive 
              ? 'border-brand-400 bg-brand-50/50 shadow-[0_0_30px_rgba(99,102,241,0.2)]' 
              : 'border-surface-300 hover:border-brand-300 hover:bg-white/40'
            }
          `}
        >
          <input {...getInputProps()} />
          <div className="relative z-10 text-center flex flex-col items-center">
            <motion.div 
              animate={{ y: isDragActive ? [0, -10, 0] : 0 }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className={`p-5 rounded-3xl mb-6 shadow-inner transition-colors duration-300 ${isDragActive ? 'bg-brand-100 text-brand-600' : 'bg-surface-100/80 text-slate-800 dark:text-white/90'}`}
            >
              <CloudArrowUpIcon className="h-10 w-10 md:h-12 md:w-12" />
            </motion.div>
            
            <h3 className="text-2xl md:text-3xl font-bold font-display text-surface-900 tracking-tight mb-3">
              {isDragActive ? 'Drop file here' : 'Drag & Drop your lecture'}
            </h3>
            <p className="text-slate-800 dark:text-white/90 font-medium mb-8 max-w-sm mx-auto">
              Choose an audio or video file, or drag it here directly. <span className="text-brand-600 font-bold hover:underline">Browse files</span>
            </p>
            
            <div className="flex flex-wrap justify-center gap-2">
              <span className="px-3.5 py-1.5 bg-brand-50/80 border border-brand-100 text-brand-700 rounded-xl text-xs font-bold uppercase tracking-wide">
                Audio (MP3, WAV)
              </span>
              <span className="px-3.5 py-1.5 bg-accent-50/80 border border-accent-100 text-accent-700 rounded-xl text-xs font-bold uppercase tracking-wide">
                Video (MP4, MKV)
              </span>
              <span className="px-3.5 py-1.5 bg-surface-100 border border-surface-200 text-surface-600 rounded-xl text-xs font-bold uppercase tracking-wide">
                Max 500MB
              </span>
            </div>
          </div>
          
          {/* Subtle background glow effect */}
          {isDragActive && (
             <div className="absolute inset-0 bg-gradient-to-tr from-brand-500/10 to-accent-500/10 z-0 pointer-events-none" />
          )}
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card rounded-3xl p-6 border-brand-200 shadow-md relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-brand-400 to-accent-400 opacity-5 rounded-bl-[100px] z-0" />
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 relative z-10">
            <div className={`p-4 rounded-2xl shadow-inner ${isVideo ? 'bg-accent-100 text-accent-600' : 'bg-brand-100 text-brand-600'}`}>
              {isVideo ? <DocumentIcon className="h-8 w-8" /> : <MusicalNoteIcon className="h-8 w-8" />}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-lg font-bold font-display text-surface-900 mb-1.5 truncate pr-8">
                {selectedFile.name}
              </h4>
              <div className="flex flex-wrap items-center gap-3 text-sm font-semibold">
                <span className="text-slate-800 dark:text-white/90">
                  {formatFileSize(selectedFile.size)}
                </span>
                <span className="w-1.5 h-1.5 bg-surface-300 rounded-full"></span>
                <span className="text-surface-600 border border-surface-200 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/50">
                  {isVideo ? 'Video Lecture' : 'Audio Lecture'}
                </span>
                <span className={`px-2 py-0.5 rounded-md text-xs tracking-wider uppercase ${isVideo ? 'bg-accent-50 text-accent-700 border border-accent-100' : 'bg-brand-50 text-brand-700 border border-brand-100'}`}>
                  {selectedFile.name.split('.').pop()}
                </span>
              </div>
            </div>
            <button
              onClick={removeFile}
              className="absolute sm:relative top-2 right-2 sm:top-auto sm:right-auto p-2.5 bg-white hover:bg-red-50 rounded-xl transition-colors duration-200 shadow-sm border border-surface-200 hover:border-red-200 group-hover:shadow group-hover:-translate-y-0.5"
              title="Remove file"
            >
              <XMarkIcon className="h-5 w-5 text-slate-800 dark:text-white/90 hover:text-red-500 transition-colors" />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default FileUploader;