import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { summaryService } from '../services/summaryService';
import { taskService } from '../services/taskService';
import Loader from '../components/common/Loader';
import { 
  DocumentTextIcon, 
  CheckCircleIcon, 
  ClockIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';

const Dashboard = () => {
  const { user, refreshUser } = useAuth();
  const [recentSummaries, setRecentSummaries] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refreshUser(); // Refresh user stats
    fetchRecentData();
  }, []);

  const fetchRecentData = async () => {
    try {
      const [summaries, tasks] = await Promise.all([
        summaryService.getSummaries(),
        taskService.getUserTasks('pending')
      ]);
      setRecentSummaries(summaries.slice(0, 5));
      setUpcomingTasks(tasks.sort((a, b) => new Date(a.deadline) - new Date(b.deadline)).slice(0, 5));
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const stats = user?.stats || {
    totalSummaries: 0,
    completedTasks: 0,
    hoursSaved: 0
  };

  const statCards = [
    {
      title: 'Total Summaries',
      value: stats.totalSummaries,
      icon: DocumentTextIcon,
      gradient: 'from-blue-500 to-teal-500',
      bgLight: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Tasks Completed',
      value: stats.completedTasks,
      icon: CheckCircleIcon,
      gradient: 'from-green-500 to-emerald-500',
      bgLight: 'bg-green-50',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      title: 'Hours Saved',
      value: stats.hoursSaved.toFixed(1),
      icon: ClockIcon,
      gradient: 'from-purple-500 to-pink-500',
      bgLight: 'bg-purple-50',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600'
    }
  ];

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDaysLeft = (deadline) => {
    if (!deadline) return null;
    const today = new Date();
    const due = new Date(deadline);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) return <Loader />;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Welcome header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">{user?.name || 'Student'}</span>
        </h1>
        <p className="text-gray-500 mt-1">Here's what's happening with your lectures</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {statCards.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${card.iconBg}`}>
                  <card.icon className={`h-6 w-6 ${card.iconColor}`} />
                </div>
                <span className="text-3xl font-bold text-gray-900">{card.value}</span>
              </div>
              <h3 className="text-gray-600 font-medium">{card.title}</h3>
              <div className={`h-1 w-0 group-hover:w-full bg-gradient-to-r ${card.gradient} transition-all duration-500 mt-4 rounded-full`} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent summaries and upcoming tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent summaries */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100"
        >
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-teal-50">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                Recent Summaries
              </h2>
              <Link to="/summaries" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 group">
                View all
                <ArrowTrendingUpIcon className="h-4 w-4 group-hover:translate-x-1 transition" />
              </Link>
            </div>
          </div>
          {recentSummaries.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <p>No summaries yet.</p>
              <Link to="/upload" className="text-blue-600 hover:underline mt-2 inline-block">
                Upload a lecture
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentSummaries.map((summary) => (
                <Link
                  key={summary.id}
                  to={`/summary/${summary.id}`}
                  className="block px-6 py-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-teal-50 transition group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1 group-hover:text-blue-600 transition">
                        {summary.content.substring(0, 60)}...
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <CalendarIcon className="h-3.5 w-3.5" />
                        <span>{formatDistanceToNow(new Date(summary.createdAt), { addSuffix: true })}</span>
                      </div>
                    </div>
                    {summary.saved && (
                      <span className="ml-2 text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">
                        Saved
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </motion.div>

        {/* Upcoming tasks */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100"
        >
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-red-50">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <SparklesIcon className="h-5 w-5 text-orange-600" />
                Upcoming Tasks
              </h2>
              <Link to="/tasks" className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1 group">
                View all
                <ArrowTrendingUpIcon className="h-4 w-4 group-hover:translate-x-1 transition" />
              </Link>
            </div>
          </div>
          {upcomingTasks.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <p>No pending tasks.</p>
              <p className="text-xs mt-1">Upload a lecture with task extraction enabled.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {upcomingTasks.map((task) => {
                const daysLeft = getDaysLeft(task.deadline);
                return (
                  <Link
                    key={task.id}
                    to={`/tasks/${task.id}`}
                    className="block px-6 py-4 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 transition group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-medium text-gray-900 line-clamp-1 group-hover:text-orange-600 transition">
                            {task.title}
                          </h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        </div>
                        {task.deadline && (
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <CalendarIcon className="h-3.5 w-3.5" />
                            <span>Due {format(new Date(task.deadline), 'MMM d')}</span>
                            {daysLeft !== null && (
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                daysLeft < 0 ? 'bg-red-100 text-red-600' :
                                daysLeft === 0 ? 'bg-orange-100 text-orange-600' :
                                daysLeft <= 2 ? 'bg-yellow-100 text-yellow-600' :
                                'bg-green-100 text-green-600'
                              }`}>
                                {daysLeft < 0 ? 'Overdue' : `${daysLeft} days left`}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Quick action button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-8 text-center"
      >
        <Link
          to="/upload"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-500 text-white font-medium rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105"
        >
          <DocumentTextIcon className="h-5 w-5" />
          Upload New Lecture
        </Link>
      </motion.div>
    </div>
  );
};

export default Dashboard;