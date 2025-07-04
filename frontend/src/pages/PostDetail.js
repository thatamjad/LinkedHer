import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Avatar, Button, TextField, Divider, CircularProgress, Container } from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../context/AuthContext';

const PostDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPostData = async () => {
      try {
        // This is a placeholder for an actual API call
        // In a real application, you would fetch from your backend
        const response = await fetch(`/api/posts/${postId}`);
        if (!response.ok) {
          throw new Error('Failed to load post');
        }
        const data = await response.json();
        setPost(data.post);
        setComments(data.comments);
      } catch (err) {
        console.error('Error fetching post:', err);
        setError('Failed to load post. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPostData();
  }, [postId]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    
    if (!commentText.trim()) return;
    
    try {
      // This is a placeholder for an actual API call
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: commentText,
          userId: currentUser.id
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add comment');
      }
      
      const newComment = await response.json();
      setComments([...comments, newComment]);
      setCommentText('');
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Failed to add comment. Please try again.');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!post) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography>Post not found.</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 3, mb: 3, mt: 3 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar 
            src={post.author.profileImageUrl} 
            alt={post.author.name}
            sx={{ mr: 2 }}
          />
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">
              {post.author.name}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {post.author.title}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </Typography>
          </Box>
        </Box>
        
        <Typography variant="h5" gutterBottom>
          {post.title}
        </Typography>
        
        <Typography variant="body1" paragraph>
          {post.content}
        </Typography>
        
        {post.imageUrl && (
          <Box my={2}>
            <img 
              src={post.imageUrl} 
              alt="Post" 
              style={{ maxWidth: '100%', borderRadius: 8 }}
            />
          </Box>
        )}
        
        <Box display="flex" gap={1}>
          <Button variant="outlined" size="small">
            Like ({post.likes || 0})
          </Button>
          <Button variant="outlined" size="small">
            Share
          </Button>
        </Box>
      </Paper>
      
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Comments ({comments.length})
        </Typography>
        
        <Box component="form" onSubmit={handleAddComment} mb={3}>
          <TextField
            fullWidth
            label="Add a comment"
            multiline
            rows={2}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <Button 
            type="submit" 
            variant="contained" 
            disabled={!commentText.trim()}
          >
            Post Comment
          </Button>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        {comments.length === 0 ? (
          <Typography variant="body2" color="textSecondary" textAlign="center" py={2}>
            No comments yet. Be the first to comment!
          </Typography>
        ) : (
          comments.map((comment) => (
            <Box key={comment.id} mb={2} p={2} sx={{ backgroundColor: 'background.default', borderRadius: 1 }}>
              <Box display="flex" alignItems="center" mb={1}>
                <Avatar 
                  src={comment.author.profileImageUrl} 
                  alt={comment.author.name}
                  sx={{ width: 32, height: 32, mr: 1 }}
                />
                <Box>
                  <Typography variant="subtitle2">
                    {comment.author.name}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2">
                {comment.content}
              </Typography>
            </Box>
          ))
        )}
      </Paper>
    </Container>
  );
};

export default PostDetail; 