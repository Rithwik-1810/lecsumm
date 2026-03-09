import api from './api';

export const lectureService = {
  uploadLecture: async (formData) => {
    console.log('lectureService.uploadLecture called');
    const response = await api.post('/lectures/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log('Upload progress:', percentCompleted);
      },
    });
    return response;
  },

  getUserLectures: async () => {
    const response = await api.get('/lectures');
    return response.data;
  },

  getLectureById: async (id) => {
    const response = await api.get(`/lectures/${id}`);
    return response.data;
  },

  deleteLecture: async (id) => {
    const response = await api.delete(`/lectures/${id}`);
    return response.data;
  },
};