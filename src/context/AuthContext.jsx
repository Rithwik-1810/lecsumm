import React, { createContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await authService.login({ email, password });
      setUser(response.user);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data || error.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const response = await authService.register(userData);
      setUser(response.user);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data || error.message };
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async (idToken) => {
    setLoading(true);
    try {
      const response = await authService.googleLogin(idToken);
      setUser(response.user);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data || error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const sendSignupOtp = async (email) => {
    try {
      await authService.sendSignupOtp(email);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data || error.message };
    }
  };

  const sendForgotPasswordOtp = async (email) => {
    try {
      await authService.sendForgotPasswordOtp(email);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data || error.message };
    }
  };

  const resetPassword = async (email, otp, newPassword) => {
    try {
      await authService.resetPassword(email, otp, newPassword);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data || error.message };
    }
  };

  // ✅ Memoized refreshUser to prevent unnecessary re-renders
  const refreshUser = useCallback(async () => {
    try {
      const freshUser = await authService.getCurrentUser();
      setUser(freshUser);
    } catch (error) {
      console.error('Failed to refresh user', error);
    }
  }, []);

  const value = {
    user,
    loading,
    login,
    register,
    googleLogin,
    logout,
    sendSignupOtp,
    sendForgotPasswordOtp,
    resetPassword,
    refreshUser,
    isAuthenticated: () => !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};