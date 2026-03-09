import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import UploadLecture from './pages/UploadLecture';
import SummaryResults from './pages/SummaryResults';
import MySummaries from './pages/MySummaries';
import TasksPage from './pages/TasksPage';
import SavedNotes from './pages/SavedNotes';
import Profile from './pages/Profile';
import TaskDetails from './pages/TaskDetails';

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/upload" element={<UploadLecture />} />
      <Route path="/summary/:id" element={<SummaryResults />} />
      <Route path="/summaries" element={<MySummaries />} />
      <Route path="/tasks" element={<TasksPage />} />
      <Route path="/saved" element={<SavedNotes />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/tasks/:id" element={<TaskDetails />} />
    </Routes>
  );
};

export default AppRouter;  // THIS MUST BE HERE