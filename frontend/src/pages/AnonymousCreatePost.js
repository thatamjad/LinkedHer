import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  CircularProgress,
  Alert,
  FormControlLabel,
  Switch,
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { useAuth } from '../context/AuthContext';
import { useAnonymous } from '../context/AnonymousContext';

const AnonymousCreatePost = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { activePersona, getPersonaList } = useAnonymous();
  const [personas, setPersonas] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: [],
    imageFile: null,
    imagePreviewUrl: '',
    personaId: '',
    useActivePersona: true,
  });
  const [currentTag, setCurrentTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPersonas = async () => {
      try {
        const personaList = await getPersonaList();
        setPersonas(personaList);
        
        // Set active persona as default if available
        if (activePersona && formData.useActivePersona) {
          setFormData(prev => ({ ...prev, personaId: activePersona.id }));
        }
      } catch (err) {
        console.error('Error loading personas:', err);
        setError('Failed to load personas. Please try again.');
      }
    };

    loadPersonas();
  }, [getPersonaList, activePersona]);

  const categories = [
    'Career Challenges',
    'Workplace Issues',
    'Discrimination',
    'Harassment',
    'Mental Health',
    'Work-Life Balance',
    'Salary Negotiation',
    'Difficult Managers',
    'Job Search Struggles',
    'General Discussion',
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSwitchChange = (e) => {
    const { checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      useActivePersona: checked,
      personaId: checked && activePersona ? activePersona.id : '',
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Create a preview URL for the image
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        imageFile: file,
        imagePreviewUrl: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()],
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.personaId) {
      setError('Please select a persona or create one before posting.');
      setLoading(false);
      return;
    }

    try {
      // Create form data for multipart/form-data submission
      const postData = new FormData();
      postData.append('title', formData.title);
      postData.append('content', formData.content);
      postData.append('category', formData.category);
      postData.append('tags', JSON.stringify(formData.tags));
      postData.append('personaId', formData.personaId);
      
      if (formData.imageFile) {
        postData.append('image', formData.imageFile);
      }

      // This is a placeholder for an actual API call
      const response = await fetch('/api/anonymous/posts', {
        method: 'POST',
        body: postData,
      });

      if (!response.ok) {
        throw new Error('Failed to create anonymous post');
      }

      const createdPost = await response.json();
      navigate(`/anonymous/post/${createdPost.id}`);
    } catch (err) {
      console.error('Error creating anonymous post:', err);
      setError('Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Create Anonymous Post
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          Your post will be published anonymously using your selected persona. Your real identity will be protected.
        </Alert>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.useActivePersona}
                    onChange={handleSwitchChange}
                    name="useActivePersona"
                    color="primary"
                  />
                }
                label="Use active persona"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth disabled={formData.useActivePersona}>
                <InputLabel>Select Persona</InputLabel>
                <Select
                  name="personaId"
                  value={formData.personaId}
                  onChange={handleChange}
                  label="Select Persona"
                  disabled={formData.useActivePersona}
                >
                  {personas.map((persona) => (
                    <MenuItem key={persona.id} value={persona.id}>
                      {persona.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {!personas.length && (
                <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                  You need to create a persona first. Go to Anonymous Personas page.
                </Typography>
              )}
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                fullWidth
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                required
                multiline
                rows={8}
                fullWidth
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  label="Category"
                  required
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <TextField
                  label="Add Tags"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  variant="outlined"
                  fullWidth
                  sx={{ mr: 1 }}
                />
                <Button
                  onClick={addTag}
                  variant="contained"
                  disabled={!currentTag.trim()}
                >
                  Add
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {formData.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => removeTag(tag)}
                    color="primary"
                    variant="outlined"
                    size="small"
                  />
                ))}
              </Box>
            </Grid>

            <Grid item xs={12}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="image-upload"
                type="file"
                onChange={handleImageChange}
              />
              <label htmlFor="image-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<PhotoCamera />}
                >
                  Upload Image
                </Button>
              </label>
            </Grid>

            {formData.imagePreviewUrl && (
              <Grid item xs={12}>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Image Preview:
                  </Typography>
                  <img
                    src={formData.imagePreviewUrl}
                    alt="Preview"
                    style={{
                      maxWidth: '100%',
                      maxHeight: 200,
                      objectFit: 'contain',
                      borderRadius: 4,
                    }}
                  />
                </Box>
              </Grid>
            )}

            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button variant="outlined" onClick={() => navigate('/anonymous')}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading || !formData.title || !formData.content || !formData.category || !formData.personaId}
              >
                {loading ? <CircularProgress size={24} /> : 'Publish Anonymous Post'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default AnonymousCreatePost; 