import React, { useState } from 'react';
import {
  Box,
  Modal,
  Typography,
  Button,
  Divider,
  IconButton,
  TextField,
  InputAdornment,
  Snackbar,
  Alert,
  useTheme
} from '@mui/material';
import {
  Close as CloseIcon,
  ContentCopy as CopyIcon,
  Email as EmailIcon,
  LinkedIn as LinkedInIcon,
  Twitter as TwitterIcon,
  Facebook as FacebookIcon,
  WhatsApp as WhatsAppIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import { useMode } from '../../context/ModeContext';
import apiClient from '../../services/apiClient';

const ShareJobModal = ({ open, onClose, job }) => {
  const theme = useTheme();
  const { mode } = useMode();
  
  // State for copied notification
  const [copied, setCopied] = useState(false);
  const [shareComplete, setShareComplete] = useState(false);
  
  // Create job URL
  const jobUrl = job ? `${window.location.origin}/jobs/${job._id}` : '';
  
  // Handle copy link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(jobUrl);
    setCopied(true);
    
    // Record share
    if (job) {
      recordShare('copy');
    }
  };
  
  // Handle social media share
  const handleSocialShare = (platform) => {
    let shareUrl;
    
    const shareText = `Check out this job: ${job?.title} at ${job?.company}`;
    
    switch (platform) {
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(jobUrl)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(jobUrl)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(jobUrl)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(shareText + ': ' + jobUrl)}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent('Job Opportunity: ' + job?.title)}&body=${encodeURIComponent(shareText + '\n\n' + jobUrl)}`;
        break;
      default:
        return;
    }
    
    // Open new window for sharing
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
    
    // Record share
    recordShare(platform);
    
    // Show success message
    setShareComplete(true);
  };
  
  // Record share in backend
  const recordShare = async (platform) => {
    try {
      await apiClient.post(`/jobs/${job._id}/share`, { platform });
    } catch (error) {
      console.error('Error recording share:', error);
    }
  };
  
  // Close copied notification
  const handleCloseCopied = () => {
    setCopied(false);
  };
  
  // Close share complete notification
  const handleCloseShareComplete = () => {
    setShareComplete(false);
  };
  
  // Social media sharing options
  const socialOptions = [
    { id: 'linkedin', label: 'LinkedIn', icon: <LinkedInIcon fontSize="large" />, color: '#0077B5' },
    { id: 'twitter', label: 'Twitter', icon: <TwitterIcon fontSize="large" />, color: '#1DA1F2' },
    { id: 'facebook', label: 'Facebook', icon: <FacebookIcon fontSize="large" />, color: '#4267B2' },
    { id: 'whatsapp', label: 'WhatsApp', icon: <WhatsAppIcon fontSize="large" />, color: '#25D366' },
    { id: 'email', label: 'Email', icon: <EmailIcon fontSize="large" />, color: '#EA4335' },
  ];
  
  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        aria-labelledby="share-job-modal-title"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: 500 },
          bgcolor: mode === 'professional' ? 'background.paper' : 'background.default',
          boxShadow: 24,
          borderRadius: 2,
          p: 4
        }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography 
              id="share-job-modal-title" 
              variant="h5" 
              component="h2"
              fontWeight="bold"
              color={mode === 'professional' ? 'text.primary' : 'text.secondary'}
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <ShareIcon color={mode === 'professional' ? 'primary' : 'secondary'} />
              Share Job
            </Typography>
            <Button 
              onClick={onClose}
              sx={{ minWidth: 'auto', p: 1 }}
            >
              <CloseIcon />
            </Button>
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
          {/* Job Info */}
          {job && (
            <Box sx={{ mb: 3 }}>
              <Typography 
                variant="h6"
                fontWeight="bold"
                color={mode === 'professional' ? 'text.primary' : 'text.secondary'}
              >
                {job.title}
              </Typography>
              <Typography 
                variant="subtitle1"
                color="text.secondary"
              >
                {job.company} • {job.location}
              </Typography>
            </Box>
          )}
          
          {/* Copy Link */}
          <Box sx={{ mb: 4 }}>
            <Typography 
              variant="subtitle1" 
              sx={{ mb: 1 }}
              color={mode === 'professional' ? 'text.primary' : 'text.secondary'}
            >
              Job Link
            </Typography>
            <TextField
              fullWidth
              value={jobUrl}
              variant="outlined"
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton 
                      edge="end" 
                      onClick={handleCopyLink}
                      color={mode === 'professional' ? 'primary' : 'secondary'}
                    >
                      <CopyIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: mode === 'professional' ? 'primary.main' : 'secondary.main'
                  }
                }
              }}
            />
          </Box>
          
          {/* Share on Social Media */}
          <Box sx={{ mb: 3 }}>
            <Typography 
              variant="subtitle1" 
              sx={{ mb: 2 }}
              color={mode === 'professional' ? 'text.primary' : 'text.secondary'}
            >
              Share on
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              {socialOptions.map(option => (
                <Box 
                  key={option.id}
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <IconButton 
                    onClick={() => handleSocialShare(option.id)}
                    sx={{ 
                      bgcolor: 'action.hover',
                      '&:hover': {
                        bgcolor: `${option.color}20`
                      },
                      color: option.color
                    }}
                  >
                    {option.icon}
                  </IconButton>
                  <Typography variant="caption" color="text.secondary">
                    {option.label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
          
          {/* Note */}
          <Box sx={{ mt: 4, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
            <Typography 
              variant="body2"
              color="text.secondary"
            >
              By sharing this job, you're helping women in your network find great opportunities. Our platform preserves privacy, ensuring the safety and anonymity of all users.
            </Typography>
          </Box>
        </Box>
      </Modal>
      
      {/* Copy Notification */}
      <Snackbar
        open={copied}
        autoHideDuration={3000}
        onClose={handleCloseCopied}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseCopied} 
          severity="success"
          sx={{ width: '100%' }}
        >
          Job link copied to clipboard!
        </Alert>
      </Snackbar>
      
      {/* Share Complete Notification */}
      <Snackbar
        open={shareComplete}
        autoHideDuration={3000}
        onClose={handleCloseShareComplete}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseShareComplete} 
          severity="success"
          sx={{ width: '100%' }}
        >
          Job shared successfully!
        </Alert>
      </Snackbar>
    </>
  );
};

export default ShareJobModal; 