import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Divider,
  Chip,
  Rating,
  Avatar,
  TextField,
  Grid,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  VisibilityOff as VisibilityOffIcon,
  InsertLink as InsertLinkIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Forum as ForumIcon,
  Person as PersonIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';

const MentalHealthResourceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isAnonymousReview, setIsAnonymousReview] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [relatedResources, setRelatedResources] = useState([]);
  const [openReviewDialog, setOpenReviewDialog] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  
  useEffect(() => {
    const fetchResourceDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch resource details
        const resourceResponse = await axios.get(`/api/mental-health/resources/${id}`);
        setResource(resourceResponse.data);
        
        // Check if user has saved this resource
        if (user) {
          const savedStatusResponse = await axios.get(`/api/mental-health/resources/${id}/saved`);
          setIsSaved(savedStatusResponse.data.isSaved);
          
          // Check if user has already rated this resource
          const userRatingResponse = await axios.get(`/api/mental-health/resources/${id}/user-rating`);
          if (userRatingResponse.data.rating) {
            setUserRating(userRatingResponse.data.rating);
          }
        }
        
        // Fetch reviews
        const reviewsResponse = await axios.get(`/api/mental-health/resources/${id}/reviews`);
        setReviews(reviewsResponse.data);
        
        // Fetch related resources
        const relatedResponse = await axios.get(`/api/mental-health/resources/${id}/related`);
        setRelatedResources(relatedResponse.data);
        
        // Fetch comments
        const commentsResponse = await axios.get(`/api/mental-health/resources/${id}/comments`);
        setComments(commentsResponse.data);
      } catch (err) {
        console.error('Error fetching resource details:', err);
        setError('Failed to load resource details.');
        toast.error('Failed to load resource details');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchResourceDetails();
    }
  }, [id, user]);
  
  const handleSaveResource = async () => {
    try {
      if (isSaved) {
        await axios.delete(`/api/mental-health/resources/${id}/save`);
        toast.success('Resource removed from saved resources');
      } else {
        await axios.post(`/api/mental-health/resources/${id}/save`);
        toast.success('Resource saved successfully');
      }
      setIsSaved(!isSaved);
    } catch (err) {
      console.error('Error saving resource:', err);
      toast.error('Failed to save resource');
    }
  };
  
  const handleRatingChange = async (event, newValue) => {
    setUserRating(newValue);
    
    try {
      await axios.post(`/api/mental-health/resources/${id}/rate`, { rating: newValue });
      toast.success('Rating submitted successfully');
      
      // Refresh resource to update average rating
      const resourceResponse = await axios.get(`/api/mental-health/resources/${id}`);
      setResource(resourceResponse.data);
    } catch (err) {
      console.error('Error submitting rating:', err);
      toast.error('Failed to submit rating');
    }
  };
  
  const handleSubmitReview = async () => {
    if (!reviewText.trim()) {
      toast.error('Please enter a review');
      return;
    }
    
    try {
      const response = await axios.post(`/api/mental-health/resources/${id}/review`, {
        content: reviewText,
        isAnonymous: isAnonymousReview
      });
      
      setReviews([response.data, ...reviews]);
      setReviewText('');
      setIsAnonymousReview(false);
      setOpenReviewDialog(false);
      toast.success('Review submitted successfully');
    } catch (err) {
      console.error('Error submitting review:', err);
      toast.error('Failed to submit review');
    }
  };
  
  const handleAddComment = async (e) => {
    e.preventDefault();
    
    if (!commentText.trim()) return;
    
    try {
      const response = await axios.post(`/api/mental-health/resources/${id}/comments`, {
        content: commentText,
        userId: user.id,
      });

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      const newComment = await response.data;
      setComments([...comments, newComment]);
      setCommentText('');
      toast.success('Comment added successfully');
    } catch (err) {
      console.error('Error adding comment:', err);
      toast.error('Failed to add comment. Please try again.');
    }
  };
  
  const getContactIcon = (type) => {
    switch (type) {
      case 'website':
        return <InsertLinkIcon />;
      case 'phone':
        return <PhoneIcon />;
      case 'email':
        return <EmailIcon />;
      case 'chat':
        return <ForumIcon />;
      case 'person':
        return <PersonIcon />;
      default:
        return <InsertLinkIcon />;
    }
  };
  
  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  if (error || !resource) {
    return (
      <Container maxWidth="lg">
        <Box textAlign="center" p={3}>
          <Typography variant="h6" color="error">{error || 'Resource not found'}</Typography>
          <Button variant="contained" color="primary" onClick={() => navigate('/mental-health/resources')} sx={{ mt: 2 }}>
            Back to Resources
          </Button>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg">
      <Box py={4}>
        {/* Back button */}
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={() => navigate('/mental-health/resources')}
          sx={{ mb: 3 }}
        >
          Back to Resources
        </Button>
        
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
              {resource.name}
            </Typography>
            
            <Box display="flex" alignItems="center" mb={1}>
              <Chip 
                label={resource.category} 
                color="primary"
                size="small"
                sx={{ mr: 1 }}
              />
              {resource.isAnonymouslyAccessible && (
                <Chip 
                  icon={<VisibilityOffIcon />}
                  label="Anonymous Access" 
                  color="secondary"
                  size="small"
                  sx={{ mr: 1 }}
                />
              )}
              {resource.isFree && (
                <Chip 
                  label="Free" 
                  color="success"
                  size="small"
                />
              )}
            </Box>
            
            <Box display="flex" alignItems="center" mb={2}>
              <Rating 
                value={resource.averageRating} 
                precision={0.5} 
                readOnly 
                sx={{ mr: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                ({resource.totalRatings} ratings)
              </Typography>
            </Box>
          </Box>
          
          <Button
            variant={isSaved ? "contained" : "outlined"}
            color="primary"
            startIcon={isSaved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
            onClick={handleSaveResource}
          >
            {isSaved ? 'Saved' : 'Save'}
          </Button>
        </Box>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom>About this Resource</Typography>
              <Typography variant="body1" paragraph>
                {resource.description}
              </Typography>
              
              {resource.services && resource.services.length > 0 && (
                <>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Services Offered
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1} mb={3}>
                    {resource.services.map((service, index) => (
                      <Chip key={index} label={service} variant="outlined" />
                    ))}
                  </Box>
                </>
              )}
              
              {resource.availability && (
                <>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Availability
                  </Typography>
                  <Box display="flex" alignItems="center" mb={3}>
                    <AccessTimeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {resource.availability}
                    </Typography>
                  </Box>
                </>
              )}
              
              {resource.accessInstructions && (
                <>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    How to Access
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {resource.accessInstructions}
                  </Typography>
                </>
              )}
              
              {resource.contactOptions && resource.contactOptions.length > 0 && (
                <>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Contact Options
                  </Typography>
                  <List>
                    {resource.contactOptions.map((contact, index) => (
                      <ListItem key={index} disablePadding sx={{ mb: 1 }}>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          {getContactIcon(contact.type)}
                        </ListItemIcon>
                        <ListItemText
                          primary={contact.label}
                          secondary={contact.description}
                        />
                        {contact.value && (
                          <Button
                            variant="outlined"
                            size="small"
                            href={contact.type === 'email' ? `mailto:${contact.value}` : 
                                  contact.type === 'phone' ? `tel:${contact.value}` : 
                                  contact.value}
                            target={contact.type === 'website' || contact.type === 'chat' ? '_blank' : '_self'}
                            rel="noopener noreferrer"
                          >
                            {contact.type === 'website' || contact.type === 'chat' ? 'Visit' : 
                             contact.type === 'email' ? 'Email' : 
                             contact.type === 'phone' ? 'Call' : 'Contact'}
                          </Button>
                        )}
                      </ListItem>
                    ))}
                  </List>
                </>
              )}
            </Paper>
            
            <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6">
                  Reviews ({reviews.length})
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setOpenReviewDialog(true)}
                >
                  Write a Review
                </Button>
              </Box>
              
              {reviews.length === 0 ? (
                <Typography variant="body1" textAlign="center" py={3}>
                  No reviews yet. Be the first to share your experience!
                </Typography>
              ) : (
                reviews.map((review) => (
                  <Box key={review._id} mb={3}>
                    <Box display="flex" alignItems="flex-start" mb={1}>
                      {!review.isAnonymous && review.author ? (
                        <Avatar 
                          src={review.author.profilePicture} 
                          alt={review.author.name}
                          sx={{ mr: 2, width: 40, height: 40 }}
                        />
                      ) : (
                        <Avatar sx={{ mr: 2, width: 40, height: 40, bgcolor: 'secondary.main' }}>
                          <VisibilityOffIcon fontSize="small" />
                        </Avatar>
                      )}
                      <Box flexGrow={1}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {!review.isAnonymous && review.author ? review.author.name : 'Anonymous User'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatDistanceToNow(new Date(review.createdAt))} ago
                        </Typography>
                      </Box>
                      {review.rating > 0 && (
                        <Rating value={review.rating} readOnly size="small" />
                      )}
                    </Box>
                    <Typography variant="body1" sx={{ ml: 7 }}>
                      {review.content}
                    </Typography>
                    <Divider sx={{ mt: 2 }} />
                  </Box>
                ))
              )}
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom>Rate this Resource</Typography>
              
              <Box display="flex" alignItems="center" mb={2}>
                <Rating
                  name="user-rating"
                  value={userRating}
                  onChange={handleRatingChange}
                  precision={0.5}
                  size="large"
                />
                <Typography variant="body2" color="text.secondary" ml={1}>
                  {userRating > 0 ? `Your rating: ${userRating}/5` : 'Not rated yet'}
                </Typography>
              </Box>
              
              <Alert severity="info" sx={{ mb: 2 }}>
                Your rating helps others find quality mental health resources.
              </Alert>
            </Paper>
            
            {relatedResources.length > 0 && (
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Related Resources</Typography>
                
                {relatedResources.map((related) => (
                  <Card 
                    key={related._id} 
                    sx={{ mb: 2, cursor: 'pointer', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-3px)', boxShadow: 3 } }}
                    onClick={() => navigate(`/mental-health/resources/${related._id}`)}
                  >
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {related.name}
                      </Typography>
                      <Box display="flex" alignItems="center" mb={1}>
                        <Chip 
                          label={related.category} 
                          color="primary"
                          size="small"
                          sx={{ mr: 1 }}
                        />
                        {related.isAnonymouslyAccessible && (
                          <Chip 
                            icon={<VisibilityOffIcon />}
                            label="Anonymous" 
                            color="secondary"
                            size="small"
                          />
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {related.description.substring(0, 100)}...
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Paper>
            )}
          </Grid>
        </Grid>
      </Box>
      
      {/* Review Dialog */}
      <Dialog open={openReviewDialog} onClose={() => setOpenReviewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Write a Review</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Share your experience with this resource to help other women in the community.
          </Typography>
          
          <TextField
            label="Your Review"
            multiline
            rows={6}
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            fullWidth
            margin="normal"
          />
          
          <Box display="flex" alignItems="center" mt={2}>
            <Typography variant="body2" mr={2}>Post anonymously:</Typography>
            <Chip
              label={isAnonymousReview ? "Yes" : "No"}
              color={isAnonymousReview ? "secondary" : "default"}
              onClick={() => setIsAnonymousReview(!isAnonymousReview)}
              sx={{ cursor: 'pointer' }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReviewDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmitReview} variant="contained" color="primary">
            Submit Review
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MentalHealthResourceDetail;
