import React, { useState } from 'react';
import { Button, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const TestLoginButton = () => {
  const [loading, setLoading] = useState(false);
  const { testLogin } = useAuth();
  const navigate = useNavigate();

  const handleTestLogin = async () => {
    try {
      setLoading(true);
      
      // Use the testLogin function from AuthContext which calls the backend
      await testLogin();
      
      // Redirect to dashboard
      navigate('/');
      
    } catch (error) {
      console.error('Test login failed:', error);
      alert('Test login failed. Please check if the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="contained"
      color="secondary"
      onClick={handleTestLogin}
      disabled={loading}
      sx={{ mt: 2 }}
    >
      {loading ? <CircularProgress size={24} /> : 'Login as Test User'}
    </Button>
  );
};

export default TestLoginButton;