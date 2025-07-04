import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Breadcrumbs, Link, useTheme } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Home as HomeIcon, Work as WorkIcon } from '@mui/icons-material';
import JobBoard from '../components/jobs/JobBoard';
import { useAuth } from '../context/AuthContext';
import { useMode } from '../context/ModeContext';
import jobService from '../services/jobService';

const JobBoardPage = () => {
  const theme = useTheme();
  const { user, isAuthenticated } = useAuth();
  const { mode } = useMode();
  
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Fetch job recommendations if user is authenticated
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (isAuthenticated && user) {
        try {
          setLoading(true);
          const data = await jobService.getRecommendations(3);
          setRecommendations(data.recommendations || []);
        } catch (error) {
          console.error('Error fetching job recommendations:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchRecommendations();
  }, [isAuthenticated, user]);
  
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs 
        aria-label="breadcrumb" 
        sx={{ mb: 3 }}
        separator="›"
      >
        <Link
          component={RouterLink}
          to="/"
          underline="hover"
          sx={{ display: 'flex', alignItems: 'center' }}
          color="inherit"
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Home
        </Link>
        <Typography
          sx={{ display: 'flex', alignItems: 'center' }}
          color="text.primary"
        >
          <WorkIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Job Board
        </Typography>
      </Breadcrumbs>
      
      {/* Page Title */}
      <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <Typography 
          variant="h4" 
          component="h1" 
          fontWeight="bold"
          color={mode === 'professional' ? 'primary.main' : 'secondary.main'}
        >
          Find Your Perfect Role
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" mt={1}>
          Browse jobs tailored for women in professional careers
        </Typography>
      </Box>
      
      {/* Personalized Recommendations */}
      {isAuthenticated && recommendations.length > 0 && (
        <Box 
          sx={{ 
            mb: 4, 
            p: 3, 
            borderRadius: 2,
            bgcolor: mode === 'professional' ? 'primary.light' : 'secondary.light',
            color: mode === 'professional' ? 'primary.contrastText' : 'secondary.contrastText'
          }}
        >
          <Typography variant="h6" fontWeight="bold" mb={2}>
            Recommended For You
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {recommendations.map(job => (
              <Link
                key={job._id}
                component={RouterLink}
                to={`/jobs/${job._id}`}
                underline="hover"
                sx={{ 
                  color: mode === 'professional' ? 'primary.dark' : 'secondary.dark',
                  fontWeight: 500
                }}
              >
                {job.title} at {job.company}
              </Link>
            ))}
          </Box>
        </Box>
      )}
      
      {/* Main Job Board Component */}
      <JobBoard />
    </Container>
  );
};

export default JobBoardPage; 