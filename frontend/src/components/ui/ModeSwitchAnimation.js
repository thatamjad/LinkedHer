import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Typography, Fade } from '@mui/material';
import { useAnonymous } from '../../context/AnonymousContext';

const ModeSwitchAnimation = () => {
  const { anonymousMode, animationInProgress, settings, activePersona } = useAnonymous();
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  
  // Messages for the animation stages
  const messages = {
    professional: [
      'Establishing secure connection...',
      'Switching to professional mode...',
      'Loading your profile...',
      'Almost there...',
    ],
    anonymous: [
      'Establishing secure connection...',
      'Activating privacy protocols...',
      'Initializing anonymous persona...',
      'Almost there...',
    ]
  };
  
  useEffect(() => {
    if (!animationInProgress) {
      setProgress(0);
      return;
    }
    
    const duration = settings?.animationSpeed || 300;
    const steps = 20;
    const interval = duration / steps;
    
    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      setProgress(Math.min(100, (currentStep / steps) * 100));
      
      // Update message at certain progress points
      if (currentStep === 5) {
        setMessage(anonymousMode ? messages.professional[0] : messages.anonymous[0]);
      } else if (currentStep === 10) {
        setMessage(anonymousMode ? messages.professional[1] : messages.anonymous[1]);
      } else if (currentStep === 15) {
        setMessage(anonymousMode ? messages.professional[2] : messages.anonymous[2]);
      } else if (currentStep === 18) {
        setMessage(anonymousMode ? messages.professional[3] : messages.anonymous[3]);
      }
      
      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, interval);
    
    return () => {
      clearInterval(timer);
    };
  }, [animationInProgress, anonymousMode, settings]);
  
  if (!animationInProgress) {
    return null;
  }
  
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: anonymousMode ? 'rgba(18, 18, 18, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        zIndex: 1500,
        transition: 'background-color 0.5s ease-in-out',
      }}
    >
      <CircularProgress 
        variant="determinate" 
        value={progress}
        size={100}
        thickness={4}
        sx={{
          color: anonymousMode ? 'primary.light' : 'primary.main',
          mb: 4,
        }}
      />
      
      <Fade in={!!message} timeout={200}>
        <Typography 
          variant="h6" 
          color={anonymousMode ? 'white' : 'text.primary'}
          sx={{ mb: 2 }}
        >
          {message}
        </Typography>
      </Fade>
      
      <Typography 
        variant="body1" 
        color={anonymousMode ? 'text.secondary' : 'text.secondary'}
      >
        {anonymousMode ? 'Switching to Professional Mode' : `Switching to ${activePersona?.name || 'Anonymous'} Persona`}
      </Typography>
    </Box>
  );
};

export default ModeSwitchAnimation; 