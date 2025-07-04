import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Container, 
  Grid, 
  Box, 
  Typography, 
  Paper, 
  Divider,
  IconButton,
  CircularProgress,
  Alert,
  Fade,
  Drawer,
  useTheme,
  useMediaQuery,
  Fab,
  Button
} from '@mui/material';
import { 
  Info, 
  Refresh, 
  VisibilityOff,
  Security,
  Fingerprint,
  KeyboardArrowUp,
  Add as AddIcon
} from '@mui/icons-material';
import { useAnonymous } from '../context/AnonymousContext';
import AnonymousPostForm from '../components/posts/AnonymousPostForm';
import AnonymousPost from '../components/posts/AnonymousPost';
import ModeToggle from '../components/ui/ModeToggle';

const AnonymousFeed = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { 
    anonymousMode, 
    activePersona, 
    getAnonymousFeed, 
    createAnonymousPost, 
    toggleLike,
    addComment,
    anonymousApiClient
  } = useAnonymous();
  
  // State for feed
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // State for info drawer
  const [infoOpen, setInfoOpen] = useState(false);
  
  // State for scroll to top button
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  // State for form open
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Observer for infinite scrolling
  const observer = useRef();
  
  // Load anonymous feed
  const loadFeed = useCallback(async (pageNum) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await anonymousApiClient.get('/anonymous/feed', {
        params: { page: pageNum, limit: 10 },
      });
      setPosts((prev) => pageNum === 1 ? data.posts : [...prev, ...data.posts]);
      setHasMore(data.pagination.page < data.pagination.pages);
    } catch (err) {
      setError('Failed to load anonymous posts.');
    } finally {
      setLoading(false);
    }
  }, [anonymousApiClient]);
  
  // Handle post creation
  const handlePostCreated = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
    setIsFormOpen(false);
  };
  
  // Handle post like
  const handleLike = async (postId) => {
    try {
      const result = await toggleLike(postId);
      
      // Update post in state
      setPosts(prev => 
        prev.map(post => {
          if (post._id === postId) {
            return {
              ...post,
              isLiked: result.isLiked,
              likesCount: result.likesCount
            };
          }
          return post;
        })
      );
    } catch (err) {
      console.error('Like error:', err);
    }
  };
  
  // Handle comment submission
  const handleComment = async (postId, content, lifespan) => {
    try {
      const result = await addComment(postId, content, lifespan);
      
      // Update post in state
      setPosts(prev => 
        prev.map(post => {
          if (post._id === postId) {
            return {
              ...post,
              comments: [result.comment, ...(post.comments || [])],
              commentsCount: (post.commentsCount || 0) + 1
            };
          }
          return post;
        })
      );
    } catch (err) {
      console.error('Comment error:', err);
    }
  };
  
  // Handle scroll events for scroll-to-top button
  const handleScroll = () => {
    if (window.scrollY > 300) {
      setShowScrollTop(true);
    } else {
      setShowScrollTop(false);
    }
  };
  
  // Scroll to top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  // Load initial feed
  useEffect(() => {
    loadFeed(1);
    
    // Add scroll listener
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [loadFeed]);
  
  // Infinite scrolling observer
  const lastPostElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
        loadFeed(page + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore, page, loadFeed]);
  
  // Info drawer content
  const infoDrawerContent = (
    <Box sx={{ width: isMobile ? '100vw' : 350, p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Fingerprint color="primary" />
        Anonymous Mode
      </Typography>
      
      <Divider sx={{ mb: 3 }} />
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Current Persona
        </Typography>
        <Paper sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="body1">
            {activePersona?.name || 'No active persona'}
          </Typography>
          {activePersona && (
            <Typography variant="caption" color="text.secondary">
              ID: {activePersona?.personaId?.slice(-6) || 'Unknown'}
            </Typography>
          )}
        </Paper>
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Privacy Features
        </Typography>
        <Paper sx={{ p: 2, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <VisibilityOff color="primary" sx={{ mr: 2 }} />
            <Box>
              <Typography variant="body2" fontWeight={500}>
                Hidden Identity
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Your real identity is hidden from other users
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Security color="primary" sx={{ mr: 2 }} />
            <Box>
              <Typography variant="body2" fontWeight={500}>
                Metadata Stripping
              </Typography>
              <Typography variant="caption" color="text.secondary">
                All uploaded media has identifying metadata removed
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
      
      <Button 
        variant="contained" 
        fullWidth 
        onClick={() => setInfoOpen(false)}
        sx={{ mt: 2 }}
      >
        Close
      </Button>
    </Box>
  );
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        {/* Left sidebar - empty for now */}
        <Grid item xs={0} md={3} sx={{ display: { xs: 'none', md: 'block' } }}>
          
        </Grid>
        
        {/* Main content */}
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" component="h1" fontWeight={600}>
              Anonymous Feed
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton onClick={() => setInfoOpen(true)}>
                <Info />
              </IconButton>
              
              <ModeToggle />
            </Box>
          </Box>
          
          {anonymousMode && activePersona ? (
            <>
              <AnonymousPostForm 
                open={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onPostCreated={handlePostCreated}
              />
              
              {posts.map((post, index) => {
                const isLastPost = index === posts.length - 1;
                return (
                  <div ref={isLastPost ? lastPostElementRef : null} key={post._id}>
                    <AnonymousPost 
                      post={post}
                      onLike={handleLike}
                      onComment={handleComment}
                    />
                  </div>
                );
              })}
              
              {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              )}

              {error && <Alert severity="error">{error}</Alert>}

              {!hasMore && posts.length > 0 && (
                <Typography textAlign="center" color="text.secondary" sx={{ my: 4 }}>
                  You've reached the end of the anonymous space.
                </Typography>
              )}
            </>
          ) : (
            <Paper 
              sx={{ 
                p: 4, 
                borderRadius: 2,
                background: 'linear-gradient(145deg, #1E1E1E 0%, #2D2D2D 100%)',
              }}
            >
              <Alert 
                severity="info" 
                sx={{ mb: 2 }}
                icon={<VisibilityOff />}
              >
                Anonymous Mode is not active
              </Alert>
              
              <Typography variant="body1" paragraph>
                You need to activate Anonymous Mode to view and create anonymous posts.
              </Typography>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                Use the avatar button in the top right to switch to Anonymous Mode or create a new persona.
              </Typography>
            </Paper>
          )}
        </Grid>
        
        {/* Right sidebar - empty for now */}
        <Grid item xs={0} md={3} sx={{ display: { xs: 'none', md: 'block' } }}>
          
        </Grid>
      </Grid>
      
      {/* Information drawer */}
      <Drawer
        anchor={isMobile ? 'bottom' : 'right'}
        open={infoOpen}
        onClose={() => setInfoOpen(false)}
      >
        {infoDrawerContent}
      </Drawer>
      
      {/* Scroll to top button */}
      <Fade in={showScrollTop}>
        <Fab 
          color="primary" 
          size="small" 
          aria-label="scroll to top"
          onClick={scrollToTop}
          sx={{ 
            position: 'fixed', 
            bottom: 20, 
            right: 20,
            zIndex: 2
          }}
        >
          <KeyboardArrowUp />
        </Fab>
      </Fade>
      
      <Fab
        color="secondary"
        aria-label="create anonymous post"
        sx={{ position: 'fixed', bottom: 32, right: 32 }}
        onClick={() => setIsFormOpen(true)}
      >
        <AddIcon />
      </Fab>
    </Container>
  );
};

export default AnonymousFeed; 