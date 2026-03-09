import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { summaryService } from '../services/summaryService';
import { useAuth } from '../hooks/useAuth';
import Loader from '../components/common/Loader';
import { 
  BookmarkIcon as BookmarkOutline, 
  TrashIcon,
  CalendarIcon,
  DocumentTextIcon,
  FunnelIcon,
  ArrowPathIcon,
  Squares2X2Icon,
  ListBulletIcon
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolid } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';

const MySummaries = () => {
  const { refreshUser } = useAuth();
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [filter, setFilter] = useState(''); // 'all', 'saved', 'recent'

  useEffect(() => {
    fetchSummaries();
  }, []);

  const fetchSummaries = async () => {
    try {
      const data = await summaryService.getSummaries();
      setSummaries(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleSave = async (id, currentSaved) => {
    try {
      const updated = await summaryService.toggleSaveSummary(id);
      setSummaries(summaries.map(s => s.id === id ? updated : s));
      await refreshUser();
    } catch (err) {
      console.error('Failed to toggle save:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this summary? This action cannot be undone.')) {
      return;
    }
    setDeletingId(id);
    try {
      await summaryService.deleteSummary(id);
      setSummaries(summaries.filter(s => s.id !== id));
      await refreshUser();
    } catch (err) {
      console.error('Failed to delete summary:', err);
      alert('Failed to delete summary. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredSummaries = () => {
    if (filter === 'saved') return summaries.filter(s => s.saved);
    if (filter === 'recent') return summaries.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
    return summaries;
  };

  const displaySummaries = filteredSummaries();

  if (loading) return <Loader />;
  if (error) return (
    <div className="p-6 text-center">
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg inline-block">
        <p className="font-medium">Error loading summaries</p>
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
            My Summaries
          </h1>
          <p className="text-gray-500 mt-1">All your generated lecture summaries</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center bg-white rounded-lg shadow-sm border border-gray-200 p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition ${
                viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="Grid view"
            >
              <Squares2X2Icon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition ${
                viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="List view"
            >
              <ListBulletIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="relative">
            <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
            >
              <option value="">All Summaries</option>
              <option value="saved">Saved Only</option>
              <option value="recent">Most Recent</option>
            </select>
          </div>

          <button
            onClick={fetchSummaries}
            className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition shadow-sm"
            title="Refresh"
          >
            <ArrowPathIcon className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Summaries display */}
      {displaySummaries.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100"
        >
          <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <DocumentTextIcon className="h-12 w-12 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No summaries yet</h3>
          <p className="text-gray-500">Upload a lecture to generate your first summary.</p>
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
              {displaySummaries.map((summary, index) => (
                <motion.div
                  key={summary.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200 group">
                    <Link to={`/summary/${summary.id}`} className="block">
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition">
                            {summary.lectureId ? 'Lecture Summary' : 'Summary'}
                          </h3>
                          <span className="text-xs text-gray-400">
                            {formatDistanceToNow(new Date(summary.createdAt), { addSuffix: true })}
                          </span>
                        </div>

                        <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                          {summary.content}
                        </p>

                        {summary.topics?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-4">
                            {summary.topics.slice(0, 3).map((topic, i) => (
                              <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full">
                                {topic}
                              </span>
                            ))}
                            {summary.topics.length > 3 && (
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                                +{summary.topics.length - 3}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="h-3.5 w-3.5" />
                            {format(new Date(summary.createdAt), 'MMM d, yyyy')}
                          </span>
                          <span>{summary.keyPoints?.length || 0} key points</span>
                        </div>
                      </div>
                    </Link>

                    <div className="flex justify-end items-center gap-2 px-5 py-3 bg-gray-50 border-t border-gray-100">
                      <button
                        onClick={() => toggleSave(summary.id, summary.saved)}
                        disabled={deletingId === summary.id}
                        className="text-gray-500 hover:text-yellow-500 transition disabled:opacity-50"
                        title={summary.saved ? 'Remove from saved' : 'Save summary'}
                      >
                        {summary.saved ? (
                          <BookmarkSolid className="h-5 w-5 text-yellow-500" />
                        ) : (
                          <BookmarkOutline className="h-5 w-5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(summary.id)}
                        disabled={deletingId === summary.id}
                        className="text-gray-400 hover:text-red-600 transition disabled:opacity-50"
                        title="Delete summary"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            // List view
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {displaySummaries.map((summary, index) => (
                <motion.div
                  key={summary.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className={`p-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-teal-50 transition ${
                    index !== displaySummaries.length - 1 ? 'border-b border-gray-100' : ''
                  }`}>
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <Link to={`/summary/${summary.id}`} className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-gray-900 hover:text-blue-600 transition line-clamp-1">
                          {summary.lectureId ? 'Lecture Summary' : 'Summary'}
                        </h3>
                        <p className="text-sm text-gray-500 line-clamp-1 mt-1">{summary.content}</p>
                      </Link>

                      {summary.topics?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {summary.topics.slice(0, 2).map((topic, i) => (
                            <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full">
                              {topic}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <CalendarIcon className="h-3.5 w-3.5" />
                        <span>{formatDistanceToNow(new Date(summary.createdAt), { addSuffix: true })}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleSave(summary.id, summary.saved)}
                          disabled={deletingId === summary.id}
                          className="text-gray-500 hover:text-yellow-500 transition disabled:opacity-50"
                        >
                          {summary.saved ? (
                            <BookmarkSolid className="h-5 w-5 text-yellow-500" />
                          ) : (
                            <BookmarkOutline className="h-5 w-5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(summary.id)}
                          disabled={deletingId === summary.id}
                          className="text-gray-400 hover:text-red-600 transition disabled:opacity-50"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

export default MySummaries;