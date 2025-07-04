import React, { useState, useEffect, useCallback } from 'react';
import { Container, Box, Typography, Paper, Button, Divider, Grid, Alert, useTheme } from '@mui/material';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';

// Import verification components
import VerificationStatus from '../components/verification/VerificationStatus';
import VerificationCountdown from '../components/verification/VerificationCountdown';
import LinkedInVerification from '../components/verification/LinkedInVerification';
import EmailVerification from '../components/verification/EmailVerification';
import IdVerification from '../components/verification/IdVerification';

const VerificationPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [verificationData, setVerificationData] = useState(null);
  const [urlParams, setUrlParams] = useState({});
  
  // Parse URL parameters on component mount
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const method = searchParams.get('method');
    const status = searchParams.get('status');
    
    if (method && status) {
      setUrlParams({ method, status });
    }
  }, []);
  
  const fetchVerificationStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await apiClient.get('/verification/status');
      setVerificationData(data);
    } catch (err) {
      console.error('Verification status error:', err);
      setError('Failed to load verification status. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch verification status on component mount
  useEffect(() => {
    fetchVerificationStatus();
  }, [fetchVerificationStatus]);
  
  // Method to refresh verification status
  const refreshVerificationStatus = () => {
    fetchVerificationStatus();
  };
  
  // Display outcome message if redirected from verification
  const renderVerificationOutcome = () => {
    if (!urlParams.method || !urlParams.status) return null;
    
    const { method, status } = urlParams;
    
    if (status === 'success') {
      return (
        <Alert severity="success" sx={{ mb: 3 }}>
          Your {method === 'linkedin' ? 'LinkedIn' : 'email'} verification was successful!
        </Alert>
      );
    } else if (status === 'error') {
      return (
        <Alert severity="error" sx={{ mb: 3 }}>
          There was an error verifying your {method === 'linkedin' ? 'LinkedIn' : 'email'}. Please try again.
        </Alert>
      );
    }
    
    return null;
  };
  
  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box textAlign="center" py={6}>
          <Typography variant="h5">Loading verification status...</Typography>
        </Box>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={fetchVerificationStatus}>
          Try Again
        </Button>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 2,
          textAlign: 'center',
          backgroundColor: theme.palette.primary.light,
          color: theme.palette.primary.contrastText
        }}
      >
        <Box display="flex" justifyContent="center" alignItems="center" mb={2}>
          <VerifiedUserIcon sx={{ fontSize: 36, mr: 1 }} />
          <Typography variant="h4">Account Verification</Typography>
        </Box>
        <Typography variant="body1">
          Complete the verification steps below to unlock all features and establish trust in our community.
        </Typography>
      </Paper>
      
      {renderVerificationOutcome()}
      
      {verificationData && (
        <>
          <VerificationStatus 
            status={verificationData.status}
            expiresAt={verificationData.expiresAt}
            score={verificationData.score}
            methods={verificationData.methods}
          />
          
          {/* Only show countdown if not verified and not expired */}
          {verificationData.status !== 'verified' && 
           !verificationData.isExpired && 
           verificationData.expiresAt && (
            <VerificationCountdown expiresAt={verificationData.expiresAt} />
          )}
          
          {/* Show expired message if verification has expired */}
          {verificationData.isExpired && (
            <Alert severity="error" sx={{ mb: 3 }}>
              <Alert.Title>Verification Window Expired</Alert.Title>
              Your verification window has expired. Please contact support to request an extension.
            </Alert>
          )}
          
          <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4, mb: 2 }}>
            Verification Methods
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <LinkedInVerification 
                isVerified={verificationData.methods?.linkedIn?.verified}
                verificationData={verificationData.methods?.linkedIn}
                onVerificationComplete={refreshVerificationStatus}
              />
            </Grid>
            
            <Grid item xs={12}>
              <EmailVerification 
                isVerified={verificationData.methods?.professionalEmail?.verified}
                verificationData={verificationData.methods?.professionalEmail}
                onVerificationComplete={refreshVerificationStatus}
              />
            </Grid>
            
            <Grid item xs={12}>
              <IdVerification 
                isVerified={verificationData.methods?.governmentId?.verified}
                verificationData={verificationData.methods?.governmentId}
                status={verificationData.methods?.governmentId?.status}
                onVerificationComplete={refreshVerificationStatus}
              />
            </Grid>
          </Grid>
          
          <Box mt={4} textAlign="center">
            <Button 
              variant="contained" 
              color="primary"
              size="large"
              onClick={() => navigate('/dashboard')}
            >
              Return to Dashboard
            </Button>
          </Box>
        </>
      )}
    </Container>
  );
};

export default VerificationPage; 