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
    <>
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
    </>
  );
}

export default App;