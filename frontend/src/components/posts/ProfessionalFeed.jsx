import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Box, Typography, CircularProgress, Divider, Button } from '@mui/material';
import Post from './Post';
import CreatePost from './CreatePost';
import { useAuth } from '../../context/AuthContext';

const ProfessionalFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { currentUser } = useAuth();

  const loadPosts = useCallback(async (pageNum = 1, append = false) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get(`/api/posts/professional?page=${pageNum}&limit=10`);
      
      if (response.data.length < 10) {
        setHasMore(false);
      }
      
      setPosts(prev => append ? [...prev, ...response.data] : response.data);
    } catch (err) {
      setError('Failed to load posts. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts(1, false);
  }, [loadPosts]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadPosts(nextPage, true);
  };

  const handlePostCreated = (newPost) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
  };

  if (loading && posts.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && posts.length === 0) {
    return (
      <Box sx={{ my: 4, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
        <Button 
          variant="outlined" 
          sx={{ mt: 2 }}
          onClick={() => loadPosts(1, false)}
        >
          Try Again
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <CreatePost onPostCreated={handlePostCreated} />
      
      <Divider sx={{ my: 3 }} />
      
      <Typography variant="h6" sx={{ mb: 2 }}>
        Professional Feed
      </Typography>
      
      {posts.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">
            No posts yet. Be the first to share a professional update!
          </Typography>
        </Box>
      ) : (
        <>
          {posts.map(post => (
            <Post 
              key={post._id} 
              post={post} 
              currentUser={currentUser}
            />
          ))}
          
          {hasMore && (
            <Box sx={{ textAlign: 'center', my: 3 }}>
              <Button 
                variant="outlined" 
                onClick={handleLoadMore}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Load More'}
              </Button>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default ProfessionalFeed; 