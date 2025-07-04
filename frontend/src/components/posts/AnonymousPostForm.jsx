import React, { useState, useRef } from 'react';
import {
  Box,
  Card,
  TextField,
  Button,
  IconButton,
  Typography,
  Avatar,
  Chip,
  CircularProgress,
  Tooltip,
  Divider,
  Paper,
  Switch,
  FormControlLabel,
  Collapse,
  Slider,
  Alert,
  FormHelperText
} from '@mui/material';
import {
  Image as ImageIcon,
  Videocam as VideoIcon,
  Send as SendIcon,
  AccessTime as TimeIcon,
  Timer as TimerIcon,
  Security as SecurityIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { useAnonymous } from '../../context/AnonymousContext';

const AnonymousPostForm = ({ onPostCreated }) => {
  const { activePersona, uploadAnonymousMedia } = useAnonymous();
  
  // Form states
  const [content, setContent] = useState('');
  const [media, setMedia] = useState({ type: null, file: null, preview: null });
  const [ephemeral, setEphemeral] = useState(false);
  const [disappearTime, setDisappearTime] = useState(24); // Hours
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  
  // Refs
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  
  // Character limit for post
  const MAX_CHARS = 2000;
  
  // Handle text input change
  const handleContentChange = (e) => {
    const value = e.target.value;
    if (value.length <= MAX_CHARS) {
      setContent(value);
    }
  };
  
  // Handle media selection
  const handleMediaClick = (type) => {
    if (type === 'image') {
      imageInputRef.current.click();
    } else if (type === 'video') {
      videoInputRef.current.click();
    }
  };
  
  // Handle file selection
  const handleFileChange = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (type === 'image' && !file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    } else if (type === 'video' && !file.type.startsWith('video/')) {
      setError('Please select a valid video file');
      return;
    }
    
    // Check file size
    const MAX_SIZE = type === 'image' ? 5 * 1024 * 1024 : 20 * 1024 * 1024; // 5MB for images, 20MB for videos
    if (file.size > MAX_SIZE) {
      setError(`File too large. Maximum size: ${MAX_SIZE / (1024 * 1024)}MB`);
      return;
    }
    
    // Create preview
    const preview = URL.createObjectURL(file);
    setMedia({ type, file, preview });
    setError(null);
  };
  
  // Remove selected media
  const handleRemoveMedia = () => {
    if (media.preview) {
      URL.revokeObjectURL(media.preview);
    }
    setMedia({ type: null, file: null, preview: null });
  };
  
  // Toggle ephemeral setting
  const handleEphemeralToggle = () => {
    setEphemeral(!ephemeral);
    if (!advancedOpen && !ephemeral) {
      setAdvancedOpen(true);
    }
  };
  
  // Handle disappear time change
  const handleDisappearTimeChange = (event, newValue) => {
    setDisappearTime(newValue);
  };
  
  // Get time display text
  const getTimeDisplayText = () => {
    if (disappearTime < 1) {
      return `${disappearTime * 60} minutes`;
    } else if (disappearTime === 1) {
      return '1 hour';
    } else if (disappearTime < 24) {
      return `${disappearTime} hours`;
    } else if (disappearTime === 24) {
      return '1 day';
    } else {
      return `${disappearTime / 24} days`;
    }
  };
  
  // Submit post
  const handleSubmit = async () => {
    if (content.trim() === '' && !media.file) {
      setError('Please enter some content or add media to your post');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      let mediaUrl = null;
      let postType = 'TEXT';
      
      // Upload media if present
      if (media.file) {
        const uploadResult = await uploadAnonymousMedia(media.file);
        mediaUrl = uploadResult.url;
        postType = media.type.toUpperCase();
      }
      
      // Calculate disappear time if ephemeral
      const disappearsAt = ephemeral ? new Date(Date.now() + (disappearTime * 60 * 60 * 1000)) : null;
      
      // Create post object
      const postData = {
        content: content.trim(),
        postType,
        disappearsAt
      };
      
      if (mediaUrl) {
        if (postType === 'IMAGE') {
          postData.imageUrl = mediaUrl;
        } else if (postType === 'VIDEO') {
          postData.videoUrl = mediaUrl;
        }
      }
      
      // Call parent handler
      if (onPostCreated) {
        await onPostCreated(postData);
      }
      
      // Reset form
      setContent('');
      handleRemoveMedia();
      setEphemeral(false);
      setDisappearTime(24);
      setAdvancedOpen(false);
    } catch (err) {
      setError(err.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card sx={{ p: 2, mb: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Avatar 
          src={activePersona?.avatarUrl} 
          sx={{ 
            width: 40, 
            height: 40, 
            mr: 1.5,
            bgcolor: !activePersona?.avatarUrl ? 'secondary.main' : 'inherit'
          }}
        >
          {!activePersona?.avatarUrl && activePersona?.displayName?.charAt(0)}
        </Avatar>
        
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
            {activePersona?.displayName || 'Anonymous'}
          </Typography>
          <Chip 
            size="small" 
            label="Anonymous Post" 
            color="secondary" 
            variant="outlined"
            icon={<VisibilityOffIcon sx={{ fontSize: '0.8rem !important' }} />}
            sx={{ height: 24 }}
          />
        </Box>
      </Box>
      
      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {/* Text input */}
      <TextField
        fullWidth
        multiline
        minRows={3}
        maxRows={8}
        placeholder="What do you want to share anonymously?"
        value={content}
        onChange={handleContentChange}
        variant="outlined"
        disabled={loading}
        sx={{ mb: 2 }}
        InputProps={{
          sx: { bgcolor: 'background.paper' }
        }}
      />
      
      {/* Character counter */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
        <Typography 
          variant="caption" 
          color={content.length > MAX_CHARS * 0.9 ? 'error' : 'text.secondary'}
        >
          {content.length}/{MAX_CHARS}
        </Typography>
      </Box>
      
      {/* Media preview */}
      {media.preview && (
        <Box sx={{ position: 'relative', mb: 2, mt: 1 }}>
          {media.type === 'image' && (
            <Box 
              component="img" 
              src={media.preview} 
              alt="Post image" 
              sx={{ 
                width: '100%', 
                maxHeight: 300, 
                objectFit: 'contain',
                borderRadius: 1
              }} 
            />
          )}
          
          {media.type === 'video' && (
            <Box 
              component="video" 
              src={media.preview} 
              controls
              sx={{ 
                width: '100%', 
                maxHeight: 300,
                borderRadius: 1
              }} 
            />
          )}
          
          <IconButton 
            onClick={handleRemoveMedia}
            sx={{ 
              position: 'absolute', 
              top: 8, 
              right: 8, 
              bgcolor: 'rgba(0, 0, 0, 0.5)',
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.7)',
              }
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      )}
      
      {/* Hidden file inputs */}
      <input 
        type="file" 
        ref={imageInputRef}
        onChange={(e) => handleFileChange(e, 'image')}
        accept="image/*"
        style={{ display: 'none' }}
      />
      
      <input 
        type="file"
        ref={videoInputRef}
        onChange={(e) => handleFileChange(e, 'video')}
        accept="video/*"
        style={{ display: 'none' }}
      />
      
      {/* Advanced options */}
      <Box sx={{ mb: 2 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
            mb: 1
          }}
          onClick={() => setAdvancedOpen(!advancedOpen)}
        >
          <Typography 
            variant="subtitle2" 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              color: 'text.secondary'
            }}
          >
            <SecurityIcon fontSize="small" sx={{ mr: 0.5 }} />
            Advanced Privacy Options
          </Typography>
          
          <Button 
            size="small" 
            color="inherit"
            onClick={(e) => {
              e.stopPropagation();
              setAdvancedOpen(!advancedOpen);
            }}
          >
            {advancedOpen ? 'Hide' : 'Show'}
          </Button>
        </Box>
        
        <Collapse in={advancedOpen}>
          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'rgba(0, 0, 0, 0.02)' }}>
            <FormControlLabel
              control={
                <Switch 
                  checked={ephemeral} 
                  onChange={handleEphemeralToggle}
                  color="secondary"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TimerIcon fontSize="small" sx={{ mr: 0.5 }} />
                  <Typography variant="body2">Ephemeral Post</Typography>
                  <Tooltip title="This post will automatically disappear after the specified time">
                    <IconButton size="small" sx={{ ml: 0.5 }}>
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              }
            />
            
            {ephemeral && (
              <Box sx={{ pl: 3, pr: 3, mt: 1 }}>
                <Typography variant="body2" gutterBottom>
                  Post disappears after: <strong>{getTimeDisplayText()}</strong>
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                  <Slider
                    value={disappearTime}
                    onChange={handleDisappearTimeChange}
                    step={disappearTime < 1 ? 0.25 : 1}
                    min={0.25}
                    max={72}
                    marks={[
                      { value: 0.25, label: '15m' },
                      { value: 1, label: '1h' },
                      { value: 24, label: '1d' },
                      { value: 72, label: '3d' }
                    ]}
                    color="secondary"
                  />
                </Box>
                
                <FormHelperText>
                  Ephemeral posts will be permanently deleted after the specified time period
                </FormHelperText>
              </Box>
            )}
          </Paper>
        </Collapse>
      </Box>
      
      {/* Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Tooltip title="Add Image">
            <IconButton 
              color="primary" 
              onClick={() => handleMediaClick('image')}
              disabled={loading || media.file !== null}
            >
              <ImageIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Add Video">
            <IconButton 
              color="primary" 
              onClick={() => handleMediaClick('video')}
              disabled={loading || media.file !== null}
            >
              <VideoIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Ephemeral Post">
            <IconButton 
              color={ephemeral ? 'secondary' : 'default'}
              onClick={handleEphemeralToggle}
              disabled={loading}
            >
              <TimerIcon />
            </IconButton>
          </Tooltip>
        </Box>
        
        <Button
          variant="contained"
          color="secondary"
          startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
          onClick={handleSubmit}
          disabled={loading || (content.trim() === '' && !media.file)}
        >
          Post Anonymously
        </Button>
      </Box>
    </Card>
  );
};

export default AnonymousPostForm; 