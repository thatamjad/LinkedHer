import React, { useState } from 'react';
import axios from 'axios';
import { Button, TextField, Card, CardContent, IconButton, Typography, Box, CircularProgress, Snackbar, Alert } from '@mui/material';
import { PhotoCamera, Close } from '@mui/icons-material';

const CreatePost = ({ onPostCreated }) => {
  const [postContent, setPostContent] = useState('');
  const [postImage, setPostImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPostImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setPostImage(null);
    setImagePreview('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!postContent.trim() && !postImage) {
      setError('Post cannot be empty');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('content', postContent);
      if (postImage) {
        formData.append('image', postImage);
        formData.append('postType', 'IMAGE');
      } else {
        formData.append('postType', 'TEXT');
      }

      const response = await axios.post('/api/posts/professional', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess(true);
      setPostContent('');
      setPostImage(null);
      setImagePreview('');
      
      if (onPostCreated) {
        onPostCreated(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ mb: 3, boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Share a professional update
        </Typography>
        
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="What would you like to share professionally?"
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            variant="outlined"
            sx={{ mb: 2 }}
          />

          {imagePreview && (
            <Box sx={{ position: 'relative', mb: 2 }}>
              <img 
                src={imagePreview} 
                alt="Post preview" 
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '250px', 
                  borderRadius: '8px'
                }} 
              />
              <IconButton
                sx={{
                  position: 'absolute',
                  top: 5,
                  right: 5,
                  bgcolor: 'rgba(0,0,0,0.5)',
                  color: 'white',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                }}
                size="small"
                onClick={removeImage}
              >
                <Close />
              </IconButton>
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <IconButton
              color="primary"
              component="label"
              disabled={loading}
            >
              <PhotoCamera />
              <input
                hidden
                accept="image/*"
                type="file"
                onChange={handleImageChange}
              />
            </IconButton>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading || (!postContent.trim() && !postImage)}
            >
              {loading ? <CircularProgress size={24} /> : 'Post'}
            </Button>
          </Box>
        </form>
      </CardContent>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
      >
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
      >
        <Alert severity="success" onClose={() => setSuccess(false)}>
          Post created successfully!
        </Alert>
      </Snackbar>
    </Card>
  );
};

export default CreatePost; 