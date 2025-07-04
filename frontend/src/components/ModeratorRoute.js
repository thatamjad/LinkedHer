import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * A route guard that only allows moderators to access the route
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if user is a moderator
 * @returns {React.ReactElement} The protected component or a redirect
 */
const ModeratorRoute = ({ children }) => {
  const { authState, isAuthenticated } = useAuth();
  
  // Check if user is authenticated
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  
  // Check if user has moderator role
  if (!authState.user?.isModerator) {
    return <Navigate to="/" replace />;
  }
  
  // If authenticated and a moderator, allow access
  return children;
};

export default ModeratorRoute; 