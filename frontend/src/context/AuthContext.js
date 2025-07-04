import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import apiClient from '../services/apiClient';
import socketService from '../services/socketService';

// Create context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  // Setup axios instance with token
  const authAxios = axios.create({
    baseURL: API_URL,
    withCredentials: true,
  });

  // Add token to requests
  authAxios.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Handle token expiry and refresh
  authAxios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // If the error is 401 and not already retrying
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {          // Attempt to refresh token
          const response = await authAxios.post('/auth/refresh-token', {});
          
          if (response.data.accessToken) {
            // Update token
            localStorage.setItem('token', response.data.accessToken);
            
            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
            return authAxios(originalRequest);
          }
        } catch (refreshError) {
          // If refresh fails, logout
          logout();
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );

  // Check if user is already logged in (on app load)
  const loadUser = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }

      // Fetch current user data
      const response = await authAxios.get('/auth/me');
      setCurrentUser(response.data.user);
      setError(null);
      
      // Initialize socket connection with existing token
      socketService.connect(token);
    } catch (err) {
      console.error('Load user error:', err);
      localStorage.removeItem('token');
      setCurrentUser(null);
      setError('Session expired. Please login again.');
      
      // Disconnect socket on error
      socketService.disconnect();
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (emailOrToken, passwordOrUser) => {
    try {
      setLoading(true);
      
      // Check if we're passing token and user directly (mock login)
      if (typeof emailOrToken === 'string' && typeof passwordOrUser === 'object') {
        const token = emailOrToken;
        const user = passwordOrUser;
        
        localStorage.setItem('token', token);
        setCurrentUser(user);
        setError(null);
        
        // Initialize socket connection
        socketService.connect(token);
        
        return { token, user };
      }
        // Normal login with email and password
      const email = emailOrToken;
      const password = passwordOrUser;
      
      const response = await authAxios.post('/auth/login', { email, password });
      
      localStorage.setItem('token', response.data.token);
      setCurrentUser(response.data.user);
      setError(null);
      
      // Initialize socket connection
      socketService.connect(response.data.token);
      
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  // Register user
  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };  // Test login for development
  const testLogin = async () => {
    try {
      setLoading(true);
      console.log('Making test login request to:', `${API_URL}/auth/test-login`);
      
      const response = await authAxios.post('/auth/test-login', {});
      
      console.log('Test login response:', response.data);
      localStorage.setItem('token', response.data.token);
      setCurrentUser(response.data.user);
      setError(null);
      
      return response.data;
    } catch (err) {
      console.error('Test login error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        url: `${API_URL}/auth/test-login`
      });
      
      // Enhanced error message for test login
      let errorMessage = 'Test login failed';
      if (err.code === 'ECONNREFUSED' || err.message.includes('Network Error')) {
        errorMessage = 'Cannot connect to backend server. Please ensure the backend is running on port 5000.';
      } else if (err.response?.status === 404) {
        errorMessage = 'Test login endpoint not found. Please check the backend configuration.';
      } else {
        errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'Test login failed';
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    try {
      setLoading(true);
      await authAxios.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      setCurrentUser(null);
      setLoading(false);
      
      // Disconnect socket
      socketService.disconnect();
    }
  };

  // Start verification process
  const startVerification = async () => {
    try {
      setLoading(true);
      const response = await authAxios.post('/users/verification/start');
      
      setCurrentUser(prev => ({
        ...prev,
        verificationStatus: response.data.verificationStatus,
        verificationExpiresAt: response.data.verificationExpiresAt
      }));
      
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start verification');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get verification status
  const getVerificationStatus = async () => {
    try {
      const response = await authAxios.get('/users/verification/status');
      
      setCurrentUser(prev => ({
        ...prev,
        verificationStatus: response.data.verificationStatus,
        verificationExpiresAt: response.data.verificationExpiresAt,
        verificationScore: response.data.verificationScore
      }));
      
      return response.data;
    } catch (err) {
      console.error('Get verification status error:', err);
      throw err;
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      const response = await authAxios.put('/users/profile', profileData);
      
      setCurrentUser(prev => ({
        ...prev,
        ...response.data.user
      }));
      
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Context value
  const value = {
    currentUser,
    loading,
    error,
    setError,
    login,
    register,
    logout,
    updateProfile,
    startVerification,
    getVerificationStatus,
    testLogin,
    authAxios
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 