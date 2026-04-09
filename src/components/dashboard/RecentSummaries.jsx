import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { summaryService } from '../../services/summaryService';
import Loader from '../common/Loader';

const RecentSummaries = () => {
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const data = await summaryService.getSummaries();
        // Get the 3 most recent
        setSummaries(data.slice(0, 3));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRecent();
  }, []);

  if (loading) return <Loader size="sm" />;
  if (error) return <div className="text-red-600">Error loading summaries</div>;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <h2 className="font-semibold text-gray-900">Recent Summaries</h2>
      </div>
      {summaries.length === 0 ? (
        <div className="p-6 text-center text-gray-500">No summaries yet. Upload a lecture to get started!</div>
      ) : (
        <div className="divide-y divide-gray-100">
          {summaries.map((summary) => (
            <Link
              key={summary.id}
              to={`/summary/${summary.lectureId || summary.id}`}
              className="block px-6 py-4 hover:bg-gray-50 transition"
            >
              <p className="text-sm font-medium text-gray-900 line-clamp-1">
                {summary.content.substring(0, 60)}...
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(summary.createdAt).toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      )}
      {summaries.length > 0 && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-center">
          <Link to="/summaries" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
            View All Summaries
          </Link>
        </div>
      )}
    </div>
  );
};

export default RecentSummaries;