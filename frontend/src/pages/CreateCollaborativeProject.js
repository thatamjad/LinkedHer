import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  IconButton,
  Grid,
  FormHelperText
} from '@mui/material';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon,
  Link as LinkIcon
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import axios from 'axios';
import { toast } from 'react-toastify';
import { addDays } from 'date-fns';

const CreateCollaborativeProject = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    deadline: addDays(new Date(), 30),
    requiredSkills: [],
    links: []
  });
  
  const [newSkill, setNewSkill] = useState('');
  const [newLink, setNewLink] = useState({
    title: '',
    url: ''
  });
  
  const categories = [
    'Technology',
    'Business',
    'Design',
    'Marketing',
    'Writing',
    'Research',
    'Education',
    'Social Impact',
    'Healthcare',
    'Arts & Culture',
    'Environment',
    'Other'
  ];
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      deadline: date
    });
  };
  
  const handleAddSkill = () => {
    if (!newSkill.trim()) {
      toast.error('Please enter a skill');
      return;
    }
    
    if (formData.requiredSkills.includes(newSkill.trim())) {
      toast.error('This skill has already been added');
      return;
    }
    
    setFormData({
      ...formData,
      requiredSkills: [...formData.requiredSkills, newSkill.trim()]
    });
    
    setNewSkill('');
  };
  
  const handleRemoveSkill = (skill) => {
    setFormData({
      ...formData,
      requiredSkills: formData.requiredSkills.filter(s => s !== skill)
    });
  };
  
  const handleLinkChange = (e) => {
    const { name, value } = e.target;
    setNewLink({
      ...newLink,
      [name]: value
    });
  };
  
  const handleAddLink = () => {
    if (!newLink.title.trim() || !newLink.url.trim()) {
      toast.error('Please provide both title and URL for the link');
      return;
    }
    
    // Basic URL validation
    try {
      new URL(newLink.url);
    } catch (err) {
      toast.error('Please enter a valid URL');
      return;
    }
    
    setFormData({
      ...formData,
      links: [...formData.links, newLink]
    });
    
    setNewLink({
      title: '',
      url: ''
    });
  };
  
  const handleRemoveLink = (index) => {
    const updatedLinks = [...formData.links];
    updatedLinks.splice(index, 1);
    
    setFormData({
      ...formData,
      links: updatedLinks
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim() || !formData.description.trim() || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (formData.requiredSkills.length === 0) {
      toast.error('Please add at least one required skill');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('/api/collaborative-projects', formData);
      toast.success('Collaborative project created successfully!');
      navigate(`/collaborative-projects/${response.data._id}`);
    } catch (err) {
      console.error('Error creating collaborative project:', err);
      setError(err.response?.data?.message || 'Failed to create project. Please try again.');
      toast.error('Failed to create collaborative project');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="md">
        <Box py={4}>
          <Box display="flex" alignItems="center" mb={4}>
            <Button 
              variant="outlined" 
              color="primary" 
              onClick={() => navigate('/collaborative-projects')}
              sx={{ mr: 2 }}
            >
              Back
            </Button>
            <Typography variant="h4" component="h1" fontWeight="bold">
              Create Collaborative Project
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
                label="Project Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
                helperText="Give your project a clear, descriptive title"
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
                helperText="Describe your project, its goals, and what you're looking to achieve"
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
                    <FormHelperText>Select the category that best fits your project</FormHelperText>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Project Deadline"
                    value={formData.deadline}
                    onChange={handleDateChange}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        fullWidth 
                        required 
                        helperText="When do you aim to complete this project?" 
                      />
                    )}
                    minDate={addDays(new Date(), 1)}
                  />
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="h6" gutterBottom>
                Required Skills
              </Typography>
              
              <Box mb={3}>
                {formData.requiredSkills.length > 0 ? (
                  <Box display="flex" flexWrap="wrap" gap={1} mb={3}>
                    {formData.requiredSkills.map((skill, index) => (
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
                    label="Add Required Skill"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    sx={{ flexGrow: 1 }}
                    placeholder="e.g., Web Development, Graphic Design, Content Writing"
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
                  Add skills that team members should have to contribute to this project
                </FormHelperText>
              </Box>
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="h6" gutterBottom>
                Project Links
              </Typography>
              
              <Box mb={3}>
                {formData.links.length > 0 ? (
                  <Grid container spacing={2} mb={3}>
                    {formData.links.map((link, index) => (
                      <Grid item xs={12} key={index}>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                            <Box display="flex" alignItems="center">
                              <LinkIcon color="primary" sx={{ mr: 1 }} />
                              <Box>
                                <Typography variant="subtitle1" fontWeight="bold">
                                  {link.title}
                                </Typography>
                                <Typography variant="body2" component="a" href={link.url} target="_blank" rel="noopener noreferrer" sx={{ color: 'primary.main' }}>
                                  {link.url}
                                </Typography>
                              </Box>
                            </Box>
                            <IconButton onClick={() => handleRemoveLink(index)} color="error" size="small">
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    No links added yet
                  </Typography>
                )}
                
                <Grid container spacing={2} alignItems="flex-start">
                  <Grid item xs={12} sm={5}>
                    <TextField
                      label="Link Title"
                      name="title"
                      value={newLink.title}
                      onChange={handleLinkChange}
                      fullWidth
                      placeholder="e.g., 'Project Repository', 'Design Mockups'"
                    />
                  </Grid>
                  <Grid item xs={12} sm={5}>
                    <TextField
                      label="URL"
                      name="url"
                      value={newLink.url}
                      onChange={handleLinkChange}
                      fullWidth
                      placeholder="https://example.com"
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <Button 
                      variant="outlined" 
                      onClick={handleAddLink}
                      fullWidth
                      sx={{ height: 56 }}
                      startIcon={<AddIcon />}
                    >
                      Add
                    </Button>
                  </Grid>
                </Grid>
                <FormHelperText>
                  Add relevant links such as repositories, documents, or resources
                </FormHelperText>
              </Box>
              
              <Divider sx={{ my: 3 }} />
              
              <Box display="flex" justifyContent="flex-end">
                <Button 
                  type="button" 
                  variant="outlined" 
                  color="inherit" 
                  onClick={() => navigate('/collaborative-projects')}
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
                >
                  {loading ? <CircularProgress size={24} /> : 'Create Project'}
                </Button>
              </Box>
            </form>
          </Paper>
        </Box>
      </Container>
    </LocalizationProvider>
  );
};

export default CreateCollaborativeProject;
