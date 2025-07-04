import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, Grid, Paper, Avatar, Container } from '@mui/material';
import { useAuth } from '../context/AuthContext';

const EditProfile = () => {
  const { currentUser, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    company: '',
    bio: '',
    location: '',
    skills: '',
    profileImageUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        title: currentUser.title || '',
        company: currentUser.company || '',
        bio: currentUser.bio || '',
        location: currentUser.location || '',
        skills: currentUser.skills ? currentUser.skills.join(', ') : '',
        profileImageUrl: currentUser.profileImageUrl || ''
      });
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const updatedData = {
        ...formData,
        skills: formData.skills.split(',').map(skill => skill.trim()).filter(Boolean)
      };
      
      await updateUserProfile(updatedData);
      navigate('/profile');
    } catch (err) {
      setError('Failed to update profile. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Edit Profile
        </Typography>
        
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} display="flex" justifyContent="center">
              <Avatar
                src={formData.profileImageUrl}
                alt={formData.name}
                sx={{ width: 100, height: 100 }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Profile Image URL"
                name="profileImageUrl"
                value={formData.profileImageUrl}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                fullWidth
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
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Skills (comma separated)"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                fullWidth
                helperText="Enter skills separated by commas"
              />
            </Grid>
            
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/profile')}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default EditProfile; 