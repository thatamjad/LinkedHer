import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Box, 
  Typography, 
  Alert,
  InputAdornment,
  IconButton,
  Divider,
  useTheme,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { Eye, EyeOff, Mail, Lock, ArrowRight, UserPlus, User } from 'lucide-react';
import { ModernButton, ModernInput, ModernCard } from '../components/ui/ModernComponents';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { register, error, setError } = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (error) setError(null);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!acceptTerms) {
      setError('Please accept the terms and conditions');
      return;
    }
    
    try {
      setIsSubmitting(true);
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password
      });
      navigate('/');
    } catch (err) {
      console.error('Registration error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <Box 
      className="min-h-screen bg-gradient-royal flex items-center justify-center p-4"
      sx={{
        background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 30% 70%, rgba(168, 237, 234, 0.3) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(254, 214, 227, 0.3) 0%, transparent 50%)',
          pointerEvents: 'none'
        }
      }}
    >
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        style={{ width: '100%', maxWidth: '480px', position: 'relative', zIndex: 1 }}
      >
        <ModernCard 
          className="glass p-8"
          sx={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}
        >
          <motion.div variants={itemVariants}>
            <Box className="text-center mb-8">
              <Box 
                className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-primary flex items-center justify-center"
                sx={{
                  background: 'linear-gradient(135deg, var(--accent-purple), var(--primary-500))',
                  width: 64,
                  height: 64,
                  margin: '0 auto 16px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <UserPlus size={28} color="white" />
              </Box>
              <Typography 
                variant="h4" 
                className="font-display text-gradient font-bold mb-2"
                sx={{ 
                  background: 'linear-gradient(135deg, var(--accent-purple), var(--primary-500))',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Join Linker
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Create your professional account
              </Typography>
            </Box>
          </motion.div>

          {error && (
            <motion.div variants={itemVariants}>
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3,
                  borderRadius: 'var(--radius-lg)',
                  '& .MuiAlert-icon': {
                    fontSize: '1.2rem'
                  }
                }}
              >
                {error}
              </Alert>
            </motion.div>
          )}

          <motion.div variants={itemVariants}>
            <Box component="form" onSubmit={handleSubmit} className="space-y-4">
              <Box className="grid grid-cols-2 gap-4">
                <ModernInput
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  placeholder="First name"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <User size={20} color={theme.palette.text.secondary} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 'var(--radius-lg)',
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      },
                      '&.Mui-focused': {
                        backgroundColor: 'white',
                        boxShadow: '0 0 0 3px rgba(139, 95, 191, 0.1)',
                      }
                    }
                  }}
                />

                <ModernInput
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  placeholder="Last name"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 'var(--radius-lg)',
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      },
                      '&.Mui-focused': {
                        backgroundColor: 'white',
                        boxShadow: '0 0 0 3px rgba(139, 95, 191, 0.1)',
                      }
                    }
                  }}
                />
              </Box>

              <ModernInput
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                fullWidth
                placeholder="Enter your email"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Mail size={20} color={theme.palette.text.secondary} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'white',
                      boxShadow: '0 0 0 3px rgba(139, 95, 191, 0.1)',
                    }
                  }
                }}
              />

              <ModernInput
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                required
                fullWidth
                placeholder="Create a password"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock size={20} color={theme.palette.text.secondary} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'white',
                      boxShadow: '0 0 0 3px rgba(139, 95, 191, 0.1)',
                    }
                  }
                }}
              />

              <ModernInput
                label="Confirm Password"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                fullWidth
                placeholder="Confirm your password"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock size={20} color={theme.palette.text.secondary} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                        size="small"
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'white',
                      boxShadow: '0 0 0 3px rgba(139, 95, 191, 0.1)',
                    }
                  }
                }}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    sx={{
                      color: 'var(--accent-purple)',
                      '&.Mui-checked': {
                        color: 'var(--accent-purple)',
                      },
                    }}
                  />
                }
                label={
                  <Typography variant="body2" color="text.secondary">
                    I accept the{' '}
                    <Link 
                      to="/terms" 
                      style={{ 
                        color: 'var(--accent-purple)',
                        textDecoration: 'none',
                        fontWeight: 500
                      }}
                    >
                      Terms & Conditions
                    </Link>
                    {' '}and{' '}
                    <Link 
                      to="/privacy" 
                      style={{ 
                        color: 'var(--accent-purple)',
                        textDecoration: 'none',
                        fontWeight: 500
                      }}
                    >
                      Privacy Policy
                    </Link>
                  </Typography>
                }
              />

              <ModernButton
                type="submit"
                variant="primary"
                size="large"
                fullWidth
                loading={isSubmitting}
                endIcon={<ArrowRight size={20} />}
                className="mt-6"
                sx={{
                  height: 48,
                  fontSize: '1rem',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-lg)',
                  background: 'linear-gradient(135deg, var(--accent-purple), var(--primary-500))',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: '0 10px 25px rgba(139, 95, 191, 0.3)',
                  }
                }}
              >
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </ModernButton>
            </Box>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                or
              </Typography>
            </Divider>

            <Box className="text-center space-y-4">
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  style={{ 
                    color: 'var(--accent-purple)',
                    textDecoration: 'none',
                    fontWeight: 600,
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = 'var(--primary-500)';
                    e.target.style.textDecoration = 'underline';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = 'var(--accent-purple)';
                    e.target.style.textDecoration = 'none';
                  }}
                >
                  Sign in here
                </Link>
              </Typography>

              <Typography variant="body2" color="text.secondary">
                <Link 
                  to="/home" 
                  style={{ 
                    color: 'var(--accent-purple)',
                    textDecoration: 'none',
                    fontWeight: 500,
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = 'var(--primary-500)';
                    e.target.style.textDecoration = 'underline';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = 'var(--accent-purple)';
                    e.target.style.textDecoration = 'none';
                  }}
                >
                  Back to Home
                </Link>
              </Typography>
            </Box>
          </motion.div>
        </ModernCard>

        {/* Floating background elements */}
        <motion.div
          className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-primary rounded-full opacity-10"
          animate={{
            y: [0, -15, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          sx={{
            background: 'linear-gradient(135deg, var(--accent-purple), var(--primary-500))',
          }}
        />
        <motion.div
          className="absolute -bottom-6 -left-6 w-20 h-20 bg-gradient-secondary rounded-full opacity-10"
          animate={{
            y: [0, 15, 0],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "linear"
          }}
          sx={{
            background: 'linear-gradient(135deg, var(--accent-pink), var(--secondary-100))',
          }}
        />
      </motion.div>
    </Box>
  );
};

export default Register;
