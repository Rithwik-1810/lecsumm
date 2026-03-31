import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { summaryService } from '../services/summaryService';
import { useAuth } from '../hooks/useAuth';
import Loader from '../components/common/Loader';
import ConfirmModal from '../components/common/ConfirmModal';
import {
  BookmarkIcon as BookmarkOutline, TrashIcon, CalendarIcon,
  DocumentTextIcon, FunnelIcon, ArrowPathIcon,
  PlusIcon, SparklesIcon, ChevronRightIcon, CheckIcon,
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolid } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const MySummaries = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [filter, setFilter] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [selectedSummaries, setSelectedSummaries] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ 
    isOpen: false, 
    title: '', 
    message: '', 
    onConfirm: () => {},
    variant: 'danger' 
  });

  useEffect(() => { 
    fetchSummaries(); 
    // Reset selection mode when component unmounts or filter changes
    return () => {
      setIsSelectionMode(false);
      setSelectedSummaries([]);
    };
  }, [filter]);

  const fetchSummaries = async () => {
    setLoading(true);
    try {
      const data = await summaryService.getSummaries();
      // Fetch associated lectures to get titles
      try {
        const lectures = await lectureService.getUserLectures();
        const lectureMap = lectures.reduce((acc, l) => ({ ...acc, [l.id]: l.title }), {});
        
        const enriched = data.map(s => {
          const derivedTitle = s.topics?.[0] || lectureMap[s.lectureId] || 'Intelligent Analysis';
          return { ...s, title: derivedTitle };
        });
        setSummaries(enriched);
      } catch {
        // Fallback if lecture fetch fails
        setSummaries(data.map(s => ({ ...s, title: s.topics?.[0] || 'AI Generated Summary' })));
      }
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const toggleSave = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const updated = await summaryService.toggleSaveSummary(id);
      setSummaries(summaries.map(s => s.id === id ? updated : s));
      await refreshUser();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id, e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    
    setConfirmModal({
      isOpen: true,
      title: 'Delete Summary',
      message: 'Are you sure you want to delete this summary? This action cannot be undone.',
      variant: 'danger',
      onConfirm: async () => {
        setDeletingId(id);
        const toastId = toast.loading('Deleting summary...');
        try {
          await summaryService.deleteSummary(id);
          setSummaries(summaries.filter(s => s.id !== id));
          toast.success('Summary deleted', { id: toastId });
          await refreshUser();
        } catch { 
          toast.error('Failed to delete.', { id: toastId }); 
        } finally { 
          setDeletingId(null); 
        }
      }
    });
  };

  const toggleSelectSummary = (id) => {
    setSelectedSummaries(prev => 
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedSummaries.length === displaySummaries.length) {
      setSelectedSummaries([]);
    } else {
      setSelectedSummaries(displaySummaries.map(s => s.id));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedSummaries.length === 0) return;
    
    setConfirmModal({
      isOpen: true,
      title: 'Delete Selected',
      message: `Are you sure you want to delete ${selectedSummaries.length} selected summaries?`,
      variant: 'danger',
      onConfirm: async () => {
        setIsBulkDeleting(true);
        const toastId = toast.loading(`Deleting ${selectedSummaries.length} summaries...`);
        try {
          await summaryService.deleteMultipleSummaries(selectedSummaries);
          toast.success('Summaries deleted successfully', { id: toastId });
          setSummaries(summaries.filter(s => !selectedSummaries.includes(s.id)));
          setSelectedSummaries([]);
          setIsSelectionMode(false);
          await refreshUser();
        } catch (err) {
          toast.error('Failed to delete summaries', { id: toastId });
        } finally {
          setIsBulkDeleting(false);
        }
      }
    });
  };

  const handleDeleteAll = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Clear Library',
      message: 'WARNING: Are you sure you want to delete ALL your summaries? This action cannot be undone.',
      variant: 'danger',
      onConfirm: async () => {
        setIsBulkDeleting(true);
        const toastId = toast.loading('Deleting all summaries...');
        try {
          await summaryService.deleteAllSummaries();
          toast.success('All summaries cleared', { id: toastId });
          setSummaries([]);
          setSelectedSummaries([]);
          setIsSelectionMode(false);
          await refreshUser();
        } catch (err) {
          toast.error('Failed to clear summaries', { id: toastId });
        } finally {
          setIsBulkDeleting(false);
        }
      }
    });
  };

  const displaySummaries = (() => {
    if (filter === 'saved') return summaries.filter(s => s.saved);
    if (filter === 'recent') return [...summaries].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
    return summaries;
  })();

  const cardAccents = [
    { gradient: 'from-brand-500 to-cyan-400', border: 'hover:border-brand-500/30', shadow: 'group-hover:shadow-[0_0_40px_rgba(6,182,212,0.12)]', icon: 'text-brand-400', iconBg: 'bg-brand-500/10 border-brand-500/20' },
    { gradient: 'from-violet-500 to-purple-400', border: 'hover:border-violet-500/30', shadow: 'group-hover:shadow-[0_0_40px_rgba(139,92,246,0.12)]', icon: 'text-violet-400', iconBg: 'bg-violet-500/10 border-violet-500/20' },
    { gradient: 'from-emerald-500 to-teal-400', border: 'hover:border-emerald-500/30', shadow: 'group-hover:shadow-[0_0_40px_rgba(16,185,129,0.12)]', icon: 'text-emerald-400', iconBg: 'bg-emerald-500/10 border-emerald-500/20' },
    { gradient: 'from-amber-500 to-orange-400', border: 'hover:border-amber-500/30', shadow: 'group-hover:shadow-[0_0_40px_rgba(245,158,11,0.12)]', icon: 'text-amber-400', iconBg: 'bg-amber-500/10 border-amber-500/20' },
    { gradient: 'from-rose-500 to-pink-400', border: 'hover:border-rose-500/30', shadow: 'group-hover:shadow-[0_0_40px_rgba(244,63,94,0.12)]', icon: 'text-rose-400', iconBg: 'bg-rose-500/10 border-rose-500/20' },
    { gradient: 'from-blue-500 to-indigo-400', border: 'hover:border-blue-500/30', shadow: 'group-hover:shadow-[0_0_40px_rgba(59,130,246,0.12)]', icon: 'text-blue-400', iconBg: 'bg-blue-500/10 border-blue-500/20' },
  ];

  if (loading) return <Loader />;
  if (error) return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="glass-card-ai text-rose-400 p-6 max-w-md border border-rose-500/20 shadow-glow-brand">
        <h3 className="font-bold mb-1 uppercase tracking-widest text-xs">Error loading summaries</h3>
        <p className="text-sm text-rose-300">{error}</p>
        <button onClick={fetchSummaries} className="mt-4 text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors uppercase tracking-wider">Try again →</button>
      </div>
    </div>
  );

  // Split summaries: first one is "featured", rest are stacked
  const featured = displaySummaries[0] || null;
  const rest = displaySummaries.slice(1);

  return (
    <div className="w-full">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <p className="text-[11px] font-bold tracking-widest text-brand-400 uppercase mb-2 opacity-80">Your Library</p>
            <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight">My Summaries</h1>
            <p className="text-slate-500 dark:text-white/50 text-sm mt-1.5 font-medium">{summaries.length} summaries generated</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Filter pills */}
            <div className="flex items-center bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full p-1 gap-0.5">
              {[['', 'All'], ['saved', 'Saved'], ['recent', 'Recent']].map(([val, label]) => (
                <button key={val} onClick={() => setFilter(val)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${filter === val ? 'bg-brand-500/20 text-brand-300 shadow-[0_0_12px_rgba(6,182,212,0.2)]' : 'text-slate-500 dark:text-white/50 hover:text-slate-700 dark:text-white/80'}`}
                >{label}</button>
              ))}
            </div>
            <button onClick={fetchSummaries} className="p-2 text-slate-400 dark:text-white/40 hover:text-brand-400 hover:bg-brand-500/10 rounded-xl transition-all border border-transparent hover:border-brand-500/20" title="Refresh">
              <ArrowPathIcon className="w-4 h-4" />
            </button>

            {summaries.length > 0 && (
              <>
                <button 
                  onClick={() => {
                    setIsSelectionMode(!isSelectionMode);
                    if (isSelectionMode) setSelectedSummaries([]);
                  }}
                  className={`px-5 py-2 rounded-full text-xs font-bold transition-all border ${isSelectionMode ? 'bg-slate-200 dark:bg-white/10 border-slate-300 dark:border-white/20 text-slate-800 dark:text-white' : 'bg-brand-500/10 border-brand-500/20 text-brand-400 hover:bg-brand-500/20'}`}
                >
                  {isSelectionMode ? 'Cancel' : 'Select'}
                </button>

                <button 
                  onClick={handleDeleteAll}
                  disabled={isBulkDeleting}
                  className="flex items-center gap-2 px-3 py-2 text-slate-400 dark:text-white/40 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all border border-transparent hover:border-rose-500/20" 
                  title="Clear Library"
                >
                  <TrashIcon className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Delete All</span>
                </button>
              </>
            )}

            <Link to="/upload"
              className="inline-flex items-center gap-2 stripe-gradient-bg hover:scale-[1.02] text-slate-900 dark:text-white text-sm font-bold px-5 py-2.5 rounded-full shadow-glow-brand transition-all duration-300 border border-slate-300 dark:border-white/20"
            >
              <PlusIcon className="w-4 h-4" /> New
            </Link>
          </div>
        </motion.div>

        {/* Multi-select Actions Bar */}
        <AnimatePresence>
          {selectedSummaries.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-3 bg-brand-500/10 border border-brand-500/20 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-brand-500 rounded-md flex items-center justify-center">
                    <CheckIcon className="w-3.5 h-3.5 text-white stroke-[3px]" />
                  </div>
                  <span className="text-sm font-bold text-brand-400">{selectedSummaries.length} summar{selectedSummaries.length !== 1 ? 'ies' : 'y'} selected</span>
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setSelectedSummaries([])}
                    className="text-xs font-bold text-slate-500 dark:text-white/40 hover:text-slate-700 dark:hover:text-white transition-colors"
                  >
                    Clear Selection
                  </button>
                  <button 
                    onClick={handleDeleteSelected}
                    disabled={isBulkDeleting}
                    className="flex items-center gap-2 px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 rounded-full text-xs font-bold border border-rose-500/30 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    <TrashIcon className="w-3.5 h-3.5" />
                    Delete Selected
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content */}
        {displaySummaries.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="glass-card-ai py-24 flex flex-col items-center justify-center text-center px-6 border border-dashed border-slate-300 dark:border-white/15 relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-30 pointer-events-none">
              <div className="absolute top-10 left-1/4 w-32 h-32 bg-brand-500/20 rounded-full blur-[60px]" />
              <div className="absolute bottom-10 right-1/4 w-24 h-24 bg-accent-500/20 rounded-full blur-[50px]" />
            </div>
            <div className="w-20 h-20 bg-brand-500/10 border border-brand-500/30 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
              <DocumentTextIcon className="w-10 h-10 text-brand-400" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-xl mb-2 tracking-tight">{filter ? 'No records match filter' : 'No summaries yet'}</h3>
            <p className="text-slate-500 dark:text-white/50 text-sm max-w-md mb-8 font-medium">
              {filter ? 'Adjust your filters to see more results.' : 'Upload a lecture to generate your first AI summary.'}
            </p>
            {!filter && (
              <Link to="/upload" className="inline-flex items-center gap-2 stripe-gradient-bg text-slate-900 dark:text-white text-sm font-bold px-6 py-3 rounded-full shadow-glow-brand hover:scale-[1.03] transition-transform border border-slate-300 dark:border-white/20">
                <PlusIcon className="w-4 h-4" /> Upload Lecture
              </Link>
            )}
          </motion.div>
        ) : (
          <div className="space-y-5">
            {isSelectionMode && (
              <div className="mb-2 flex items-center pl-16">
                <button 
                  onClick={toggleSelectAll}
                  className="flex items-center gap-2 group cursor-pointer -ml-2"
                >
                  <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${selectedSummaries.length === displaySummaries.length && displaySummaries.length > 0 ? 'bg-brand-500 border-brand-500' : 'border-slate-300 dark:border-white/10 dark:bg-white/5 group-hover:border-brand-500/50'}`}>
                    {selectedSummaries.length === displaySummaries.length && displaySummaries.length > 0 && <CheckIcon className="w-3.5 h-3.5 text-white stroke-[3px]" />}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/30 group-hover:text-brand-400 transition-colors">
                    {selectedSummaries.length === displaySummaries.length && displaySummaries.length > 0 ? 'Deselect All' : 'Select All Summaries'}
                  </span>
                </button>
              </div>
            )}

            <div className="space-y-5">
              {/* ── FEATURED CARD (Hero style, full-width) ── */}
              {featured && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className={`group relative ${isSelectionMode ? 'pl-16' : ''}`}
                >
                  {/* Selection Overlay */}
                  {isSelectionMode && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 z-20">
                      <button 
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleSelectSummary(featured.id); }}
                        className={`w-10 h-10 -ml-2 rounded-full flex items-center justify-center transition-all ${selectedSummaries.includes(featured.id) ? 'text-brand-400' : 'text-slate-400 dark:text-white/20 hover:text-brand-400/60'}`}
                      >
                        <div className={`w-6 h-6 rounded-md border-2 transition-all flex items-center justify-center ${selectedSummaries.includes(featured.id) ? 'bg-brand-500 border-brand-500 shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'border-slate-300 dark:border-white/20 dark:bg-white/10'}`}>
                          {selectedSummaries.includes(featured.id) && <CheckIcon className="w-4 h-4 text-white stroke-[3px]" />}
                        </div>
                      </button>
                    </div>
                  )}

                  <div 
                    onClick={() => navigate(`/summary/${featured.id}`)}
                    className="block cursor-pointer"
                  >
                    <div className={`relative bg-slate-50 dark:bg-[#0E0F14] rounded-2xl border border-slate-200 dark:border-white/[0.06] overflow-hidden transition-all duration-500 hover:border-brand-500/30 group-hover:shadow-[0_0_50px_rgba(6,182,212,0.1)] ${selectedSummaries.includes(featured.id) ? 'ring-2 ring-brand-500/50 border-brand-500/50' : ''}`}>
                      {/* Accent gradient bar */}
                      <div className="h-1 w-full bg-gradient-to-r from-brand-500 via-accent-500 to-brand-400 opacity-70 group-hover:opacity-100 transition-opacity" />
                      
                      {/* Ambient glow */}
                      <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/8 rounded-full blur-[100px] pointer-events-none group-hover:bg-brand-500/12 transition-colors duration-700" />
                      <div className="absolute bottom-0 left-0 w-60 h-60 bg-accent-500/6 rounded-full blur-[80px] pointer-events-none group-hover:bg-accent-500/10 transition-colors duration-700" />
                      
                      <div className="relative p-8 sm:p-10 flex flex-col sm:flex-row gap-8">
                        {/* Left content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-brand-500/15 border border-brand-500/25 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                              <SparklesIcon className="w-5 h-5 text-brand-400" />
                            </div>
                            <span className="text-[10px] font-bold text-brand-400 uppercase tracking-widest bg-brand-500/10 px-3 py-1 rounded-full border border-brand-500/20">Latest Summary</span>
                            <span className="text-[10px] text-slate-400 dark:text-white/40 font-bold uppercase tracking-wider ml-auto">
                              {formatDistanceToNow(new Date(featured.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                          
                          <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight mb-3 group-hover:text-brand-400 transition-colors">
                            {featured.title}
                          </h2>
                          <p className="text-base text-slate-700 dark:text-white/60 leading-relaxed font-medium line-clamp-3 group-hover:text-slate-900 dark:text-white transition-colors duration-300 mb-6">
                            {featured.content}
                          </p>

                          {featured.topics?.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-6">
                              {featured.topics.map((t, i) => (
                                <span key={i} className="text-[10px] uppercase font-bold px-3 py-1.5 bg-slate-200/50 dark:bg-white/[0.04] text-slate-500 dark:text-white/50 rounded-lg border border-slate-200 dark:border-white/[0.06] tracking-wider group-hover:text-slate-600 dark:text-white/70 group-hover:bg-slate-200 dark:group-hover:bg-white/[0.06] transition-colors">{t}</span>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-white/40 font-bold uppercase tracking-wider">
                              <CalendarIcon className="w-3.5 h-3.5" />{format(new Date(featured.createdAt), 'MMMM d, yyyy')}
                            </span>
                            <span className="flex items-center gap-1.5 text-[10px] text-emerald-400/80 font-bold uppercase tracking-wider">
                              <SparklesIcon className="w-3 h-3" />{featured.keyPoints?.length || 0} Key Points
                            </span>
                          </div>
                        </div>

                        {/* Right actions */}
                        <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:justify-between">
                          <div className="flex gap-2">
                            <button onClick={(e) => toggleSave(featured.id, e)} disabled={deletingId === featured.id}
                              className={`p-2.5 rounded-xl transition-all duration-300 border ${featured.saved ? 'text-amber-400 bg-amber-500/15 border-amber-500/25' : 'text-slate-400 dark:text-white/30 hover:text-amber-400 hover:bg-amber-500/10 border-slate-200 dark:border-white/[0.06] hover:border-amber-500/25'}`}
                            >
                              {featured.saved ? <BookmarkSolid className="w-5 h-5" /> : <BookmarkOutline className="w-5 h-5" />}
                            </button>
                            <button onClick={(e) => handleDelete(featured.id, e)} disabled={deletingId === featured.id}
                              className="p-2.5 rounded-xl text-slate-400 dark:text-white/30 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-200 dark:border-white/[0.06] hover:border-rose-500/25 transition-all"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>
                          <div className="flex items-center gap-2 text-brand-400 text-xs font-bold group-hover:gap-3 transition-all">
                            Read full summary <ChevronRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── STACKED CARDS (Vertical feed style) ── */}
              {rest.length > 0 && (
                <div className="space-y-3">
                  <AnimatePresence>
                    {rest.map((s, i) => {
                      const accent = cardAccents[(i + 1) % cardAccents.length];
                      const isExpanded = expandedId === s.id;

                      return (
                        <motion.div
                          key={s.id}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3, delay: i * 0.04 }}
                          className={`relative ${isSelectionMode ? 'pl-16' : ''} group`}
                        >
                          {/* Selection Overlay */}
                          {isSelectionMode && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 z-20">
                              <button 
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleSelectSummary(s.id); }}
                                className={`w-8 h-8 -ml-1 rounded-full flex items-center justify-center transition-all ${selectedSummaries.includes(s.id) ? 'text-brand-400' : 'text-slate-400 dark:text-white/20 hover:text-brand-400/60'}`}
                              >
                                <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${selectedSummaries.includes(s.id) ? 'bg-brand-500 border-brand-500 shadow-[0_0_12px_rgba(6,182,212,0.3)]' : 'border-slate-300 dark:border-white/15 dark:bg-white/5'}`}>
                                  {selectedSummaries.includes(s.id) && <CheckIcon className="w-3.5 h-3.5 text-white stroke-[3px]" />}
                                </div>
                              </button>
                            </div>
                          )}
                          <div 
                            onClick={() => navigate(`/summary/${s.id}`)}
                            className={`relative bg-slate-50 dark:bg-[#0E0F14]/80 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-white/[0.05] overflow-hidden transition-all duration-500 cursor-pointer ${accent.border} ${accent.shadow} ${selectedSummaries.includes(s.id) ? 'ring-2 ring-brand-500/40 border-brand-500/30' : ''}`}
                          >
                            {/* Left accent bar */}
                            <div className={`absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b ${accent.gradient} opacity-40 group-hover:opacity-100 transition-opacity duration-500 rounded-l-2xl`} />
                            
                            <div className="flex items-start gap-5 p-5 pl-6">
                              {/* Icon */}
                              <div className={`w-11 h-11 ${accent.iconBg} border rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform duration-300`}>
                                <DocumentTextIcon className={`w-5 h-5 ${accent.icon}`} />
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                  <span className="text-[10px] text-slate-400 dark:text-white/40 font-bold uppercase tracking-wider bg-slate-200/50 dark:bg-white/[0.03] px-2 py-0.5 rounded-md border border-slate-200 dark:border-white/[0.05]">
                                    {formatDistanceToNow(new Date(s.createdAt), { addSuffix: true })}
                                  </span>
                                  {s.saved && (
                                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                                      <BookmarkSolid className="w-3 h-3" /> Saved
                                    </span>
                                  )}
                                </div>
                                
                                <div>
                                  <p className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-brand-400 transition-colors mb-1 tracking-tight">{s.title}</p>
                                  <p className={`text-xs font-medium text-slate-500 dark:text-white/40 leading-relaxed group-hover:text-slate-600 dark:group-hover:text-white/60 transition-colors duration-300 ${isExpanded ? '' : 'line-clamp-2'} cursor-pointer`}>
                                    {s.content}
                                  </p>
                                </div>

                                {/* Expandable topics */}
                                <AnimatePresence>
                                  {isExpanded && s.topics?.length > 0 && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: 'auto' }}
                                      exit={{ opacity: 0, height: 0 }}
                                      className="overflow-hidden"
                                    >
                                      <div className="flex flex-wrap gap-2 mt-3">
                                        {s.topics.map((t, j) => (
                                          <span key={j} className="text-[9px] uppercase font-bold px-2 py-1 bg-slate-200/50 dark:bg-white/[0.04] text-slate-500 dark:text-white/50 rounded-md border border-slate-200 dark:border-white/[0.05] tracking-wider">{t}</span>
                                        ))}
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>

                                <div className="flex items-center gap-4 mt-3">
                                  <span className="text-[10px] text-slate-400 dark:text-white/30 font-bold uppercase tracking-wider flex items-center gap-1.5">
                                    <CalendarIcon className="w-3 h-3" />{format(new Date(s.createdAt), 'MMM d, yyyy')}
                                  </span>
                                  <span className="text-[10px] text-emerald-400/60 font-bold uppercase tracking-wider">
                                    {s.keyPoints?.length || 0} points
                                  </span>
                                  <button
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setExpandedId(isExpanded ? null : s.id); }}
                                    className="text-[10px] text-slate-400 dark:text-white/30 hover:text-brand-400 font-bold uppercase tracking-wider transition-colors ml-auto"
                                  >
                                    {isExpanded ? 'Less' : 'More'}
                                  </button>
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center gap-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <button onClick={(e) => toggleSave(s.id, e)} disabled={deletingId === s.id}
                                  className={`p-2 rounded-lg transition-all duration-200 ${s.saved ? 'text-amber-400' : 'text-slate-400 dark:text-white/30 hover:text-amber-400'}`}
                                >
                                  {s.saved ? <BookmarkSolid className="w-4 h-4" /> : <BookmarkOutline className="w-4 h-4" />}
                                </button>
                                <button onClick={(e) => handleDelete(s.id, e)} disabled={deletingId === s.id}
                                  className="p-2 rounded-lg text-slate-400 dark:text-white/30 hover:text-rose-400 transition-all duration-200"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(`/summary/${s.id}`); }}
                                  className="p-2 rounded-lg text-slate-400 dark:text-white/30 hover:text-brand-400 transition-all duration-200"
                                >
                                  <ChevronRightIcon className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
      />
    </div>
  );
};

export default MySummaries;
