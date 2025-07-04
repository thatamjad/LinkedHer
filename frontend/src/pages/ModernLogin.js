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
  useTheme
} from '@mui/material';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Shield } from 'lucide-react';
import { ModernButton, ModernInput, ModernCard } from '../components/ui/ModernComponents';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { login, error, setError } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (error) setError(null);
  };
    const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      const success = await login(formData.email, formData.password);
      if (success) {
        navigate('/');
      }
    } catch (err) {
      // The error is already set in AuthContext, just log for debugging
      console.error('Login error:', err);
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
      className="min-h-screen bg-gradient-cool flex items-center justify-center p-4"
      sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
          pointerEvents: 'none'
        }
      }}
    >
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        style={{ width: '100%', maxWidth: '400px', position: 'relative', zIndex: 1 }}
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
                <Shield size={28} color="white" />
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
                Welcome Back
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Sign in to your Linker account
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
            <Box component="form" onSubmit={handleSubmit} className="space-y-6">
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
                placeholder="Enter your password"
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
                  fontWeight: 'bold',
                  borderRadius: 'var(--radius-lg)'
                }}
              >
                Sign In
              </ModernButton>
            </Box>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Divider sx={{ my: 3, color: 'text.secondary' }}>
              <Typography variant="caption" sx={{ px: 1 }}>
                New to Linker?
              </Typography>
            </Divider>

            <ModernButton
              variant="secondary"
              size="large"
              fullWidth
              onClick={() => navigate('/register')}
              sx={{
                height: 48,
                fontSize: '1rem',
                borderRadius: 'var(--radius-lg)'
              }}
            >
              Create an Account
            </ModernButton>
          </motion.div>

        </ModernCard>

        {/* Floating background elements */}
        <motion.div
          className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-primary rounded-full opacity-20"
          animate={{
            y: [0, -10, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          sx={{
            background: 'linear-gradient(135deg, var(--accent-purple), var(--primary-500))',
          }}
        />
        <motion.div
          className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-secondary rounded-full opacity-20"
          animate={{
            y: [0, 10, 0],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 15,
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

export default Login;
