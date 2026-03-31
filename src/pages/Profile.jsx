import React, { useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import {
  DocumentTextIcon, CheckCircleIcon, ClockIcon,
  SparklesIcon, ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const Profile = () => {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!hasFetched.current && refreshUser) {
      hasFetched.current = true;
      refreshUser();
    }
  }, [refreshUser]);

  const handleSignOut = () => { logout(); navigate('/'); };

  if (!user) return (
    <div className="w-full flex items-center justify-center px-4 py-20">
      <div className="glass-card-ai p-10 text-center max-w-sm w-full shadow-glow-brand">
        <div className="w-16 h-16 bg-brand-500/10 border border-brand-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
          <SparklesIcon className="w-8 h-8 text-brand-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Session Expired</h2>
        <p className="text-slate-800 dark:text-white/90 text-sm mb-8 font-medium">Please log in to view your profile.</p>
        <button onClick={() => navigate('/')} className="w-full stripe-gradient-bg border border-slate-300 dark:border-white/20 text-slate-900 dark:text-white text-sm font-bold py-3 rounded-full shadow-glow-brand hover:scale-[1.03] transition-transform uppercase tracking-widest">
          Return to Hub
        </button>
      </div>
    </div>
  );

  const stats = user.stats || { totalSummaries: 0, completedTasks: 0, hoursSaved: 0 };
  const initials = user.name ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : 'U';

  const statCards = [
    { label: 'Total Summaries', value: stats.totalSummaries, Icon: DocumentTextIcon, color: 'text-brand-600', bg: 'bg-brand-50', border: 'border-brand-100' },
    { label: 'Tasks Completed', value: stats.completedTasks, Icon: CheckCircleIcon, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { label: 'Hours Saved', value: stats.hoursSaved?.toFixed(1), Icon: ClockIcon, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100' },
  ];

  return (
    <div className="w-full">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <p className="text-[11px] font-bold tracking-widest text-brand-400 uppercase mb-2 opacity-80">Account</p>
          <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight">Profile</h1>
        </motion.div>

        {/* Profile Card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}
          className="glass-card-ai overflow-hidden shadow-glow-brand border border-slate-200 dark:border-white/10"
        >
          <div className="h-32 bg-gradient-to-br from-brand-600/40 via-accent-600/20 to-brand-900/40 relative overflow-hidden backdrop-blur-3xl">
            <div className="absolute inset-0 opacity-20"
              style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }}
            />
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-accent-500/30 rounded-full blur-3xl"></div>
          </div>
          <div className="px-8 pb-8 relative z-10">
            <div className="-mt-10 mb-5 flex items-end justify-between">
              <div className="w-20 h-20 rounded-2xl stripe-gradient-bg text-slate-900 dark:text-white font-bold text-2xl flex items-center justify-center ring-4 ring-white dark:ring-[#0B0C10] shadow-[0_0_20px_rgba(6,182,212,0.4)] relative overflow-hidden">
                <span className="relative z-10 tracking-widest">{initials}</span>
                <div className="absolute inset-0 bg-white/20 backdrop-blur-sm z-0"></div>
              </div>
              <button onClick={handleSignOut}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-white/90 hover:text-rose-400 px-4 py-2 rounded-xl hover:bg-rose-500/10 transition-colors border border-transparent hover:border-rose-500/30"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4" /> Sign Out
              </button>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{user.name || 'Student'}</h2>
            <p className="text-sm text-slate-800 dark:text-white/90 mt-1 font-medium">{user.email}</p>
            <div className="flex flex-wrap gap-3 mt-5">
              <span className="text-[10px] uppercase font-bold px-3 py-1.5 bg-brand-500/10 text-brand-300 rounded-lg border border-brand-500/30 tracking-widest shadow-[0_0_10px_rgba(6,182,212,0.1)]">Student</span>
              {user.achievements?.length > 0 && (
                <span className="text-[10px] uppercase font-bold px-3 py-1.5 bg-accent-500/10 text-accent-300 rounded-lg border border-accent-500/30 tracking-widest shadow-[0_0_10px_rgba(168,85,247,0.1)]">
                  {user.achievements.length} Achievement{user.achievements.length !== 1 ? 's' : ''} Unlocked
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
          className="glass-card-ai p-8 shadow-[0_0_15px_rgba(255,255,255,0.02)]"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/30 flex items-center justify-center">
              <SparklesIcon className="w-4 h-4 text-brand-400" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-widest">Your Impact</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {statCards.map((s, i) => (
              <div key={i} className={`flex flex-col items-center justify-center text-center p-5 rounded-2xl border bg-white dark:bg-[#0B0C10]/50 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                s.label.includes('Summaries') ? 'border-brand-500/20 hover:border-brand-500/50 hover:shadow-brand-500/20' :
                s.label.includes('Tasks') ? 'border-emerald-500/20 hover:border-emerald-500/50 hover:shadow-emerald-500/20' :
                'border-accent-500/20 hover:border-accent-500/50 hover:shadow-accent-500/20'
              }`}>
                <div className={`w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 border flex items-center justify-center mb-3 ${
                  s.label.includes('Summaries') ? 'border-brand-500/30 text-brand-400' :
                  s.label.includes('Tasks') ? 'border-emerald-500/30 text-emerald-400' :
                  'border-accent-500/30 text-accent-400'
                }`}>
                  <s.Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-800 dark:text-white/90 uppercase tracking-widest leading-none mb-2">{s.label}</p>
                  <p className="text-3xl font-display font-bold text-slate-900 dark:text-white">{s.value}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Achievements */}
        {user.achievements?.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}
            className="glass-card-ai p-8 shadow-[0_0_15px_rgba(255,255,255,0.02)]"
          >
            <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-5 uppercase tracking-widest">Achievements Unlocked</h3>
            <div className="flex flex-wrap gap-3">
              {user.achievements.map((ach, i) => (
                <span key={i} className="inline-flex items-center gap-2 px-4 py-2 bg-accent-500/10 border border-accent-500/30 text-accent-300 rounded-xl text-xs font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(168,85,247,0.1)]">
                  <span className="text-sm">🏆</span> {ach.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
};

export default Profile;
