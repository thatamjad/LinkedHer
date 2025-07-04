import React, { useState } from 'react';
import axios from 'axios';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardActions, 
  CardMedia, 
  Avatar, 
  Typography, 
  IconButton, 
  TextField, 
  Button, 
  Box, 
  Collapse, 
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText
} from '@mui/material';
import { 
  ThumbUpOutlined, 
  ThumbUp, 
  CommentOutlined, 
  MoreVert, 
  Send 
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';

const Post = ({ post, currentUser }) => {
  const [expanded, setExpanded] = useState(false);
  const [comment, setComment] = useState('');
  const [liked, setLiked] = useState(post.likes.includes(currentUser?._id));
  const [likeCount, setLikeCount] = useState(post.likes.length);
  const [comments, setComments] = useState(post.comments || []);
  const [submitting, setSubmitting] = useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const handleLike = async () => {
    try {
      const endpoint = `/api/posts/professional/${post._id}/like`;
      const method = liked ? 'delete' : 'post';
      
      await axios[method](endpoint);
      
      setLiked(!liked);
      setLikeCount(prevCount => liked ? prevCount - 1 : prevCount + 1);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setSubmitting(true);
    try {
      const response = await axios.post(`/api/posts/professional/${post._id}/comment`, {
        text: comment
      });

      setComments([...comments, response.data]);
      setComment('');
      if (!expanded) setExpanded(true);
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card sx={{ mb: 3, boxShadow: 2 }}>
      <CardHeader
        avatar={
          <Avatar 
            src={post.userId?.profilePicture} 
            alt={`${post.userId?.firstName} ${post.userId?.lastName}`}
          />
        }
        action={
          <IconButton aria-label="settings">
            <MoreVert />
          </IconButton>
        }
        title={`${post.userId?.firstName} ${post.userId?.lastName}`}
        subheader={`${post.userId?.headline || 'Professional'} • ${
          formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })
        }`}
      />

      <CardContent>
        <Typography variant="body1" color="text.primary" sx={{ whiteSpace: 'pre-wrap' }}>
          {post.content}
        </Typography>
      </CardContent>

      {post.imageUrl && (
        <CardMedia
          component="img"
          image={post.imageUrl}
          alt="Post image"
          sx={{ 
            maxHeight: '500px', 
            objectFit: 'contain',
            bgcolor: 'black'
          }}
        />
      )}

      <CardActions disableSpacing>
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
          <IconButton 
            onClick={handleLike}
            color={liked ? "primary" : "default"}
            aria-label="like post"
          >
            {liked ? <ThumbUp /> : <ThumbUpOutlined />}
          </IconButton>
          <Typography variant="body2" color="text.secondary">
            {likeCount}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            onClick={handleExpandClick}
            aria-expanded={expanded}
            aria-label="show comments"
          >
            <CommentOutlined />
          </IconButton>
          <Typography variant="body2" color="text.secondary">
            {comments.length}
          </Typography>
        </Box>
      </CardActions>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Divider />
        <Box sx={{ p: 2 }}>
          <form onSubmit={handleCommentSubmit}>
            <Box sx={{ display: 'flex' }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Add a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                disabled={submitting}
              />
              <Button 
                type="submit" 
                disabled={!comment.trim() || submitting}
                sx={{ ml: 1 }}
              >
                <Send />
              </Button>
            </Box>
          </form>

          <List sx={{ width: '100%', pt: 2 }}>
            {comments.length > 0 ? (
              comments.map((comment, index) => (
                <ListItem 
                  key={comment._id || index} 
                  alignItems="flex-start" 
                  sx={{ px: 0 }}
                >
                  <ListItemAvatar>
                    <Avatar 
                      src={comment.userId?.profilePicture} 
                      alt={`${comment.userId?.firstName || 'User'}`}
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography 
                        component="span" 
                        variant="body2" 
                        color="text.primary"
                        sx={{ fontWeight: 'bold' }}
                      >
                        {comment.userId?.firstName} {comment.userId?.lastName}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.primary"
                        >
                          {comment.text}
                        </Typography>
                        <Typography
                          component="div"
                          variant="caption"
                          color="text.secondary"
                          sx={{ mt: 0.5 }}
                        >
                          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                No comments yet. Be the first to comment!
              </Typography>
            )}
          </List>
        </Box>
      </Collapse>
    </Card>
  );
};

export default Post; 