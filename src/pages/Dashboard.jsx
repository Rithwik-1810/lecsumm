import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { summaryService } from '../services/summaryService';
import { taskService } from '../services/taskService';
import Loader from '../components/common/Loader';
import {
  DocumentTextIcon, CheckCircleIcon, ClockIcon,
  CalendarIcon, ArrowRightIcon, PlusIcon,
  SparklesIcon, BoltIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] },
});

const Dashboard = () => {
  const { user, refreshUser } = useAuth();
  const [recentSummaries, setRecentSummaries] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { refreshUser(); fetchRecentData(); }, []);

  const fetchRecentData = async () => {
    try {
      const [summaries, tasks] = await Promise.all([
        summaryService.getSummaries(),
        taskService.getUserTasks('pending'),
      ]);
      setRecentSummaries(summaries.slice(0, 5));
      setUpcomingTasks(tasks.sort((a, b) => new Date(a.deadline) - new Date(b.deadline)).slice(0, 5));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const stats = user?.stats || { totalSummaries: 0, completedTasks: 0, hoursSaved: 0 };

  const getDaysLeft = (deadline) => {
    if (!deadline) return null;
    return Math.ceil((new Date(deadline) - new Date()) / 86400000);
  };

  const priorityBadge = (p) => ({
    high: 'bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/30',
    medium: 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/30',
    low: 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30',
  }[p?.toLowerCase()] || 'bg-slate-200 dark:bg-surface-800 text-slate-800 dark:text-white/90 border border-surface-700');

  const deadlinePill = (d) => {
    if (d === null) return null;
    if (d < 0) return { label: 'Overdue', cls: 'bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/30' };
    if (d === 0) return { label: 'Due Today', cls: 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/30' };
    if (d <= 2) return { label: `${d}d left`, cls: 'bg-orange-500/10 text-orange-400 ring-1 ring-orange-500/30' };
    return { label: `${d}d left`, cls: 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30' };
  };

  if (loading) return <Loader />;

  const statCards = [
    { label: 'Summaries Created', value: stats.totalSummaries, Icon: DocumentTextIcon, color: 'text-brand-400', bg: 'bg-brand-500/10', border: 'border-brand-500/20' },
    { label: 'Tasks Completed', value: stats.completedTasks, Icon: CheckCircleIcon, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { label: 'Hours Saved', value: stats.hoursSaved?.toFixed(1), Icon: ClockIcon, color: 'text-accent-400', bg: 'bg-accent-500/10', border: 'border-accent-500/20' },
  ];

  return (
    <div className="w-full">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">

        {/* Header */}
        <motion.div {...fadeUp(0)} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-widest text-brand-400 uppercase mb-2">Dashboard</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
              Welcome back, <span className="text-gradient animate-shine">{user?.name || 'Guest'}</span>
            </h1>
            <p className="text-slate-800 dark:text-white/90 text-sm mt-1.5">Overview of your summaries and tasks.</p>
          </div>
          <Link to="/upload"
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 active:scale-95 text-slate-900 dark:text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-glow-brand transition-all duration-300 hover:-translate-y-0.5 self-start sm:self-auto border border-brand-400/50"
          >
            <PlusIcon className="w-4 h-4" /> Upload Lecture
          </Link>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {statCards.map((s, i) => (
            <motion.div key={i} {...fadeUp(0.05 * (i + 1))}
              className="glass-card-ai p-6 flex items-center gap-4"
            >
              <div className={`w-12 h-12 rounded-xl border flex items-center justify-center flex-shrink-0 ${s.bg} ${s.border}`}>
                <s.Icon className={`w-6 h-6 ${s.color}`} />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-800 dark:text-white/90 uppercase tracking-widest">{s.label}</p>
                <p className="text-3xl font-display font-bold text-slate-900 dark:text-white mt-1 tracking-tight">{s.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Recent Summaries */}
          <motion.div {...fadeUp(0.2)} className="glass-card-ai flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-white/5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-brand-500/10 border border-brand-500/20">
                  <SparklesIcon className="w-4 h-4 text-brand-400" />
                </div>
                <h2 className="font-semibold text-slate-900 dark:text-white text-sm tracking-wide">Recent Summaries</h2>
              </div>
              <Link to="/summaries" className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1 group transition-colors">
                View all <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
            <div className="flex-1">
              {recentSummaries.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
                  <div className="w-12 h-12 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl flex items-center justify-center mb-4 shadow-glass-inset">
                    <DocumentTextIcon className="w-6 h-6 text-slate-800 dark:text-white/90" />
                  </div>
                  <p className="text-sm font-medium text-slate-800 dark:text-white/90">No summaries found.</p>
                  <Link to="/upload" className="mt-3 text-xs font-bold text-brand-400 hover:text-brand-300 transition-colors uppercase tracking-wider">Upload new lecture →</Link>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {recentSummaries.map((s) => (
                    <Link key={s.id} to={`/summary/${s.id}`}
                      className="flex items-start gap-4 px-6 py-4 hover:bg-slate-100 dark:bg-white/5 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 bg-brand-500/10 border border-brand-500/20 group-hover:scale-110 transition-transform">
                        <DocumentTextIcon className="w-4 h-4 text-brand-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white line-clamp-1 group-hover:text-brand-300 transition-colors">
                          {s.content?.substring(0, 72)}…
                        </p>
                        <p className="text-xs font-medium text-slate-800 dark:text-white/90 mt-1.5 flex items-center gap-1.5">
                          <CalendarIcon className="w-3.5 h-3.5" />
                          {formatDistanceToNow(new Date(s.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      {s.saved && <span className="text-[10px] font-bold px-2.5 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-md self-center flex-shrink-0 tracking-wider uppercase shadow-[0_0_10px_rgba(251,191,36,0.2)]">Saved</span>}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Upcoming Tasks */}
          <motion.div {...fadeUp(0.25)} className="glass-card-ai flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-white/5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-accent-500/10 border border-accent-500/20">
                  <BoltIcon className="w-4 h-4 text-accent-400" />
                </div>
                <h2 className="font-semibold text-slate-900 dark:text-white text-sm tracking-wide">Upcoming Tasks</h2>
              </div>
              <Link to="/tasks" className="text-xs font-semibold text-accent-400 hover:text-accent-300 flex items-center gap-1 group transition-colors">
                View all tasks <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
            <div className="flex-1">
              {upcomingTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
                  <div className="w-12 h-12 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl flex items-center justify-center mb-4 shadow-glass-inset">
                    <CheckCircleIcon className="w-6 h-6 text-slate-800 dark:text-white/90" />
                  </div>
                  <p className="text-sm font-medium text-slate-800 dark:text-white/90">No upcoming tasks.</p>
                  <p className="text-xs font-medium text-slate-800 dark:text-white/90 mt-1">Upload a new lecture to extract tasks.</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {upcomingTasks.map((task) => {
                    const d = getDaysLeft(task.deadline);
                    const pill = deadlinePill(d);
                    return (
                      <Link key={task.id} to={`/tasks/${task.id}`}
                        className="flex items-center gap-4 px-6 py-4 hover:bg-slate-100 dark:bg-white/5 transition-colors group"
                      >
                        <div className="w-2 h-2 rounded-full bg-accent-400 flex-shrink-0 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-white line-clamp-1 group-hover:text-slate-900 dark:text-white transition-colors">{task.title}</p>
                          <div className="flex items-center gap-2.5 mt-2 flex-wrap">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${priorityBadge(task.priority)}`}>{task.priority}</span>
                            {pill && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wider uppercase ${pill.cls}`}>{pill.label}</span>}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* CTA Banner */}
        <motion.div {...fadeUp(0.3)}
          className="relative overflow-hidden bg-white dark:bg-[#0B0C10] border border-slate-200 dark:border-white/10 rounded-[1.5rem] p-8 sm:p-10 text-slate-900 dark:text-white shadow-glow-accent group"
        >
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay"></div>
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-brand-500/20 rounded-full blur-[80px] pointer-events-none group-hover:bg-brand-500/30 transition-all duration-700" />
          <div className="absolute -bottom-10 right-40 w-48 h-48 bg-accent-500/20 rounded-full blur-[60px] pointer-events-none group-hover:bg-accent-500/30 transition-all duration-700" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold font-display tracking-tight text-slate-900 dark:text-white mb-2">Upload a new lecture</h3>
              <p className="text-slate-800 dark:text-white/90 text-sm font-medium max-w-md">Upload an audio or video file to automatically generate summaries and extract tasks.</p>
            </div>
            <Link to="/upload"
              className="inline-flex items-center gap-2 stripe-gradient-bg text-slate-900 dark:text-white font-bold text-sm px-8 py-4 rounded-full shadow-glow-brand hover:scale-[1.03] transition-all duration-300 flex-shrink-0 border border-slate-300 dark:border-white/20"
            >
              <PlusIcon className="w-5 h-5" /> Upload File
            </Link>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default Dashboard;
