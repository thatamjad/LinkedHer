import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Box, Typography, Chip, LinearProgress, Paper, Tooltip } from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

const StatusWrapper = styled(Paper)`
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 24px;
  background-color: ${props => {
    switch (props.status) {
      case 'verified':
        return '#EBF7EE';
      case 'pending':
        return '#FFF8E1';
      case 'expired':
        return '#FFEBEE';
      default:
        return '#ECEFF1';
    }
  }};
`;

const ProgressWrapper = styled(Box)`
  margin-top: 16px;
  position: relative;
`;

const CustomLinearProgress = styled(LinearProgress)`
  height: 12px;
  border-radius: 6px;
  background-color: rgba(0, 0, 0, 0.1);
  .MuiLinearProgress-bar {
    background-color: ${props => {
      if (props.value >= 70) return '#27AE60';
      if (props.value >= 40) return '#F39C12';
      return '#E74C3C';
    }};
  }
`;

const StatusChip = styled(Chip)`
  margin-left: 16px;
  font-weight: 600;
  height: 32px;
  font-size: 0.85rem;
`;

const CountdownText = styled(Typography)`
  margin-top: 8px;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 8px;
    font-size: 18px;
  }
`;

const VerificationStatus = ({ status, expiresAt, score, methods = {} }) => {
  const [daysRemaining, setDaysRemaining] = useState(null);
  const [isExpired, setIsExpired] = useState(false);
  
  // Calculate days remaining whenever expiresAt changes
  useEffect(() => {
    if (!expiresAt) return;
    
    const calculateDaysRemaining = () => {
      const now = new Date();
      const expiryDate = new Date(expiresAt);
      const timeDiff = expiryDate - now;
      
      // If expired
      if (timeDiff <= 0) {
        setIsExpired(true);
        setDaysRemaining(0);
        return;
      }
      
      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      setDaysRemaining({ days, hours });
    };
    
    calculateDaysRemaining();
    
    // Update countdown every hour
    const interval = setInterval(calculateDaysRemaining, 1000 * 60 * 60);
    
    return () => clearInterval(interval);
  }, [expiresAt]);
  
  // Determine status text and icon
  const getStatusInfo = () => {
    if (status === 'verified') {
      return {
        text: 'Verified',
        icon: <VerifiedIcon />,
        color: 'success'
      };
    } else if (isExpired) {
      return {
        text: 'Expired',
        icon: <ErrorOutlineIcon />,
        color: 'error'
      };
    } else if (status === 'pending') {
      return {
        text: 'Pending',
        icon: <AccessTimeIcon />,
        color: 'warning'
      };
    } else {
      return {
        text: 'Unverified',
        icon: <HelpOutlineIcon />,
        color: 'default'
      };
    }
  };
  
  const statusInfo = getStatusInfo();
  
  // Calculate verification methods completed
  const getVerificationProgress = () => {
    let completed = 0;
    if (methods.linkedIn?.verified) completed++;
    if (methods.professionalEmail?.verified) completed++;
    if (methods.governmentId?.verified) completed++;
    
    const total = 3; // Total verification methods
    return { completed, total };
  };
  
  const progress = getVerificationProgress();
  
  return (
    <StatusWrapper status={isExpired ? 'expired' : status} elevation={1}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">Verification Status</Typography>
        <StatusChip 
          label={statusInfo.text}
          color={statusInfo.color}
          icon={statusInfo.icon}
        />
      </Box>
      
      {status === 'pending' && daysRemaining && (
        <CountdownText variant="body2" color="text.secondary">
          <AccessTimeIcon />
          {isExpired ? (
            'Verification window has expired'
          ) : (
            `Verification window: ${daysRemaining.days} day${daysRemaining.days !== 1 ? 's' : ''} and ${daysRemaining.hours} hour${daysRemaining.hours !== 1 ? 's' : ''} remaining`
          )}
        </CountdownText>
      )}
      
      <ProgressWrapper>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="body2">Verification Score: {score || 0}%</Typography>
          <Tooltip title={`${progress.completed}/${progress.total} verification methods completed`}>
            <Typography variant="body2">
              {progress.completed}/{progress.total} Methods
            </Typography>
          </Tooltip>
        </Box>
        <CustomLinearProgress variant="determinate" value={score || 0} />
        
        {score < 70 && status !== 'verified' && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            You need 70% to become fully verified
          </Typography>
        )}
      </ProgressWrapper>
    </StatusWrapper>
  );
};

export default VerificationStatus; 