import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Paper,
  Divider,
  CircularProgress,
  Alert,
  Grid,
  FormHelperText,
  Switch,
  FormControlLabel
} from '@mui/material';
import { 
  Add as AddIcon,
  Check as CheckIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import axios from 'axios';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const CreateAchievement = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Will be present in edit mode
  const isEditMode = !!id;
  
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(isEditMode);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    achievedDate: new Date(),
    skills: [],
    image: '',
    impactDescription: '',
    requestVerification: true,
    evidence: {
      title: '',
      url: ''
    }
  });
  
  const [newSkill, setNewSkill] = useState('');
  
  const categories = [
    'Professional Certification',
    'Award',
    'Career Milestone',
    'Education',
    'Project Success',
    'Publication',
    'Leadership',
    'Public Speaking',
    'Community Impact',
    'Skill Development',
    'Other'
  ];
  
  useEffect(() => {
    // Fetch achievement data in edit mode
    if (isEditMode) {
      const fetchAchievement = async () => {
        try {
          setFetchingData(true);
          const response = await axios.get(`/api/achievements/${id}`);
          
          // Transform the data to fit our form structure
          const achievementData = {
            ...response.data,
            achievedDate: new Date(response.data.achievedDate),
            requestVerification: response.data.verificationStatus === 'pending'
          };
          
          setFormData(achievementData);
        } catch (err) {
          console.error('Error fetching achievement:', err);
          setError('Failed to load achievement data. Please try again later.');
          toast.error('Failed to load achievement data');
        } finally {
          setFetchingData(false);
        }
      };
      
      fetchAchievement();
    }
  }, [id, isEditMode]);
  
  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    
    if (name === 'requestVerification') {
      setFormData({
        ...formData,
        [name]: checked
      });
    } else if (name.startsWith('evidence.')) {
      const evidenceField = name.split('.')[1];
      setFormData({
        ...formData,
        evidence: {
          ...formData.evidence,
          [evidenceField]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      achievedDate: date
    });
  };
  
  const handleAddSkill = () => {
    if (!newSkill.trim()) {
      toast.error('Please enter a skill');
      return;
    }
    
    if (formData.skills.includes(newSkill.trim())) {
      toast.error('This skill has already been added');
      return;
    }
    
    setFormData({
      ...formData,
      skills: [...formData.skills, newSkill.trim()]
    });
    
    setNewSkill('');
  };
  
  const handleRemoveSkill = (skill) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(s => s !== skill)
    });
  };
  
  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error('Please enter a title for your achievement');
      return false;
    }
    
    if (!formData.description.trim()) {
      toast.error('Please enter a description');
      return false;
    }
    
    if (!formData.category) {
      toast.error('Please select a category');
      return false;
    }
    
    if (formData.requestVerification && 
        (!formData.evidence.title.trim() || !formData.evidence.url.trim())) {
      toast.error('Please provide evidence details for verification');
      return false;
    }
    
    if (formData.evidence.url && !isValidUrl(formData.evidence.url)) {
      toast.error('Please enter a valid URL for evidence');
      return false;
    }
    
    if (formData.image && !isValidUrl(formData.image)) {
      toast.error('Please enter a valid URL for the image');
      return false;
    }
    
    return true;
  };
  
  const isValidUrl = (urlString) => {
    try {
      new URL(urlString);
      return true;
    } catch (err) {
      return false;
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const achievementData = {
        ...formData,
        verificationStatus: formData.requestVerification ? 'pending' : 'unverified'
      };
      
      // Remove unnecessary field
      delete achievementData.requestVerification;
      
      let response;
      
      if (isEditMode) {
        response = await axios.put(`/api/achievements/${id}`, achievementData);
        toast.success('Achievement updated successfully!');
      } else {
        response = await axios.post('/api/achievements', achievementData);
        toast.success('Achievement created successfully!');
      }
      
      navigate(`/achievements/${response.data._id}`);
    } catch (err) {
      console.error('Error saving achievement:', err);
      setError(err.response?.data?.message || 'Failed to save achievement. Please try again.');
      toast.error('Failed to save achievement');
    } finally {
      setLoading(false);
    }
  };
  
  if (fetchingData) {
    return (
      <Container maxWidth="md">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="md">
        <Box py={4}>
          <Box display="flex" alignItems="center" mb={4}>
            <Button 
              variant="outlined" 
              color="primary" 
              onClick={() => navigate('/achievements')}
              sx={{ mr: 2 }}
            >
              Back
            </Button>
            <Typography variant="h4" component="h1" fontWeight="bold">
              {isEditMode ? 'Edit Achievement' : 'Add New Achievement'}
            </Typography>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <Paper elevation={3} sx={{ p: 3 }}>
            <form onSubmit={handleSubmit}>
              <TextField
                label="Achievement Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
                helperText="Give your achievement a clear, descriptive title"
              />
              
              <TextField
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                fullWidth
                required
                multiline
                rows={4}
                margin="normal"
                helperText="Describe your achievement and what it means to you"
              />
              
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel id="category-label">Category</InputLabel>
                    <Select
                      labelId="category-label"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      label="Category"
                    >
                      {categories.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>Select the category that best fits your achievement</FormHelperText>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Achievement Date"
                    value={formData.achievedDate}
                    onChange={handleDateChange}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        fullWidth 
                        required 
                        helperText="When did you achieve this milestone?" 
                      />
                    )}
                    maxDate={new Date()}
                  />
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="h6" gutterBottom>
                Skills Demonstrated
              </Typography>
              
              <Box mb={3}>
                {formData.skills.length > 0 ? (
                  <Box display="flex" flexWrap="wrap" gap={1} mb={3}>
                    {formData.skills.map((skill, index) => (
                      <Chip
                        key={index}
                        label={skill}
                        onDelete={() => handleRemoveSkill(skill)}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    No skills added yet
                  </Typography>
                )}
                
                <Box display="flex" gap={2} alignItems="center">
                  <TextField
                    label="Add Skill"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    sx={{ flexGrow: 1 }}
                    placeholder="e.g., Leadership, Project Management, Public Speaking"
                  />
                  <Button 
                    variant="outlined" 
                    onClick={handleAddSkill}
                    sx={{ height: 56 }}
                    startIcon={<AddIcon />}
                  >
                    Add
                  </Button>
                </Box>
                <FormHelperText>
                  Add skills that you demonstrated through this achievement
                </FormHelperText>
              </Box>
              
              <Divider sx={{ my: 3 }} />
              
              <TextField
                label="Image URL (Optional)"
                name="image"
                value={formData.image}
                onChange={handleChange}
                fullWidth
                margin="normal"
                helperText="Add a URL to an image that showcases your achievement"
              />
              
              <TextField
                label="Impact Description (Optional)"
                name="impactDescription"
                value={formData.impactDescription}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
                margin="normal"
                helperText="Describe the impact of this achievement on your career, organization, or community"
              />
              
              <Divider sx={{ my: 3 }} />
              
              <Box mb={3}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Typography variant="h6" gutterBottom>
                    Verification & Evidence
                  </Typography>
                  <InfoIcon color="action" sx={{ ml: 1 }} />
                </Box>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.requestVerification}
                      onChange={handleChange}
                      name="requestVerification"
                      color="primary"
                    />
                  }
                  label="Request verification for this achievement"
                />
                
                <Alert severity="info" sx={{ mt: 1, mb: 3 }}>
                  Verified achievements receive a special badge and are more credible to viewers of your profile. You'll need to provide evidence to support your achievement.
                </Alert>
                
                {formData.requestVerification && (
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Evidence Title"
                        name="evidence.title"
                        value={formData.evidence.title}
                        onChange={handleChange}
                        fullWidth
                        required={formData.requestVerification}
                        placeholder="e.g., 'Certificate', 'Award Letter', 'Project Link'"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Evidence URL"
                        name="evidence.url"
                        value={formData.evidence.url}
                        onChange={handleChange}
                        fullWidth
                        required={formData.requestVerification}
                        placeholder="https://example.com/my-certificate"
                        helperText="Link to a document, image, or website that verifies your achievement"
                      />
                    </Grid>
                  </Grid>
                )}
              </Box>
              
              <Divider sx={{ my: 3 }} />
              
              <Box display="flex" justifyContent="flex-end">
                <Button 
                  type="button" 
                  variant="outlined" 
                  color="inherit" 
                  onClick={() => navigate('/achievements')}
                  sx={{ mr: 2 }}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={24} /> : <CheckIcon />}
                >
                  {loading ? 'Saving...' : isEditMode ? 'Update Achievement' : 'Create Achievement'}
                </Button>
              </Box>
            </form>
          </Paper>
        </Box>
      </Container>
    </LocalizationProvider>
  );
};

export default CreateAchievement;

