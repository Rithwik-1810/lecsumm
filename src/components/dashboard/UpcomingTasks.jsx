import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { taskService } from '../../services/taskService';
import Loader from '../common/Loader';
import { CalendarIcon } from '@heroicons/react/24/outline';

const UpcomingTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await taskService.getUserTasks('pending');
        // Sort by deadline (closest first) and take 3
        const sorted = data.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
        setTasks(sorted.slice(0, 3));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

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

  const getDaysLeftColor = (days) => {
    if (days < 0) return 'text-red-600 bg-red-100';
    if (days === 0) return 'text-orange-600 bg-orange-100';
    if (days <= 2) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  if (loading) return <Loader size="sm" />;
  if (error) return <div className="text-red-600">Error loading tasks</div>;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <h2 className="font-semibold text-gray-900">Upcoming Tasks</h2>
      </div>
      {tasks.length === 0 ? (
        <div className="p-6 text-center text-gray-500">No pending tasks</div>
      ) : (
        <div className="divide-y divide-gray-100">
          {tasks.map((task) => {
            const daysLeft = getDaysLeft(task.deadline);
            return (
              <Link
                key={task.id}
                to={`/tasks/${task.id}`}
                className="block px-6 py-4 hover:bg-gray-50 transition"
              >
                <div className="flex items-start justify-between mb-1">
                  <h3 className="text-sm font-medium text-gray-900 line-clamp-1">{task.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
                {task.deadline && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <CalendarIcon className="h-3.5 w-3.5" />
                    <span>Due: {new Date(task.deadline).toLocaleDateString()}</span>
                    {daysLeft !== null && (
                      <span className={`px-2 py-0.5 rounded-full text-xs ${getDaysLeftColor(daysLeft)}`}>
                        {daysLeft < 0 ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} days left`}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
      {tasks.length > 0 && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-center">
          <Link to="/tasks" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
            View All Tasks
          </Link>
        </div>
      )}
    </div>
  );
};

export default UpcomingTasks;