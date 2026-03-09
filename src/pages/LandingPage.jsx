import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SparklesIcon, ClockIcon, DocumentTextIcon, CheckCircleIcon, ArrowRightOnRectangleIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

// Auth Modal Component (keep this as is)
const AuthModal = ({ isOpen, onClose, mode, onSwitchMode }) => {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        onClose();
        toast.success('Logged in successfully!');
        navigate('/dashboard');
      } else {
        toast.error(result.error || 'Login failed');
      }
    } catch (error) {
      toast.error('Login failed');
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      const result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      if (result.success) {
        onClose();
        toast.success('Account created successfully!');
        navigate('/dashboard');
      } else {
        toast.error(result.error || 'Registration failed');
      }
    } catch (error) {
      toast.error('Registration failed');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-teal-600 rounded-2xl shadow-lg mb-4">
              {mode === 'login' ? (
                <ArrowRightOnRectangleIcon className="h-8 w-8 text-white" />
              ) : (
                <UserPlusIcon className="h-8 w-8 text-white" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {mode === 'login' ? 'Welcome Back!' : 'Create Account'}
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              {mode === 'login' 
                ? 'Sign in to access your lectures and tasks' 
                : 'Join us to start summarizing your lectures'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={mode === 'login' ? handleLogin : handleSignup} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition outline-none"
                  autoComplete="off"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition outline-none"
                autoComplete="off"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition outline-none"
                autoComplete="off"
                required
              />
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your password"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition outline-none"
                  autoComplete="off"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition transform hover:scale-105"
            >
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={handleSwitchMode}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                {mode === 'login' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Main LandingPage component
const LandingPage = () => {
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  const features = [
    {
      icon: SparklesIcon,
      title: 'AI-Powered Summaries',
      description: 'Advanced NLP algorithms generate concise, accurate lecture summaries'
    },
    {
      icon: ClockIcon,
      title: 'Save Time',
      description: 'Reduce hours of lecture watching to minutes of reading'
    },
    {
      icon: DocumentTextIcon,
      title: 'Smart Task Extraction',
      description: 'Automatically identify assignments and deadlines'
    },
    {
      icon: CheckCircleIcon,
      title: 'Stay Organized',
      description: 'Keep all your lecture notes and tasks in one place'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Auth Modal */}
      <AnimatePresence>
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          mode={authMode}
          onSwitchMode={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
        />
      </AnimatePresence>

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-teal-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">AI</span>
              </div>
              <span className="text-xl font-bold text-gray-900">LectureSumm</span>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setAuthMode('login');
                  setShowAuthModal(true);
                }}
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setAuthMode('signup');
                  setShowAuthModal(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Turn Lectures into{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">
              Smart Notes
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Upload your lecture recording and let AI summarize key topics,
            extract tasks, and highlight deadlines automatically.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => {
                setAuthMode('signup');
                setShowAuthModal(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium text-lg shadow-lg"
            >
              Get Started Free
            </button>
            <button className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium text-lg hover:bg-gray-50">
              Watch Demo
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose LectureSumm?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-md">
                <feature.icon className="h-10 w-10 text-blue-600 mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to transform your learning?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of students who are saving hours of study time with AI-powered summaries.
          </p>
          <button
            onClick={() => {
              setAuthMode('signup');
              setShowAuthModal(true);
            }}
            className="bg-gradient-to-r from-blue-600 to-teal-500 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition transform hover:scale-105"
          >
            Start Your Free Trial
          </button>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;