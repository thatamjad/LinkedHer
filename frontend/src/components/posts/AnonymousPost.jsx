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
  ListItemText
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
  Videocam as VideoIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useAnonymous } from '../../context/AnonymousContext';

const AnonymousPost = ({ post, onLike, onComment, onShare }) => {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentLifespan, setCommentLifespan] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [showReportMenu, setShowReportMenu] = useState(false);
  
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
  
  return (
    <Card sx={{ 
      mb: 3,
      border: isEphemeral ? '1px solid rgba(139, 95, 191, 0.3)' : 'none',
      position: 'relative',
      overflow: 'visible'
    }}>
      {/* Ephemeral indicator */}
      {isEphemeral && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            bgcolor: 'rgba(139, 95, 191, 0.2)',
            zIndex: 1,
            overflow: 'hidden'
          }}
        >
          <Box
            sx={{
              height: '100%',
              width: `${calculateProgress()}%`,
              bgcolor: 'secondary.main',
              transition: 'width 1s linear'
            }}
          />
        </Box>
      )}
      
      {/* Post header */}
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar 
              src={post.persona?.avatarUrl} 
              sx={{ 
                width: 40, 
                height: 40, 
                mr: 1.5,
                bgcolor: !post.persona?.avatarUrl ? 'secondary.main' : 'inherit'
              }}
            >
              {!post.persona?.avatarUrl && post.persona?.displayName?.charAt(0)}
            </Avatar>
            
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                {post.persona?.displayName || 'Anonymous User'}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </Typography>
                
                <Chip 
                  size="small" 
                  label="Anonymous" 
                  variant="outlined"
                  color="secondary"
                  icon={<VisibilityOffIcon style={{ fontSize: '0.7rem' }} />}
                  sx={{ height: 20, fontSize: '0.7rem' }}
                />
                
                {isEphemeral && (
                  <Chip 
                    size="small" 
                    icon={<TimerIcon style={{ fontSize: '0.7rem' }} />}
                    label={formatTimeRemaining()}
                    sx={{ 
                      ml: 0.5, 
                      height: 20, 
                      fontSize: '0.7rem',
                      bgcolor: 'rgba(139, 95, 191, 0.1)'
                    }}
                  />
                )}
              </Box>
            </Box>
          </Box>
          
          <IconButton size="small" onClick={handleMenuOpen}>
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Box>
        
        {/* Post content */}
        <Typography variant="body1" paragraph>
          {post.content}
        </Typography>
        
        {/* Post media */}
        {post.imageUrl && (
          <Box 
            component="img" 
            src={post.imageUrl} 
            alt="Post image" 
            sx={{ 
              width: '100%', 
              borderRadius: 1,
              mb: 1.5
            }}
          />
        )}
        
        {post.videoUrl && (
          <Box 
            component="video" 
            src={post.videoUrl} 
            controls
            sx={{ 
              width: '100%', 
              borderRadius: 1,
              mb: 1.5
            }}
          />
        )}
        
        {/* Stats row */}
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            color: 'text.secondary',
            fontSize: '0.875rem',
            mt: 1
          }}
        >
          <Box>
            {post.likesCount > 0 && (
              <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                <FavoriteIcon color="error" sx={{ fontSize: '0.875rem', mr: 0.5 }} />
                {post.likesCount} {post.likesCount === 1 ? 'like' : 'likes'}
              </Box>
            )}
          </Box>
          
          <Box>
            {post.commentsCount > 0 && (
              <Box 
                component="span" 
                sx={{ cursor: 'pointer' }}
                onClick={() => setCommentsOpen(true)}
              >
                {post.commentsCount} {post.commentsCount === 1 ? 'comment' : 'comments'}
              </Box>
            )}
          </Box>
        </Box>
      </CardContent>
      
      <Divider />
      
      {/* Actions */}
      <CardActions sx={{ justifyContent: 'space-between' }}>
        <Box>
          <IconButton 
            size="small" 
            color={post.isLiked ? 'error' : 'default'}
            onClick={() => onLike(post._id)}
          >
            {post.isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          </IconButton>
          
          <IconButton 
            size="small" 
            onClick={() => setCommentsOpen(!commentsOpen)}
            color={commentsOpen ? 'primary' : 'default'}
          >
            <CommentIcon />
          </IconButton>
          
          <IconButton size="small" onClick={handleShare}>
            <ShareIcon />
          </IconButton>
        </Box>
        
        <Box>
          {post.postType !== 'TEXT' && (
            <Tooltip title={post.postType === 'IMAGE' ? 'Image Post' : 'Video Post'}>
              <Box component="span" sx={{ display: 'inline-flex', mr: 1 }}>
                {post.postType === 'IMAGE' ? (
                  <ImageIcon fontSize="small" color="action" />
                ) : (
                  <VideoIcon fontSize="small" color="action" />
                )}
              </Box>
            </Tooltip>
          )}
          
          <Button 
            size="small" 
            component={Link} 
            to={`/anonymous/post/${post._id}`}
            sx={{ ml: 1 }}
          >
            View Details
          </Button>
        </Box>
      </CardActions>
      
      {/* Comments section */}
      <Collapse in={commentsOpen} timeout="auto" unmountOnExit>
        <CardContent sx={{ pt: 0 }}>
          <Divider sx={{ mb: 2 }} />
          
          <Typography variant="subtitle2" gutterBottom>
            Comments
          </Typography>
          
          {/* Comment list */}
          {post.comments && post.comments.length > 0 ? (
            <Box>
              {post.comments.map((comment) => (
                <Paper 
                  key={comment._id} 
                  variant="outlined" 
                  sx={{ p: 1.5, mb: 1.5, bgcolor: 'background.paper' }}
                >
                  <Box sx={{ display: 'flex', mb: 1 }}>
                    <Avatar 
                      src={comment.persona?.avatarUrl} 
                      sx={{ 
                        width: 28, 
                        height: 28, 
                        mr: 1,
                        bgcolor: !comment.persona?.avatarUrl ? 'secondary.main' : 'inherit',
                        fontSize: '0.875rem'
                      }}
                    >
                      {!comment.persona?.avatarUrl && comment.persona?.displayName?.charAt(0)}
                    </Avatar>
                    
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {comment.persona?.displayName || 'Anonymous User'}
                        </Typography>
                        
                        <Typography variant="caption" color="text.secondary">
                          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </Typography>
                      </Box>
                      
                      <Typography variant="body2">
                        {comment.text}
                      </Typography>
                    </Box>
                  </Box>
                  
                  {comment.disappearsAt && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      <TimerIcon sx={{ fontSize: '0.75rem', color: 'text.secondary', mr: 0.5 }} />
                      <Typography variant="caption" color="text.secondary">
                        Disappears {formatDistanceToNow(new Date(comment.disappearsAt), { addSuffix: true })}
                      </Typography>
                    </Box>
                  )}
                </Paper>
              ))}
              
              {post.commentsCount > post.comments.length && (
                <Button 
                  size="small" 
                  sx={{ mt: 1 }}
                  component={Link}
                  to={`/anonymous/post/${post._id}`}
                >
                  View All Comments
                </Button>
              )}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ my: 2 }}>
              No comments yet. Be the first to comment!
            </Typography>
          )}
          
          {/* Comment form */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mt: 2 }}>
            <Avatar 
              sx={{ 
                width: 32, 
                height: 32, 
                mr: 1.5,
                bgcolor: 'secondary.main'
              }}
            />
            
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                multiline
                maxRows={4}
                sx={{ mb: 1 }}
              />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Tooltip title="Make this an ephemeral comment that disappears">
                  <Chip
                    icon={<TimerIcon />}
                    label={commentLifespan ? `${commentLifespan}h` : "Permanent"}
                    onClick={() => setCommentLifespan(commentLifespan === 0 ? 24 : commentLifespan === 24 ? 72 : 0)}
                    variant={commentLifespan > 0 ? "filled" : "outlined"}
                    size="small"
                    color={commentLifespan > 0 ? "secondary" : "default"}
                  />
                </Tooltip>
                
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  endIcon={submitting ? <CircularProgress size={16} /> : <SendIcon />}
                  onClick={handleCommentSubmit}
                  disabled={!commentText.trim() || submitting}
                >
                  Comment
                </Button>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Collapse>
      
      {/* Post options menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        {!showReportMenu ? (
          <>
            <MenuItem onClick={handleCopyLink}>
              <ListItemIcon>
                <CopyIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Copy Link</ListItemText>
            </MenuItem>
            
            <MenuItem onClick={handleShare}>
              <ListItemIcon>
                <ShareIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Share</ListItemText>
            </MenuItem>
            
            <Divider />
            
            <MenuItem onClick={() => setShowReportMenu(true)}>
              <ListItemIcon>
                <FlagIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>Report</ListItemText>
            </MenuItem>
          </>
        ) : (
          <>
            <MenuItem onClick={handleMenuClose}>
              <ListItemIcon>
                <FlagIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>Report Inappropriate Content</ListItemText>
            </MenuItem>
            
            <MenuItem onClick={handleMenuClose}>
              <ListItemIcon>
                <BlockIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>Block Anonymous User</ListItemText>
            </MenuItem>
            
            <Divider />
            
            <MenuItem onClick={() => setShowReportMenu(false)}>
              <ListItemText>Back</ListItemText>
            </MenuItem>
          </>
        )}
      </Menu>
    </Card>
  );
};

export default AnonymousPost; 