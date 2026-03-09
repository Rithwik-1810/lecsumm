import api from './api';

export const summaryService = {
  // Get all summaries for the current user
  getSummaries: async () => {
    const response = await api.get('/summaries');
    return response.data;
  },

  // Get a specific summary by its ID
  getSummaryById: async (id) => {
    const response = await api.get(`/summaries/${id}`);
    return response.data;
  },

  // Get summary by lecture ID (used for polling after upload)
  getSummaryByLectureId: async (lectureId) => {
    const response = await api.get(`/summaries/lecture/${lectureId}`);
    return response.data;
  },

  // Toggle saved status
  toggleSaveSummary: async (id) => {
    const response = await api.put(`/summaries/${id}/save`);
    return response.data;
  },

  // Delete a summary
  deleteSummary: async (id) => {
    const response = await api.delete(`/summaries/${id}`);
    return response.data;
  }
};