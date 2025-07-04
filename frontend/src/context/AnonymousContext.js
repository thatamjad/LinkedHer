import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import apiClient from '../services/apiClient';

// Create context
const AnonymousContext = createContext();

// Custom hook to use anonymous context
export const useAnonymous = () => {
  return useContext(AnonymousContext);
};

// Create a separate, isolated client for anonymous requests
const anonymousApiClient = apiClient.create();

anonymousApiClient.interceptors.request.use(config => {
  config.headers['x-anonymous-mode'] = 'true';
  const anonymousToken = sessionStorage.getItem('anonymousToken');
  if (anonymousToken) {
    config.headers['Authorization'] = `Bearer ${anonymousToken}`;
  }
  return config;
});

// Provider component
export const AnonymousProvider = ({ children }) => {
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activePersona, setActivePersona] = useState(null);
  const [contextStore, setContextStore] = useState({
    professional: {
      lastLocation: '/',
      scrollPositions: {},
      draftPosts: [],
      searchHistory: [],
      viewedContent: new Set()
    },
    anonymous: {
      lastLocation: '/anonymous',
      scrollPositions: {},
      draftPosts: [],
      searchHistory: [],
      viewedContent: new Set()
    }
  });
  const [animationInProgress, setAnimationInProgress] = useState(false);
  
  const loadPersonas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await apiClient.get('/anonymous/personas/my');
      setPersonas(data.personas || []);
    } catch (err) {
      setError('Failed to load anonymous personas.');
    } finally {
      setLoading(false);
    }
  }, []);

  const createPersona = async (personaData) => {
    const { data } = await apiClient.post('/anonymous/personas', personaData);
    setPersonas(prev => [...prev, data.persona]);
    return data;
  };

  const updatePersona = async (personaId, personaData) => {
    const { data } = await apiClient.put(`/anonymous/personas/${personaId}`, personaData);
    setPersonas(prev => prev.map(p => p.personaId === personaId ? data.persona : p));
    return data;
  };

  const deletePersona = async (personaId) => {
    await apiClient.delete(`/anonymous/personas/${personaId}`);
    setPersonas(prev => prev.filter(p => p.personaId !== personaId));
    if (activePersona?.personaId === personaId) {
      exitAnonymousMode();
    }
  };

  const switchPersona = async (personaId) => {
    const { data } = await apiClient.post(`/anonymous/personas/${personaId}/switch`);
    sessionStorage.setItem('anonymousToken', data.token);
    setActivePersona(data.persona);
    return data;
  };

  const exitAnonymousMode = () => {
    sessionStorage.removeItem('anonymousToken');
    setActivePersona(null);
  };

  // Store current context before switching modes
  const storeCurrentContext = (pathname, scrollPos = window.scrollY) => {
    const currentMode = activePersona ? 'anonymous' : 'professional';
    
    setContextStore(prev => ({
      ...prev,
      [currentMode]: {
        ...prev[currentMode],
        lastLocation: pathname,
        scrollPositions: {
          ...prev[currentMode].scrollPositions,
          [pathname]: scrollPos
        }
      }
    }));
  };
  
  // Get the target location when switching modes
  const getTargetLocation = (defaultPath) => {
    return contextStore[activePersona ? 'anonymous' : 'professional'].lastLocation || defaultPath;
  };

  // Get anonymous feed
  const getAnonymousFeed = async (page = 1, limit = 10) => {
    try {
      const response = await anonymousApiClient.get('/anonymous/feed', {
        params: { page, limit }
      });
      
      return response.data;
    } catch (err) {
      console.error('Get anonymous feed error:', err);
      throw err;
    }
  };

  // Create an anonymous post
  const createAnonymousPost = async (postData) => {
    try {
      if (!activePersona) {
        throw new Error('You must be in anonymous mode to create posts');
      }
      
      setLoading(true);
      const response = await anonymousApiClient.post('/anonymous/posts', postData);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create anonymous post');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Like or unlike an anonymous post
  const toggleLike = async (postId) => {
    try {
      if (!activePersona) {
        throw new Error('You must be in anonymous mode to like posts');
      }
      
      const response = await anonymousApiClient.post(`/anonymous/posts/${postId}/like`);
      return response.data;
    } catch (err) {
      console.error('Toggle like error:', err);
      throw err;
    }
  };

  // Add a comment to an anonymous post
  const addComment = async (postId, content, lifespan = 0) => {
    try {
      if (!activePersona) {
        throw new Error('You must be in anonymous mode to comment');
      }
      
      const response = await anonymousApiClient.post(`/anonymous/posts/${postId}/comments`, {
        content,
        lifespan
      });
      
      return response.data;
    } catch (err) {
      console.error('Add comment error:', err);
      throw err;
    }
  };

  // Upload media for anonymous posts with metadata stripping
  const uploadAnonymousMedia = async (file) => {
    try {
      if (!activePersona) {
        throw new Error('You must be in anonymous mode to upload media');
      }
      
      const formData = new FormData();
      formData.append('media', file);
      
      const response = await anonymousApiClient.post('/anonymous/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (err) {
      console.error('Upload media error:', err);
      throw err;
    }
  };

  // Load personas when user changes or on mount
  useEffect(() => {
    loadPersonas();
  }, [loadPersonas]);

  // Context value
  const value = {
    personas,
    loading,
    error,
    activePersona,
    contextStore,
    storeCurrentContext,
    getTargetLocation,
    animationInProgress,
    createPersona,
    updatePersona,
    deletePersona,
    switchPersona,
    exitAnonymousMode,
    getAnonymousFeed,
    createAnonymousPost,
    toggleLike,
    addComment,
    uploadAnonymousMedia,
    anonymousApiClient,
  };

  return (
    <AnonymousContext.Provider value={value}>
      {children}
    </AnonymousContext.Provider>
  );
};

export default AnonymousContext; 