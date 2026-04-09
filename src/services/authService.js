import api from './api';

export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  googleLogin: async (idToken) => {
    const response = await api.post('/auth/google', { idToken });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  sendSignupOtp: async (email) => {
    const response = await api.post('/auth/send-signup-otp', { email });
    return response.data;
  },

  sendForgotPasswordOtp: async (email) => {
    const response = await api.post('/auth/send-forgot-password-otp', { email });
    return response.data;
  },

  resetPassword: async (email, otp, newPassword) => {
    const response = await api.post('/auth/reset-password', { email, otp, newPassword });
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
  },

  getCurrentUser: async () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const response = await api.get('/auth/me');
      return response.data; // this must include the updated stats
    } catch (error) {
      console.error('Failed to get current user', error);
      // Only return null (sign out) if the server explicitly rejects the token
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        localStorage.removeItem('token');
        return null;
      }
      // For network blips, 500 errors, or cold starts, throw to prevent wiping the user state
      throw error;
    }
  }
};