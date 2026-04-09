import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SparklesIcon, ClockIcon, DocumentTextIcon, CheckCircleIcon, ArrowRightOnRectangleIcon, UserPlusIcon, PlayCircleIcon, XMarkIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

// Auth Modal Component
const AuthModal = ({ isOpen, onClose, mode, onSwitchMode }) => {
  const { login, register, googleLogin, sendSignupOtp, sendForgotPasswordOtp, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [slowRequest, setSlowRequest] = useState(false);
  const [currentView, setCurrentView] = useState(mode);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    otp: '',
    newPassword: ''
  });

  React.useEffect(() => {
    setCurrentView(mode);
  }, [mode]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '', confirmPassword: '', otp: '', newPassword: '' });
  };

  const handleSwitchMode = () => {
    onSwitchMode();
    resetForm();
  };

  // Shows a "Server waking up" banner if request takes > 4 seconds (Render free tier cold start)
  const withSlowWarning = async (fn) => {
    const timer = setTimeout(() => setSlowRequest(true), 4000);
    try {
      await fn();
    } finally {
      clearTimeout(timer);
      setSlowRequest(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    await withSlowWarning(async () => {
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
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Security keys do not match.');
      return;
    }
    setLoading(true);
    await withSlowWarning(async () => {
      try {
        const result = await sendSignupOtp(formData.email);
        if (result.success) {
          toast.success('Verification code sent to your email.');
          setCurrentView('verify_signup');
        } else {
          toast.error(result.error || 'Failed to send verification code.');
        }
      } catch {
        toast.error('Connection error.');
      } finally {
        setLoading(false);
      }
    });
  };

  const handleVerifySignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await register({
        name: formData.name, email: formData.email, password: formData.password, otp: formData.otp
      });
      if (result.success) {
        toast.success('Email verified! Welcome aboard.');
        onClose();
        navigate('/dashboard');
      } else {
        toast.error(result.error || 'Verification failed');
      }
    } catch {
      toast.error('Verification error.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    await withSlowWarning(async () => {
      try {
        const result = await sendForgotPasswordOtp(formData.email);
        if (result.success) {
          toast.success('Reset code sent to your email.');
          setCurrentView('reset_password');
        } else {
          toast.error(result.error || 'Failed to send reset code.');
        }
      } catch {
        toast.error('Connection error.');
      } finally {
        setLoading(false);
      }
    });
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const result = await resetPassword(formData.email, formData.otp, formData.newPassword);
      if (result.success) {
        toast.success('Password reset successfully. You can now login.');
        setCurrentView('login');
      } else {
        toast.error(result.error || 'Password reset failed');
      }
    } catch {
      toast.error('Connection error.');
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

          {(currentView === 'login' || currentView === 'signup') && (
            <>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 stripe-gradient-bg rounded-2xl shadow-glow-brand mb-5 group-hover:scale-105 transition-transform">
                  {currentView === 'login' ? <ArrowRightOnRectangleIcon className="h-8 w-8 text-slate-900 dark:text-white relative z-10" /> : <UserPlusIcon className="h-8 w-8 text-slate-900 dark:text-white relative z-10" />}
                </div>
                <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
                  {currentView === 'login' ? 'Sign In' : 'Sign Up'}
                </h2>
                <p className="text-slate-800 dark:text-white/90 font-medium text-sm">
                  {currentView === 'login' ? 'Enter your details to sign in.' : 'Create an account to get started.'}
                </p>
              </div>

              <form onSubmit={currentView === 'login' ? handleLogin : handleSignup} className="space-y-4">
                {currentView === 'signup' && (
                  <Input label="Name" type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Your Name" required className="bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-surface-500 focus-stripe" />
                )}
                <Input label="Email Address" type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="you@email.com" required className="bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-surface-500 focus-stripe" />
                <Input label="Password" type="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="••••••••" required className="bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-surface-500 focus-stripe" />
                {currentView === 'signup' && (
                  <Input label="Confirm Password" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} placeholder="••••••••" required className="bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-surface-500 focus-stripe" />
                )}
                
                {currentView === 'login' && (
                  <div className="flex justify-end">
                    <button type="button" onClick={() => setCurrentView('forgot_password')} className="text-sm text-brand-400 hover:text-brand-300 font-medium transition-colors">
                      Forgot Password?
                    </button>
                  </div>
                )}

                {slowRequest && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-medium"
                  >
                    <span className="relative flex h-2 w-2 flex-shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                    </span>
                    Server is waking up from sleep — this may take 30 seconds on first use.
                  </motion.div>
                )}
                <div className="pt-2">
                  <Button type="submit" disabled={loading} className="w-full text-base py-3 stripe-gradient-bg shadow-glow-brand rounded-full text-slate-900 dark:text-white font-semibold flex items-center justify-center gap-2 hover:scale-[1.02] transition-all">
                    {loading ? <span className="animate-pulse">Processing...</span> : currentView === 'login' ? 'Sign In' : 'Continue'}
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
                  {currentView === 'login' ? "Don't have an account? " : "Already have an account? "}
                  <button type="button" onClick={handleSwitchMode} className="text-brand-400 hover:text-brand-300 font-bold transition-colors">
                    {currentView === 'login' ? 'Sign Up' : 'Sign In'}
                  </button>
                </p>
              </div>
            </>
          )}

          {currentView === 'verify_signup' && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="text-center mb-6">
                <CheckCircleIcon className="h-12 w-12 text-brand-400 mx-auto mb-4" />
                <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-2">Verify Email</h2>
                <p className="text-slate-800 dark:text-white/80 text-sm">We've sent a 6-digit code to {formData.email}</p>
              </div>
              <form onSubmit={handleVerifySignup} className="space-y-4">
                <Input label="Verification Code" type="text" name="otp" value={formData.otp} onChange={handleInputChange} placeholder="123456" required className="bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus-stripe text-center tracking-widest text-xl" maxLength={6} />
                <Button type="submit" disabled={loading} className="w-full text-base py-3 stripe-gradient-bg shadow-glow-brand rounded-full text-slate-900 dark:text-white font-semibold flex items-center justify-center">
                  {loading ? 'Verifying...' : 'Complete Sign Up'}
                </Button>
                <div className="text-center mt-4">
                  <button type="button" onClick={() => setCurrentView('signup')} className="text-sm text-slate-500 hover:text-slate-700 dark:text-white/50 hover:dark:text-white">← Back</button>
                </div>
              </form>
            </motion.div>
          )}

          {currentView === 'forgot_password' && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-2">Reset Password</h2>
                <p className="text-slate-800 dark:text-white/80 text-sm">Enter your email to receive a reset code.</p>
              </div>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <Input label="Email Address" type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="you@email.com" required className="bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus-stripe" />
                <Button type="submit" disabled={loading} className="w-full text-base py-3 stripe-gradient-bg shadow-glow-brand rounded-full text-slate-900 dark:text-white font-semibold">
                  {loading ? 'Sending...' : 'Send Reset Code'}
                </Button>
                <div className="text-center mt-4">
                  <button type="button" onClick={() => setCurrentView('login')} className="text-sm text-slate-500 hover:text-slate-700 dark:text-white/50 hover:dark:text-white">← Back to Login</button>
                </div>
              </form>
            </motion.div>
          )}

          {currentView === 'reset_password' && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-2">Choose New Password</h2>
                <p className="text-slate-800 dark:text-white/80 text-sm">Enter the code sent to your email and your new password.</p>
              </div>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <Input label="Reset Code" type="text" name="otp" value={formData.otp} onChange={handleInputChange} placeholder="123456" required className="bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus-stripe text-center tracking-widest text-xl" maxLength={6} />
                <Input label="New Password" type="password" name="newPassword" value={formData.newPassword} onChange={handleInputChange} placeholder="••••••••" required className="bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus-stripe" />
                <Input label="Confirm New Password" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} placeholder="••••••••" required className="bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus-stripe" />
                <Button type="submit" disabled={loading} className="w-full text-base py-3 stripe-gradient-bg shadow-glow-brand rounded-full text-slate-900 dark:text-white font-semibold">
                  {loading ? 'Resetting...' : 'Reset Password'}
                </Button>
              </form>
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
  const { theme, toggleTheme } = useTheme();
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
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-800 dark:text-white/90 hover:text-brand-400 dark:hover:text-brand-400 hover:bg-slate-100 dark:bg-white/5 rounded-full transition-all duration-300"
            title="Toggle Theme"
          >
            {theme === 'dark' ? (
              <SunIcon className="w-5 h-5 text-amber-400" />
            ) : (
              <MoonIcon className="w-5 h-5 text-indigo-400" />
            )}
          </button>
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