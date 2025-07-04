import apiClient from './apiClient';

/**
 * Service for interacting with job-related API endpoints
 */
class JobService {
  /**
   * Get jobs with filters
   * @param {Object} filters - Filter criteria
   * @param {number} page - Page number
   * @param {number} limit - Results per page
   * @returns {Promise} - Promise resolving to job data
   */
  async getJobs(filters = {}, page = 1, limit = 10) {
    const params = new URLSearchParams({ page, limit, ...filters });
    const response = await apiClient.get('/jobs', { params });
    return response.data;
  }
  
  /**
   * Get a single job by ID
   * @param {string} jobId - Job ID
   * @returns {Promise} - Promise resolving to job data
   */
  async getJob(jobId) {
    const response = await apiClient.get(`/jobs/${jobId}`);
    return response.data;
  }
  
  /**
   * Get personalized job recommendations
   * @param {number} limit - Number of recommendations to get
   * @returns {Promise} - Promise resolving to recommended jobs
   */
  async getRecommendations(limit = 10) {
    const response = await apiClient.get('/jobs/recommendations', { params: { limit } });
    return response.data;
  }
  
  /**
   * Save a job for later
   * @param {string} jobId - Job ID to save
   * @returns {Promise} - Promise resolving to success message
   */
  async saveJob(jobId) {
    const response = await apiClient.post(`/jobs/save/${jobId}`);
    return response.data;
  }
  
  /**
   * Unsave a job
   * @param {string} jobId - Job ID to unsave
   * @returns {Promise} - Promise resolving to success message
   */
  async unsaveJob(jobId) {
    const response = await apiClient.delete(`/jobs/save/${jobId}`);
    return response.data;
  }
  
  /**
   * Get user's saved jobs
   * @param {number} page - Page number
   * @param {number} limit - Results per page
   * @returns {Promise} - Promise resolving to saved jobs data
   */
  async getSavedJobs(page = 1, limit = 10) {
    const response = await apiClient.get('/jobs/saved', { params: { page, limit } });
    return response.data;
  }
  
  /**
   * Record a job application
   * @param {string} jobId - Job ID applied to
   * @param {Object} applicationData - Application data
   * @returns {Promise} - Promise resolving to success message
   */
  async recordApplication(jobId, applicationData = {}) {
    const response = await apiClient.post(`/jobs/apply/${jobId}`, applicationData);
    return response.data;
  }
  
  /**
   * Get user's applied jobs
   * @param {number} page - Page number
   * @param {number} limit - Results per page
   * @returns {Promise} - Promise resolving to applied jobs data
   */
  async getAppliedJobs(page = 1, limit = 10) {
    const response = await apiClient.get('/jobs/applied', { params: { page, limit } });
    return response.data;
  }
  
  /**
   * Save a job search
   * @param {string} name - Search name
   * @param {Object} filters - Search filters
   * @param {boolean} notificationsEnabled - Whether to enable notifications
   * @returns {Promise} - Promise resolving to success message
   */
  async saveJobSearch(name, filters, notificationsEnabled = false) {
    const response = await apiClient.post('/jobs/search/save', {
      name,
      filters,
      notificationsEnabled
    });
    return response.data;
  }
  
  /**
   * Get user's saved searches
   * @returns {Promise} - Promise resolving to saved searches data
   */
  async getSavedSearches() {
    const response = await apiClient.get('/jobs/search/saved');
    return response.data;
  }
  
  /**
   * Delete a saved search
   * @param {string} searchId - Saved search ID
   * @returns {Promise} - Promise resolving to success message
   */
  async deleteSavedSearch(searchId) {
    const response = await apiClient.delete(`/jobs/search/saved/${searchId}`);
    return response.data;
  }
  
  /**
   * Get job statistics
   * @returns {Promise} - Promise resolving to job statistics
   */
  async getJobStats() {
    const response = await apiClient.get('/jobs/stats');
    return response.data;
  }
}

export default new JobService(); 