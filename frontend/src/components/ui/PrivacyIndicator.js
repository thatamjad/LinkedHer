import React from 'react';
import { Chip, Tooltip, Box, Typography } from '@mui/material';
import { 
  LockOutlined, 
  PublicOutlined, 
  GppGoodOutlined, 
  HourglassEmptyOutlined,
  Schedule
} from '@mui/icons-material';

// Privacy level constants
export const PRIVACY_LEVELS = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
};

// Lifespan types
export const LIFESPAN_TYPES = {
  PERMANENT: 'permanent',
  DISAPPEARING: 'disappearing'
};

const PrivacyIndicator = ({ 
  privacyLevel = PRIVACY_LEVELS.MEDIUM, 
  lifespanType = LIFESPAN_TYPES.PERMANENT,
  expiresAt = null
}) => {
  // Icon based on privacy level
  const PrivacyIcon = 
    privacyLevel === PRIVACY_LEVELS.HIGH ? LockOutlined :
    privacyLevel === PRIVACY_LEVELS.MEDIUM ? GppGoodOutlined : 
    PublicOutlined;
  
  // Color based on privacy level
  const chipColor = 
    privacyLevel === PRIVACY_LEVELS.HIGH ? 'success' :
    privacyLevel === PRIVACY_LEVELS.MEDIUM ? 'info' : 
    'warning';
  
  // Label based on privacy level
  const privacyLabel = 
    privacyLevel === PRIVACY_LEVELS.HIGH ? 'High Privacy' :
    privacyLevel === PRIVACY_LEVELS.MEDIUM ? 'Medium Privacy' : 
    'Basic Privacy';
  
  // Description based on privacy level
  const privacyDescription = 
    privacyLevel === PRIVACY_LEVELS.HIGH ? 
      'End-to-end encrypted with metadata stripping' :
    privacyLevel === PRIVACY_LEVELS.MEDIUM ? 
      'Identity protected with standard encryption' : 
      'Basic anonymity protection';
  
  // Calculate time remaining if disappearing
  const getTimeRemaining = () => {
    if (lifespanType !== LIFESPAN_TYPES.DISAPPEARING || !expiresAt) {
      return null;
    }
    
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffMs = expiry - now;
    
    if (diffMs <= 0) {
      return 'Expired';
    }
    
    // Less than an hour
    if (diffMs < 3600000) {
      return `${Math.ceil(diffMs / 60000)} min`;
    }
    
    // Less than a day
    if (diffMs < 86400000) {
      return `${Math.ceil(diffMs / 3600000)} hr`;
    }
    
    // Multiple days
    return `${Math.ceil(diffMs / 86400000)} days`;
  };
  
  const timeRemaining = getTimeRemaining();
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Tooltip 
        title={
          <Box>
            <Typography variant="body2">{privacyLabel}</Typography>
            <Typography variant="caption">{privacyDescription}</Typography>
          </Box>
        }
      >
        <Chip
          icon={<PrivacyIcon />}
          label={privacyLabel}
          size="small"
          color={chipColor}
          variant="outlined"
          sx={{ 
            borderRadius: '16px',
            '& .MuiChip-icon': {
              color: 'inherit'
            }
          }}
        />
      </Tooltip>
      
      {lifespanType === LIFESPAN_TYPES.DISAPPEARING && expiresAt && (
        <Tooltip 
          title={
            <Box>
              <Typography variant="body2">Disappearing Post</Typography>
              <Typography variant="caption">
                This post will disappear {timeRemaining ? `in ${timeRemaining}` : 'soon'}
              </Typography>
            </Box>
          }
        >
          <Chip
            icon={<Schedule />}
            label={timeRemaining || 'Disappearing'}
            size="small"
            color="error"
            variant="outlined"
            sx={{ 
              borderRadius: '16px',
              '& .MuiChip-icon': {
                color: 'inherit'
              }
            }}
          />
        </Tooltip>
      )}
    </Box>
  );
};

export default PrivacyIndicator; 