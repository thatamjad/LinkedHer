import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Avatar,
  Typography,
  IconButton,
  Button,
  Box,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Tooltip,
  CardMedia,
  ListItemIcon,
  ListItemText,
  TextField,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import CommentOutlinedIcon from '@mui/icons-material/CommentOutlined';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VerifiedIcon from '@mui/icons-material/Verified';
import FlagIcon from '@mui/icons-material/Flag';
import { useAuth } from '../../context/AuthContext';
import { usePost } from '../../context/PostContext';
import { useReport } from '../../context/ReportContext';
import { formatDistanceToNow } from 'date-fns';
import ReportButton from '../ui/ReportButton';
import apiClient from '../../services/apiClient';

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[2],
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
}));

const PostCard = ({ post, onCommentClick, isProfessionalMode = true }) => {
  const { currentUser } = useAuth();
  const { likePost, unlikePost, savePost, unsavePost, deletePost } = usePost();
  const { submitProfessionalReport } = useReport();
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportDetails, setReportDetails] = useState({ reportType: 'inappropriate_content', description: '' });
  const menuOpen = Boolean(menuAnchorEl);

  const handleMenuClick = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleLikeToggle = async () => {
    try {
      if (isLiked) {
        await unlikePost(post._id);
      } else {
        await likePost(post._id);
      }
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  };

  const handleSaveToggle = async () => {
    try {
      if (isSaved) {
        await unsavePost(post._id);
      } else {
        await savePost(post._id);
      }
    } catch (err) {
      console.error('Failed to toggle save:', err);
    }
  };

  const handleDeleteClick = () => {
    handleMenuClose();
    setConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deletePost(post._id);
      setConfirmDeleteOpen(false);
    } catch (err) {
      console.error('Failed to delete post:', err);
    }
  };

  const handleEditClick = () => {
    handleMenuClose();
    // Navigate to edit post page or open edit dialog
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
      await submitProfessionalReport({
        ...reportDetails,
        contentType: 'post',
        contentId: post._id,
        reportedUserId: post.author._id
      });
      handleCloseReportModal();
    } catch (error) {
      console.error('Failed to submit report', error);
    }
  };

  // Check if current user has liked this post
  const isLiked = post.engagement.likes.users.some(
    userId => userId === currentUser._id
  );

  // Check if current user has saved this post
  const isSaved = post.engagement.saves.users.some(
    userId => userId === currentUser._id
  );

  // Check if current user is the post author
  const isAuthor = post.user._id === currentUser._id;

  // Format post date
  const formattedDate = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });

  const isCurrentUserPost = isProfessionalMode && post.userId === currentUser._id;

  return (
    <StyledCard>
      <CardHeader
        avatar={
          <Avatar 
            src={post.user.profileImage || '/default-avatar.png'}
            alt={`${post.user.firstName} ${post.user.lastName}`}
            component={Link}
            to={`/profile/${post.user._id}`}
            sx={{ cursor: 'pointer' }}
          />
        }
        action={
          isAuthor && (
            <>
              <IconButton 
                aria-label="post settings" 
                onClick={handleMenuClick}
                aria-controls={menuOpen ? 'post-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={menuOpen ? 'true' : undefined}
              >
                <MoreVertIcon />
              </IconButton>
              <Menu
                id="post-menu"
                anchorEl={menuAnchorEl}
                open={menuOpen}
                onClose={handleMenuClose}
                MenuListProps={{
                  'aria-labelledby': 'post-menu-button',
                }}
              >
                <MenuItem onClick={handleEditClick}>
                  <EditIcon fontSize="small" sx={{ mr: 1 }} />
                  Edit
                </MenuItem>
                <MenuItem onClick={handleDeleteClick}>
                  <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                  Delete
                </MenuItem>
                <MenuItem onClick={handleOpenReportModal}>
                  <ListItemIcon><FlagIcon fontSize="small" /></ListItemIcon>
                  <ListItemText>Report Post</ListItemText>
                </MenuItem>
              </Menu>
            </>
          )
        }
        title={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography 
              variant="subtitle1" 
              component={Link} 
              to={`/profile/${post.user._id}`}
              sx={{ 
                textDecoration: 'none', 
                color: 'text.primary',
                fontWeight: 'bold',
                '&:hover': {
                  textDecoration: 'underline'
                }
              }}
            >
              {post.user.firstName} {post.user.lastName}
            </Typography>
            {post.user.verificationStatus === 'verified' && (
              <Tooltip title="Verified User">
                <VerifiedIcon color="primary" sx={{ ml: 0.5, fontSize: 16 }} />
              </Tooltip>
            )}
          </Box>
        }
        subheader={formattedDate}
      />
      
      {post.media && post.media.length > 0 && (
        <CardMedia
          component="img"
          height="auto"
          image={post.media[0].url}
          alt={post.media[0].altText || 'Post image'}
          sx={{ maxHeight: 400, objectFit: 'contain' }}
        />
      )}
      
      <CardContent>
        <Typography variant="body1" component="div">
          {post.content.text}
        </Typography>
      </CardContent>
      
      <Divider />
      
      <Box sx={{ px: 2, py: 1, display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {post.engagement.likes.count} {post.engagement.likes.count === 1 ? 'like' : 'likes'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {post.engagement.comments.count} {post.engagement.comments.count === 1 ? 'comment' : 'comments'}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {post.engagement.saves.count} {post.engagement.saves.count === 1 ? 'save' : 'saves'}
        </Typography>
      </Box>
      
      <Divider />
      
      <CardActions sx={{ justifyContent: 'space-between', px: 2 }}>
        <Button
          startIcon={isLiked ? <ThumbUpIcon /> : <ThumbUpOutlinedIcon />}
          onClick={handleLikeToggle}
          color={isLiked ? 'primary' : 'inherit'}
        >
          Like
        </Button>
        <Button
          startIcon={<CommentOutlinedIcon />}
          onClick={onCommentClick}
        >
          Comment
        </Button>
        <Button
          startIcon={isSaved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
          onClick={handleSaveToggle}
          color={isSaved ? 'primary' : 'inherit'}
        >
          Save
        </Button>
      </CardActions>

      {/* Confirm Delete Dialog */}
      <Dialog open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)}>
        <DialogTitle>Delete Post</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this post? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Report button */}
      {!isCurrentUserPost && (
        <ReportButton 
          contentType="post"
          contentId={post._id}
          userId={isProfessionalMode ? post.userId : undefined}
          contentHash={!isProfessionalMode ? post.contentHash : undefined}
        />
      )}

      <Dialog open={isReportModalOpen} onClose={handleCloseReportModal} fullWidth maxWidth="sm">
        <DialogTitle>Report Post</DialogTitle>
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
              <MenuItem value="impersonation">Impersonation</MenuItem>
              <MenuItem value="other">Other</MenuItem>
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
    </StyledCard>
  );
};

export default PostCard; 