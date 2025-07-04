import React, { useState } from 'react';
import {
  Card,
  CardContent,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Snackbar
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const ImprovedCreatePost = ({ onPostCreated }) => {
  const { currentUser } = useAuth();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Please enter some content for your post');
      return;
    }

    if (!currentUser) {
      setError('Please login to create a post');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Creating post with content:', content);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      const postData = {
        content: {
          text: content.trim(),
          formatting: {}
        },
        visibility: 'public',
        postType: 'TEXT'
      };

      console.log('Sending post data:', postData);
      console.log('To URL:', `${API_URL}/posts/professional`);
      console.log('With token:', token ? 'Present' : 'Missing');

      const response = await axios.post(
        `${API_URL}/posts/professional`,
        postData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000 // 10 second timeout
        }
      );

      console.log('Post created successfully:', response.data);
      setSuccess(true);
      setContent('');
      
      if (onPostCreated) {
        onPostCreated(response.data);
      }

    } catch (err) {
      console.error('Error creating post:', err);
      
      let errorMessage = 'Failed to create post';
      
      if (err.code === 'ECONNREFUSED' || err.message.includes('Network Error')) {
        errorMessage = 'Cannot connect to server. Please ensure the backend is running.';
      } else if (err.response) {
        const status = err.response.status;
        const data = err.response.data;
        
        switch (status) {
          case 401:
            errorMessage = 'Authentication failed. Please login again.';
            break;
          case 403:
            errorMessage = 'You don\'t have permission to create posts.';
            break;
          case 404:
            errorMessage = 'Post creation endpoint not found. Please check the backend configuration.';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later.';
            break;
          default:
            errorMessage = data.message || data.msg || `Request failed with status ${status}`;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Create a Professional Post
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {!currentUser && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Please login to create posts
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="What would you like to share with your professional network?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              variant="outlined"
              sx={{ mb: 2 }}
              disabled={loading || !currentUser}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                {content.length}/2000 characters
              </Typography>
              
              <Button
                type="submit"
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
                disabled={loading || !content.trim() || !currentUser}
              >
                {loading ? 'Posting...' : 'Post'}
              </Button>
            </Box>
          </form>

          {currentUser && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Posting as: {currentUser.firstName} {currentUser.lastName}
            </Typography>
          )}
        </CardContent>
      </Card>

      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSuccess(false)}>
          Post created successfully!
        </Alert>
      </Snackbar>
    </>
  );
};

export default ImprovedCreatePost;
