import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Paper, 
  Divider, 
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import axios from 'axios';
import VerificationStatus from '../components/verification/VerificationStatus';
import LinkedInVerification from '../components/verification/LinkedInVerification';
import EmailVerification from '../components/verification/EmailVerification';
import IdVerification from '../components/verification/IdVerification';
import { useNavigate, useLocation } from 'react-router-dom';

const Verification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [verificationData, setVerificationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Handle query params for OAuth callback
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const method = queryParams.get('method');
    const status = queryParams.get('status');
    
    if (method && status) {
      setSnackbar({
        open: true,
        message: status === 'success' 
          ? `${method.charAt(0).toUpperCase() + method.slice(1)} verification successful!` 
          : `${method.charAt(0).toUpperCase() + method.slice(1)} verification failed`,
        severity: status === 'success' ? 'success' : 'error'
      });
      
      // Remove query params from URL
      navigate('/verification', { replace: true });
    }
  }, [location, navigate]);
  
  // Fetch verification status
  useEffect(() => {
    const fetchVerificationStatus = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/verification/status`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        setVerificationData(response.data);
      } catch (err) {
        console.error('Error fetching verification status:', err);
        setError('Failed to load verification status. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchVerificationStatus();
    
    // Refresh status every minute to show countdown timer updates
    const intervalId = setInterval(fetchVerificationStatus, 60000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  const refreshVerificationStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/verification/status`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setVerificationData(response.data);
      return response.data;
    } catch (err) {
      console.error('Error refreshing verification status:', err);
      throw err;
    }
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };
  
  if (loading && !verificationData) {
    return (
      <Container maxWidth="md">
        <Box sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container maxWidth="md">
        <Box sx={{ py: 4 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      </Container>
    );
  }
  
  // Check if methods exist and are verified
  const linkedInVerified = verificationData?.verificationMethods?.linkedIn?.verified || false;
  const emailVerified = verificationData?.verificationMethods?.professionalEmail?.verified || false;
  const idVerified = verificationData?.verificationMethods?.governmentId?.verified || false;
  
  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Account Verification
        </Typography>
        
        <Typography variant="body1" paragraph>
          To ensure Linker remains a women-only professional space, we require identity verification. 
          Complete at least two verification methods to become fully verified and access all platform features.
        </Typography>
        
        {verificationData && (
          <VerificationStatus 
            status={verificationData.verificationStatus}
            expiresAt={verificationData.verificationExpiresAt}
            score={verificationData.verificationScore}
            methods={verificationData.verificationMethods}
          />
        )}
        
        <Box mt={4}>
          <LinkedInVerification 
            isVerified={linkedInVerified}
            verificationData={verificationData?.verificationMethods?.linkedIn}
            onVerificationComplete={refreshVerificationStatus}
          />
          
          <EmailVerification 
            isVerified={emailVerified}
            verificationData={verificationData?.verificationMethods?.professionalEmail}
            onVerificationComplete={refreshVerificationStatus}
          />
          
          <IdVerification 
            isVerified={idVerified}
            verificationData={verificationData?.verificationMethods?.governmentId}
            onVerificationComplete={refreshVerificationStatus}
          />
        </Box>
        
        <Paper elevation={1} sx={{ p: 3, mt: 4, bgcolor: '#f8f9fa' }}>
          <Typography variant="h6" gutterBottom>
            Privacy Commitment
          </Typography>
          <Typography variant="body2">
            We prioritize your privacy and security in our verification process. All ID documents 
            have metadata removed before storage, and your verification data is encrypted. 
            Learn more about our privacy practices in our <a href="/privacy">Privacy Policy</a>.
          </Typography>
        </Paper>
      </Box>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Verification; 