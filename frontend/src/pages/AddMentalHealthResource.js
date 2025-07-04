import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Container,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
} from '@mui/material';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const AddMentalHealthResource = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    imageUrl: '',
    categories: [],
    resourceType: '',
    costType: '',
  });
  const [currentCategory, setCurrentCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const resourceTypes = [
    'Article',
    'Video',
    'Podcast',
    'Book',
    'App',
    'Website',
    'Course',
    'Community',
    'Tool',
    'Service',
  ];

  const costTypes = [
    'Free',
    'Freemium',
    'Paid',
    'Subscription',
    'One-time purchase',
  ];

  const suggestedCategories = [
    'Stress Management',
    'Anxiety',
    'Depression',
    'Burnout',
    'Work-Life Balance',
    'Career Development',
    'Leadership',
    'Imposter Syndrome',
    'Workplace Relationships',
    'Discrimination',
    'Harassment',
    'Self-care',
    'Mindfulness',
    'Meditation',
    'Physical Health',
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addCategory = () => {
    if (currentCategory.trim() && !formData.categories.includes(currentCategory.trim())) {
      setFormData((prev) => ({
        ...prev,
        categories: [...prev.categories, currentCategory.trim()],
      }));
      setCurrentCategory('');
    }
  };

  const removeCategory = (categoryToRemove) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.filter((category) => category !== categoryToRemove),
    }));
  };

  const addSuggestedCategory = (category) => {
    if (!formData.categories.includes(category)) {
      setFormData((prev) => ({
        ...prev,
        categories: [...prev.categories, category],
      }));
    }
  };

  const handleCategoryKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCategory();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (formData.categories.length === 0) {
      setError('Please add at least one category');
      setLoading(false);
      return;
    }

    try {
      // This is a placeholder for an actual API call
      const response = await fetch('/api/mental-health-resources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          creatorId: currentUser.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add resource');
      }

      const createdResource = await response.json();
      toast.success('Resource added successfully!');
      navigate(`/mental-health/resources/${createdResource.id}`);
    } catch (err) {
      console.error('Error adding resource:', err);
      setError('Failed to add resource. Please try again.');
      toast.error('Failed to add resource');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Add Mental Health Resource
        </Typography>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="Resource Title"
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
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                multiline
                rows={6}
                fullWidth
                variant="outlined"
                helperText="Describe what this resource offers and how it can help others"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Resource URL"
                name="url"
                value={formData.url}
                onChange={handleChange}
                required
                fullWidth
                variant="outlined"
                helperText="Link to the resource (website, article, video, etc.)"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Image URL (Optional)"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                helperText="URL for an image to represent this resource"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Resource Type</InputLabel>
                <Select
                  name="resourceType"
                  value={formData.resourceType}
                  onChange={handleChange}
                  label="Resource Type"
                >
                  {resourceTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Cost Type</InputLabel>
                <Select
                  name="costType"
                  value={formData.costType}
                  onChange={handleChange}
                  label="Cost Type"
                >
                  {costTypes.map((cost) => (
                    <MenuItem key={cost} value={cost}>
                      {cost}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Categories
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                <TextField
                  label="Add Category"
                  value={currentCategory}
                  onChange={(e) => setCurrentCategory(e.target.value)}
                  onKeyDown={handleCategoryKeyDown}
                  variant="outlined"
                  fullWidth
                  sx={{ mr: 1 }}
                />
                <Button
                  onClick={addCategory}
                  variant="contained"
                  disabled={!currentCategory.trim()}
                >
                  Add
                </Button>
              </Box>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {formData.categories.map((category) => (
                  <Chip
                    key={category}
                    label={category}
                    onDelete={() => removeCategory(category)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>

              <Typography variant="subtitle2" gutterBottom>
                Suggested Categories:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {suggestedCategories
                  .filter((category) => !formData.categories.includes(category))
                  .map((category) => (
                    <Chip
                      key={category}
                      label={category}
                      onClick={() => addSuggestedCategory(category)}
                      variant="outlined"
                      size="small"
                      sx={{ cursor: 'pointer' }}
                    />
                  ))}
              </Box>
            </Grid>

            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button variant="outlined" onClick={() => navigate('/mental-health/resources')}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={
                  loading ||
                  !formData.title ||
                  !formData.description ||
                  !formData.url ||
                  !formData.resourceType ||
                  !formData.costType ||
                  formData.categories.length === 0
                }
              >
                {loading ? <CircularProgress size={24} /> : 'Add Resource'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default AddMentalHealthResource;

