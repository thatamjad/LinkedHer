import React, { useState } from 'react';
import styled from 'styled-components';
import { Box, Button, Typography, Paper, Divider, CircularProgress } from '@mui/material';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import apiClient from '../../services/apiClient';

const VerificationCard = styled(Paper)`
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 20px;
  border-left: 4px solid #0A66C2;
`;

const LinkedInButton = styled(Button)`
  background-color: #0A66C2;
  &:hover {
    background-color: #084e96;
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

const LinkedInVerification = ({ isVerified, verificationData, onVerificationComplete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const initiateLinkedInAuth = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await apiClient.get('/verification/linkedin/init');
      // Redirect to LinkedIn OAuth page
      window.location.href = data.authUrl;
    } catch (err) {
      setError('Failed to initiate LinkedIn verification. Please try again.');
      console.error('LinkedIn verification error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <VerificationCard elevation={2}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6" color="#0A66C2" style={{ display: 'flex', alignItems: 'center' }}>
          <LinkedInIcon style={{ marginRight: '8px' }} />
          LinkedIn Verification
        </Typography>
        {isVerified && (
          <Typography variant="body2" style={{ color: '#27AE60', fontWeight: 'bold' }}>
            Verified
          </Typography>
        )}
      </Box>
      
      <Divider style={{ margin: '16px 0' }} />
      
      <Typography variant="body2" color="text.secondary">
        Connect your LinkedIn profile to verify your professional identity. This helps establish 
        trust within our community and contributes to your verification score.
      </Typography>
      
      {isVerified ? (
        <Box mt={2}>
          <StatusIcon verified>
            <CheckCircleIcon />
            <Typography variant="body2">
              Your LinkedIn profile has been successfully verified
            </Typography>
          </StatusIcon>
          
          {verificationData?.data && (
            <Box mt={2} p={2} bgcolor="#f5f5f5" borderRadius="8px">
              <Typography variant="body2">
                <strong>Profile:</strong> {verificationData.data.firstName} {verificationData.data.lastName}
              </Typography>
              <Typography variant="body2" mt={1}>
                <strong>Verified on:</strong> {new Date(verificationData.verifiedAt).toLocaleDateString()}
              </Typography>
            </Box>
          )}
        </Box>
      ) : (
        <>
          <LinkedInButton
            variant="contained"
            startIcon={<LinkedInIcon />}
            onClick={initiateLinkedInAuth}
            disabled={loading}
            fullWidth
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Connect with LinkedIn'}
          </LinkedInButton>
          
          {error && (
            <Typography variant="body2" color="error" mt={2}>
              {error}
            </Typography>
          )}
        </>
      )}
    </VerificationCard>
  );
};

export default LinkedInVerification; 