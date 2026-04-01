import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUpload } from '../hooks/useUpload';
import { motion, AnimatePresence } from 'framer-motion';
import { SparklesIcon, MusicalNoteIcon, XMarkIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';

const LANGUAGES = ['English', 'Spanish', 'French', 'German'];

const Toggle = ({ checked, onChange, label, description }) => (
  <label className="flex items-start gap-4 cursor-pointer group">
    <button type="button" onClick={onChange}
      className={`relative mt-0.5 flex-shrink-0 rounded-full transition-colors duration-300 border ${checked ? 'bg-brand-500 border-brand-400 shadow-glow-brand' : 'bg-slate-200 dark:bg-surface-800 border-slate-200 dark:border-white/10'}`}
      style={{ width: 44, height: 24 }}
    >
      <span className={`absolute top-0.5 left-0.5 bg-white rounded-full shadow-sm transition-transform duration-300 ${checked ? 'translate-x-[20px]' : 'translate-x-0'}`}
        style={{ width: 18, height: 18 }}
      />
    </button>
    <div>
      <p className="text-base font-bold text-slate-900 dark:text-white group-hover:text-brand-300 transition-colors">{label}</p>
      <p className="text-sm text-slate-800 dark:text-white/90 mt-1 font-medium">{description}</p>
    </div>
  </label>
);

const UploadLecture = () => {
  const navigate = useNavigate();
  const { uploadFile, uploading, progress } = useUpload();
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);
  const [options, setOptions] = useState({ language: 'english', extractTasks: true, generateSummary: true });

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  };

  const fmt = (b) => b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`;

  const handleUpload = async () => {
    if (!file) return;
    const res = await uploadFile(file, options);
    if (res.success && res.data) navigate(`/summary/${res.data.id}`);
  };

  return (
    <div className="w-full">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <p className="text-xs font-semibold tracking-widest text-brand-400 uppercase mb-2">Upload</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Upload Lecture</h1>
          <p className="text-slate-800 dark:text-white/90 text-base sm:text-lg mt-3 max-w-xl leading-relaxed">
            Upload audio or video files. Our AI will automatically transcribe and summarize them for you.
          </p>
        </motion.div>

        {/* Drop Zone */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.08 }}>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => !file && inputRef.current?.click()}
            className={`relative rounded-[1.5rem] border-2 border-dashed transition-all duration-300 overflow-hidden backdrop-blur-md ${
              dragging ? 'border-brand-400 bg-brand-500/10 scale-[1.02] shadow-glow-brand'
                : file ? 'border-brand-500/30 bg-slate-100 dark:bg-white/5 cursor-default shadow-glass-inset'
                  : 'border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 hover:border-brand-500/50 hover:bg-brand-500/5 cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.02)] hover:shadow-glow-brand'
              }`}
          >
            <input ref={inputRef} type="file" accept="audio/*,video/*" className="hidden" onChange={e => setFile(e.target.files[0])} />
            <AnimatePresence mode="wait">
              {!file ? (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-16 px-8 gap-5 text-center"
                >
                  <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center border border-slate-200 dark:border-white/10 shadow-glass-inset group-hover:scale-110 transition-transform">
                    <ArrowUpTrayIcon className="w-7 h-7 text-brand-400" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-slate-900 dark:text-white tracking-wide">Drop your files here</p>
                    <p className="text-lg text-slate-800 dark:text-white/90 mt-1 font-medium">or <span className="text-brand-400 font-bold hover:text-brand-300 transition-colors">browse files</span></p>
                  </div>
                  <div className="flex gap-2.5 flex-wrap justify-center mt-2">
                    {['MP4', 'MP3', 'WAV', 'MOV', 'M4A'].map(ext => (
                      <span key={ext} className="text-sm font-mono font-bold tracking-wider px-3 py-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white/90 rounded-lg">{ext}</span>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div key="file" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-6 p-8"
                >
                  <div className="w-14 h-14 bg-brand-500/20 border border-brand-500/30 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-glow-brand">
                    <MusicalNoteIcon className="w-6 h-6 text-brand-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{file.name}</p>
                    <p className="text-xs text-brand-300 mt-1 font-medium">{fmt(file.size)}</p>
                    <div className="mt-3 h-1.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden border border-slate-200 dark:border-white/5 relative">
                      <motion.div className="absolute top-0 left-0 h-full rounded-full stripe-gradient-bg shadow-glow-brand" initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 0.8, ease: "easeOut" }} />
                    </div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    className="p-3 text-slate-800 dark:text-white/90 hover:text-rose-400 hover:bg-rose-500/10 rounded-2xl transition-all"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Options */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.14 }}
          className="glass-card-ai p-8 space-y-10"
        >
          <p className="text-xs font-bold uppercase tracking-widest text-slate-800 dark:text-white/90">Summary Options</p>

          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-800 dark:text-white/90">Processing Language</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {LANGUAGES.map(lang => (
                <button key={lang} onClick={() => setOptions(o => ({ ...o, language: lang.toLowerCase() }))}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all duration-300 ${options.language === lang.toLowerCase()
                    ? 'bg-brand-500/20 border-brand-400 text-brand-300 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                    : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-800 dark:text-white/90 hover:border-brand-500/30 hover:text-brand-400'
                    }`}
                >{lang}</button>
              ))}
            </div>
          </div>

          <div className="h-px bg-slate-200 dark:bg-white/10" />

          <div className="space-y-5">
            <Toggle checked={options.generateSummary} onChange={() => setOptions(o => ({ ...o, generateSummary: !o.generateSummary }))}
              label="Generate Summary" description="Create a clear, easy-to-read summary of your lecture"
            />
            <Toggle checked={options.extractTasks} onChange={() => setOptions(o => ({ ...o, extractTasks: !o.extractTasks }))}
              label="Extract Tasks" description="Auto-detect assignments, requirements, and deadlines"
            />
          </div>
        </motion.div>

        {/* Progress bar */}
        <AnimatePresence>
          {uploading && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="glass-card-ai border-brand-500/30 shadow-glow-brand p-8 space-y-5">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <SparklesIcon className="w-4 h-4 text-brand-400 animate-pulse" /> Processing your file...
                  </span>
                  <span className="text-xs font-bold text-brand-400 bg-brand-500/10 px-2 py-1 rounded-md border border-brand-500/20">{progress}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden border border-slate-200 dark:border-white/5 relative">
                  <motion.div className="absolute top-0 left-0 h-full rounded-full stripe-gradient-bg shadow-glow-brand" style={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
                </div>
                <p className="text-[10px] uppercase tracking-widest text-slate-800 dark:text-white/90 font-bold">Uploading · Transcribing · Summarizing</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
          <div className="relative group">
            {/* Animated glow ring behind button — only when file is selected */}
            {file && !uploading && (
              <motion.div
                className="absolute -inset-1 rounded-[1.25rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-lg"
                style={{ background: 'linear-gradient(135deg, #06b6d4, #8b5cf6, #06b6d4)' }}
                animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              />
            )}
            {/* Pulsing ring when ready */}
            {file && !uploading && (
              <motion.div
                className="absolute -inset-0.5 rounded-[1.25rem] blur-sm"
                style={{ background: 'linear-gradient(135deg, #06b6d4, #8b5cf6, #06b6d4)' }}
                animate={{ opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}
            <button onClick={handleUpload} disabled={uploading || !file}
              className={`relative w-full py-5 rounded-[1rem] font-bold text-[15px] tracking-wide flex items-center justify-center gap-3 transition-all duration-300 overflow-hidden ${!file || uploading
                ? 'bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-slate-400 dark:text-white/30 cursor-not-allowed'
                : 'bg-gradient-to-r from-brand-500 via-purple-500 to-brand-500 text-white shadow-[0_0_30px_rgba(6,182,212,0.4),0_0_60px_rgba(139,92,246,0.2)] hover:shadow-[0_0_40px_rgba(6,182,212,0.6),0_0_80px_rgba(139,92,246,0.3)] hover:scale-[1.02] active:scale-[0.98] border border-white/20'
                }`}
              style={file && !uploading ? { backgroundSize: '200% auto' } : {}}
            >
              {/* Shimmer sweep effect on hover */}
              {file && !uploading && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                  initial={{ x: '-100%' }}
                  animate={{ x: '200%' }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
                />
              )}
              {uploading ? (
                <>
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Processing Data...</span>
                </>
              ) : (
                <>
                  <motion.div
                    animate={file ? { rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                  >
                    <SparklesIcon className="w-5 h-5" />
                  </motion.div>
                  <span>Start Upload</span>
                  {file && (
                    <motion.span
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="ml-1 text-white/70"
                    >→</motion.span>
                  )}
                </>
              )}
            </button>
          </div>
          {!file && (
            <p className="text-center text-[11px] uppercase tracking-[0.2em] text-slate-400 dark:text-white/30 mt-4 font-semibold">
              Select a file to begin
            </p>
          )}
          {file && !uploading && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-[11px] uppercase tracking-[0.2em] text-brand-400 mt-4 font-bold"
            >
              ✨ Ready to analyze your lecture
            </motion.p>
          )}
        </motion.div>

      </div>
    </div>
  );
};

export default UploadLecture;
