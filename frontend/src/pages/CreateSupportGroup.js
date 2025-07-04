import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Chip,
  Paper,
  Container,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const CreateSupportGroup = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    tags: [],
    isPrivate: false,
  });
  const [currentTag, setCurrentTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const categories = [
    'Career Development',
    'Job Search',
    'Work-Life Balance',
    'Leadership',
    'Workplace Challenges',
    'Discrimination',
    'Mental Health',
    'Mentorship',
    'Entrepreneurship',
    'General Support',
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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

    try {
      // This is a placeholder for an actual API call
      const response = await fetch('/api/support-groups', {
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
        throw new Error('Failed to create support group');
      }

      const createdGroup = await response.json();
      toast.success('Support group created successfully!');
      navigate(`/support-groups/${createdGroup.id}`);
    } catch (err) {
      console.error('Error creating support group:', err);
      setError('Failed to create support group. Please try again.');
      toast.error('Failed to create support group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Create Support Group
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
                label="Group Name"
                name="name"
                value={formData.name}
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
                helperText="Describe the purpose of this support group and who it's for"
              />
            </Grid>

            <Grid item xs={12}>
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

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <TextField
                  label="Add Tags"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  variant="outlined"
                  fullWidth
                  sx={{ mr: 1 }}
                  helperText="Press Enter or click Add to add a tag"
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
              <FormControl fullWidth variant="outlined">
                <InputLabel>Privacy</InputLabel>
                <Select
                  name="isPrivate"
                  value={formData.isPrivate}
                  onChange={handleChange}
                  label="Privacy"
                >
                  <MenuItem value={false}>Public (Anyone can join)</MenuItem>
                  <MenuItem value={true}>Private (Approval required to join)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button variant="outlined" onClick={() => navigate('/support-groups')}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading || !formData.name || !formData.description || !formData.category}
              >
                {loading ? <CircularProgress size={24} /> : 'Create Support Group'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default CreateSupportGroup;
