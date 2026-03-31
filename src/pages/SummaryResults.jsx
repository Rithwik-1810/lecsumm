import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { summaryService } from '../services/summaryService';
import { lectureService } from '../services/lectureService';
import { useAuth } from '../hooks/useAuth';
import Loader from '../components/common/Loader';
import { BookmarkIcon as BookmarkOutline } from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolid } from '@heroicons/react/24/solid';
import {
  TrashIcon, ArrowLeftIcon, SparklesIcon,
  ListBulletIcon, CheckCircleIcon, TagIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/common/ConfirmModal';

const SummaryResults = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [lecture, setLecture] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  const pollingRef = useRef(null);
  const isMounted = useRef(true);
  const stableRefresh = useCallback(async () => { if (refreshUser) await refreshUser(); }, [refreshUser]);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; if (pollingRef.current) clearTimeout(pollingRef.current); };
  }, []);

  useEffect(() => {
    const fetchSummary = async () => {
      const poll = async () => {
        try {
          // First check the lecture status so we can detect backend crashes!
          const l = await lectureService.getLectureById(id);
          if (isMounted.current) setLecture(l);
          
          if (l.status === 'failed') {
            if (isMounted.current) {
              const reason = l.failReason || "The AI backend failed to process this lecture. Please check if the audio file format is supported and less than 1 Hour long.";
              setError(reason);
              setLoading(false);
            }
            return;
          }
          
          if (l.status === 'completed') {
            const s = await summaryService.getSummaryByLectureId(id);
            if (isMounted.current) { 
              setSummary(s); 
              setLoading(false); 
              await stableRefresh();
            }
            return;
          }
          
          // Still processing... poll again.
          if (isMounted.current) pollingRef.current = setTimeout(poll, 3000);
        } catch (err) {
          // If we hit an error fetching the lecture or summary
          if (err.response?.status === 404 && isMounted.current) {
            pollingRef.current = setTimeout(poll, 3000);
          } else if (isMounted.current) { 
            setError(err.message); 
            setLoading(false); 
          }
        }
      };
      
      try {
        const data = await summaryService.getSummaryById(id);
        if (isMounted.current) { 
          setSummary(data); 
          setLoading(false);
          // Fetch lecture title
          if (data.lectureId) {
            try { const l = await lectureService.getLectureById(data.lectureId); setLecture(l); }
            catch (err) { console.error(err); }
          }
        }
        return;
      } catch (err) {
        if (err.response?.status !== 404) {
          if (isMounted.current) { setError(err.message); setLoading(false); } return;
        }
      }
      poll();
    };
    fetchSummary();
  }, [id, stableRefresh]);

  const handleToggleSave = async () => {
    if (!summary) return;
    setSaving(true);
    try { const u = await summaryService.toggleSaveSummary(summary.id); if (isMounted.current) setSummary(u); }
    catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleDelete = () => {
    if (!summary) return;
    setConfirmModal({
      isOpen: true,
      title: 'Delete Summary',
      message: 'Are you sure you want to delete this summary? This action cannot be undone.',
        onConfirm: async () => {
          setDeleting(true);
          const toastId = toast.loading('Deleting summary...');
          try { 
            await summaryService.deleteSummary(summary.id); 
            await stableRefresh(); 
            toast.success('Summary deleted', { id: toastId });
            navigate('/summaries'); 
          }
          catch { toast.error('Delete failed. Try again.', { id: toastId }); }
          finally { setDeleting(false); }
        }
    });
  };

  if (loading) return <Loader />;
  if (error) return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="bg-red-50 border border-red-200 p-6 rounded-2xl max-w-md">
        <p className="font-semibold text-red-700 text-sm">Error loading summary</p>
        <p className="text-xs text-red-600 mt-1">{error}</p>
        <button onClick={() => navigate(-1)} className="mt-3 text-xs font-semibold text-red-700 hover:underline">← Go Back</button>
      </div>
    </div>
  );
  if (!summary) return (
    <div className="max-w-4xl mx-auto px-6 py-10 text-center">
      <div className="glass-card-ai p-10 max-w-sm mx-auto shadow-glow-brand">
        <h2 className="font-bold text-slate-900 dark:text-white mb-2 text-xl tracking-tight">Intelligence Not Found</h2>
        <p className="text-slate-900 dark:text-white text-sm mb-6 font-medium">The requested summary could not be found.</p>
        <button onClick={() => navigate('/summaries')} className="stripe-gradient-bg text-slate-900 dark:text-white text-sm font-bold px-6 py-3 rounded-full hover:scale-[1.03] transition-transform shadow-glow-brand border border-slate-300 dark:border-white/20">Return to Matrix</button>
      </div>
    </div>
  );

  const fadeUp = (delay = 0) => ({ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4, delay } });

  return (
    <div className="w-full">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">

        {/* Top nav */}
        <div className="flex items-center justify-between">
          <button onClick={() => navigate('/summaries')}
            className="flex items-center gap-1.5 text-sm font-bold text-slate-900 dark:text-white hover:text-brand-400 transition-colors group tracking-wide uppercase"
          >
            <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> System Return
          </button>
          <div className="flex items-center gap-3">
            <button onClick={handleToggleSave} disabled={saving}
              className={`flex items-center gap-2 text-[11px] font-bold px-4 py-2 rounded-xl transition-all duration-300 uppercase tracking-wider disabled:opacity-50 ${summary.saved ? 'bg-accent-500/20 border border-accent-500/30 text-accent-300 shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white hover:border-accent-500/50 hover:text-accent-400 shadow-glass-inset'}`}
            >
              {summary.saved ? <BookmarkSolid className="w-4 h-4 text-accent-400" /> : <BookmarkOutline className="w-4 h-4" />}
              {summary.saved ? 'Saved' : 'Save'}
            </button>
            <button onClick={handleDelete} disabled={deleting}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white hover:text-rose-400 hover:border-rose-500/30 hover:bg-rose-500/10 shadow-glass-inset transition-all duration-300 disabled:opacity-50"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Summary Content */}
        <motion.div {...fadeUp(0)} className="glass-card-ai overflow-hidden shadow-glow-brand group">
          <div className="px-6 py-6 border-b border-slate-200 dark:border-white/10 flex items-center gap-4 bg-slate-100 dark:bg-white/5">
            <div className="w-12 h-12 bg-brand-500/10 rounded-xl flex items-center justify-center border border-brand-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              <SparklesIcon className="w-6 h-6 text-brand-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                {summary.topics?.[0] || lecture?.title || 'Lecture Intelligence'}
              </h1>
              <p className="text-[11px] font-bold text-slate-900 dark:text-white mt-1 uppercase tracking-widest text-brand-300/80">AI Analysis Result</p>
            </div>
          </div>
          <div className="p-8">
            <p className="text-slate-900 dark:text-white leading-relaxed text-sm sm:text-base whitespace-pre-line font-medium">{summary.content}</p>
          </div>
        </motion.div>

        {/* Key Points */}
        {summary.keyPoints?.length > 0 && (
          <motion.div {...fadeUp(0.1)} className="glass-card-ai overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 dark:border-white/10 flex items-center gap-3">
              <ListBulletIcon className="w-5 h-5 text-emerald-400" />
              <h2 className="font-bold text-slate-900 dark:text-white tracking-tight">Key Points</h2>
              <span className="text-[10px] uppercase font-bold px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-md border border-emerald-500/20 ml-auto tracking-wider">
                {summary.keyPoints.length} Data Points
              </span>
            </div>
            <div className="p-6 space-y-3">
              {summary.keyPoints.map((point, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-white/5 hover:border-emerald-500/30 hover:bg-emerald-500/10 transition-all duration-300 group">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-[0_0_10px_rgba(16,185,129,0.1)] group-hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-shadow">
                    <CheckCircleIcon className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-sm text-slate-900 dark:text-white leading-relaxed font-medium group-hover:text-slate-900 dark:text-white transition-colors pt-1">{point}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Topics */}
        {summary.topics?.length > 0 && (
          <motion.div {...fadeUp(0.2)} className="glass-card-ai overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 dark:border-white/10 flex items-center gap-3">
              <TagIcon className="w-5 h-5 text-brand-400" />
              <h2 className="font-bold text-slate-900 dark:text-white tracking-tight">Topic Classifications</h2>
            </div>
            <div className="p-6 flex flex-wrap gap-3">
              {summary.topics.map((topic, i) => (
                <span key={i} className="px-4 py-2 bg-brand-500/10 text-brand-300 border border-brand-500/20 rounded-lg text-xs font-bold hover:bg-brand-500/20 transition-all shadow-[0_0_10px_rgba(6,182,212,0.1)] hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-default uppercase tracking-wider">
                  {topic}
                </span>
              ))}
            </div>
          </motion.div>
        )}

      </div>
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
      />
    </div>
  );
};

export default SummaryResults;
