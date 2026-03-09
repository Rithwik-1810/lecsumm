import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { 
  UserCircleIcon, 
  DocumentTextIcon, 
  CheckCircleIcon, 
  ClockIcon 
} from '@heroicons/react/24/outline';

const Profile = () => {
  const { user, logout, refreshUser } = useAuth();
  const [profileUser, setProfileUser] = useState(user);
  const navigate = useNavigate();
  const hasFetched = useRef(false);

  useEffect(() => {
    // Fetch fresh user data once when component mounts
    if (!hasFetched.current && refreshUser) {
      hasFetched.current = true;
      refreshUser().then(() => {
        console.log('Profile: refreshUser completed');
      });
    }
  }, [refreshUser]);

  // Update local state when context user changes
  useEffect(() => {
    console.log('Profile: user context changed', user?.stats?.hoursSaved);
    setProfileUser(user);
  }, [user]);

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  if (!profileUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Please log in to view your profile.</p>
      </div>
    );
  }

  const stats = profileUser.stats || {
    totalSummaries: 0,
    completedTasks: 0,
    hoursSaved: 0
  };

  const formattedHours = stats.hoursSaved.toFixed(1);

  console.log('Profile rendering with hours:', stats.hoursSaved);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-teal-500 px-6 py-8">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
              <UserCircleIcon className="h-12 w-12 text-white" />
            </div>
            <div className="text-white">
              <h1 className="text-2xl font-bold">{profileUser.name || 'Student'}</h1>
              <p className="text-blue-100">{profileUser.email}</p>
            </div>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
          <div className="bg-blue-50 rounded-lg p-4 flex items-center gap-3">
            <DocumentTextIcon className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total Summaries</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalSummaries}</p>
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 flex items-center gap-3">
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Tasks Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedTasks}</p>
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 flex items-center gap-3">
            <ClockIcon className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Hours Saved</p>
              <p className="text-2xl font-bold text-gray-900">{formattedHours}</p>
            </div>
          </div>
        </div>

        {/* Achievements */}
        {profileUser.achievements && profileUser.achievements.length > 0 && (
          <div className="px-6 pb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Achievements</h2>
            <div className="flex flex-wrap gap-2">
              {profileUser.achievements.map((ach, idx) => (
                <span key={idx} className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                  {ach.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Sign Out Button */}
        <div className="border-t border-gray-200 px-6 py-4 flex justify-end">
          <button
            onClick={handleSignOut}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition shadow-md hover:shadow-lg"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;