import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Fab
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';
import PostCard from '../components/posts/PostCard';

const Feed = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get('/posts', {
        params: { page, limit: 10 },
      });
      setPosts((prev) => [...prev, ...data.data]);
      setHasMore(data.currentPage < data.totalPages);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const lastPostElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  const handleLikeToggle = (postId, newLikes) => {
    setPosts(posts.map(p => p._id === postId ? { ...p, engagement: { ...p.engagement, likes: newLikes } } : p));
  };
  
  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Professional Feed
        </Typography>
        
        {posts.length === 0 && !loading && (
          <Paper sx={{ p: 4, textAlign: 'center', mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              The feed is quiet...
            </Typography>
            <Typography color="text.secondary">
              Be the first to share an update, ask a question, or celebrate a win.
            </Typography>
          </Paper>
        )}

        <Box sx={{ mt: 3 }}>
          {posts.map((post, index) => {
            if (posts.length === index + 1) {
              return <div ref={lastPostElementRef} key={post._id}><PostCard post={post} onLikeToggle={handleLikeToggle} /></div>;
            } else {
              return <PostCard key={post._id} post={post} onLikeToggle={handleLikeToggle} />;
            }
          })}
        </Box>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
        )}
        
        {!hasMore && posts.length > 0 && (
          <Typography textAlign="center" sx={{ color: 'text.secondary', my: 4 }}>
            You've reached the end of the feed.
          </Typography>
        )}

        <Fab 
          color="primary" 
          aria-label="add" 
          sx={{ position: 'fixed', bottom: 32, right: 32 }}
          onClick={() => navigate('/create-post')}
        >
          <AddIcon />
        </Fab>
      </Box>
    </Container>
  );
};

export default Feed;
