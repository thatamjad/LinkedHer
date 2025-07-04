import React, { useState, useRef } from 'react';
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
  IconButton,
  CircularProgress,
  Alert,
  Avatar
} from '@mui/material';
import { PhotoCamera, Public, Group, Lock } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/apiClient';

const CreatePost = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleContentChange = (e) => {
    setContent(e.target.value);
  };

  const handleVisibilityChange = (e) => {
    setVisibility(e.target.value);
  };

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !mediaFile) {
      setError("Post must contain text or media.");
      return;
    }
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('content', JSON.stringify({ text: content }));
    formData.append('visibility', visibility);
    if (mediaFile) {
      formData.append('media', mediaFile);
    }

    try {
      await apiClient.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate('/feed');
    } catch (err) {
      console.error('Error creating post:', err);
      setError('Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper elevation={2} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom align="center">
          Create a Post
        </Typography>
        <Box display="flex" alignItems="center" mb={3}>
          <Avatar src={currentUser?.profileImage} sx={{ mr: 2 }} />
          <Typography fontWeight="bold">{currentUser?.firstName} {currentUser?.lastName}</Typography>
        </Box>
        <form onSubmit={handleSubmit}>
          <TextField
            placeholder={`What's on your mind, ${currentUser?.firstName}?`}
            value={content}
            onChange={handleContentChange}
            multiline
            rows={6}
            fullWidth
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <IconButton color="primary" onClick={() => fileInputRef.current.click()}>
                <PhotoCamera />
              </IconButton>
            </Box>
            <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
              <InputLabel>Visibility</InputLabel>
              <Select value={visibility} label="Visibility" onChange={handleVisibilityChange}>
                <MenuItem value="public"><Public sx={{ mr: 1, fontSize: 16 }} />Public</MenuItem>
                <MenuItem value="connections"><Group sx={{ mr: 1, fontSize: 16 }}/>Connections</MenuItem>
                <MenuItem value="private"><Lock sx={{ mr: 1, fontSize: 16 }}/>Private</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleMediaChange}
            accept="image/*,video/*"
            hidden
          />
          {mediaPreview && (
            <Box mt={2} textAlign="center">
              <img src={mediaPreview} alt="Preview" style={{ maxHeight: '300px', maxWidth: '100%', borderRadius: '8px' }} />
            </Box>
          )}
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{ mt: 3, py: 1.5 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Post'}
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default CreatePost; 