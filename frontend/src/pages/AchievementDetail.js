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
  Avatar,
  Grid,
  TextField,
  CircularProgress,
  Alert,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar
} from '@mui/material';
import {
  Verified as VerifiedIcon,
  Celebration as CelebrationIcon,
  EmojiEvents as TrophyIcon,
  CalendarToday as CalendarIcon,
  ThumbUp as ThumbUpIcon,
  Comment as CommentIcon,
  Share as ShareIcon,
  Person as PersonIcon,
  Favorite as HeartIcon
} from '@mui/icons-material';
import { styled } from '@mui/system';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { format, formatDistanceToNow } from 'date-fns';
import Confetti from 'react-confetti';

const CelebrationButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.warning.main,
  color: theme.palette.warning.contrastText,
  '&:hover': {
    backgroundColor: theme.palette.warning.dark,
  },
}));

const VerificationChip = styled(Chip)(({ theme, status }) => ({
  backgroundColor: 
    status === 'verified' ? theme.palette.success.main : 
    status === 'pending' ? theme.palette.warning.main : 
    theme.palette.error.main,
  color: 
    status === 'verified' ? theme.palette.success.contrastText : 
    status === 'pending' ? theme.palette.warning.contrastText : 
    theme.palette.error.contrastText,
}));

const AchievementDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [achievement, setAchievement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [congratulations, setCongratulations] = useState([]);
  const [newCongratulation, setNewCongratulation] = useState('');
  const [loadingCongratulation, setLoadingCongratulation] = useState(false);
  const [openCelebrateDialog, setOpenCelebrateDialog] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  
  useEffect(() => {
    const fetchAchievementDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch achievement details
        const achievementResponse = await axios.get(`/api/achievements/${id}`);
        setAchievement(achievementResponse.data);
        setLikeCount(achievementResponse.data.likes || 0);
        
        // Check if user has already liked this achievement
        if (user) {
          const likeStatusResponse = await axios.get(`/api/achievements/${id}/like-status`);
          setHasLiked(likeStatusResponse.data.hasLiked);
        }
        
        // Fetch congratulations
        const congratulationsResponse = await axios.get(`/api/achievements/${id}/congratulations`);
        setCongratulations(congratulationsResponse.data);
      } catch (err) {
        console.error('Error fetching achievement details:', err);
        setError('Failed to load achievement details.');
        toast.error('Failed to load achievement details');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchAchievementDetails();
    }
  }, [id, user]);
  
  const handleLikeToggle = async () => {
    try {
      if (hasLiked) {
        await axios.delete(`/api/achievements/${id}/like`);
        setLikeCount(prev => prev - 1);
      } else {
        await axios.post(`/api/achievements/${id}/like`);
        setLikeCount(prev => prev + 1);
      }
      setHasLiked(!hasLiked);
    } catch (err) {
      console.error('Error toggling like:', err);
      toast.error('Failed to process your like');
    }
  };
  
  const handleAddCongratulation = async () => {
    if (!newCongratulation.trim()) {
      toast.error('Please enter a congratulation message');
      return;
    }
    
    try {
      setLoadingCongratulation(true);
      
      const response = await axios.post(`/api/achievements/${id}/congratulations`, {
        message: newCongratulation
      });
      
      setCongratulations([response.data, ...congratulations]);
      setNewCongratulation('');
      toast.success('Congratulation added successfully');
    } catch (err) {
      console.error('Error adding congratulation:', err);
      toast.error('Failed to add congratulation');
    } finally {
      setLoadingCongratulation(false);
    }
  };
  
  const handleCelebrate = async () => {
    try {
      await axios.post(`/api/achievements/${id}/celebrate`, {
        message: celebrationMessage
      });
      
      setOpenCelebrateDialog(false);
      setCelebrationMessage('');
      
      // Show confetti animation
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
      
      toast.success('Achievement celebrated!');
      
      // Refresh achievement data
      const achievementResponse = await axios.get(`/api/achievements/${id}`);
      setAchievement(achievementResponse.data);
    } catch (err) {
      console.error('Error celebrating achievement:', err);
      toast.error('Failed to celebrate achievement');
    }
  };
  
  const handleShare = async () => {
    try {
      const shareData = {
        title: `${achievement.user.name}'s Achievement: ${achievement.title}`,
        text: `Check out ${achievement.user.name}'s achievement: ${achievement.title}`,
        url: window.location.href
      };
      
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback - copy link to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard');
      }
    } catch (err) {
      console.error('Error sharing achievement:', err);
      toast.error('Failed to share achievement');
    }
  };
  
  if (loading) {
    return (
      <Container maxWidth="md">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  if (error || !achievement) {
    return (
      <Container maxWidth="md">
        <Box textAlign="center" p={3}>
          <Typography variant="h6" color="error">{error || 'Achievement not found'}</Typography>
          <Button variant="contained" color="primary" onClick={() => navigate('/achievements')} sx={{ mt: 2 }}>
            Back to Achievements
          </Button>
        </Box>
      </Container>
    );
  }
  
  const isOwnAchievement = user && achievement.user._id === user._id;
  
  return (
    <Container maxWidth="md">
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} />}
      
      <Box py={4}>
        {/* Back button */}
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={() => navigate('/achievements')}
          sx={{ mb: 3 }}
        >
          Back to Achievements
        </Button>
        
        <Paper elevation={3} sx={{ p: 3, mb: 4, position: 'relative', overflow: 'hidden' }}>
          {achievement.celebrationCount > 0 && (
            <Box 
              position="absolute" 
              top={0} 
              right={0} 
              bgcolor="warning.main" 
              color="warning.contrastText" 
              px={2} 
              py={1}
              sx={{ 
                borderBottomLeftRadius: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <CelebrationIcon />
              <Typography variant="body2" fontWeight="bold">
                {achievement.celebrationCount} Celebrations
              </Typography>
            </Box>
          )}
          
          <Box mb={3}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={8}>
                <Box display="flex" alignItems="center" mb={1}>
                  <TrophyIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                  <Typography variant="h4" component="h1" fontWeight="bold">
                    {achievement.title}
                  </Typography>
                </Box>
                
                <Box display="flex" alignItems="center" mb={2} flexWrap="wrap" gap={1}>
                  <Chip 
                    label={achievement.category} 
                    color="primary"
                    size="small"
                  />
                  <Chip 
                    icon={<CalendarIcon fontSize="small" />}
                    label={format(new Date(achievement.achievedDate), 'MMM d, yyyy')}
                    variant="outlined"
                    size="small"
                  />
                  <VerificationChip
                    icon={achievement.verificationStatus === 'verified' ? <VerifiedIcon /> : null}
                    label={achievement.verificationStatus.charAt(0).toUpperCase() + achievement.verificationStatus.slice(1)}
                    status={achievement.verificationStatus}
                    size="small"
                  />
                </Box>
                
                <Box display="flex" alignItems="center" mb={3}>
                  <Avatar 
                    src={achievement.user.profilePicture} 
                    alt={achievement.user.name}
                    sx={{ width: 40, height: 40, mr: 1 }}
                  />
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {achievement.user.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Posted {formatDistanceToNow(new Date(achievement.createdAt))} ago
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Box display="flex" justifyContent={{ xs: 'flex-start', md: 'flex-end' }} gap={1}>
                  {!isOwnAchievement && (
                    <CelebrationButton
                      startIcon={<CelebrationIcon />}
                      variant="contained"
                      onClick={() => setOpenCelebrateDialog(true)}
                    >
                      Celebrate
                    </CelebrationButton>
                  )}
                  
                  {isOwnAchievement && achievement.verificationStatus === 'pending' && (
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => navigate(`/achievements/${id}/edit`)}
                    >
                      Edit
                    </Button>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>
          
          {achievement.image && (
            <Box 
              component="img" 
              src={achievement.image} 
              alt={achievement.title} 
              sx={{ 
                width: '100%', 
                borderRadius: 2,
                maxHeight: 400,
                objectFit: 'contain',
                mb: 3
              }}
            />
          )}
          
          <Typography variant="body1" paragraph>
            {achievement.description}
          </Typography>
          
          {achievement.skills && achievement.skills.length > 0 && (
            <Box mb={3}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Skills Demonstrated
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {achievement.skills.map((skill, index) => (
                  <Chip key={index} label={skill} variant="outlined" />
                ))}
              </Box>
            </Box>
          )}
          
          {achievement.impactDescription && (
            <Box mb={3}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Impact
              </Typography>
              <Typography variant="body1" paragraph>
                {achievement.impactDescription}
              </Typography>
            </Box>
          )}
          
          {achievement.evidence && achievement.evidence.url && (
            <Box mb={3}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Evidence
              </Typography>
              <Button
                variant="outlined"
                startIcon={<VerifiedIcon />}
                href={achievement.evidence.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {achievement.evidence.title || 'View Evidence'}
              </Button>
            </Box>
          )}
          
          <Divider sx={{ my: 3 }} />
          
          <Box display="flex" justifyContent="space-between">
            <Box display="flex" gap={2}>
              <Button
                startIcon={hasLiked ? <HeartIcon color="error" /> : <ThumbUpIcon />}
                onClick={handleLikeToggle}
                variant={hasLiked ? "contained" : "outlined"}
                color={hasLiked ? "error" : "primary"}
              >
                {likeCount} {likeCount === 1 ? 'Like' : 'Likes'}
              </Button>
              
              <Button
                startIcon={<CommentIcon />}
                variant="outlined"
                onClick={() => document.getElementById('congratulations-section').scrollIntoView({ behavior: 'smooth' })}
              >
                {congratulations.length} {congratulations.length === 1 ? 'Comment' : 'Comments'}
              </Button>
            </Box>
            
            <Button
              startIcon={<ShareIcon />}
              variant="outlined"
              onClick={handleShare}
            >
              Share
            </Button>
          </Box>
        </Paper>
        
        <Paper elevation={2} sx={{ p: 3 }} id="congratulations-section">
          <Typography variant="h6" gutterBottom>
            Congratulations
          </Typography>
          
          <Box mb={3}>
            <TextField
              placeholder="Add your congratulations..."
              variant="outlined"
              fullWidth
              multiline
              rows={2}
              value={newCongratulation}
              onChange={(e) => setNewCongratulation(e.target.value)}
              sx={{ mb: 1 }}
            />
            
            <Box display="flex" justifyContent="flex-end">
              <Button 
                variant="contained" 
                color="primary"
                onClick={handleAddCongratulation}
                disabled={loadingCongratulation || !newCongratulation.trim()}
              >
                {loadingCongratulation ? <CircularProgress size={24} /> : 'Post'}
              </Button>
            </Box>
          </Box>
          
          {congratulations.length === 0 ? (
            <Typography variant="body1" textAlign="center" py={2} color="text.secondary">
              Be the first to congratulate {achievement.user.name} on this achievement!
            </Typography>
          ) : (
            <List>
              {congratulations.map((congratulation) => (
                <ListItem key={congratulation._id} alignItems="flex-start" sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar src={congratulation.user.profilePicture} alt={congratulation.user.name} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="subtitle2">
                          {congratulation.user.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatDistanceToNow(new Date(congratulation.createdAt))} ago
                        </Typography>
                      </Box>
                    }
                    secondary={congratulation.message}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Paper>
      </Box>
      
      {/* Celebration Dialog */}
      <Dialog open={openCelebrateDialog} onClose={() => setOpenCelebrateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: 'warning.main', color: 'warning.contrastText' }}>
          <Box display="flex" alignItems="center" gap={1}>
            <CelebrationIcon />
            <Typography variant="h6">Celebrate this Achievement</Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="body1" paragraph>
            Help celebrate {achievement.user.name}'s achievement! Your celebration will be visible to everyone and will trigger a special celebration animation.
          </Typography>
          
          <TextField
            autoFocus
            margin="dense"
            label="Add a celebration message (optional)"
            type="text"
            fullWidth
            multiline
            rows={3}
            value={celebrationMessage}
            onChange={(e) => setCelebrationMessage(e.target.value)}
            placeholder="Congratulations on this amazing achievement!"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCelebrateDialog(false)}>Cancel</Button>
          <CelebrationButton onClick={handleCelebrate} variant="contained">
            Celebrate
          </CelebrationButton>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AchievementDetail;
