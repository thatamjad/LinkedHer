import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Avatar,
  IconButton,
  Divider,
  Typography,
  FormControl,
  MenuItem,
  Select,
  InputLabel,
  Chip,
  Stack
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ImageIcon from '@mui/icons-material/Image';
import DeleteIcon from '@mui/icons-material/Delete';
import LockIcon from '@mui/icons-material/Lock';
import PublicIcon from '@mui/icons-material/Public';
import GroupIcon from '@mui/icons-material/Group';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../../context/AuthContext';
import { usePost } from '../../context/PostContext';

const StyledDropzone = styled(Box)(({ theme, isDragActive }) => ({
  border: `2px dashed ${isDragActive ? theme.palette.primary.main : theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
  textAlign: 'center',
  backgroundColor: isDragActive ? theme.palette.action.hover : 'transparent',
  cursor: 'pointer',
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  transition: 'all 0.2s ease-in-out'
}));

const PreviewImage = styled(Box)(({ theme }) => ({
  position: 'relative',
  marginTop: theme.spacing(2),
  width: '100%',
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
}));

const DeleteButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  right: theme.spacing(1),
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  color: 'white',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
}));

const CreatePostForm = ({ onPostCreated }) => {
  const { currentUser } = useAuth();
  const { createPost } = usePost();
  const [content, setContent] = useState('');
  const [media, setMedia] = useState([]);
  const [visibility, setVisibility] = useState('public');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
    },
    maxFiles: 1,
    onDrop: acceptedFiles => {
      const file = acceptedFiles[0];
      
      // For the frontend preview only
      const preview = URL.createObjectURL(file);
      
      // In a real app, you would upload the file to your server here
      // and get back a URL. For now, we'll simulate that.
      const simulatedMediaObject = {
        type: 'image',
        url: preview,
        file, // Store the file for later upload
        altText: '',
        size: file.size,
        dimensions: {
          width: 0,
          height: 0
        }
      };
      
      setMedia([simulatedMediaObject]);
    }
  });

  const handleRemoveMedia = (index) => {
    const newMedia = [...media];
    if (newMedia[index].url.startsWith('blob:')) {
      URL.revokeObjectURL(newMedia[index].url);
    }
    newMedia.splice(index, 1);
    setMedia(newMedia);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim() && media.length === 0) {
      setError('Please add some text or an image to your post');
      return;
    }

    setIsSubmitting(true);
    setError('');
    
    try {
      // In a real app, you would upload any media files first
      // and get back URLs to include in your post

      // For now, we'll use our simulated media objects
      const postData = {
        content: {
          text: content.trim(),
          formatting: {}
        },
        visibility,
        media: media.map(m => ({
          type: m.type,
          url: m.url,
          altText: m.altText,
          size: m.size,
          dimensions: m.dimensions
        }))
      };
      
      await createPost(postData);
      
      // Reset form
      setContent('');
      setMedia([]);
      setVisibility('public');
      
      // Notify parent component
      if (onPostCreated) {
        onPostCreated();
      }
    } catch (err) {
      console.error('Failed to create post:', err);
      setError('Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getVisibilityIcon = () => {
    switch (visibility) {
      case 'public':
        return <PublicIcon />;
      case 'connections':
        return <GroupIcon />;
      case 'private':
        return <LockIcon />;
      default:
        return <PublicIcon />;
    }
  };

  return (
    <Card sx={{ mb: 3, boxShadow: 2, borderRadius: 2 }}>
      <CardContent>
        <Box component="form" onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
            <Avatar 
              src={currentUser.profileImage || '/default-avatar.png'} 
              alt={`${currentUser.firstName} ${currentUser.lastName}`}
              sx={{ mr: 2 }}
            />
            <TextField
              multiline
              fullWidth
              minRows={2}
              maxRows={6}
              placeholder={`What's on your mind, ${currentUser.firstName}?`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              variant="outlined"
              error={!!error}
              helperText={error}
            />
          </Box>

          {media.length > 0 ? (
            <Stack spacing={1}>
              {media.map((item, index) => (
                <PreviewImage key={index}>
                  <img 
                    src={item.url} 
                    alt="Preview" 
                    style={{ width: '100%', height: 'auto', maxHeight: '300px', objectFit: 'contain' }}
                  />
                  <DeleteButton 
                    size="small" 
                    onClick={() => handleRemoveMedia(index)}
                    aria-label="Remove image"
                  >
                    <DeleteIcon />
                  </DeleteButton>
                </PreviewImage>
              ))}
            </Stack>
          ) : (
            <StyledDropzone {...getRootProps()} isDragActive={isDragActive}>
              <input {...getInputProps()} />
              <Typography color="text.secondary">
                {isDragActive ? 'Drop your image here' : 'Drag & drop an image, or click to select one'}
              </Typography>
            </StyledDropzone>
          )}

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <Select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                  displayEmpty
                  startAdornment={getVisibilityIcon()}
                  sx={{ pl: 1 }}
                >
                  <MenuItem value="public">Public</MenuItem>
                  <MenuItem value="connections">Connections Only</MenuItem>
                  <MenuItem value="private">Private</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={isSubmitting || (!content.trim() && media.length === 0)}
            >
              {isSubmitting ? 'Posting...' : 'Post'}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CreatePostForm; 