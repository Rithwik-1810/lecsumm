import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { summaryService } from '../services/summaryService';
import { useAuth } from '../hooks/useAuth';
import Loader from '../components/common/Loader';
import { BookmarkIcon as BookmarkOutline } from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolid } from '@heroicons/react/24/solid';
import { TrashIcon } from '@heroicons/react/24/outline';

const SummaryResults = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const pollingRef = useRef(null);
  const isMounted = useRef(true);

  // Stable refresh callback – refreshUser is now memoized in context
  const stableRefresh = useCallback(async () => {
    if (refreshUser) await refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (pollingRef.current) clearTimeout(pollingRef.current);
    };
  }, []);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        // First try: as summary ID
        const data = await summaryService.getSummaryById(id);
        if (isMounted.current) {
          setSummary(data);
          setLoading(false);
        }
        return;
      } catch (err) {
        if (err.response?.status !== 404) {
          if (isMounted.current) {
            setError(err.message);
            setLoading(false);
          }
          return;
        }
      }

      // Second try: as lecture ID (poll)
      const poll = async () => {
        try {
          const lectureSummary = await summaryService.getSummaryByLectureId(id);
          if (isMounted.current) {
            setSummary(lectureSummary);
            setLoading(false);
            // Only refresh user stats once summary is found
            await stableRefresh();
          }
        } catch (err) {
          if (err.response?.status === 404 && isMounted.current) {
            // Not ready yet – poll again after 3 seconds
            pollingRef.current = setTimeout(poll, 3000);
          } else if (isMounted.current) {
            setError(err.message);
            setLoading(false);
          }
        }
      };

      poll();
    };

    fetchSummary();
  }, [id, stableRefresh]); // stableRefresh is now stable

  const handleToggleSave = async () => {
    if (!summary) return;
    setSaving(true);
    try {
      const updated = await summaryService.toggleSaveSummary(summary.id);
      if (isMounted.current) setSummary(updated);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!summary) return;
    if (!window.confirm('Are you sure you want to delete this summary? This action cannot be undone.')) return;
    setDeleting(true);
    try {
      await summaryService.deleteSummary(summary.id);
      await stableRefresh();
      navigate('/summaries');
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete summary. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <Loader />;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;
  if (!summary) return <div className="p-4">Summary not found.</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Lecture Summary</h1>
        <div className="flex gap-2">
          <button
            onClick={handleToggleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-100 hover:bg-yellow-200 rounded-lg transition disabled:opacity-50"
          >
            {summary.saved ? (
              <>
                <BookmarkSolid className="h-5 w-5 text-yellow-600" />
                <span>Saved</span>
              </>
            ) : (
              <>
                <BookmarkOutline className="h-5 w-5" />
                <span>Save</span>
              </>
            )}
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-lg transition disabled:opacity-50"
          >
            <TrashIcon className="h-5 w-5 text-red-600" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <p className="text-gray-700 whitespace-pre-line">{summary.content}</p>
      </div>

      {summary.keyPoints?.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">Key Points</h2>
          <ul className="list-disc pl-5 space-y-2">
            {summary.keyPoints.map((point, index) => (
              <li key={index} className="text-gray-700">{point}</li>
            ))}
          </ul>
        </div>
      )}

      {summary.topics?.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-3">Topics Covered</h2>
          <div className="flex flex-wrap gap-2">
            {summary.topics.map((topic, index) => (
              <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SummaryResults;