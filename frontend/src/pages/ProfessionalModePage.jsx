import React from 'react';
import { Container, Box, Typography, Paper, Grid, Divider } from '@mui/material';
import ProfessionalFeed from '../components/posts/ProfessionalFeed';
import { useAuth } from '../context/AuthContext';

const ProfessionalModePage = () => {
  const { currentUser, isVerified } = useAuth();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Grid container spacing={3}>
        {/* Main content */}
        <Grid item xs={12} md={8}>
          <Paper 
            elevation={3} 
            sx={{ p: 3, borderRadius: 2 }}
          >
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
              Professional Network
            </Typography>
            
            {!isVerified() && (
              <Box 
                sx={{ 
                  mb: 3, 
                  p: 2, 
                  backgroundColor: 'warning.light', 
                  borderRadius: 1 
                }}
              >
                <Typography variant="body1">
                  Your account requires verification to access all professional features. 
                  Please complete verification to ensure full access.
                </Typography>
              </Box>
            )}
            
            <ProfessionalFeed />
          </Paper>
        </Grid>
        
        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={3} 
            sx={{ p: 3, mb: 3, borderRadius: 2 }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>
              Your Professional Profile
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box 
                component="img"
                src={currentUser?.profilePicture || '/default-profile.png'}
                alt={currentUser?.firstName}
                sx={{ 
                  width: 60, 
                  height: 60, 
                  borderRadius: '50%', 
                  mr: 2,
                  objectFit: 'cover'
                }}
              />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  {currentUser?.firstName} {currentUser?.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {currentUser?.headline || 'Add your professional headline'}
                </Typography>
              </Box>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="body2" sx={{ mb: 1 }}>
              Profile completion: {calculateProfileCompletion(currentUser)}%
            </Typography>
            
            <Box
              sx={{
                height: 8,
                width: '100%',
                bgcolor: 'grey.300',
                borderRadius: 5,
                mb: 2
              }}
            >
              <Box
                sx={{
                  height: '100%',
                  width: `${calculateProfileCompletion(currentUser)}%`,
                  bgcolor: 'primary.main',
                  borderRadius: 5
                }}
              />
            </Box>
            
            <Typography 
              variant="body2" 
              color="primary" 
              sx={{ cursor: 'pointer' }}
            >
              Complete your profile →
            </Typography>
          </Paper>
          
          <Paper 
            elevation={3} 
            sx={{ p: 3, borderRadius: 2 }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>
              Community Guidelines
            </Typography>
            
            <Typography variant="body2" paragraph>
              Our professional community thrives on respect, integrity, and constructive engagement.
            </Typography>
            
            <Typography variant="body2" paragraph>
              All content posted in professional mode is linked to your verified identity. 
              Please ensure your contributions maintain professional standards.
            </Typography>
            
            <Typography 
              variant="body2" 
              color="primary" 
              sx={{ cursor: 'pointer' }}
            >
              Read full guidelines →
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

// Helper function to calculate profile completion percentage
const calculateProfileCompletion = (user) => {
  if (!user) return 0;
  
  const fields = [
    !!user.firstName,
    !!user.lastName,
    !!user.profilePicture,
    !!user.headline,
    !!user.professionalSummary,
    user.skills && user.skills.length > 0,
    user.experience && user.experience.length > 0,
    user.education && user.education.length > 0
  ];
  
  const completedFields = fields.filter(field => field).length;
  return Math.round((completedFields / fields.length) * 100);
};

export default ProfessionalModePage; 