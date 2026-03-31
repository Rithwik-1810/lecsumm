import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { taskService } from '../services/taskService';
import Loader from '../components/common/Loader';
import ConfirmModal from '../components/common/ConfirmModal';
import {
  CalendarIcon, FunnelIcon, CheckCircleIcon, ClockIcon,
  ExclamationTriangleIcon, ArrowPathIcon,
  PlusIcon, ChevronRightIcon, TrashIcon, CheckIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow, isPast, isToday, isTomorrow, format } from 'date-fns';
import toast from 'react-hot-toast';

const priorityConfig = {
  high: { badge: 'bg-rose-500/10 text-rose-400 border border-rose-500/20', dot: 'bg-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.6)]', ring: 'ring-rose-500/30 bg-rose-500/20', accent: 'from-rose-500 to-pink-400', Icon: ExclamationTriangleIcon },
  medium: { badge: 'bg-amber-500/10 text-amber-400 border border-amber-500/20', dot: 'bg-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.6)]', ring: 'ring-amber-500/30 bg-amber-500/20', accent: 'from-amber-500 to-orange-400', Icon: ClockIcon },
  low: { badge: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20', dot: 'bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.6)]', ring: 'ring-emerald-500/30 bg-emerald-500/20', accent: 'from-emerald-500 to-teal-400', Icon: CheckCircleIcon },
};

const statusConfig = {
  completed: { label: 'Completed', cls: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20', dot: 'bg-emerald-400' },
  'in-progress': { label: 'In Progress', cls: 'bg-brand-500/10 text-brand-400 border border-brand-500/20', dot: 'bg-brand-400 animate-pulse' },
  pending: { label: 'Pending', cls: 'bg-amber-500/10 text-amber-400 border border-amber-500/20', dot: 'bg-amber-400' },
};

const deadlineInfo = (deadline) => {
  if (!deadline) return null;
  const d = new Date(deadline);
  const timeStr = format(d, 'h:mm a');
  if (isPast(d) && !isToday(d)) return { text: 'Overdue', time: timeStr, cls: 'bg-rose-500/10 text-rose-400 border border-rose-500/20' };
  if (isToday(d)) return { text: 'Due Today', time: timeStr, cls: 'bg-orange-500/10 text-orange-400 border border-orange-500/20' };
  if (isTomorrow(d)) return { text: 'Due Tomorrow', time: timeStr, cls: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' };
  return { text: `Due ${formatDistanceToNow(d, { addSuffix: true })}`, time: timeStr, cls: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' };
};

const calcProgress = (task) => {
  if (!task.subtasks?.length) return task.progress || 0;
  return Math.round(task.subtasks.filter(s => s.completed).length / task.subtasks.length * 100);
};

const TasksPage = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({ status: '', priority: '' });
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ 
    isOpen: false, 
    title: '', 
    message: '', 
    onConfirm: () => {},
    variant: 'danger' 
  });

  useEffect(() => { 
    fetchTasks(); 
    return () => {
      setIsSelectionMode(false);
      setSelectedTasks([]);
    };
  }, [filter]);

  const fetchTasks = async () => {
    setLoading(true);
    try { 
      const data = await taskService.getUserTasks(filter.status, filter.priority);
      setTasks(data); 
      setSelectedTasks([]); // Clear selection on refresh/filter change
      setIsSelectionMode(false); // Reset selection mode on refresh
    }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const toggleSelectTask = (id) => {
    setSelectedTasks(prev => 
      prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedTasks.length === tasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(tasks.map(t => t.id));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedTasks.length === 0) return;
    
    setConfirmModal({
      isOpen: true,
      title: 'Delete Selected Tasks',
      message: `Are you sure you want to delete ${selectedTasks.length} selected task(s)? This action cannot be undone.`,
      variant: 'danger',
      onConfirm: async () => {
        setIsDeleting(true);
        const toastId = toast.loading(`Deleting ${selectedTasks.length} tasks...`);
        try {
          await taskService.deleteMultipleTasks(selectedTasks);
          toast.success('Tasks deleted successfully', { id: toastId });
          setTasks(tasks.filter(t => !selectedTasks.includes(t.id)));
          setSelectedTasks([]);
          setIsSelectionMode(false);
        } catch (err) {
          toast.error('Failed to delete tasks', { id: toastId });
        } finally {
          setIsDeleting(false);
        }
      }
    });
  };

  const handleDeleteAll = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Clear All Tasks',
      message: 'WARNING: Are you sure you want to delete ALL your tasks? This action cannot be undone.',
      variant: 'danger',
      onConfirm: async () => {
        setIsDeleting(true);
        const toastId = toast.loading('Deleting all tasks...');
        try {
          await taskService.deleteAllTasks();
          toast.success('All tasks cleared', { id: toastId });
          setTasks([]);
          setSelectedTasks([]);
          setIsSelectionMode(false);
        } catch (err) {
          toast.error('Failed to clear tasks', { id: toastId });
        } finally {
          setIsDeleting(false);
        }
      }
    });
  };

  const handleDeleteTask = (id, e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    
    setConfirmModal({
      isOpen: true,
      title: 'Delete Task',
      message: 'Are you sure you want to delete this task? This action cannot be undone.',
      variant: 'danger',
      onConfirm: async () => {
        setDeletingId(id);
        const toastId = toast.loading('Deleting task...');
        try {
          await taskService.deleteTask(id);
          toast.success('Task deleted successfully', { id: toastId });
          setTasks(tasks.filter(t => t.id !== id));
          setSelectedTasks(prev => prev.filter(tid => tid !== id));
        } catch (err) {
          toast.error('Failed to delete task', { id: toastId });
        } finally {
          setDeletingId(null);
        }
      }
    });
  };

  if (loading && tasks.length === 0) return <Loader />;
  if (error) return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="glass-card-ai text-rose-400 p-5 border border-rose-500/20 max-w-md">
        <p className="font-bold text-xs uppercase tracking-widest">Error loading tasks</p>
        <p className="text-xs text-rose-300 mt-1">{error}</p>
        <button onClick={fetchTasks} className="mt-3 text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors uppercase tracking-wider">Retry →</button>
      </div>
    </div>
  );

  // Group tasks by status for Kanban-like sections
  const grouped = {
    'in-progress': tasks.filter(t => t.status === 'in-progress'),
    'pending': tasks.filter(t => t.status === 'pending'),
    'completed': tasks.filter(t => t.status === 'completed'),
  };

  return (
    <div className="w-full">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <p className="text-[11px] font-bold tracking-widest text-brand-400 uppercase mb-2 opacity-80">Action Items</p>
            <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight">Tasks & Deadlines</h1>
            <p className="text-slate-500 dark:text-white/50 text-sm mt-1.5 font-medium">{tasks.length} task{tasks.length !== 1 ? 's' : ''} tracked</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Filters */}
            <div className="flex items-center bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full p-1 gap-0.5">
              {[['', 'All'], ['pending', 'Pending'], ['in-progress', 'Active'], ['completed', 'Done']].map(([val, label]) => (
                <button key={val} onClick={() => setFilter({ ...filter, status: val })}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${filter.status === val ? 'bg-brand-500/20 text-brand-300 shadow-[0_0_12px_rgba(6,182,212,0.2)]' : 'text-slate-500 dark:text-white/50 hover:text-slate-700 dark:text-white/80'}`}
                >{label}</button>
              ))}
            </div>
            <div className="relative">
              <select value={filter.priority} onChange={e => setFilter({ ...filter, priority: e.target.value })}
                className="pl-3 pr-7 py-1.5 text-xs font-bold text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-full bg-slate-100 dark:bg-white/5 appearance-none focus:outline-none focus:border-accent-500/50 cursor-pointer"
              >
                <option className="bg-white dark:bg-[#0B0C10]" value="">Priority</option>
                <option className="bg-white dark:bg-[#0B0C10]" value="high">High</option>
                <option className="bg-white dark:bg-[#0B0C10]" value="medium">Medium</option>
                <option className="bg-white dark:bg-[#0B0C10]" value="low">Low</option>
              </select>
            </div>
            <button onClick={fetchTasks} className="p-2 text-slate-400 dark:text-white/40 hover:text-accent-400 hover:bg-accent-500/10 rounded-xl transition-all border border-transparent hover:border-accent-500/20" title="Refresh">
              <ArrowPathIcon className="w-4 h-4" />
            </button>
            
            {tasks.length > 0 && (
              <>
                <button 
                  onClick={() => {
                    setIsSelectionMode(!isSelectionMode);
                    if (isSelectionMode) setSelectedTasks([]);
                  }}
                  className={`px-5 py-2 rounded-full text-xs font-bold transition-all border ${isSelectionMode ? 'bg-slate-200 dark:bg-white/10 border-slate-300 dark:border-white/20 text-slate-800 dark:text-white' : 'bg-brand-500/10 border-brand-500/20 text-brand-400 hover:bg-brand-500/20'}`}
                >
                  {isSelectionMode ? 'Cancel' : 'Select'}
                </button>

                <button 
                  onClick={handleDeleteAll}
                  disabled={isDeleting}
                  className="flex items-center gap-2 px-3 py-2 text-slate-400 dark:text-white/40 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all border border-transparent hover:border-rose-500/20" 
                  title="Delete All Tasks"
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
          {selectedTasks.length > 0 && (
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
                  <span className="text-sm font-bold text-brand-400">{selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''} selected</span>
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setSelectedTasks([])}
                    className="text-xs font-bold text-slate-500 dark:text-white/40 hover:text-slate-700 dark:hover:text-white transition-colors"
                  >
                    Clear Selection
                  </button>
                  <button 
                    onClick={handleDeleteSelected}
                    disabled={isDeleting}
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

        {/* Stats bar */}
        {tasks.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="max-w-max bg-white/5 border border-white/10 rounded-2xl px-6 py-4 mx-auto sm:mx-0 flex items-center gap-6"
          >
            {Object.entries(grouped).map(([status, items]) => {
              const cfg = statusConfig[status] || statusConfig.pending;
              return (
                <div key={status} className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
                  <div>
                    <p className="text-slate-900 dark:text-white text-lg font-bold tracking-tight">{items.length}</p>
                    <p className="text-[10px] text-slate-400 dark:text-white/40 font-bold uppercase tracking-widest">{cfg.label}</p>
                  </div>
                </div>
              );
            })}
            <div className="ml-auto flex items-center gap-2">
              <div className="w-24 h-2 bg-slate-200 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-full overflow-hidden">
                {(() => {
                  const total = tasks.length;
                  const done = grouped.completed.length;
                  const active = grouped['in-progress'].length;
                  return (
                    <div className="flex h-full">
                      <div className="bg-emerald-500 h-full transition-all" style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
                      <div className="bg-brand-500 h-full transition-all" style={{ width: `${total ? (active / total) * 100 : 0}%` }} />
                    </div>
                  );
                })()}
              </div>
              <span className="text-[10px] font-bold text-slate-400 dark:text-white/40 uppercase tracking-wider">
                {tasks.length ? Math.round((grouped.completed.length / tasks.length) * 100) : 0}% done
              </span>
            </div>
          </motion.div>
        )}

        {/* Empty */}
        {tasks.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="py-24 flex flex-col items-center justify-center text-center px-6 border border-dashed border-slate-200 dark:border-white/10 rounded-2xl relative overflow-hidden bg-slate-50 dark:bg-[#0E0F14]/50"
          >
            <div className="absolute inset-0 opacity-30 pointer-events-none">
              <div className="absolute top-10 left-1/4 w-32 h-32 bg-accent-500/20 rounded-full blur-[60px]" />
              <div className="absolute bottom-10 right-1/4 w-24 h-24 bg-brand-500/20 rounded-full blur-[50px]" />
            </div>
            <div className="w-20 h-20 bg-brand-500/10 shadow-glow-brand rounded-3xl flex items-center justify-center mb-6 border border-brand-500/20">
              <CheckCircleIcon className="w-10 h-10 text-brand-400" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-xl mb-2 tracking-tight">All Caught Up!</h3>
            <p className="text-slate-500 dark:text-white/50 text-sm max-w-sm mb-8 font-medium">Upload a lecture to automatically extract tasks, or adjust your filters.</p>
            <Link to="/upload" className="inline-flex items-center gap-2 stripe-gradient-bg text-slate-900 dark:text-white text-sm font-bold px-8 py-3.5 rounded-full transition-all shadow-glow-brand hover:scale-[1.03]">
              <PlusIcon className="w-5 h-5" /> Upload Lecture
            </Link>
          </motion.div>
        ) : (
          /* ── TIMELINE LAYOUT ── */
          <div className="relative">
            {/* Timeline vertical line */}
            <div className={`absolute top-0 bottom-0 w-px bg-gradient-to-b from-slate-200 dark:from-white/10 via-slate-100 dark:via-white/[0.06] to-transparent shadow-sm transition-all duration-300 ${isSelectionMode ? 'left-16 sm:left-20' : 'left-6 sm:left-8'}`} />

            {isSelectionMode && (
              <div className={`mb-4 flex items-center transition-all duration-300 ${isSelectionMode ? 'pl-24 sm:pl-32' : 'pl-14 sm:pl-16'}`}>
                <button 
                  onClick={toggleSelectAll}
                  className="flex items-center gap-2 group cursor-pointer"
                >
                  <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${selectedTasks.length === tasks.length && tasks.length > 0 ? 'bg-brand-500 border-brand-500' : 'border-slate-300 dark:border-white/10 dark:bg-white/5 group-hover:border-brand-500/50'}`}>
                    {selectedTasks.length === tasks.length && tasks.length > 0 && <CheckIcon className="w-3.5 h-3.5 text-white stroke-[3px]" />}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/30 group-hover:text-brand-400 transition-colors">
                    {selectedTasks.length === tasks.length && tasks.length > 0 ? 'Deselect All' : 'Select All Tasks'}
                  </span>
                </button>
              </div>
            )}

            <div className="space-y-4">
              <AnimatePresence>
                {tasks.map((task, i) => {
                  const dl = deadlineInfo(task.deadline);
                  const progress = calcProgress(task);
                  const pCfg = priorityConfig[task.priority?.toLowerCase()] || priorityConfig.low;
                  const sCfg = statusConfig[task.status?.toLowerCase()] || statusConfig.pending;
                  const radius = 14;
                  const circumference = 2 * Math.PI * radius;
                  const strokeOffset = circumference * (1 - progress / 100);

                  return (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.35, delay: i * 0.05 }}
                      className={`relative transition-all duration-300 ${isSelectionMode ? 'pl-24 sm:pl-32' : 'pl-14 sm:pl-16'} group`}
                    >
                      {/* Timeline node (Checkbox) */}
                      {isSelectionMode && (
                        <div className="absolute left-2 sm:left-4 top-7 z-20">
                           <button 
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleSelectTask(task.id); }}
                            className={`w-10 h-10 -ml-2 rounded-full flex items-center justify-center transition-all ${selectedTasks.includes(task.id) ? 'text-brand-400' : 'text-slate-400 dark:text-white/20 hover:text-brand-400/60'}`}
                           >
                              <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${selectedTasks.includes(task.id) ? 'bg-brand-500 border-brand-500 shadow-[0_0_10px_rgba(168,85,247,0.4)]' : 'border-slate-300 dark:border-white/10 dark:bg-white/5'}`}>
                                {selectedTasks.includes(task.id) && <CheckIcon className="w-3.5 h-3.5 text-white stroke-[3px]" />}
                              </div>
                           </button>
                        </div>
                      )}

                      {/* Timeline dot */}
                      <div className={`absolute top-10 z-10 w-4 h-4 transition-all duration-300 ${isSelectionMode ? 'left-[58px] sm:left-[74px]' : 'left-[18px] sm:left-[26px]'}`}>
                        <div className={`w-full h-full rounded-full ring-4 ${pCfg.ring} ${pCfg.dot} transition-all duration-300 group-hover:scale-125`} />
                      </div>

                       <div 
                        onClick={() => navigate(`/tasks/${task.id}`)}
                        className="block cursor-pointer group/card"
                      >
                        <div className={`relative bg-slate-50 dark:bg-[#0E0F14]/80 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-white/[0.05] overflow-hidden transition-all duration-500 hover:border-slate-300 dark:border-white/15 hover:shadow-[0_4px_30px_rgba(0,0,0,0.3)] group-hover/card:-translate-y-0.5`}>
                          {/* Top accent line */}
                          <div className={`h-[2px] w-full bg-gradient-to-r ${pCfg.accent} opacity-0 group-hover:opacity-60 transition-opacity duration-500`} />

                          <div className="p-5 sm:p-6">
                            {/* Row 1: Badges */}
                            <div className="flex items-center gap-2 flex-wrap mb-4">
                              <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2.5 py-1.5 rounded-lg uppercase tracking-widest ${pCfg.badge} border border-white/5`}>
                                <pCfg.Icon className="w-3 h-3" />{task.priority || 'Normal'}
                              </span>
                              <span className={`inline-flex items-center gap-1.5 text-[9px] font-bold px-2.5 py-1.5 rounded-lg uppercase tracking-widest ${sCfg.cls} border border-white/5`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${sCfg.dot}`} />
                                {sCfg.label}
                              </span>
                              {dl && (
                                <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2.5 py-1.5 rounded-lg uppercase tracking-widest ${dl.cls} border border-white/5`}>
                                  <CalendarIcon className="w-3 h-3" />{dl.text}
                                </span>
                              )}
                              <span className="text-[10px] text-slate-400 dark:text-white/30 font-medium ml-auto hidden sm:flex flex-col items-end">
                                <span>{task.deadline ? format(new Date(task.deadline), 'MMM d, yyyy') : 'No deadline'}</span>
                                {task.deadline && <span className="text-[9px] opacity-60">{format(new Date(task.deadline), 'h:mm a')}</span>}
                              </span>
                            </div>

                            {/* Row 2: Title + Description */}
                            <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white/90 line-clamp-1 group-hover:text-slate-900 dark:text-white transition-colors duration-300 mb-1.5 tracking-tight">{task.title}</h3>
                            <p className="text-sm text-slate-400 dark:text-white/40 line-clamp-2 font-medium leading-relaxed mb-4">{task.description}</p>

                            {/* Row 3: Progress + Subtasks + CTA */}
                            <div className="flex items-center gap-5">
                              {/* Mini progress ring */}
                              <div className="relative w-9 h-9 flex-shrink-0" style={{ color: progress === 100 ? '#10b981' : '#a855f7' }}>
                                <svg className="w-9 h-9 -rotate-90" viewBox="0 0 36 36">
                                  <circle cx="18" cy="18" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2.5" />
                                  <circle cx="18" cy="18" r={radius} fill="none" stroke="currentColor"
                                    strokeWidth="2.5" strokeLinecap="round"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={strokeOffset}
                                    style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                                  />
                                </svg>
                                <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-slate-700 dark:text-white/80">{progress}%</span>
                              </div>

                              {/* Progress bar */}
                              <div className="flex-1 max-w-xs">
                                <div className="h-1.5 w-full bg-slate-200 dark:bg-white/[0.04] rounded-full overflow-hidden border border-slate-300 dark:border-white/[0.04]">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.8, ease: 'easeOut' }}
                                    className={`h-full rounded-full ${progress === 100 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-accent-500 shadow-[0_0_8px_rgba(168,85,247,0.4)]'}`}
                                  />
                                </div>
                              </div>

                              {task.subtasks?.length > 0 && (
                                <span className="text-[10px] text-slate-400 dark:text-white/30 font-bold uppercase tracking-wider hidden sm:block">
                                  {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} subtasks
                                </span>
                              )}

                              {task.lectureTitle && (
                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-brand-500/10 dark:bg-white/5 border border-brand-500/20 dark:border-white/10 max-w-[180px]">
                                  <VideoCameraIcon className="w-2.5 h-2.5 text-brand-400" />
                                  <span className="text-[9px] font-bold text-brand-400 truncate">{task.lectureTitle}</span>
                                </div>
                              )}

                              {/* Actions */}
                              <div className="ml-auto flex items-center gap-3">
                                <button
                                  onClick={(e) => handleDeleteTask(task.id, e)}
                                  disabled={deletingId === task.id}
                                  className={`p-2 rounded-xl text-slate-400 dark:text-white/30 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all duration-300 opacity-0 group-hover/card:opacity-100 ${deletingId === task.id ? 'animate-pulse' : ''}`}
                                  title="Delete Task"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                                
                                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 dark:text-white/30 group-hover/card:text-brand-400 transition-all duration-300">
                                  <span className="hidden sm:inline">View</span>
                                  <ChevronRightIcon className="w-4 h-4 group-hover/card:translate-x-1 transition-transform" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
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

export default TasksPage;
