import React, { createContext, useState, useContext, useCallback } from 'react';
import { useAuth } from './AuthContext';

// Create context
const ProfileContext = createContext();

// Custom hook to use profile context
export const useProfile = () => {
  return useContext(ProfileContext);
};

// Provider component
export const ProfileProvider = ({ children }) => {
  const { authAxios, currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get current user's profile
  const getCurrentProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await authAxios.get('/profile/me');
      setProfile(response.data.data);
      setError(null);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load profile');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [authAxios]);

  // Get profile by user ID
  const getProfileByUserId = useCallback(async (userId) => {
    try {
      setLoading(true);
      const response = await authAxios.get(`/profile/user/${userId}`);
      setError(null);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load profile');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [authAxios]);

  // Create or update profile
  const createOrUpdateProfile = useCallback(async (profileData) => {
    try {
      setLoading(true);
      const response = await authAxios.post('/profile', profileData);
      setProfile(response.data.data);
      setError(null);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [authAxios]);

  // Add experience
  const addExperience = useCallback(async (experienceData) => {
    try {
      setLoading(true);
      const response = await authAxios.post('/profile/experience', experienceData);
      setProfile(response.data.data);
      setError(null);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add experience');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [authAxios]);

  // Update experience
  const updateExperience = useCallback(async (expId, experienceData) => {
    try {
      setLoading(true);
      const response = await authAxios.put(`/profile/experience/${expId}`, experienceData);
      setProfile(response.data.data);
      setError(null);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update experience');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [authAxios]);

  // Delete experience
  const deleteExperience = useCallback(async (expId) => {
    try {
      setLoading(true);
      const response = await authAxios.delete(`/profile/experience/${expId}`);
      setProfile(response.data.data);
      setError(null);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete experience');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [authAxios]);

  // Add education
  const addEducation = useCallback(async (educationData) => {
    try {
      setLoading(true);
      const response = await authAxios.post('/profile/education', educationData);
      setProfile(response.data.data);
      setError(null);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add education');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [authAxios]);

  // Update education
  const updateEducation = useCallback(async (eduId, educationData) => {
    try {
      setLoading(true);
      const response = await authAxios.put(`/profile/education/${eduId}`, educationData);
      setProfile(response.data.data);
      setError(null);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update education');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [authAxios]);

  // Delete education
  const deleteEducation = useCallback(async (eduId) => {
    try {
      setLoading(true);
      const response = await authAxios.delete(`/profile/education/${eduId}`);
      setProfile(response.data.data);
      setError(null);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete education');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [authAxios]);

  // Add skill
  const addSkill = useCallback(async (skillData) => {
    try {
      setLoading(true);
      const response = await authAxios.post('/profile/skills', skillData);
      setProfile(response.data.data);
      setError(null);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add skill');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [authAxios]);

  // Delete skill
  const deleteSkill = useCallback(async (skillId) => {
    try {
      setLoading(true);
      const response = await authAxios.delete(`/profile/skills/${skillId}`);
      setProfile(response.data.data);
      setError(null);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete skill');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [authAxios]);

  // Context value
  const value = {
    profile,
    loading,
    error,
    setError,
    getCurrentProfile,
    getProfileByUserId,
    createOrUpdateProfile,
    addExperience,
    updateExperience,
    deleteExperience,
    addEducation,
    updateEducation,
    deleteEducation,
    addSkill,
    deleteSkill
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};

export default ProfileContext; 