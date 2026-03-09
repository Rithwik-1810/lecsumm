import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { taskService } from '../services/taskService';
import Loader from '../components/common/Loader';
import { 
  CalendarIcon, 
  FunnelIcon, 
  CheckCircleIcon, 
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { format, formatDistanceToNow, isPast, isToday, isTomorrow } from 'date-fns';

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({ status: '', priority: '' });
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  useEffect(() => {
    fetchTasks();
  }, [filter]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const data = await taskService.getUserTasks(filter.status, filter.priority);
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return <ExclamationTriangleIcon className="h-4 w-4" />;
      case 'medium': return <ClockIcon className="h-4 w-4" />;
      case 'low': return <CheckCircleIcon className="h-4 w-4" />;
      default: return null;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-gradient-to-r from-red-500 to-pink-500 text-white border-red-200';
      case 'medium': return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-yellow-200';
      case 'low': return 'bg-gradient-to-r from-green-500 to-teal-500 text-white border-green-200';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getDeadlineDisplay = (deadline) => {
    if (!deadline) return null;
    const date = new Date(deadline);
    if (isPast(date) && !isToday(date)) {
      return { text: `Overdue by ${formatDistanceToNow(date)}`, className: 'bg-red-100 text-red-700 border-red-200' };
    }
    if (isToday(date)) {
      return { text: 'Due today', className: 'bg-orange-100 text-orange-700 border-orange-200' };
    }
    if (isTomorrow(date)) {
      return { text: 'Due tomorrow', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
    }
    return { text: `Due ${formatDistanceToNow(date, { addSuffix: true })}`, className: 'bg-green-100 text-green-700 border-green-200' };
  };

  const calculateProgress = (task) => {
    if (!task.subtasks || task.subtasks.length === 0) return task.progress || 0;
    const completed = task.subtasks.filter(st => st.completed).length;
    return Math.round((completed / task.subtasks.length) * 100);
  };

  if (loading && tasks.length === 0) return <Loader />;
  if (error) return (
    <div className="p-6 text-center">
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg inline-block">
        <p className="font-medium">Error loading tasks</p>
        <p className="text-sm">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header with filters and view toggle */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
            Tasks & Deadlines
          </h1>
          <p className="text-gray-500 mt-1">Manage your academic tasks efficiently</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center bg-white rounded-lg shadow-sm border border-gray-200 p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              List
            </button>
          </div>

          <div className="relative">
            <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="relative">
            <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={filter.priority}
              onChange={(e) => setFilter({ ...filter, priority: e.target.value })}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
            >
              <option value="">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <button
            onClick={fetchTasks}
            className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition shadow-sm"
            title="Refresh"
          >
            <ArrowPathIcon className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Tasks display */}
      {tasks.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100"
        >
          <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircleIcon className="h-12 w-12 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No tasks found</h3>
          <p className="text-gray-500">Upload a lecture to generate tasks automatically.</p>
          <Link
            to="/upload"
            className="inline-block mt-4 px-6 py-2 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-lg hover:shadow-lg transition"
          >
            Upload Lecture
          </Link>
        </motion.div>
      ) : (
        <AnimatePresence>
          {viewMode === 'grid' ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {tasks.map((task, index) => {
                const deadlineDisplay = getDeadlineDisplay(task.deadline);
                const progress = calculateProgress(task);
                const priorityIcon = getPriorityIcon(task.priority);
                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      to={`/tasks/${task.id}`}
                      className="block group"
                    >
                      <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200">
                        {/* Priority header */}
                        <div className={`px-5 py-2 flex items-center gap-2 text-sm font-medium ${getPriorityColor(task.priority)}`}>
                          {priorityIcon}
                          <span>{task.priority || 'No Priority'}</span>
                        </div>
                        
                        {/* Content */}
                        <div className="p-5">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition">
                            {task.title}
                          </h3>
                          <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                            {task.description}
                          </p>
                          
                          {/* Deadline */}
                          {task.deadline && deadlineDisplay && (
                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${deadlineDisplay.className} mb-4`}>
                              <CalendarIcon className="h-3.5 w-3.5" />
                              <span>{deadlineDisplay.text}</span>
                            </div>
                          )}

                          {/* Progress */}
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-500">Progress</span>
                              <span className="font-medium text-gray-700">{progress}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.5 }}
                                className={`h-full rounded-full ${
                                  progress === 100 ? 'bg-green-500' : 'bg-gradient-to-r from-blue-500 to-teal-500'
                                }`}
                              />
                            </div>
                          </div>

                          {/* Status and subtasks */}
                          <div className="flex items-center justify-between mt-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                              {task.status || 'pending'}
                            </span>
                            <span className="text-xs text-gray-400">
                              {task.subtasks?.length || 0} subtasks
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            // List view
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {tasks.map((task, index) => {
                const deadlineDisplay = getDeadlineDisplay(task.deadline);
                const progress = calculateProgress(task);
                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      to={`/tasks/${task.id}`}
                      className="block group"
                    >
                      <div className={`p-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-teal-50 transition ${
                        index !== tasks.length - 1 ? 'border-b border-gray-100' : ''
                      }`}>
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                          {/* Priority badge */}
                          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium w-fit ${getPriorityColor(task.priority)}`}>
                            {getPriorityIcon(task.priority)}
                            <span>{task.priority || 'No Priority'}</span>
                          </div>

                          {/* Task info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition line-clamp-1">
                              {task.title}
                            </h3>
                            <p className="text-sm text-gray-500 line-clamp-1">{task.description}</p>
                          </div>

                          {/* Deadline */}
                          {task.deadline && deadlineDisplay && (
                            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border w-fit ${deadlineDisplay.className}`}>
                              <CalendarIcon className="h-3.5 w-3.5" />
                              <span>{deadlineDisplay.text}</span>
                            </div>
                          )}

                          {/* Progress */}
                          <div className="flex items-center gap-3 w-48">
                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  progress === 100 ? 'bg-green-500' : 'bg-gradient-to-r from-blue-500 to-teal-500'
                                }`}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-gray-600 w-10">{progress}%</span>
                          </div>

                          {/* Status badge */}
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border w-fit ${getStatusColor(task.status)}`}>
                            {task.status || 'pending'}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

export default TasksPage;