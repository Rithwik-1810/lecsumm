import api from './api';

export const taskService = {
  getUserTasks: async (status, priority) => {
    const params = {};
    if (status) params.status = status;
    if (priority) params.priority = priority;
    const response = await api.get('/tasks', { params });
    return response.data;
  },
  getTaskById: async (id) => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },
  createTask: async (task) => {
    const response = await api.post('/tasks', task);
    return response.data;
  },
  updateTask: async (id, task) => {
    const response = await api.put(`/tasks/${id}`, task);
    return response.data;
  },
  deleteTask: async (id) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },
  deleteMultipleTasks: async (ids) => {
    const response = await api.delete('/tasks/bulk', { data: ids });
    return response.data;
  },
  deleteAllTasks: async () => {
    const response = await api.delete('/tasks/all');
    return response.data;
  }
};