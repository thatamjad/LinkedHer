import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Box, Typography, Paper, LinearProgress, Tooltip } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const CountdownWrapper = styled(Paper)`
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 24px;
  background-color: ${props => props.isExpiring ? '#FFF3E0' : '#F3E5F5'};
  border-left: 4px solid ${props => props.isExpiring ? '#FF9800' : '#9C27B0'};
`;

const ProgressBar = styled(LinearProgress)`
  height: 8px;
  border-radius: 4px;
  margin-top: 12px;
  background-color: rgba(0, 0, 0, 0.1);
  
  .MuiLinearProgress-bar {
    background-color: ${props => {
      if (props.progress < 25) return '#F44336';
      if (props.progress < 50) return '#FF9800';
      return '#8B5FBF';
    }};
  }
`;

const TimePart = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 8px;
  
  .time-value {
    font-size: 1.8rem;
    font-weight: 700;
    line-height: 1;
    color: ${props => props.isExpiring ? '#E65100' : '#4A148C'};
  }
  
  .time-label {
    font-size: 0.75rem;
    color: ${props => props.isExpiring ? '#E65100' : '#4A148C'};
    opacity: 0.7;
    margin-top: 4px;
  }
`;

const VerificationCountdown = ({ expiresAt }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
  const [progress, setProgress] = useState(100);
  
  useEffect(() => {
    if (!expiresAt) return;
    
    // Calculate initial total duration (in ms) assuming 7 day window
    const totalDuration = 7 * 24 * 60 * 60 * 1000; 
    
    const calculateTimeLeft = () => {
      const now = new Date();
      const expiryDate = new Date(expiresAt);
      const difference = expiryDate - now;
      
      if (difference <= 0) {
        // Verification window has expired
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
        setProgress(0);
        return;
      }
      
      // Calculate new progress based on time remaining
      const newProgress = Math.round((difference / totalDuration) * 100);
      setProgress(Math.min(newProgress, 100));
      
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      
      setTimeLeft({ days, hours, minutes, seconds, total: difference });
    };
    
    calculateTimeLeft();
    
    // Update countdown every second
    const timer = setInterval(calculateTimeLeft, 1000);
    
    return () => clearInterval(timer);
  }, [expiresAt]);
  
  if (!expiresAt || timeLeft.total === 0) {
    return null;
  }
  
  const isExpiring = timeLeft.days < 2; // Less than 2 days remaining
  
  return (
    <CountdownWrapper elevation={1} isExpiring={isExpiring}>
      <Box display="flex" alignItems="center" mb={1}>
        {isExpiring ? (
          <WarningAmberIcon color="warning" style={{ marginRight: '8px' }} />
        ) : (
          <AccessTimeIcon color="secondary" style={{ marginRight: '8px' }} />
        )}
        <Typography variant="h6" color={isExpiring ? 'warning.dark' : 'secondary.dark'}>
          {isExpiring ? 'Verification Expiring Soon!' : 'Verification Window'}
        </Typography>
      </Box>
      
      <Typography variant="body2" color="text.secondary" mb={2}>
        {isExpiring 
          ? 'Your verification window is closing soon. Please complete verification to maintain access to all features.'
          : 'You need to complete verification within this time window to access all features of the platform.'}
      </Typography>
      
      <Box display="flex" justifyContent="center" alignItems="center" my={2}>
        <TimePart isExpiring={isExpiring}>
          <Typography className="time-value">{timeLeft.days}</Typography>
          <Typography className="time-label">Days</Typography>
        </TimePart>
        
        <Typography variant="h4" color={isExpiring ? 'warning.main' : 'secondary.main'}>:</Typography>
        
        <TimePart isExpiring={isExpiring}>
          <Typography className="time-value">{timeLeft.hours.toString().padStart(2, '0')}</Typography>
          <Typography className="time-label">Hours</Typography>
        </TimePart>
        
        <Typography variant="h4" color={isExpiring ? 'warning.main' : 'secondary.main'}>:</Typography>
        
        <TimePart isExpiring={isExpiring}>
          <Typography className="time-value">{timeLeft.minutes.toString().padStart(2, '0')}</Typography>
          <Typography className="time-label">Minutes</Typography>
        </TimePart>
        
        <Typography variant="h4" color={isExpiring ? 'warning.main' : 'secondary.main'}>:</Typography>
        
        <TimePart isExpiring={isExpiring}>
          <Typography className="time-value">{timeLeft.seconds.toString().padStart(2, '0')}</Typography>
          <Typography className="time-label">Seconds</Typography>
        </TimePart>
      </Box>
      
      <Tooltip title={`${progress}% of time remaining`} placement="top">
        <ProgressBar variant="determinate" value={progress} progress={progress} />
      </Tooltip>
    </CountdownWrapper>
  );
};

export default VerificationCountdown; 