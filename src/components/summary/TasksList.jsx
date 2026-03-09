import React from 'react';
import { CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

const TasksList = ({ tasks }) => {
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Tasks & Deadlines</h2>
      <div className="space-y-4">
        {tasks?.map((task) => (
          <div key={task.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-medium text-gray-900">{task.description}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <ClockIcon className="h-4 w-4 mr-1" />
              Due: {task.deadline}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TasksList;