import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  IconButton,
  CircularProgress,
  Alert
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import { useAnonymous } from '../../context/AnonymousContext';

const AnonymousPostForm = ({ open, onClose, onPostCreated }) => {
  const { anonymousApiClient } = useAnonymous();
  const [content, setContent] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

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
  
  const clearForm = () => {
    setContent('');
    setMediaFile(null);
    setMediaPreview('');
    setError(null);
  };

  const handleSubmit = async () => {
    if (!content.trim() && !mediaFile) {
      setError("Post must contain text or media.");
      return;
    }
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('content', content);
    if (mediaFile) {
      formData.append('media', mediaFile);
    }

    try {
      const { data } = await anonymousApiClient.post('/anonymous/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onPostCreated(data.post);
      clearForm();
      onClose();
    } catch (err) {
      setError('Failed to create anonymous post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create Anonymous Post</DialogTitle>
      <DialogContent>
        <TextField
          placeholder="Share your thoughts anonymously..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          multiline
          rows={5}
          fullWidth
          variant="outlined"
          sx={{ my: 2 }}
        />
        <Box>
          <IconButton color="secondary" onClick={() => fileInputRef.current.click()}>
            <PhotoCamera />
          </IconButton>
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
            <img src={mediaPreview} alt="Preview" style={{ maxHeight: '200px', maxWidth: '100%', borderRadius: '8px' }} />
          </Box>
        )}
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="secondary" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Post Anonymously'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AnonymousPostForm; 