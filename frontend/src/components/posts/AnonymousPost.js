import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardActions, 
  Typography, 
  Avatar, 
  Box, 
  IconButton, 
  Button, 
  Chip,
  TextField,
  Collapse,
  Divider,
  Paper,
  CircularProgress,
  Tooltip,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import { 
  Favorite as FavoriteIcon, 
  FavoriteBorder as FavoriteBorderIcon,
  Comment as CommentIcon,
  Share as ShareIcon,
  MoreVert as MoreVertIcon,
  Timer as TimerIcon,
  Flag as FlagIcon,
  Block as BlockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Send as SendIcon,
  Link as LinkIcon,
  ContentCopy as CopyIcon,
  Image as ImageIcon,
  Videocam as VideoIcon,
  ThumbUpOutlined,
  CommentOutlined,
  VisibilityOutlined
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useAnonymous } from '../../context/AnonymousContext';
import { useReport } from '../../context/ReportContext';

const AnonymousPost = ({ post, onLike, onComment, onShare }) => {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentLifespan, setCommentLifespan] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [showReportMenu, setShowReportMenu] = useState(false);
  const { submitAnonymousReport } = useReport();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportDetails, setReportDetails] = useState({ reportType: 'inappropriate_content', description: '' });
  
  // Calculate if post is ephemeral and time remaining
  const isEphemeral = post.disappearsAt !== null;
  const timeRemaining = isEphemeral 
    ? Math.max(0, new Date(post.disappearsAt) - new Date())
    : null;
    
  // Format time remaining for display
  const formatTimeRemaining = () => {
    if (!isEphemeral) return null;
    
    const seconds = Math.floor(timeRemaining / 1000);
    if (seconds <= 0) return 'Expiring now';
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m remaining`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h remaining`;
    
    const days = Math.floor(hours / 24);
    return `${days}d remaining`;
  };
  
  // Calculate progress percentage for ephemeral posts
  const calculateProgress = () => {
    if (!isEphemeral) return 100;
    
    const createdAt = new Date(post.createdAt).getTime();
    const expiresAt = new Date(post.disappearsAt).getTime();
    const totalTime = expiresAt - createdAt;
    const elapsed = Date.now() - createdAt;
    
    return Math.max(0, Math.min(100, 100 - (elapsed / totalTime * 100)));
  };
  
  // Handle comment submission
  const handleCommentSubmit = async () => {
    if (!commentText.trim()) return;
    
    try {
      setSubmitting(true);
      await onComment(post._id, commentText.trim(), commentLifespan);
      setCommentText('');
    } catch (err) {
      console.error('Comment error:', err);
    } finally {
      setSubmitting(false);
    }
  };
  
  // Handle menu open
  const handleMenuOpen = (event) => {
    setMenuAnchor(event.currentTarget);
  };
  
  // Handle menu close
  const handleMenuClose = () => {
    setMenuAnchor(null);
    setShowReportMenu(false);
  };
  
  // Handle post sharing
  const handleShare = () => {
    if (onShare) {
      onShare(post._id);
    }
    handleMenuClose();
  };
  
  // Handle post link copying
  const handleCopyLink = () => {
    const url = `${window.location.origin}/anonymous/post/${post._id}`;
    navigator.clipboard.writeText(url);
    handleMenuClose();
  };
  
  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleOpenReportModal = () => {
    setIsReportModalOpen(true);
    handleMenuClose();
  };

  const handleCloseReportModal = () => {
    setIsReportModalOpen(false);
    setReportDetails({ reportType: 'inappropriate_content', description: '' });
  };
  
  const handleReportSubmit = async () => {
    try {
      await submitAnonymousReport({
        ...reportDetails,
        contentType: 'post',
        contentId: post._id,
      });
      handleCloseReportModal();
    } catch (error) {
      console.error('Failed to submit anonymous report', error);
    }
  };

  return (
    <>
      <Paper elevation={2} sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
             <Box display="flex" alignItems="center">
                <Avatar src={post.persona?.avatarUrl} sx={{ mr: 2, bgcolor: 'secondary.main' }}>
                  {post.persona?.displayName?.[0]}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold" color="secondary.main">
                    {post.persona?.displayName || 'Anonymous'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(post.createdAt)}
                  </Typography>
                </Box>
              </Box>
              <IconButton onClick={handleMenuOpen}><MoreVertIcon /></IconButton>
          </Box>
          <Typography variant="body1" paragraph>{post.content}</Typography>
          {post.mediaUrls && post.mediaUrls.length > 0 && (
            <Box sx={{ mt: 2, borderRadius: 2, overflow: 'hidden' }}>
              <img src={post.mediaUrls[0]} alt="Anonymous post content" style={{ maxWidth: '100%', height: 'auto' }} />
            </Box>
          )}
        </CardContent>
        <Divider />
        <CardActions sx={{ justifyContent: 'space-around', bgcolor: 'background.default' }}>
          <IconButton size="small">
            <ThumbUpOutlined />
            <Typography variant="body2" sx={{ ml: 1 }}>{post.engagement.likes.length || 0}</Typography>
          </IconButton>
          <IconButton size="small">
            <CommentOutlined />
            <Typography variant="body2" sx={{ ml: 1 }}>{post.engagement.comments.length || 0}</Typography>
          </IconButton>
          <Box display="flex" alignItems="center">
            <VisibilityOutlined sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
            <Typography variant="caption" color="text.secondary">{post.engagement.views || 0}</Typography>
          </Box>
        </CardActions>
      </Paper>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
        <MenuItem onClick={handleOpenReportModal}>
          <ListItemIcon><FlagIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Report Post</ListItemText>
        </MenuItem>
      </Menu>
      
      <Dialog open={isReportModalOpen} onClose={handleCloseReportModal} fullWidth maxWidth="sm">
        <DialogTitle>Report Anonymous Post</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ my: 2 }}>
            <InputLabel>Reason</InputLabel>
            <Select
              value={reportDetails.reportType}
              label="Reason"
              onChange={(e) => setReportDetails(prev => ({ ...prev, reportType: e.target.value }))}
            >
              <MenuItem value="inappropriate_content">Inappropriate Content</MenuItem>
              <MenuItem value="harassment">Harassment</MenuItem>
              <MenuItem value="hate_speech">Hate Speech</MenuItem>
              <MenuItem value="misinformation">Misinformation</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Description"
            multiline
            rows={4}
            fullWidth
            value={reportDetails.description}
            onChange={(e) => setReportDetails(prev => ({ ...prev, description: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReportModal}>Cancel</Button>
          <Button onClick={handleReportSubmit} variant="contained" color="error">Submit Report</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AnonymousPost; 