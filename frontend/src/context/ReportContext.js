import React, { createContext, useState, useContext, useCallback } from 'react';
import apiClient from '../services/apiClient';
import { useAnonymous } from './AnonymousContext';

const ReportContext = createContext();

export const useReport = () => useContext(ReportContext);

export const ReportProvider = ({ children }) => {
  const { anonymousApiClient } = useAnonymous();
  const [reportFormOpen, setReportFormOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reportSuccess, setReportSuccess] = useState(false);
  
  // For moderation dashboard
  const [reports, setReports] = useState([]);
  const [currentReport, setCurrentReport] = useState(null);
  const [reportStats, setReportStats] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [filters, setFilters] = useState({
    status: '',
    reportType: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  /**
   * Open the report form for a specific content/user
   */
  const openReportForm = (target) => {
    setReportTarget(target);
    setReportFormOpen(true);
    setError(null);
    setReportSuccess(false);
  };

  /**
   * Close the report form
   */
  const closeReportForm = () => {
    setReportFormOpen(false);
    setReportTarget(null);
    setError(null);
  };

  const submitProfessionalReport = useCallback(async (reportData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.post('/reports/professional', reportData);
      return data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit report.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const submitAnonymousReport = useCallback(async (reportData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await anonymousApiClient.post('/reports/anonymous', reportData);
      return data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit anonymous report.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [anonymousApiClient]);

  const fetchReports = useCallback(async (filters) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get('/reports', { params: filters });
      setReports(data.data);
      setPagination(data.pagination);
      return data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch reports.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchReportById = useCallback(async (reportId) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get(`/reports/${reportId}`);
      setCurrentReport(data);
      return data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch report.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  const updateReport = useCallback(async (reportId, updateData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.put(`/reports/${reportId}`, updateData);
      setCurrentReport(data);
      setReports(reports.map(report => 
        report._id === reportId ? data : report
      ));
      return data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update report.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [reports]);

  /**
   * Fetch reporting statistics
   */
  const fetchReportStats = async () => {
    try {
      setLoading(true);
      
      const response = await apiClient.get('/reports/stats');
      
      setReportStats(response.data.data);
      setLoading(false);
      return response.data.data;
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to fetch report statistics');
      setLoading(false);
      throw error;
    }
  };

  const value = {
    reportFormOpen,
    reportTarget,
    loading,
    error,
    reportSuccess,
    reports,
    currentReport,
    reportStats,
    pagination,
    filters,
    openReportForm,
    closeReportForm,
    submitProfessionalReport,
    submitAnonymousReport,
    fetchReports,
    fetchReportById,
    updateReport,
    fetchReportStats,
    setFilters
  };

  return <ReportContext.Provider value={value}>{children}</ReportContext.Provider>;
};

export default ReportContext; 