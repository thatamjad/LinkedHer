import React from 'react';
import { Button as MuiButton } from '@mui/material';
import styled from 'styled-components';

const StyledButton = styled(MuiButton)`
  font-weight: ${props => props.bold ? '600' : '500'};
  box-shadow: ${props => props.variant === 'contained' ? '0px 4px 8px rgba(0, 0, 0, 0.1)' : 'none'};
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.variant === 'contained' ? '0px 6px 10px rgba(0, 0, 0, 0.15)' : 'none'};
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const Button = ({ 
  children, 
  variant = 'contained', 
  color = 'primary', 
  size = 'medium',
  fullWidth = false,
  onClick,
  disabled = false,
  bold = false,
  type = 'button',
  startIcon,
  endIcon,
  ...props 
}) => {
  return (
    <StyledButton
      variant={variant}
      color={color}
      size={size}
      fullWidth={fullWidth}
      onClick={onClick}
      disabled={disabled}
      type={type}
      bold={bold}
      startIcon={startIcon}
      endIcon={endIcon}
      {...props}
    >
      {children}
    </StyledButton>
  );
};

export default Button; 