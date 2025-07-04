import React from 'react';
import { Box, Tooltip, Typography, styled } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import SecurityIcon from '@mui/icons-material/Security';
import ShieldIcon from '@mui/icons-material/Shield';

const SecurityWrapper = styled(Box)(({ theme, status }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  backgroundColor: status === 'high' 
    ? theme.palette.success.light 
    : status === 'medium' 
      ? theme.palette.warning.light 
      : theme.palette.error.light,
  padding: theme.spacing(0.5, 1),
  borderRadius: theme.shape.borderRadius,
  color: status === 'high' 
    ? theme.palette.success.dark 
    : status === 'medium' 
      ? theme.palette.warning.dark 
      : theme.palette.error.dark,
  fontWeight: 'bold',
  cursor: 'default',
  maxWidth: 'fit-content',
  '& svg': {
    fontSize: '1.2rem'
  }
}));

/**
 * Security status indicator component
 * @param {object} props Component props
 * @param {string} props.status Security status: "high", "medium", or "low"
 * @param {string} props.message Custom message to display in tooltip
 * @param {boolean} props.showText Whether to show text label alongside icon
 * @param {function} props.onClick Optional click handler
 */
const SecurityIndicator = ({ 
  status = 'medium', 
  message = '', 
  showText = true,
  onClick = null
}) => {
  const getIcon = () => {
    switch (status) {
      case 'high':
        return <SecurityIcon />;
      case 'medium':
        return <ShieldIcon />;
      case 'low':
        return <LockOpenIcon />;
      default:
        return <LockIcon />;
    }
  };

  const getLabel = () => {
    switch (status) {
      case 'high':
        return 'High Security';
      case 'medium':
        return 'Medium Security';
      case 'low':
        return 'Low Security';
      default:
        return 'Security';
    }
  };

  const tooltipMessage = message || `Your security level is ${status.toUpperCase()}`;

  return (
    <Tooltip title={tooltipMessage} arrow>
      <SecurityWrapper status={status} onClick={onClick}>
        {getIcon()}
        {showText && <Typography variant="caption">{getLabel()}</Typography>}
      </SecurityWrapper>
    </Tooltip>
  );
};

export default SecurityIndicator; 