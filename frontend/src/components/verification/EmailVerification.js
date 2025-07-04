import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  Divider, 
  TextField, 
  CircularProgress,
  Alert,
  AlertTitle
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import apiClient from '../../services/apiClient';

const VerificationCard = styled(Paper)`
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 20px;
  border-left: 4px solid #8B5FBF;
`;

const SubmitButton = styled(Button)`
  background-color: #8B5FBF;
  &:hover {
    background-color: #7B4AAD;
  }
  margin-top: 16px;
`;

const StatusIcon = styled(Box)`
  display: flex;
  align-items: center;
  margin-top: 8px;
  color: ${props => props.verified ? '#27AE60' : 'inherit'};
  
  svg {
    margin-right: 8px;
  }
`;

const EmailVerification = ({ isVerified, verificationData, onVerificationComplete }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [freeEmailError, setFreeEmailError] = useState(false);
  
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setError(null);
    setFreeEmailError(false);
  };
  
  const initiateEmailVerification = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your professional email address');
      return;
    }
    
    // Basic email validation
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      await apiClient.post('/verification/email/init', { email });
      
      setSuccess(true);
      
      // If onVerificationComplete is provided, call it to refresh verification status
      if (onVerificationComplete) {
        onVerificationComplete();
      }
    } catch (err) {
      console.error('Email verification error:', err);
      
      if (err.response && err.response.data) {
        if (err.response.data.isFreeDomain) {
          setFreeEmailError(true);
        } else {
          setError(err.response.data.message || 'Failed to send verification email. Please try again.');
        }
      } else {
        setError('An error occurred while sending the verification email.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <VerificationCard elevation={2}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6" color="#8B5FBF" style={{ display: 'flex', alignItems: 'center' }}>
          <EmailIcon style={{ marginRight: '8px' }} />
          Professional Email Verification
        </Typography>
        {isVerified && (
          <Typography variant="body2" style={{ color: '#27AE60', fontWeight: 'bold' }}>
            Verified
          </Typography>
        )}
      </Box>
      
      <Divider style={{ margin: '16px 0' }} />
      
      <Typography variant="body2" color="text.secondary">
        Verify your professional email address to strengthen your identity verification. 
        We prioritize work and business email addresses to ensure our community is 
        composed of verified professional women.
      </Typography>
      
      {isVerified ? (
        <Box mt={2}>
          <StatusIcon verified>
            <CheckCircleIcon />
            <Typography variant="body2">
              Your professional email has been successfully verified
            </Typography>
          </StatusIcon>
          
          {verificationData?.email && (
            <Box mt={2} p={2} bgcolor="#f5f5f5" borderRadius="8px">
              <Typography variant="body2">
                <strong>Verified Email:</strong> {verificationData.email}
              </Typography>
              {verificationData.verifiedAt && (
                <Typography variant="body2" mt={1}>
                  <strong>Verified on:</strong> {new Date(verificationData.verifiedAt).toLocaleDateString()}
                </Typography>
              )}
            </Box>
          )}
        </Box>
      ) : (
        <>
          {success ? (
            <Alert severity="success" sx={{ mt: 2 }}>
              <AlertTitle>Verification Email Sent</AlertTitle>
              We've sent a verification link to your email address. Please check your inbox and click the verification link to complete the process.
            </Alert>
          ) : (
            <form onSubmit={initiateEmailVerification}>
              <TextField
                label="Professional Email Address"
                variant="outlined"
                fullWidth
                margin="normal"
                value={email}
                onChange={handleEmailChange}
                placeholder="your.name@company.com"
                error={!!error || freeEmailError}
                helperText={error}
                disabled={loading}
              />
              
              {freeEmailError && (
                <Alert severity="warning" sx={{ mt: 1 }}>
                  Please use a professional email domain for verification. Free email providers (gmail.com, yahoo.com, etc.) are not accepted for professional verification.
                </Alert>
              )}
              
              <SubmitButton
                variant="contained"
                type="submit"
                disabled={loading}
                fullWidth
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Send Verification Email'}
              </SubmitButton>
            </form>
          )}
        </>
      )}
    </VerificationCard>
  );
};

export default EmailVerification; 