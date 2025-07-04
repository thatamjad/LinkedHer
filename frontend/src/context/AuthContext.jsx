import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import apiClient from '../services/apiClient'; // Using a centralized API client

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const clearAuth = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    // The API client will handle clearing the token
  };

  const loadUser = useCallback(async () => {
    try {
      const { data } = await apiClient.get('/auth/me');
      setCurrentUser(data.user);
      setIsAuthenticated(true);
    } catch (err) {
      clearAuth();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await apiClient.post('/auth/login', { email, password });
      apiClient.setToken(data.accessToken);
      await loadUser();
      return true;
    } catch (err) {
      setError(err.response?.data?.msg || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await apiClient.post('/auth/register', userData);
      apiClient.setToken(data.accessToken);
      await loadUser();
      return true;
    } catch (err) {
      setError(err.response?.data?.msg || 'Registration failed');
      throw err; // Re-throw error so component can handle it
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (err) {
      console.error("Logout failed, but clearing session anyway.", err);
    } finally {
      clearAuth();
      apiClient.setToken(null);
    }
  };

  const isVerified = () => {
    return currentUser?.verificationStatus === 'verified';
  };
  
  const value = {
    currentUser,
    loading,
    error,
    setError, // Expose setError to be used in components
    isAuthenticated,
    login,
    register,
    logout,
    isVerified,
    // updateProfile can be moved to a ProfileContext for better separation of concerns
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
