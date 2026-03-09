import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { taskService } from '../services/taskService';
import Loader from '../components/common/Loader';
import { 
  CalendarIcon, 
  ArrowLeftIcon, 
  CheckCircleIcon, 
  ClockIcon,
  ExclamationTriangleIcon,
  PencilSquareIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import { format, formatDistanceToNow, isPast, isToday, isTomorrow } from 'date-fns';

const TaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedTask, setEditedTask] = useState(null);

  useEffect(() => {
    fetchTask();
  }, [id]);

  const fetchTask = async () => {
    try {
      const data = await taskService.getTaskById(id);
      setTask(data);
      setEditedTask(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!task) return;
    setUpdating(true);
    try {
      const updated = await taskService.updateTask(task.id, { ...task, status: newStatus });
      setTask(updated);
      setEditedTask(updated);
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleSubtaskToggle = async (index) => {
    if (!task || !task.subtasks) return;
    const updatedSubtasks = [...task.subtasks];
    updatedSubtasks[index].completed = !updatedSubtasks[index].completed;
    const updatedTask = { ...task, subtasks: updatedSubtasks };
    setUpdating(true);
    try {
      const saved = await taskService.updateTask(task.id, updatedTask);
      setTask(saved);
      setEditedTask(saved);
    } catch (err) {
      console.error('Failed to update subtask:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editedTask) return;
    setUpdating(true);
    try {
      const saved = await taskService.updateTask(task.id, editedTask);
      setTask(saved);
      setEditedTask(saved);
      setEditMode(false);
    } catch (err) {
      console.error('Failed to update task:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await taskService.deleteTask(task.id);
      navigate('/tasks');
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return <ExclamationTriangleIcon className="h-5 w-5" />;
      case 'medium': return <ClockIcon className="h-5 w-5" />;
      case 'low': return <CheckCircleIcon className="h-5 w-5" />;
      default: return null;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-gradient-to-r from-red-500 to-pink-500 text-white';
      case 'medium': return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white';
      case 'low': return 'bg-gradient-to-r from-green-500 to-teal-500 text-white';
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

  const calculateProgress = () => {
    if (!task) return 0;
    if (!task.subtasks || task.subtasks.length === 0) return task.progress || 0;
    const completed = task.subtasks.filter(st => st.completed).length;
    return Math.round((completed / task.subtasks.length) * 100);
  };

  if (loading) return <Loader />;
  if (error) return (
    <div className="p-6 text-center">
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg inline-block">
        <p className="font-medium">Error loading task</p>
        <p className="text-sm">{error}</p>
      </div>
    </div>
  );
  if (!task) return <div className="p-4 text-center">Task not found.</div>;

  const deadlineDisplay = getDeadlineDisplay(task.deadline);
  const progress = calculateProgress();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/tasks')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 group"
      >
        <ArrowLeftIcon className="h-4 w-4 group-hover:-translate-x-1 transition" />
        Back to Tasks
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
      >
        {/* Priority header */}
        <div className={`px-6 py-4 flex items-center justify-between ${getPriorityColor(task.priority)}`}>
          <div className="flex items-center gap-3">
            {getPriorityIcon(task.priority)}
            <span className="font-medium">{task.priority || 'No Priority'} Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditMode(!editMode)}
              className="p-2 hover:bg-white/20 rounded-lg transition"
              title="Edit task"
            >
              <PencilSquareIcon className="h-5 w-5" />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 hover:bg-white/20 rounded-lg transition"
              title="Delete task"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {editMode ? (
            // Edit mode form
            <div className="space-y-4">
              <input
                type="text"
                value={editedTask?.title || ''}
                onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Task title"
              />
              <textarea
                value={editedTask?.description || ''}
                onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Description"
              />
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={editedTask?.priority || ''}
                  onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value })}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Priority</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <input
                  type="date"
                  value={editedTask?.deadline || ''}
                  onChange={(e) => setEditedTask({ ...editedTask, deadline: e.target.value })}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setEditMode(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={updating}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-lg hover:shadow-lg disabled:opacity-50"
                >
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            // View mode
            <>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{task.title}</h1>
              {task.course && (
                <p className="text-sm text-gray-500 mb-4">Course: {task.course}</p>
              )}
              <p className="text-gray-700 text-lg mb-6">{task.description}</p>

              {/* Deadline and progress */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {task.deadline && deadlineDisplay && (
                  <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${deadlineDisplay.className}`}>
                    <CalendarIcon className="h-5 w-5" />
                    <span className="font-medium">{deadlineDisplay.text}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-200">
                  <ClockIcon className="h-5 w-5 text-gray-500" />
                  <span className="font-medium text-gray-700">Progress {progress}%</span>
                </div>
              </div>

              {/* Status buttons */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-3">Status</h2>
                <div className="flex flex-wrap gap-2">
                  {['pending', 'in-progress', 'completed'].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      disabled={updating || task.status === status}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition transform hover:scale-105 ${
                        task.status === status
                          ? 'bg-gradient-to-r from-blue-600 to-teal-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      } disabled:opacity-50 disabled:hover:scale-100`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subtasks */}
              {task.subtasks && task.subtasks.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold mb-3">Subtasks</h2>
                  <ul className="space-y-2">
                    {task.subtasks.map((subtask, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer group"
                        onClick={() => handleSubtaskToggle(index)}
                      >
                        {subtask.completed ? (
                          <CheckCircleSolid className="h-5 w-5 text-green-600 flex-shrink-0" />
                        ) : (
                          <CheckCircleIcon className="h-5 w-5 text-gray-300 group-hover:text-gray-400 flex-shrink-0" />
                        )}
                        <span className={`flex-1 ${subtask.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                          {subtask.title}
                        </span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default TaskDetails;