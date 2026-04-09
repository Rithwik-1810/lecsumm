import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { taskService } from '../services/taskService';
import Loader from '../components/common/Loader';
import {
  CalendarIcon, ArrowLeftIcon, CheckCircleIcon, ClockIcon,
  ExclamationTriangleIcon, PencilSquareIcon, TrashIcon, ListBulletIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow, isPast, isToday, isTomorrow, format } from 'date-fns';
import ConfirmModal from '../components/common/ConfirmModal';

const pMap = {
  high: { badge: 'bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.1)]', bar: 'bg-rose-500', Icon: ExclamationTriangleIcon },
  medium: { badge: 'bg-amber-500/10 text-amber-400 border border-amber-500/20', bar: 'bg-amber-500', Icon: ClockIcon },
  low: { badge: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20', bar: 'bg-emerald-500', Icon: CheckCircleIcon },
};

const dlInfo = (d) => {
  if (!d) return null;
  const dt = new Date(d);
  const timeStr = format(dt, 'h:mm a');
  if (isPast(dt) && !isToday(dt)) return { text: `Overdue (${formatDistanceToNow(dt)})`, time: timeStr, cls: 'bg-rose-500/10 text-rose-400 border border-rose-500/20' };
  if (isToday(dt)) return { text: 'Due Today', time: timeStr, cls: 'bg-orange-500/10 text-orange-400 border border-orange-500/20' };
  if (isTomorrow(dt)) return { text: 'Due Tomorrow', time: timeStr, cls: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' };
  return { text: `Due ${formatDistanceToNow(dt, { addSuffix: true })}`, time: timeStr, cls: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' };
};

const TaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedTask, setEditedTask] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  useEffect(() => { fetchTask(); }, [id]);

  const fetchTask = async () => {
    try { const d = await taskService.getTaskById(id); setTask(d); setEditedTask(d); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const update = async (payload) => {
    setUpdating(true);
    try { const u = await taskService.updateTask(task.id, payload); setTask(u); setEditedTask(u); return u; }
    catch (err) { console.error(err); }
    finally { setUpdating(false); }
  };

  const handleStatusChange = async (newStatus) => {
    if (updating) return;
    const oldTask = { ...task };
    const updated = { ...task, status: newStatus };
    if (newStatus === 'completed') updated.progress = 100;
    else if (newStatus === 'pending') updated.progress = 0;
    else if (newStatus === 'in-progress' && updated.progress === 0) updated.progress = 10;
    
    setTask(updated);
    
    try {
      // Send the updated payload (with correct progress) — not stale task
      const u = await taskService.updateTask(task.id, updated);
      setTask(u);
      setEditedTask(u);
    } catch (err) {
      console.error(err);
      setTask(oldTask);
    }
  };

  const handleSubtaskToggle = (i) => update({ ...task, subtasks: task.subtasks.map((s, j) => j === i ? { ...s, completed: !s.completed } : s) });
  const handleSaveEdit = async () => { await update(editedTask); setEditMode(false); };
  
  const handleDelete = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Task',
      message: 'Are you sure you want to delete this task? This action cannot be undone.',
      onConfirm: async () => {
        try { await taskService.deleteTask(task.id); navigate('/tasks'); } catch (e) { console.error(e); }
      }
    });
  };

  const progress = task ? (!task.subtasks?.length ? task.progress || 0 : Math.round(task.subtasks.filter(s => s.completed).length / task.subtasks.length * 100)) : 0;

  if (loading) return <Loader />;
  if (error) return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="bg-red-50 border border-red-200 p-5 rounded-2xl max-w-md text-red-700">
        <p className="font-semibold text-sm">Error loading task</p>
        <p className="text-xs mt-1 opacity-80">{error}</p>
        <button onClick={() => navigate('/tasks')} className="mt-3 text-xs font-semibold hover:underline">← Back to Tasks</button>
      </div>
    </div>
  );
  if (!task) return (
    <div className="max-w-4xl mx-auto px-6 py-20 text-center">
      <div className="glass-card-ai p-10 max-w-sm mx-auto shadow-glow-brand">
        <p className="text-slate-800 dark:text-white/90 text-sm mb-6 font-medium">Task not found.</p>
        <button onClick={() => navigate('/tasks')} className="stripe-gradient-bg text-slate-900 dark:text-white text-sm font-bold px-6 py-3 rounded-full hover:scale-[1.03] transition-transform shadow-glow-brand border border-slate-300 dark:border-white/20">Back to Tasks</button>
      </div>
    </div>
  );

  const cfg = pMap[task.priority?.toLowerCase()] || pMap.low;
  const PIcon = cfg.Icon;
  const dl = dlInfo(task.deadline);
  const normalizedStatus = task.status?.toLowerCase() || 'pending';

  return (
    <div className="w-full">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">

        {/* Nav bar */}
        <div className="flex items-center justify-between">
          <button onClick={() => navigate('/tasks')} className="flex items-center gap-1.5 text-sm font-bold text-slate-800 dark:text-white/90 hover:text-brand-400 transition-colors group tracking-wide uppercase">
            <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Tasks
          </button>
          <div className="flex items-center gap-3">
            <button onClick={() => setEditMode(!editMode)}
              className={`p-2.5 rounded-xl border transition-all duration-300 text-sm shadow-glass-inset ${editMode ? 'bg-brand-500/20 border-brand-500/30 text-brand-300 shadow-glow-brand' : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-800 dark:text-white/90 hover:text-brand-400 hover:bg-brand-500/10 hover:border-brand-500/30'}`}
            >
              <PencilSquareIcon className="w-4 h-4" />
            </button>
            <button onClick={handleDelete} className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-800 dark:text-white/90 hover:text-rose-400 hover:border-rose-500/30 hover:bg-rose-500/10 shadow-glass-inset transition-all duration-300">
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main card */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card-ai overflow-hidden shadow-glow-brand"
        >
          <div className={`h-1.5 w-full bg-gradient-to-r from-transparent via-current to-transparent ${cfg.bar} opacity-80`} />
          <div className="p-6">
            <AnimatePresence mode="wait">
              {editMode ? (
                <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                  <p className="text-xs font-bold text-slate-500 dark:text-white/50 uppercase tracking-widest mb-2">Editing Task</p>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-white/70 block mb-1">Title</label>
                    <input type="text" value={editedTask?.title || ''} onChange={e => setEditedTask({ ...editedTask, title: e.target.value })}
                      className="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-white/10 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-white/70 block mb-1">Description</label>
                    <textarea rows={4} value={editedTask?.description || ''} onChange={e => setEditedTask({ ...editedTask, description: e.target.value })}
                      className="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-white/10 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white placeholder-white/30 resize-none focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 transition-colors"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-white/70 block mb-1">Priority</label>
                      <select value={editedTask?.priority || ''} onChange={e => setEditedTask({ ...editedTask, priority: e.target.value })}
                        className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-white/10 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 cursor-pointer transition-colors"
                      >
                        <option className="bg-white dark:bg-[#0B0C10]" value="">Select</option>
                        <option className="bg-white dark:bg-[#0B0C10]" value="high">High</option>
                        <option className="bg-white dark:bg-[#0B0C10]" value="medium">Medium</option>
                        <option className="bg-white dark:bg-[#0B0C10]" value="low">Low</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-white/70 block mb-1">Deadline</label>
                      <input type="date" value={editedTask?.deadline || ''} onChange={e => setEditedTask({ ...editedTask, deadline: e.target.value })}
                        className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-white/10 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 transition-colors [color-scheme:dark]"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <button onClick={() => setEditMode(false)} className="px-5 py-2 text-sm font-bold text-slate-800 dark:text-white/90 border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 rounded-xl hover:bg-slate-200 dark:bg-white/10 hover:text-slate-900 dark:text-white transition-colors">Cancel</button>
                    <button onClick={handleSaveEdit} disabled={updating}
                      className="px-6 py-2 text-sm font-bold stripe-gradient-bg text-slate-900 dark:text-white rounded-xl shadow-glow-brand hover:scale-[1.02] transition-all disabled:opacity-50 border border-slate-300 dark:border-white/20"
                    >{updating ? 'Saving…' : 'Save Changes'}</button>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider mb-5 ${cfg.badge}`}>
                    <PIcon className="w-3.5 h-3.5" />{task.priority || 'Normal'} Priority
                  </span>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">{task.title}</h1>
                  {task.course && <span className="inline-block text-[11px] font-bold px-3 py-1 bg-brand-500/10 text-brand-300 border border-brand-500/20 rounded-lg mb-4 tracking-wider uppercase">{task.course}</span>}
                  <p className="text-slate-800 dark:text-white/90 text-sm leading-relaxed mb-8 font-medium">{task.description}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    {dl && (
                      <div className={`flex items-center gap-3 px-5 py-4 rounded-xl shadow-glass-inset ${dl.cls}`}>
                        <CalendarIcon className="w-5 h-5 flex-shrink-0" />
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Deadline</p>
                          <p className="text-sm font-bold tracking-wide">{dl.text}</p>
                          <p className="text-[10px] font-medium opacity-60 mt-0.5">{dl.time}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-4 px-5 py-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 shadow-glass-inset hover:border-accent-500/30 hover:bg-slate-200 dark:bg-white/10 transition-colors">
                      <div className="relative w-12 h-12 flex-shrink-0 drop-shadow-[0_0_8px_currentColor] text-accent-500" style={{ color: progress === 100 ? '#10b981' : '#a855f7' }}>
                        <svg className="w-12 h-12 -rotate-90" viewBox="0 0 40 40">
                          <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                          <circle cx="20" cy="20" r="16" fill="none" stroke="currentColor"
                            strokeWidth="3" strokeLinecap="round"
                            strokeDasharray={String(2 * Math.PI * 16)}
                            strokeDashoffset={String(2 * Math.PI * 16 * (1 - progress / 100))}
                            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-900 dark:text-white">{progress}%</span>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-800 dark:text-white/90">Completion</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{progress === 100 ? 'Completed' : progress === 0 ? 'Pending' : 'In Progress'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-800 dark:text-white/90 mb-3">Task Status</p>
                    <div className="relative flex p-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl w-full sm:w-fit shadow-glass-inset overflow-hidden">
                      <motion.div
                        className="absolute top-1.5 bottom-1.5 bg-brand-500/20 border border-brand-500/30 rounded-xl shadow-glow-brand"
                        initial={false}
                        animate={{
                          left: normalizedStatus === 'pending' ? '6px' : normalizedStatus === 'in-progress' ? '33.3%' : '66.6%',
                          width: 'calc(33.3% - 8px)',
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                      {['pending', 'in-progress', 'completed'].map((s) => (
                        <button
                          key={s}
                          onClick={() => handleStatusChange(s)}
                          disabled={updating}
                          className={`relative z-10 flex-1 sm:flex-none sm:min-w-[120px] px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${normalizedStatus === s ? 'text-brand-300' : 'text-slate-500 dark:text-white/40 hover:text-slate-800 dark:hover:text-white/80'}`}
                        >
                          {s.replace('-', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>


        {/* Subtasks */}
        {!editMode && task.subtasks?.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="glass-card-ai overflow-hidden"
          >
            <div className="px-6 py-5 border-b border-slate-200 dark:border-white/10 flex items-center gap-3 bg-slate-100 dark:bg-white/5">
              <div className="w-8 h-8 bg-accent-500/10 border border-accent-500/20 rounded-lg flex items-center justify-center shadow-[0_0_10px_rgba(168,85,247,0.1)]">
                <ListBulletIcon className="w-4 h-4 text-accent-400" />
              </div>
              <h2 className="font-bold text-slate-900 dark:text-white tracking-tight">Sub-tasks</h2>
              <span className="ml-auto text-[10px] uppercase font-bold px-2.5 py-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white/90 rounded-md tracking-wider">
                {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} Completed
              </span>
            </div>
            <div className="p-6 space-y-3">
              {task.subtasks.map((sub, i) => (
                <motion.button key={i} onClick={() => handleSubtaskToggle(i)}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                  className={`w-full flex items-start gap-4 p-4 rounded-xl border text-left transition-all duration-300 group ${sub.completed ? 'bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]' : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-accent-500/40 hover:bg-accent-500/10'}`}
                >
                  <div className="mt-0.5 flex-shrink-0 transition-transform group-hover:scale-110">
                    {sub.completed
                      ? <CheckCircleSolid className="w-5 h-5 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                      : <div className="w-5 h-5 rounded-full border-2 border-surface-400 group-hover:border-accent-400 transition-colors" />
                    }
                  </div>
                  <span className={`text-sm tracking-wide font-medium leading-relaxed transition-colors pt-0.5 ${sub.completed ? 'line-through text-slate-800 dark:text-white/90' : 'text-slate-800 dark:text-white/90 group-hover:text-slate-900 dark:text-white'}`}>{sub.title}</span>
                </motion.button>
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

export default TaskDetails;
