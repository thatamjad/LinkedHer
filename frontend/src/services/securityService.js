import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Add session ID to requests
axios.interceptors.request.use(config => {
  const sessionId = localStorage.getItem('sessionId');
  if (sessionId) {
    config.headers['x-session-id'] = sessionId;
  }
  return config;
});

// Two-Factor Authentication Services
export const setup2FA = async () => {
  try {
    const response = await axios.post(`${API_URL}/security/2fa/setup`, {}, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const verify2FA = async (token) => {
  try {
    const response = await axios.post(`${API_URL}/security/2fa/verify`, { token }, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const verify2FALogin = async (userId, token, backupCode) => {
  try {
    const response = await axios.post(`${API_URL}/security/2fa/verify-login`, { 
      userId, 
      token, 
      backupCode 
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const disable2FA = async (token, password) => {
  try {
    const response = await axios.post(`${API_URL}/security/2fa/disable`, { 
      token, 
      password 
    }, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const generateBackupCodes = async (token) => {
  try {
    const response = await axios.post(`${API_URL}/security/2fa/backup-codes`, { token }, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Session Management Services
export const createSession = async (isAnonymousMode = false) => {
  try {
    const response = await axios.post(`${API_URL}/security/sessions`, { isAnonymousMode }, {
      withCredentials: true
    });
    
    // Store session ID in local storage
    if (response.data.success && response.data.data.sessionId) {
      localStorage.setItem('sessionId', response.data.data.sessionId);
      localStorage.setItem('sessionExpiry', response.data.data.expiresAt);
    }
    
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getUserSessions = async () => {
  try {
    const response = await axios.get(`${API_URL}/security/sessions`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const revokeSession = async (sessionId) => {
  try {
    const response = await axios.delete(`${API_URL}/security/sessions/${sessionId}`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const revokeAllOtherSessions = async () => {
  try {
    const response = await axios.delete(`${API_URL}/security/sessions`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateSessionActivity = async () => {
  try {
    const response = await axios.patch(`${API_URL}/security/sessions/activity`, {}, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const markSessionSuspicious = async (sessionId, reason) => {
  try {
    const response = await axios.post(`${API_URL}/security/sessions/${sessionId}/suspicious`, { reason }, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Privacy Control Services
export const getPrivacySettings = async () => {
  try {
    const response = await axios.get(`${API_URL}/security/privacy/profile`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updatePrivacySettings = async (privacySettings) => {
  try {
    const response = await axios.put(`${API_URL}/security/privacy/profile`, { privacySettings }, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateItemVisibility = async (section, itemId, visibility) => {
  try {
    const response = await axios.patch(`${API_URL}/security/privacy/item`, { 
      section, 
      itemId, 
      visibility 
    }, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getProfileWithVisibility = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/security/privacy/profile/${userId}`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Anonymous Mode Security Services
export const generateRoutingPath = async (personaId) => {
  try {
    const response = await axios.get(`${API_URL}/security/anonymous/${personaId}/routing`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getRandomDelayParams = async (personaId) => {
  try {
    const response = await axios.get(`${API_URL}/security/anonymous/${personaId}/delay`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getRandomizedHeaders = async (personaId) => {
  try {
    const response = await axios.get(`${API_URL}/security/anonymous/${personaId}/headers`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateSecuritySettings = async (personaId, securitySettings) => {
  try {
    const response = await axios.put(`${API_URL}/security/anonymous/${personaId}/security`, { securitySettings }, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateMetadataSettings = async (personaId, metadataSettings) => {
  try {
    const response = await axios.put(`${API_URL}/security/anonymous/${personaId}/metadata`, { metadataSettings }, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateMixingParameters = async (personaId, mixingParameters) => {
  try {
    const response = await axios.put(`${API_URL}/security/anonymous/${personaId}/mixing`, { mixingParameters }, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}; 