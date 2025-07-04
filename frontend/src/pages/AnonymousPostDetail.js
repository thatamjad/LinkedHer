import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Box, 
  Paper, 
  Typography, 
  Divider, 
  Avatar, 
  TextField, 
  Button, 
  IconButton,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link,
  LinearProgress,
  Stack
} from '@mui/material';
import { 
  Masks, 
  FavoriteOutlined, 
  FavoriteBorderOutlined, 
  ArrowBack,
  Send,
  Share,
  Delete,
  Flag,
  Schedule
} from '@mui/icons-material';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAnonymous } from '../context/AnonymousContext';
import PrivacyIndicator, { PRIVACY_LEVELS, LIFESPAN_TYPES } from '../components/ui/PrivacyIndicator';
import ModeToggle from '../components/ui/ModeToggle';

const AnonymousPostDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { 
    anonymousMode, 
    activePersona, 
    anonymousAxios,
    toggleLike,
    addComment
  } = useAnonymous();
  
  // State for post data
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for comments
  const [comment, setComment] = useState('');
  const [commentLifespan, setCommentLifespan] = useState(0); // In hours, 0 means permanent
  const [submittingComment, setSubmittingComment] = useState(false);
  
  // State for disappearing post tracking
  const [timeLeft, setTimeLeft] = useState(null);
  const [progress, setProgress] = useState(100);
  
  // Fetch post data
  const fetchPost = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get the post data
      const response = await anonymousAxios.get(`/anonymous/posts/${postId}`);
      setPost(response.data.post);
      
    } catch (err) {
      console.error('Fetch post error:', err);
      setError('Failed to load post. It may have been deleted or expired.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle post like
  const handleLike = async () => {
    try {
      const result = await toggleLike(postId);
      
      // Update post in state
      setPost(prev => ({
        ...prev,
        isLiked: result.isLiked,
        likesCount: result.likesCount
      }));
    } catch (err) {
      console.error('Like error:', err);
    }
  };
  
  // Handle comment submission
  const handleCommentSubmit = async () => {
    if (!comment.trim()) return;
    
    try {
      setSubmittingComment(true);
      const result = await addComment(postId, comment, commentLifespan);
      
      // Add comment to state
      setPost(prev => ({
        ...prev,
        comments: [result.comment, ...(prev.comments || [])],
        commentsCount: (prev.commentsCount || 0) + 1
      }));
      
      // Clear comment field
      setComment('');
      setCommentLifespan(0);
    } catch (err) {
      console.error('Comment error:', err);
    } finally {
      setSubmittingComment(false);
    }
  };
  
  // Calculate time left and progress for disappearing posts
  useEffect(() => {
    if (post?.lifespanType === LIFESPAN_TYPES.DISAPPEARING && post.expiresAt) {
      const updateTimeLeft = () => {
        const now = new Date();
        const expiry = new Date(post.expiresAt);
        const diffMs = expiry - now;
        
        if (diffMs <= 0) {
          setTimeLeft('Expired');
          setProgress(0);
          return;
        }
        
        // Calculate progress based on total lifespan
        const totalLifespan = post.lifespan * 3600000; // Convert hours to ms
        const elapsedMs = totalLifespan - diffMs;
        const calculatedProgress = 100 - ((elapsedMs / totalLifespan) * 100);
        
        setProgress(Math.max(0, calculatedProgress));
        
        // Set formatted time left
        if (diffMs < 60000) {
          setTimeLeft(`${Math.ceil(diffMs / 1000)} seconds`);
        } else if (diffMs < 3600000) {
          setTimeLeft(`${Math.ceil(diffMs / 60000)} minutes`);
        } else if (diffMs < 86400000) {
          setTimeLeft(`${Math.ceil(diffMs / 3600000)} hours`);
        } else {
          setTimeLeft(`${Math.ceil(diffMs / 86400000)} days`);
        }
      };
      
      updateTimeLeft();
      const interval = setInterval(updateTimeLeft, 10000); // Update every 10 seconds
      
      return () => clearInterval(interval);
    }
  }, [post]);
  
  // Load post on mount
  useEffect(() => {
    fetchPost();
  }, [postId]);
  
  // Generate random avatar color from post ID
  const getAvatarColor = (id) => {
    const colors = [
      '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', 
      '#009688', '#4CAF50', '#8BC34A', '#CDDC39'
    ];
    
    // Use ID to determine color (pseudorandom but consistent)
    const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };
  
  // If not in anonymous mode, show warning
  if (!anonymousMode || !activePersona) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper 
          sx={{ 
            p: 4, 
            borderRadius: 2,
            background: 'linear-gradient(145deg, #1E1E1E 0%, #2D2D2D 100%)',
          }}
        >
          <Alert 
            severity="warning" 
            sx={{ mb: 2 }}
          >
            Anonymous Mode is not active
          </Alert>
          
          <Typography variant="body1" paragraph>
            You need to activate Anonymous Mode to view this post.
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}>
            <Button 
              variant="outlined" 
              startIcon={<ArrowBack />}
              component={RouterLink}
              to="/"
            >
              Back to Home
            </Button>
            <ModeToggle />
          </Box>
        </Paper>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link 
            component={RouterLink} 
            to="/"
            underline="hover"
            color="inherit"
          >
            Home
          </Link>
          <Link 
            component={RouterLink} 
            to="/anonymous"
            underline="hover"
            color="inherit"
          >
            Anonymous Feed
          </Link>
          <Typography color="text.primary">Post</Typography>
        </Breadcrumbs>
      </Box>
      
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBack />}
          onClick={() => navigate('/anonymous')}
        >
          Back to Feed
        </Button>
        <ModeToggle />
      </Box>
      
      {loading ? (
        <Paper 
          sx={{ 
            p: 4, 
            textAlign: 'center',
            borderRadius: 2,
            background: 'linear-gradient(145deg, #1E1E1E 0%, #2D2D2D 100%)',
          }}
        >
          <CircularProgress />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Loading post...
          </Typography>
        </Paper>
      ) : error ? (
        <Paper 
          sx={{ 
            p: 4, 
            borderRadius: 2,
            background: 'linear-gradient(145deg, #1E1E1E 0%, #2D2D2D 100%)',
          }}
        >
          <Alert 
            severity="error" 
            sx={{ mb: 2 }}
          >
            {error}
          </Alert>
          
          <Button 
            variant="contained" 
            startIcon={<ArrowBack />}
            onClick={() => navigate('/anonymous')}
            sx={{ mt: 2 }}
          >
            Back to Anonymous Feed
          </Button>
        </Paper>
      ) : post ? (
        <>
          <Card 
            sx={{ 
              mb: 3, 
              borderRadius: 2,
              position: 'relative',
              overflow: 'visible',
              background: 'linear-gradient(145deg, #1E1E1E 0%, #2D2D2D 100%)',
            }}
          >
            {/* Progress bar for disappearing posts */}
            {post.lifespanType === LIFESPAN_TYPES.DISAPPEARING && (
              <Box sx={{ position: 'absolute', top: -4, left: 0, right: 0, height: 4, zIndex: 1 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={progress} 
                  color="error"
                  sx={{ 
                    height: 4, 
                    borderTopLeftRadius: 12, 
                    borderTopRightRadius: 12 
                  }}
                />
              </Box>
            )}
            
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: getAvatarColor(post._id),
                      width: 48,
                      height: 48,
                      mr: 2
                    }}
                  >
                    <Masks />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {post.authorPersonaName || 'Anonymous'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(post.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
                
                <PrivacyIndicator 
                  privacyLevel={post.privacyLevel || PRIVACY_LEVELS.MEDIUM}
                  lifespanType={post.lifespanType || LIFESPAN_TYPES.PERMANENT}
                  expiresAt={post.expiresAt}
                />
              </Box>
              
              {post.lifespanType === LIFESPAN_TYPES.DISAPPEARING && timeLeft && (
                <Alert 
                  severity="info" 
                  icon={<Schedule />}
                  sx={{ mb: 2 }}
                >
                  This post will disappear in {timeLeft}
                </Alert>
              )}
              
              {post.title && (
                <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
                  {post.title}
                </Typography>
              )}
              
              {post.mediaUrl && (
                <CardMedia
                  component="img"
                  image={post.mediaUrl}
                  alt="Post media"
                  sx={{ 
                    mt: 2,
                    mb: 2,
                    borderRadius: 1,
                    maxHeight: 500,
                    objectFit: 'contain',
                    bgcolor: 'black'
                  }}
                />
              )}
              
              <Typography variant="body1" sx={{ mt: 2, mb: 3, whiteSpace: 'pre-wrap' }}>
                {post.content}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Button 
                    startIcon={post.isLiked ? <FavoriteOutlined color="error" /> : <FavoriteBorderOutlined />}
                    onClick={handleLike}
                    color={post.isLiked ? 'primary' : 'inherit'}
                  >
                    {post.likesCount || 0} {post.likesCount === 1 ? 'Like' : 'Likes'}
                  </Button>
                  
                  <Button
                    startIcon={<Share />}
                  >
                    Share
                  </Button>
                </Box>
                
                <Box>
                  <IconButton>
                    <Flag />
                  </IconButton>
                </Box>
              </Box>
            </Box>
          </Card>
          
          <Card 
            sx={{ 
              mb: 3, 
              borderRadius: 2,
              background: 'linear-gradient(145deg, #1E1E1E 0%, #2D2D2D 100%)',
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Comments
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="Add a comment..."
                  variant="outlined"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  sx={{ mb: 2 }}
                />
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    endIcon={<Send />}
                    onClick={handleCommentSubmit}
                    disabled={!comment.trim() || submittingComment}
                  >
                    {submittingComment ? 'Posting...' : 'Post Comment'}
                  </Button>
                </Box>
              </Box>
              
              <Divider sx={{ my: 3 }} />
              
              {post.comments && post.comments.length > 0 ? (
                <Stack spacing={2}>
                  {post.comments.map((comment) => (
                    <Paper 
                      key={comment._id} 
                      sx={{ 
                        p: 2, 
                        borderRadius: 2,
                        bgcolor: 'background.paper'
                      }}
                    >
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Avatar 
                          sx={{ 
                            bgcolor: getAvatarColor(comment._id),
                            width: 40,
                            height: 40
                          }}
                        >
                          <Masks fontSize="small" />
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="subtitle2">
                              {comment.authorPersonaName || 'Anonymous'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(comment.createdAt).toLocaleString()}
                            </Typography>
                          </Box>
                          <Typography variant="body2">
                            {comment.content}
                          </Typography>
                          
                          {comment.lifespanType === LIFESPAN_TYPES.DISAPPEARING && comment.expiresAt && (
                            <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Schedule fontSize="small" color="error" />
                              <Typography variant="caption" color="error.main">
                                Disappearing comment
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                </Stack>
              ) : (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No comments yet. Be the first to comment!
                </Typography>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </Container>
  );
};

export default AnonymousPostDetail; 