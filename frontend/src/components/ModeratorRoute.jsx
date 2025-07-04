import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ModeratorRoute component to protect routes that only moderators should access
 * Redirects non-moderators to the home page
 */
const ModeratorRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // While authentication status is loading, show nothing
  if (loading) {
    return null;
  }

  // If user is not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // If user is authenticated but not a moderator, redirect to home
  if (!user?.isModerator) {
    return <Navigate to="/" />;
  }

  // If user is authenticated and is a moderator, render the protected component
  return children;
};

export default ModeratorRoute; 