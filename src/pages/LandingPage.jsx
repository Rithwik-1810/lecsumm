import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SparklesIcon, ClockIcon, DocumentTextIcon, CheckCircleIcon, ArrowRightOnRectangleIcon, UserPlusIcon, PlayCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

// Auth Modal Component
const AuthModal = ({ isOpen, onClose, mode, onSwitchMode }) => {
  const { login, register, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [verificationStep, setVerificationStep] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        onClose();
        toast.success('System Connected. Welcome back.');
        navigate('/dashboard');
      } else {
        toast.error('Account not found or invalid credentials.');
      }
    } catch {
      toast.error('Authentication Error. Connection Severed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Security keys do not match.');
      return;
    }
    setLoading(true);
    try {
      const result = await register({
        name: formData.name, email: formData.email, password: formData.password
      });
      if (result.success) {
        setVerificationStep(true); 
      } else {
        toast.error(result.error || 'Registration failed');
      }
    } catch {
      toast.error('Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const result = await googleLogin(credentialResponse.credential);
      if (result.success) {
        onClose();
        toast.success('Google Authentication Successful.');
        navigate('/dashboard');
      } else {
        toast.error(result.error || 'Google login failed');
      }
    } catch (err) {
      toast.error('Google Connection Error.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-redirect after showing verification screen
  React.useEffect(() => {
    if (verificationStep) {
      const timer = setTimeout(() => {
        onClose();
        toast.success('Email verified! Welcome aboard.');
        navigate('/dashboard');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [verificationStep, navigate, onClose]);

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
    setVerificationStep(false);
  };

  const handleSwitchMode = () => {
    onSwitchMode();
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-100 dark:bg-[#05050A]/80 backdrop-blur-xl"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 20, opacity: 0 }}
        transition={{ type: "spring", duration: 0.6, bounce: 0.2 }}
        className="relative w-full max-w-md bg-white dark:bg-[#0B0C10]/90 border border-slate-200 dark:border-white/10 rounded-[2rem] overflow-hidden shadow-glow-brand"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 -left-10 w-40 h-40 bg-brand-500/20 rounded-full blur-[60px] pointer-events-none" />
        <div className="absolute bottom-0 -right-10 w-40 h-40 bg-accent-500/20 rounded-full blur-[60px] pointer-events-none" />

        <div className="relative p-8 sm:p-10">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-800 dark:text-white/90 hover:text-slate-900 dark:text-white hover:bg-slate-200 dark:bg-white/10 rounded-full transition-all">
            <XMarkIcon className="w-5 h-5" />
          </button>

          {!verificationStep ? (
            <>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 stripe-gradient-bg rounded-2xl shadow-glow-brand mb-5 group-hover:scale-105 transition-transform">
                  {mode === 'login' ? <ArrowRightOnRectangleIcon className="h-8 w-8 text-slate-900 dark:text-white relative z-10" /> : <UserPlusIcon className="h-8 w-8 text-slate-900 dark:text-white relative z-10" />}
                </div>
                <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
                  {mode === 'login' ? 'Sign In' : 'Sign Up'}
                </h2>
                <p className="text-slate-800 dark:text-white/90 font-medium text-sm">
                  {mode === 'login' ? 'Enter your details to sign in.' : 'Create an account to get started.'}
                </p>
              </div>

              <form onSubmit={mode === 'login' ? handleLogin : handleSignup} className="space-y-4">
                {mode === 'signup' && (
                  <Input label="Name" type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Rithwik..,Harsha..,Deekshith..," required className="bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-surface-500 focus-stripe" />
                )}
                <Input label="Email Address" type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="23......5XX@cvr.ac.in" required className="bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-surface-500 focus-stripe" />
                <Input label="Password" type="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="••••••••" required className="bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-surface-500 focus-stripe" />
                {mode === 'signup' && (
                  <Input label="Confirm Password" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} placeholder="••••••••" required className="bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-surface-500 focus-stripe" />
                )}

                <div className="pt-2">
                  <Button type="submit" disabled={loading} className="w-full text-base py-3 stripe-gradient-bg shadow-glow-brand rounded-full text-slate-900 dark:text-white font-semibold flex items-center justify-center gap-2 hover:scale-[1.02] transition-all">
                    {loading ? <span className="animate-pulse">Processing...</span> : mode === 'login' ? 'Sign In' : 'Sign Up'}
                  </Button>
                </div>
              </form>

              <div className="mt-6 flex flex-col gap-4">
                <div className="relative flex items-center">
                  <div className="flex-grow border-t border-slate-200 dark:border-white/10" />
                  <span className="flex-shrink-0 mx-4 text-slate-800 dark:text-white/90 text-xs font-semibold uppercase tracking-widest">Or</span>
                  <div className="flex-grow border-t border-slate-200 dark:border-white/10" />
                </div>
                
                <div className="flex justify-center">
                  <GoogleLogin 
                    onSuccess={handleGoogleSuccess}
                    onError={() => toast.error('Google Sign-In Error')}
                    useOneTap
                    theme="filled_blue"
                    shape="circle"
                    text="continue_with"
                    width="320"
                  />
                </div>
              </div>

              <div className="mt-8 text-center text-sm">
                <p className="text-slate-800 dark:text-white/90 font-medium">
                  {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                  <button type="button" onClick={handleSwitchMode} className="text-brand-400 hover:text-brand-300 font-bold transition-colors">
                    {mode === 'login' ? 'Sign Up' : 'Sign In'}
                  </button>
                </p>
              </div>
            </>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
              <div className="text-center py-4">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500/15 border border-emerald-500/30 rounded-full mb-6 shadow-[0_0_30px_rgba(16,185,129,0.25)]">
                  <CheckCircleIcon className="h-10 w-10 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-3 tracking-tight">Verification Email Sent!</h2>
                <p className="text-slate-700 dark:text-white/80 font-medium text-sm px-4 leading-relaxed">
                  We've sent a verification link to<br />
                  <strong className="text-brand-300">{formData.email}</strong>
                </p>
                
                <div className="mt-8 flex flex-col items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-emerald-400 font-semibold">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Redirecting to dashboard...
                  </div>
                  <p className="text-xs text-slate-500 dark:text-white/50 font-medium">You'll be redirected automatically</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// ... InfiniteMarquee and LandingPage components remain unchanged
const marqueeItems = [
  { text: 'AI-Powered Summaries', emoji: '✨' },
  { text: 'Instant Transcription', emoji: '🎙️' },
  { text: 'Smart Task Extraction', emoji: '📋' },
  { text: 'Save Hours Every Week', emoji: '⏱️' },
  { text: 'Multi-Language Support', emoji: '🌍' },
  { text: 'Auto-Detect Deadlines', emoji: '📅' },
  { text: 'Deep Learning Models', emoji: '🧠' },
  { text: 'Searchable Notes', emoji: '🔍' },
  { text: 'Study Smarter, Not Harder', emoji: '🚀' },
  { text: 'High-Accuracy Whisper AI', emoji: '🎯' },
];

const InfiniteMarquee = () => {
  const items = [...marqueeItems, ...marqueeItems];
  return (
    <div className="relative z-10 overflow-hidden py-5 border-y border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B0C10]/40 backdrop-blur-md">
      <div className="pointer-events-none absolute left-0 top-0 h-full w-32 bg-gradient-to-r from-white dark:from-[#05050A] to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 h-full w-32 bg-gradient-to-l from-white dark:from-[#05050A] to-transparent z-10" />
      <div
        style={{
          display: 'flex',
          width: 'max-content',
          animation: 'marquee-scroll 55s linear infinite',
          willChange: 'transform',
        }}
      >
        {items.map((item, idx) => (
          <span
            key={idx}
            className="inline-flex items-center gap-2 mx-8 whitespace-nowrap"
          >
            <span className="text-base font-semibold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-accent-500 to-brand-500">
              {item.emoji}&nbsp;{item.text}
            </span>
            <span className="text-brand-300 text-lg select-none">◈</span>
          </span>
        ))}
      </div>
      <style>{`
        @keyframes marquee-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};

const LandingPage = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  const features = [
    { icon: SparklesIcon, title: 'AI-Powered Summaries', description: 'Advanced NLP algorithms instantly compress hours of lectures into highly accurate, readable notes.', color: 'from-blue-500 to-indigo-500' },
    { icon: ClockIcon, title: 'Save Countless Hours', description: 'Reduce hours of lecture watching to mere minutes of efficient reading. Reclaim your study time.', color: 'from-amber-400 to-orange-500' },
    { icon: DocumentTextIcon, title: 'Smart Task Extraction', description: 'Automatically scan transcripts to identify assignments, homework, and looming deadlines.', color: 'from-teal-400 to-emerald-500' },
    { icon: CheckCircleIcon, title: 'Flawless Organization', description: 'Keep all your lecture notes perfectly categorized and infinitely searchable in one secure place.', color: 'from-purple-500 to-pink-500' }
  ];

  return (
    <div className="w-full relative overflow-hidden">
      <AnimatePresence>
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          mode={authMode}
          onSwitchMode={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
        />
      </AnimatePresence>

      <nav className="relative z-10 max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-12 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-glow-brand group-hover:shadow-glow-accent transition-all duration-500">
            <SparklesIcon className="w-6 h-6 text-brand-400 group-hover:text-accent-400 transition-colors" />
          </div>
          <span className="text-xl font-bold font-display tracking-tight text-slate-900 dark:text-white hidden sm:block">LectureSumm</span>
        </div>
        <div className="flex items-center gap-6 text-sm font-medium">
          <button onClick={() => { setAuthMode('login'); setShowAuthModal(true); }} className="text-slate-800 dark:text-white/90 hover:text-slate-900 dark:text-white transition-colors">Sign In</button>
          <Button onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }} size="sm" className="hidden sm:inline-flex rounded-full text-xs px-6 py-2.5 stripe-gradient-bg shadow-glow-brand">Sign Up <span className="ml-1 opacity-70">→</span></Button>
        </div>
      </nav>

      <section className="relative z-10 max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-12 pt-32 pb-40">
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: "easeOut" }} className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, duration: 0.8 }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 text-brand-300 font-semibold text-xs mb-8 border border-brand-500/30 backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <SparklesIcon className="w-4 h-4 animate-pulse" />
            <span>Welcome to LectureSumm v2.0</span>
          </motion.div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-slate-900 dark:text-white mb-8 leading-[1.1] font-display tracking-tighter">Compress knowledge. <br /><span className="text-gradient animate-shine">Expand mind.</span></h1>
          <p className="text-lg md:text-xl text-slate-800 dark:text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed">Upload raw audiovisual data. Our advanced AI dissects, summarizes, and extracts actionable insights in milliseconds. Welcome to the future of learning.</p>
          <div className="flex flex-col sm:flex-row gap-5 items-center justify-center">
            <Button size="lg" className="w-full sm:w-auto text-base px-10 py-4 stripe-gradient-bg shadow-glow-brand rounded-full hover:scale-105 transition-all text-slate-900 dark:text-white font-bold" onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }}>Get Started <span className="ml-2 opacity-70">→</span></Button>
          </div>
        </motion.div>
      </section>

      <section className="relative z-10 border-y border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B0C10]/50 backdrop-blur-xl py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div><p className="text-4xl font-display font-bold text-gradient">50K+</p><p className="text-slate-800 dark:text-white/90 mt-1 font-medium text-sm uppercase tracking-widest">Lectures Processed</p></div>
            <div><p className="text-4xl font-display font-bold text-gradient">2M+</p><p className="text-slate-800 dark:text-white/90 mt-1 font-medium text-sm uppercase tracking-widest">Hours Saved</p></div>
            <div><p className="text-4xl font-display font-bold text-gradient">4.9/5</p><p className="text-slate-800 dark:text-white/90 mt-1 font-medium text-sm uppercase tracking-widest">User Rating</p></div>
            <div><p className="text-4xl font-display font-bold text-gradient">100+</p><p className="text-slate-800 dark:text-white/90 mt-1 font-medium text-sm uppercase tracking-widest">Active Users</p></div>
          </div>
        </div>
      </section>

      <InfiniteMarquee />

      <section className="relative z-10 py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20 animate-fade-up">
            <h2 className="text-4xl md:text-5xl font-bold font-display text-slate-900 dark:text-white mb-6 tracking-tight">A complete toolkit for the <span className="text-gradient">modern student</span></h2>
            <p className="text-xl text-slate-800 dark:text-white/90">Stop re-watching videos. Read what matters and stay ahead of your curriculum with precision-engineered AI tools.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1, duration: 0.5 }} className="glass-card-ai p-8 group">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-brand-400 group-hover:scale-110 group-hover:bg-brand-500/20 group-hover:text-brand-300 transition-all duration-300 shadow-glow-brand"><feature.icon className="h-7 w-7" /></div>
                <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-slate-800 dark:text-white/90 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 py-32 px-4">
        <div className="max-w-5xl mx-auto bg-white dark:bg-[#0B0C10] border border-slate-200 dark:border-white/10 rounded-[3rem] p-12 md:p-20 text-center shadow-glow-accent overflow-hidden relative group">
          <div className="absolute inset-0 bg-slate-900/5 mix-blend-overlay"></div>
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-500/20 blur-[100px] rounded-full group-hover:bg-brand-500/30 transition-colors duration-700"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent-500/20 blur-[100px] rounded-full group-hover:bg-accent-500/30 transition-colors duration-700"></div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black font-display text-slate-900 dark:text-white mb-8 relative z-10 tracking-tight">Ready to scale your <span className="text-gradient">knowledge base?</span></h2>
          <p className="text-xl text-slate-800 dark:text-white/90 mb-12 max-w-2xl mx-auto relative z-10 font-medium">Join the network. Upgrade your learning capabilities with AI processing today.</p>
          <button onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }} className="relative z-10 stripe-gradient-bg text-slate-900 dark:text-white px-12 py-5 rounded-full font-bold text-xl shadow-glow-brand hover:scale-105 transition-all duration-300">Start Saving Time</button>
        </div>
      </section>

      <footer className="relative z-10 border-t border-slate-200 dark:border-white/10 py-12 text-center text-slate-800 dark:text-white/90 font-medium bg-slate-100 dark:bg-[#05050A]/80 backdrop-blur-md">
        <p>Ready to go. © 2026 LectureSumm. Designed with AI.</p>
      </footer>
    </div>
  );
};

export default LandingPage;