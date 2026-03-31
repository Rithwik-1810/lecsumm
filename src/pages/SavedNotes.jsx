import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { summaryService } from '../services/summaryService';
import { lectureService } from '../services/lectureService';
import Loader from '../components/common/Loader';
import {
  BookmarkIcon as BookmarkSolid, CalendarIcon, DocumentTextIcon,
  Squares2X2Icon, ListBulletIcon, ArrowPathIcon, SparklesIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';

const SavedNotes = () => {
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => { fetchSavedSummaries(); }, []);

  const fetchSavedSummaries = async () => {
    setLoading(true);
    try {
      const all = await summaryService.getSummaries();
      const saved = all.filter(s => s.saved);
      const withTitles = await Promise.all(
        saved.map(async (s) => {
          if (s.lectureId) {
            try { const l = await lectureService.getLectureById(s.lectureId); return { ...s, lectureTitle: l.title }; }
            catch { return { ...s, lectureTitle: 'Untitled Lecture' }; }
          }
          return { ...s, lectureTitle: 'Untitled Lecture' };
        })
      );
      setSummaries(withTitles);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  // Rotating accent colors
  const cardColors = [
    { accent: 'from-amber-400 to-orange-500', glow: 'hover:shadow-[0_8px_40px_rgba(245,158,11,0.15)]', iconBg: 'bg-amber-500/15 border-amber-500/25', iconColor: 'text-amber-400' },
    { accent: 'from-violet-500 to-purple-400', glow: 'hover:shadow-[0_8px_40px_rgba(139,92,246,0.15)]', iconBg: 'bg-violet-500/15 border-violet-500/25', iconColor: 'text-violet-400' },
    { accent: 'from-brand-500 to-cyan-400', glow: 'hover:shadow-[0_8px_40px_rgba(6,182,212,0.15)]', iconBg: 'bg-brand-500/15 border-brand-500/25', iconColor: 'text-brand-400' },
    { accent: 'from-rose-500 to-pink-400', glow: 'hover:shadow-[0_8px_40px_rgba(244,63,94,0.15)]', iconBg: 'bg-rose-500/15 border-rose-500/25', iconColor: 'text-rose-400' },
    { accent: 'from-emerald-500 to-teal-400', glow: 'hover:shadow-[0_8px_40px_rgba(16,185,129,0.15)]', iconBg: 'bg-emerald-500/15 border-emerald-500/25', iconColor: 'text-emerald-400' },
    { accent: 'from-blue-500 to-indigo-400', glow: 'hover:shadow-[0_8px_40px_rgba(59,130,246,0.15)]', iconBg: 'bg-blue-500/15 border-blue-500/25', iconColor: 'text-blue-400' },
  ];

  if (loading) return <Loader />;
  if (error) return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="glass-card-ai text-rose-400 p-5 max-w-md border border-rose-500/20 shadow-glow-brand">
        <p className="font-bold text-xs uppercase tracking-widest">Error loading saved notes</p>
        <p className="text-sm mt-1 text-rose-300">{error}</p>
        <button onClick={fetchSavedSummaries} className="mt-3 text-xs font-bold uppercase tracking-wider hover:text-rose-300 transition-colors">Retry →</button>
      </div>
    </div>
  );

  return (
    <div className="w-full">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">

        {/* Header + Toolbar row */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <p className="text-[11px] font-bold tracking-widest text-accent-400 uppercase mb-2 opacity-80">Your Collection</p>
            <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight">Saved Notes</h1>
            <p className="text-slate-500 dark:text-white/50 text-sm mt-1.5 font-medium">{summaries.length} bookmarked {summaries.length === 1 ? 'summary' : 'summaries'}</p>
          </div>
          <div className="flex items-center gap-4 glass-card-ai px-5 py-4">
            <div className="flex items-center bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-1 gap-1 shadow-glass-inset">
              {[['grid', Squares2X2Icon], ['list', ListBulletIcon]].map(([mode, Icon]) => (
                <button key={mode} onClick={() => setViewMode(mode)}
                  className={`p-2 rounded-lg transition-all duration-300 ${viewMode === mode ? 'bg-accent-500/20 text-accent-300 shadow-[0_0_10px_rgba(168,85,247,0.2)] border border-accent-500/30' : 'text-slate-500 dark:text-white/50 hover:text-slate-900 dark:text-white hover:bg-slate-100 dark:bg-white/5 border border-transparent'}`}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
            <div className="w-px h-6 bg-slate-200 dark:bg-white/10" />
            <button onClick={fetchSavedSummaries} className="p-2.5 text-slate-500 dark:text-white/50 hover:text-accent-400 hover:bg-accent-500/10 rounded-xl transition-all duration-300 border border-transparent hover:border-accent-500/30">
              <ArrowPathIcon className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {summaries.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="glass-card-ai py-24 flex flex-col items-center justify-center text-center px-6 border border-dashed border-slate-300 dark:border-white/15 relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-30 pointer-events-none">
              <div className="absolute top-10 left-1/4 w-32 h-32 bg-accent-500/20 rounded-full blur-[60px]" />
              <div className="absolute bottom-10 right-1/4 w-24 h-24 bg-amber-500/20 rounded-full blur-[50px]" />
            </div>
            <div className="w-20 h-20 bg-accent-500/10 border border-accent-500/30 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(168,85,247,0.15)]">
              <BookmarkSolid className="w-10 h-10 text-accent-400" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-xl mb-2 tracking-tight">No saved notes yet</h3>
            <p className="text-slate-500 dark:text-white/50 text-sm max-w-md mb-8 font-medium">Bookmark summaries while reading to collect them here.</p>
            <Link to="/summaries" className="inline-flex items-center gap-2 stripe-gradient-bg text-slate-900 dark:text-white text-sm font-bold px-6 py-3 rounded-full hover:scale-[1.03] transition-transform shadow-glow-accent border border-slate-300 dark:border-white/20 uppercase tracking-widest">
              <DocumentTextIcon className="w-4 h-4" /> Access Library
            </Link>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {viewMode === 'grid' ? (
              <motion.div layout className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {summaries.map((s, i) => {
                  const colorSet = cardColors[i % cardColors.length];
                  return (
                    <motion.div key={s.id} layout
                      initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }} transition={{ duration: 0.3, delay: i * 0.04 }}
                      className={`group relative bg-slate-50 dark:bg-[#0E0F14]/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/[0.06] overflow-hidden flex flex-col transition-all duration-500 hover:-translate-y-1 hover:border-slate-300 dark:border-white/15 ${colorSet.glow}`}
                    >
                      {/* Accent strip */}
                      <div className={`h-1 w-full bg-gradient-to-r ${colorSet.accent} opacity-60 group-hover:opacity-100 transition-opacity duration-500`} />
                      
                      <Link to={`/summary/${s.id}`} className="p-6 flex flex-col h-full relative z-10">
                        <div className="flex items-start justify-between mb-4 gap-4">
                          <h3 className="text-sm font-bold text-slate-800 dark:text-white/90 line-clamp-2 group-hover:text-accent-400 transition-colors flex-1 tracking-wide leading-relaxed">{s.lectureTitle}</h3>
                          <div className={`w-9 h-9 rounded-xl ${colorSet.iconBg} border flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                            <BookmarkSolid className={`w-4 h-4 ${colorSet.iconColor}`} />
                          </div>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-white/50 line-clamp-3 leading-relaxed font-medium flex-1">{s.content}</p>
                        {s.topics?.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-5">
                            {s.topics.slice(0, 3).map((t, j) => <span key={j} className="text-[9px] uppercase font-bold tracking-wider px-2.5 py-1 bg-slate-200/50 dark:bg-white/[0.04] text-slate-500 dark:text-white/50 rounded-lg border border-slate-200 dark:border-white/[0.06] group-hover:text-slate-600 dark:text-white/70 group-hover:bg-slate-200 dark:group-hover:bg-white/[0.06] transition-colors">{t}</span>)}
                            {s.topics.length > 3 && <span className="text-[9px] font-bold px-2 py-1 bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-white/40 rounded-lg border border-slate-200 dark:border-white/[0.06]">+{s.topics.length - 3}</span>}
                          </div>
                        )}
                        <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-200 dark:border-white/[0.06] text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-white/40">
                          <span className="flex items-center gap-1.5"><CalendarIcon className="w-3.5 h-3.5" />{format(new Date(s.createdAt), 'MMM d, yyyy')}</span>
                          <span className="flex items-center gap-1.5 text-brand-400/80">
                            <SparklesIcon className="w-3 h-3" />
                            {s.keyPoints?.length || 0} Points
                          </span>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div layout className="glass-card-ai overflow-hidden shadow-glow-brand divide-y divide-white/[0.06]">
                {summaries.map((s, i) => {
                  const colorSet = cardColors[i % cardColors.length];
                  return (
                    <motion.div key={s.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="group hover:bg-slate-100 dark:hover:bg-white/[0.03] transition-colors relative"
                    >
                      <Link to={`/summary/${s.id}`} className="flex flex-col sm:flex-row sm:items-center gap-4 px-6 py-5">
                        {/* Accent bar */}
                        <div className={`absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-gradient-to-b ${colorSet.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                        
                        <div className={`w-10 h-10 rounded-xl ${colorSet.iconBg} border flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                          <BookmarkSolid className={`w-5 h-5 ${colorSet.iconColor}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-800 dark:text-white/90 line-clamp-1 group-hover:text-accent-400 transition-colors tracking-wide">{s.lectureTitle}</p>
                          <p className="text-xs text-slate-400 dark:text-white/40 mt-1 line-clamp-1 font-medium">{s.content?.substring(0, 80)}...</p>
                        </div>
                        <div className="hidden lg:flex gap-2 flex-shrink-0">
                          {s.topics?.slice(0, 2).map((t, j) => <span key={j} className="text-[9px] uppercase font-bold tracking-wider px-2 py-1 bg-slate-200/50 dark:bg-white/[0.04] text-slate-500 dark:text-white/50 rounded-md border border-slate-200 dark:border-white/[0.06]">{t}</span>)}
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/40 flex-shrink-0 hidden sm:block w-32 text-right">{formatDistanceToNow(new Date(s.createdAt), { addSuffix: true })}</span>
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default SavedNotes;
