import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './hooks/useAuth';
import Layout from './components/layout/Layout';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import UploadLecture from './pages/UploadLecture';
import SummaryResults from './pages/SummaryResults';
import MySummaries from './pages/MySummaries';
import TasksPage from './pages/TasksPage';
import TaskDetails from './pages/TaskDetails';  // Add this import
import SavedNotes from './pages/SavedNotes';
import Profile from './pages/Profile';
import './App.css';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="waveform">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="waveform-bar"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-slate-50 dark:bg-[#05050A] font-sans relative overflow-x-hidden selection:bg-brand-500/30 selection:text-brand-100 transition-colors duration-500">
      {/* Global Mind-Blowing AI Background */}
      <div className="fixed inset-0 overflow-hidden z-0 pointer-events-none">
        {/* Animated glowing orbs */}
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-accent-500/10 dark:bg-accent-500/30 rounded-full blur-[120px] animate-blob mix-blend-multiply dark:mix-blend-screen transition-opacity duration-1000"></div>
        <div className="absolute top-[20%] left-[-10%] w-[600px] h-[600px] bg-brand-500/10 dark:bg-brand-500/20 rounded-full blur-[120px] animate-blob animation-delay-2000 mix-blend-multiply dark:mix-blend-screen transition-opacity duration-1000"></div>
        <div className="absolute bottom-[-20%] right-[20%] w-[400px] h-[400px] bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-[120px] animate-blob animation-delay-4000 mix-blend-multiply dark:mix-blend-screen transition-opacity duration-1000"></div>
        {/* Subtle grid */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] [mask-image:radial-gradient(ellipse_at_center,white,transparent_80%)] opacity-20 dark:opacity-40" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Toaster position="top-right" />
        <Routes>
          {/* Public route - Landing Page */}
          <Route path="/" element={!user ? <LandingPage /> : <Navigate to="/dashboard" />} />
          
          {/* Protected routes - require authentication */}
          <Route path="/dashboard" element={user ? <Layout><Dashboard /></Layout> : <Navigate to="/" />} />
          <Route path="/upload" element={user ? <Layout><UploadLecture /></Layout> : <Navigate to="/" />} />
          <Route path="/summary/:id" element={user ? <Layout><SummaryResults /></Layout> : <Navigate to="/" />} />
          <Route path="/summaries" element={user ? <Layout><MySummaries /></Layout> : <Navigate to="/" />} />
          <Route path="/tasks" element={user ? <Layout><TasksPage /></Layout> : <Navigate to="/" />} />
          <Route path="/tasks/:id" element={user ? <Layout><TaskDetails /></Layout> : <Navigate to="/" />} />
          <Route path="/saved" element={user ? <Layout><SavedNotes /></Layout> : <Navigate to="/" />} />
          <Route path="/profile" element={user ? <Layout><Profile /></Layout> : <Navigate to="/" />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;