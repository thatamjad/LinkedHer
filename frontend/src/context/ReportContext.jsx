import React, { createContext, useState, useContext, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

// Create a context
const ReportContext = createContext();

/**
 * Provider component for the reporting functionality
 */
export const ReportProvider = ({ children }) => {
  const { token } = useAuth();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportConfig, setReportConfig] = useState({
    contentType: null,
    contentId: null,
    reportedUserId: null,
    isAnonymous: false,
    reporterPersonaHash: null,
    reportedContentHash: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Opens the report modal with the given configuration
   */
  const openReportModal = useCallback((config) => {
    setReportConfig(config);
    setIsReportModalOpen(true);
  }, []);

  /**
   * Closes the report modal
   */
  const closeReportModal = useCallback(() => {
    setIsReportModalOpen(false);
    // Reset configuration after modal is closed
    setTimeout(() => {
      setReportConfig({
        contentType: null,
        contentId: null,
        reportedUserId: null,
        isAnonymous: false,
        reporterPersonaHash: null,
        reportedContentHash: null,
      });
    }, 300);
  }, []);

  /**
   * Submit a report
   */
  const submitReport = useCallback(async (reportData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/reports', reportData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setLoading(false);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit report');
      setLoading(false);
      throw err;
    }
  }, [token]);

  /**
   * Get user's reports
   */
  const getUserReports = useCallback(async (status = null) => {
    setLoading(true);
    setError(null);

    try {
      const params = {};
      if (status) params.status = status;

      const response = await axios.get('/api/reports/user', {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params
      });
      setLoading(false);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch reports');
      setLoading(false);
      throw err;
    }
  }, [token]);

  // Value to be provided by the context
  const value = {
    isReportModalOpen,
    reportConfig,
    loading,
    error,
    openReportModal,
    closeReportModal,
    submitReport,
    getUserReports,
  };

  return (
    <ReportContext.Provider value={value}>
      {children}
    </ReportContext.Provider>
  );
};

/**
 * Hook to use the report context
 */
export const useReport = () => {
  const context = useContext(ReportContext);
  if (!context) {
    throw new Error('useReport must be used within a ReportProvider');
  }
  return context;
};

export default ReportContext; 