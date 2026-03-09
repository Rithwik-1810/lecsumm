import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { summaryService } from '../services/summaryService';
import { lectureService } from '../services/lectureService';
import Loader from '../components/common/Loader';
import { 
  BookmarkIcon as BookmarkSolid,
  CalendarIcon,
  DocumentTextIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';

const SavedNotes = () => {
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  useEffect(() => {
    fetchSavedSummaries();
  }, []);

  const fetchSavedSummaries = async () => {
    try {
      const all = await summaryService.getSummaries();
      const saved = all.filter(s => s.saved);
      
      // Fetch lecture titles for each saved summary
      const withTitles = await Promise.all(
        saved.map(async (summary) => {
          if (summary.lectureId) {
            try {
              const lecture = await lectureService.getLectureById(summary.lectureId);
              return { ...summary, lectureTitle: lecture.title };
            } catch (err) {
              console.warn(`Could not fetch lecture for summary ${summary.id}`);
              return { ...summary, lectureTitle: 'Untitled Lecture' };
            }
          }
          return { ...summary, lectureTitle: 'Untitled Lecture' };
        })
      );
      
      setSummaries(withTitles);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;
  if (error) return (
    <div className="p-6 text-center">
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg inline-block">
        <p className="font-medium">Error loading saved notes</p>
        <p className="text-sm">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header with view toggle and refresh */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
            Saved Notes
          </h1>
          <p className="text-gray-500 mt-1">Your bookmarked summaries</p>
        </div>

        <div className="flex items-center gap-3">
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

          <button
            onClick={fetchSavedSummaries}
            className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition shadow-sm"
            title="Refresh"
          >
            <ArrowPathIcon className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Saved notes display */}
      {summaries.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100"
        >
          <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookmarkSolid className="h-12 w-12 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No saved notes</h3>
          <p className="text-gray-500">Save summaries while viewing them to see them here.</p>
          <Link
            to="/summaries"
            className="inline-block mt-4 px-6 py-2 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-lg hover:shadow-lg transition"
          >
            Browse Summaries
          </Link>
        </motion.div>
      ) : (
        <AnimatePresence>
          {viewMode === 'grid' ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {summaries.map((summary, index) => (
                <motion.div
                  key={summary.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={`/summary/${summary.id}`}
                    className="block group"
                  >
                    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200 h-full">
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition">
                            {summary.lectureTitle}
                          </h3>
                          <BookmarkSolid className="h-5 w-5 text-yellow-500 flex-shrink-0" />
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
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            // List view
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {summaries.map((summary, index) => (
                <motion.div
                  key={summary.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={`/summary/${summary.id}`}
                    className={`block p-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-teal-50 transition ${
                      index !== summaries.length - 1 ? 'border-b border-gray-100' : ''
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-base font-semibold text-gray-900 hover:text-blue-600 transition line-clamp-1">
                            {summary.lectureTitle}
                          </h3>
                          <BookmarkSolid className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                        </div>
                        <p className="text-sm text-gray-500 line-clamp-1">{summary.content}</p>
                      </div>

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
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

export default SavedNotes;