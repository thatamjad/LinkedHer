import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // This is crucial for sending cookies
});

// Interceptor to handle token attachment to headers
apiClient.interceptors.request.use(
  (config) => {
    // We will manage the token in memory, not localStorage
    const token = apiClient.defaults.headers.common['Authorization']?.split(' ')[1];
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle token refreshing
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { data } = await apiClient.post('/auth/refresh-token');
        apiClient.setToken(data.accessToken);
        originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Handle failed refresh (e.g., redirect to login)
        console.error("Session expired. Please log in again.");
        // Here you might want to trigger a logout action or redirect
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// Method to set token in memory
apiClient.setToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

export default apiClient;
