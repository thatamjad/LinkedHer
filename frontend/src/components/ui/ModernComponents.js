import React from 'react';
import styled, { css, keyframes } from 'styled-components';
import { motion } from 'framer-motion';

// Animation Keyframes
const shimmer = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const scaleIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

// Enhanced Button Component
const ButtonBase = styled(motion.button)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: ${props => {
    switch (props.size) {
      case 'xs': return '0.375rem 0.75rem';
      case 'sm': return '0.5rem 1rem';
      case 'lg': return '0.75rem 1.5rem';
      case 'xl': return '1rem 2rem';
      default: return '0.625rem 1.25rem';
    }
  }};
  font-size: ${props => {
    switch (props.size) {
      case 'xs': return '0.75rem';
      case 'sm': return '0.875rem';
      case 'lg': return '1.125rem';
      case 'xl': return '1.25rem';
      default: return '1rem';
    }
  }};
  font-weight: 600;
  line-height: 1;
  border-radius: ${props => {
    switch (props.variant) {
      case 'rounded': return '9999px';
      case 'sharp': return '0.25rem';
      default: return '0.75rem';
    }
  }};
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  text-decoration: none;
  white-space: nowrap;
  user-select: none;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }

  &:focus-visible {
    outline: 2px solid var(--accent-purple);
    outline-offset: 2px;
  }

  /* Ripple Effect */
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
  }

  &:active::before {
    width: 300px;
    height: 300px;
  }

  ${props => props.variant === 'primary' && css`
    background: linear-gradient(135deg, var(--accent-purple), #ec4899);
    color: white;
    
    &:hover:not(:disabled) {
      background: linear-gradient(135deg, var(--accent-purple-dark), #db2777);
      transform: translateY(-2px);
      box-shadow: 0 10px 25px -5px rgba(139, 95, 191, 0.4), 0 8px 10px -6px rgba(139, 95, 191, 0.1);
    }

    &:active:not(:disabled) {
      transform: translateY(0);
    }
  `}

  ${props => props.variant === 'secondary' && css`
    background: white;
    color: var(--accent-purple);
    border-color: var(--accent-purple);
    
    &:hover:not(:disabled) {
      background: var(--accent-purple);
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 10px 25px -5px rgba(139, 95, 191, 0.4);
    }
  `}

  ${props => props.variant === 'outline' && css`
    background: transparent;
    color: var(--gray-700);
    border-color: var(--gray-300);
    
    &:hover:not(:disabled) {
      background: var(--gray-50);
      border-color: var(--gray-400);
      transform: translateY(-1px);
    }
  `}

  ${props => props.variant === 'ghost' && css`
    background: transparent;
    color: var(--gray-700);
    
    &:hover:not(:disabled) {
      background: var(--gray-100);
      color: var(--gray-900);
    }
  `}

  ${props => props.variant === 'glass' && css`
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
    
    &:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.2);
      transform: translateY(-2px);
    }
  `}

  ${props => props.isLoading && css`
    color: transparent;
    
    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 20px;
      height: 20px;
      margin: -10px 0 0 -10px;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `}

  ${props => props.fullWidth && css`
    width: 100%;
  `}
`;

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  ...props
}) => {
  return (
    <ButtonBase
      variant={variant}
      size={size}
      isLoading={isLoading}
      fullWidth={fullWidth}
      whileHover={{ scale: isLoading ? 1 : 1.02 }}
      whileTap={{ scale: isLoading ? 1 : 0.98 }}
      {...props}
    >
      {leftIcon && <span>{leftIcon}</span>}
      {children}
      {rightIcon && <span>{rightIcon}</span>}
    </ButtonBase>
  );
};

// Enhanced Card Component
const CardBase = styled(motion.div)`
  background: white;
  border-radius: 1rem;
  border: 1px solid var(--gray-200);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;

  ${props => props.variant === 'elevated' && css`
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
    
    &:hover {
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
      transform: translateY(-4px);
    }
  `}

  ${props => props.variant === 'glass' && css`
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  `}

  ${props => props.variant === 'gradient' && css`
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  `}

  ${props => props.interactive && css`
    cursor: pointer;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
    }
  `}

  ${props => props.padding && css`
    padding: ${props.padding};
  `}
`;

export const Card = ({
  children,
  variant = 'elevated',
  interactive = false,
  padding = '1.5rem',
  ...props
}) => {
  return (
    <CardBase
      variant={variant}
      interactive={interactive}
      padding={padding}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      {children}
    </CardBase>
  );
};

// Enhanced Input Component
const InputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const InputBase = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  line-height: 1.5;
  border: 2px solid var(--gray-300);
  border-radius: 0.75rem;
  background: white;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:focus {
    outline: none;
    border-color: var(--accent-purple);
    box-shadow: 0 0 0 3px rgba(139, 95, 191, 0.1);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background: var(--gray-50);
  }

  ${props => props.hasError && css`
    border-color: var(--error-500);
    
    &:focus {
      border-color: var(--error-500);
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }
  `}

  ${props => props.variant === 'filled' && css`
    background: var(--gray-50);
    border: 2px solid transparent;
    
    &:focus {
      background: white;
      border-color: var(--accent-purple);
    }
  `}

  ${props => props.variant === 'glass' && css`
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: var(--gray-900);
    
    &::placeholder {
      color: var(--gray-500);
    }
    
    &:focus {
      background: rgba(255, 255, 255, 0.2);
      border-color: var(--accent-purple);
    }
  `}
`;

const InputLabel = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--gray-700);
  margin-bottom: 0.5rem;
`;

const InputError = styled.span`
  display: block;
  font-size: 0.875rem;
  color: var(--error-500);
  margin-top: 0.5rem;
`;

const InputIcon = styled.div`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  color: var(--gray-400);
  
  ${props => props.position === 'left' && css`
    left: 0.75rem;
  `}
  
  ${props => props.position === 'right' && css`
    right: 0.75rem;
  `}
`;

export const Input = ({
  label,
  error,
  leftIcon,
  rightIcon,
  variant = 'default',
  ...props
}) => {
  return (
    <InputWrapper>
      {label && <InputLabel>{label}</InputLabel>}
      <div style={{ position: 'relative' }}>
        {leftIcon && <InputIcon position="left">{leftIcon}</InputIcon>}
        <InputBase
          variant={variant}
          hasError={!!error}
          style={{
            paddingLeft: leftIcon ? '2.5rem' : '1rem',
            paddingRight: rightIcon ? '2.5rem' : '1rem',
          }}
          {...props}
        />
        {rightIcon && <InputIcon position="right">{rightIcon}</InputIcon>}
      </div>
      {error && <InputError>{error}</InputError>}
    </InputWrapper>
  );
};

// Enhanced Avatar Component
const AvatarBase = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${props => {
    switch (props.size) {
      case 'xs': return '1.5rem';
      case 'sm': return '2rem';
      case 'lg': return '4rem';
      case 'xl': return '5rem';
      case '2xl': return '6rem';
      default: return '3rem';
    }
  }};
  height: ${props => {
    switch (props.size) {
      case 'xs': return '1.5rem';
      case 'sm': return '2rem';
      case 'lg': return '4rem';
      case 'xl': return '5rem';
      case '2xl': return '6rem';
      default: return '3rem';
    }
  }};
  border-radius: ${props => props.variant === 'square' ? '0.5rem' : '50%'};
  background: ${props => props.color || 'var(--accent-purple)'};
  color: white;
  font-weight: 600;
  font-size: ${props => {
    switch (props.size) {
      case 'xs': return '0.75rem';
      case 'sm': return '0.875rem';
      case 'lg': return '1.25rem';
      case 'xl': return '1.5rem';
      case '2xl': return '1.875rem';
      default: return '1rem';
    }
  }};
  overflow: hidden;
  border: ${props => props.bordered ? '3px solid white' : 'none'};
  box-shadow: ${props => props.bordered ? '0 0 0 1px var(--gray-200)' : 'none'};
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: ${props => props.interactive ? 'scale(1.05)' : 'none'};
  }
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: inherit;
`;

const AvatarBadge = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 25%;
  height: 25%;
  background: ${props => {
    switch (props.status) {
      case 'online': return 'var(--success-500)';
      case 'away': return 'var(--warning-500)';
      case 'busy': return 'var(--error-500)';
      default: return 'var(--gray-400)';
    }
  }};
  border: 2px solid white;
  border-radius: 50%;
`;

export const Avatar = ({
  src,
  alt,
  name,
  size = 'md',
  variant = 'circle',
  color,
  bordered = false,
  interactive = false,
  status,
  ...props
}) => {
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <AvatarBase
      size={size}
      variant={variant}
      color={color}
      bordered={bordered}
      interactive={interactive}
      {...props}
    >
      {src ? (
        <AvatarImage src={src} alt={alt || name} />
      ) : (
        getInitials(name)
      )}
      {status && <AvatarBadge status={status} />}
    </AvatarBase>
  );
};

// Enhanced Badge Component
const BadgeBase = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: ${props => {
    switch (props.size) {
      case 'sm': return '0.125rem 0.375rem';
      case 'lg': return '0.375rem 0.75rem';
      default: return '0.25rem 0.5rem';
    }
  }};
  font-size: ${props => {
    switch (props.size) {
      case 'sm': return '0.75rem';
      case 'lg': return '0.875rem';
      default: return '0.75rem';
    }
  }};
  font-weight: 600;
  line-height: 1;
  border-radius: ${props => props.variant === 'square' ? '0.25rem' : '9999px'};
  text-transform: uppercase;
  letter-spacing: 0.025em;
  white-space: nowrap;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  ${props => props.color === 'primary' && css`
    background: var(--accent-purple);
    color: white;
  `}

  ${props => props.color === 'success' && css`
    background: var(--success-500);
    color: white;
  `}

  ${props => props.color === 'warning' && css`
    background: var(--warning-500);
    color: white;
  `}

  ${props => props.color === 'error' && css`
    background: var(--error-500);
    color: white;
  `}

  ${props => props.color === 'gray' && css`
    background: var(--gray-100);
    color: var(--gray-800);
  `}

  ${props => props.variant === 'outline' && css`
    background: transparent;
    border: 1px solid currentColor;
  `}

  ${props => props.variant === 'soft' && css`
    background: ${props => {
      switch (props.color) {
        case 'primary': return 'rgba(139, 95, 191, 0.1)';
        case 'success': return 'rgba(16, 185, 129, 0.1)';
        case 'warning': return 'rgba(245, 158, 11, 0.1)';
        case 'error': return 'rgba(239, 68, 68, 0.1)';
        default: return 'rgba(107, 114, 128, 0.1)';
      }
    }};
    color: ${props => {
      switch (props.color) {
        case 'primary': return 'var(--accent-purple)';
        case 'success': return 'var(--success-600)';
        case 'warning': return 'var(--warning-600)';
        case 'error': return 'var(--error-600)';
        default: return 'var(--gray-700)';
      }
    }};
  `}

  ${props => props.pulse && css`
    animation: ${pulse} 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  `}
`;

export const Badge = ({
  children,
  color = 'gray',
  size = 'md',
  variant = 'solid',
  pulse = false,
  ...props
}) => {
  return (
    <BadgeBase
      color={color}
      size={size}
      variant={variant}
      pulse={pulse}
      {...props}
    >
      {children}
    </BadgeBase>
  );
};

// Enhanced Loading Components
export const Skeleton = styled.div`
  background: linear-gradient(90deg, var(--gray-200) 25%, var(--gray-100) 50%, var(--gray-200) 75%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
  border-radius: 0.5rem;
  
  ${props => props.variant === 'text' && css`
    height: 1rem;
    border-radius: 0.25rem;
  `}
  
  ${props => props.variant === 'circle' && css`
    border-radius: 50%;
  `}
  
  ${props => props.width && css`
    width: ${props.width};
  `}
  
  ${props => props.height && css`
    height: ${props.height};
  `}
`;

export const Spinner = styled.div`
  width: ${props => props.size || '24px'};
  height: ${props => props.size || '24px'};
  border: 2px solid var(--gray-200);
  border-top: 2px solid ${props => props.color || 'var(--accent-purple)'};
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Enhanced Modal Component
const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
`;

const ModalContent = styled(motion.div)`
  background: white;
  border-radius: 1rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  max-width: ${props => props.maxWidth || '500px'};cd
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
`;

export const Modal = ({
  children,
  isOpen,
  onClose,
  maxWidth,
  ...props
}) => {
  if (!isOpen) return null;

  return (
    <ModalOverlay
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      {...props}
    >
      <ModalContent
        maxWidth={maxWidth}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </ModalContent>
    </ModalOverlay>
  );
};

// Enhanced Toast System
const ToastContainer = styled(motion.div)`
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1100;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ToastBase = styled(motion.div)`
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--gray-200);
  padding: 1rem 1.5rem;
  min-width: 300px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  
  ${props => props.variant === 'success' && css`
    border-left: 4px solid var(--success-500);
  `}
  
  ${props => props.variant === 'error' && css`
    border-left: 4px solid var(--error-500);
  `}
  
  ${props => props.variant === 'warning' && css`
    border-left: 4px solid var(--warning-500);
  `}
  
  ${props => props.variant === 'info' && css`
    border-left: 4px solid var(--accent-purple);
  `}
`;

export const Toast = ({
  children,
  variant = 'info',
  onClose,
  ...props
}) => {
  return (
    <ToastBase
      variant={variant}
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      {...props}
    >
      {children}
      {onClose && (
        <button
          onClick={onClose}
          style={{
            marginLeft: 'auto',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--gray-400)',
          }}
        >
          ×
        </button>
      )}
    </ToastBase>
  );
};

// Named exports
export { 
  Button as ModernButton,
  Card as ModernCard, 
  Input as ModernInput,
  Avatar as ModernAvatar,
  Badge as ModernBadge,
  Skeleton as ModernSkeleton,
  Spinner as ModernSpinner,
  Modal as ModernModal,
  Toast as ModernToast
};

// Default export
const ModernComponents = {
  Button,
  Card,
  Input,
  Avatar,
  Badge,
  Skeleton,
  Spinner,
  Modal,
  Toast,
};

export default ModernComponents;
