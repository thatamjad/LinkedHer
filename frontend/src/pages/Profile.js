import React, { useState } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Paper, 
  TextField,
  Grid,
  Avatar,
  Divider,
  Alert,
  Snackbar
} from '@mui/material';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { currentUser, updateProfile } = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: currentUser?.firstName || '',
    lastName: currentUser?.lastName || '',
    bio: currentUser?.bio || ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      await updateProfile(formData);
      
      setSnackbar({
        open: true,
        message: 'Profile updated successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      
      setSnackbar({
        open: true,
        message: 'Failed to update profile',
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };
  
  // Generate avatar initials
  const getInitials = () => {
    if (!currentUser) return '?';
    return `${currentUser.firstName?.charAt(0) || ''}${currentUser.lastName?.charAt(0) || ''}`;
  };
  
  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Your Profile
        </Typography>
        
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Box display="flex" alignItems="center" mb={3}>
            <Avatar 
              sx={{ 
                width: 80, 
                height: 80, 
                bgcolor: 'primary.main',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                mr: 2
              }}
            >
              {getInitials()}
            </Avatar>
            <Box>
              <Typography variant="h5">
                {currentUser?.firstName} {currentUser?.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {currentUser?.email}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Verification Status: <strong>{currentUser?.verificationStatus || 'Unverified'}</strong>
              </Typography>
            </Box>
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  multiline
                  rows={4}
                  fullWidth
                  placeholder="Tell us about yourself..."
                  helperText={`${formData.bio.length}/500 characters`}
                  inputProps={{ maxLength: 500 }}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  sx={{ mt: 1 }}
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
        
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Account Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Email
              </Typography>
              <Typography variant="body1">
                {currentUser?.email}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Member Since
              </Typography>
              <Typography variant="body1">
                {currentUser?.createdAt 
                  ? new Date(currentUser.createdAt).toLocaleDateString() 
                  : 'N/A'}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Box>
      
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Profile; 