import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { DocumentTextIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

const StatsCards = () => {
  const { user } = useAuth();

  const stats = user?.stats || {
    totalSummaries: 0,
    completedTasks: 0,
    hoursSaved: 0
  };

  const cards = [
    {
      title: 'Total Summaries',
      value: stats.totalSummaries,
      icon: DocumentTextIcon,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Tasks Completed',
      value: stats.completedTasks,
      icon: CheckCircleIcon,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      title: 'Hours Saved',
      value: stats.hoursSaved.toFixed(1),
      icon: ClockIcon,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card, index) => (
        <div key={index} className={`${card.bgColor} rounded-lg p-6 flex items-center gap-4`}>
          <div className={`p-3 rounded-full ${card.bgColor} bg-opacity-50`}>
            <card.icon className={`h-8 w-8 ${card.iconColor}`} />
          </div>
          <div>
            <p className="text-sm text-gray-600">{card.title}</p>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;