import React, { useState, useEffect } from 'react';
import { 
  Container, Box, Typography, Grid, Card, CardContent, 
  Chip, Button, Tab, Tabs, CircularProgress, 
  Divider, Avatar, IconButton, Menu, MenuItem,
  CardMedia, CardActions, Badge
} from '@mui/material';
import { styled } from '@mui/system';
import { MoreVert, Celebration, VerifiedUser, Star, 
  StarBorder, Public, Lock, People } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const CategoryChip = styled(Chip)(({ theme }) => ({
  backgroundColor: theme.palette.primary.light,
  color: theme.palette.primary.contrastText,
  fontWeight: 600,
  marginRight: theme.spacing(1)
}));

const AchievementCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[5],
  }
}));

const CelebrationBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: theme.palette.success.main,
    color: theme.palette.success.contrastText,
    fontWeight: 'bold',
    fontSize: '0.8rem'
  }
}));

const AchievementsPage = () => {
  const { userId } = useParams();
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const navigate = useNavigate();

  const categories = [
    { value: 'career', label: 'Career' },
    { value: 'education', label: 'Education' },
    { value: 'project', label: 'Project' },
    { value: 'personal', label: 'Personal' },
    { value: 'community', label: 'Community' },
    { value: 'other', label: 'Other' }
  ];

  const privacyIcons = {
    public: <Public fontSize="small" />,
    connections: <People fontSize="small" />,
    private: <Lock fontSize="small" />
  };

  const fetchAchievements = async () => {
    setLoading(true);
    try {
      let response;
      if (userId) {
        response = await axios.get(`/api/achievements/user/${userId}`);
      } else {
        response = await axios.get('/api/achievements/my');
      }
      
      setAchievements(response.data);
    } catch (err) {
      console.error('Error fetching achievements:', err);
      setError('Failed to load achievements. Please try again later.');
      toast.error('Failed to load achievements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, [userId]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleMenuOpen = (event, achievement) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedAchievement(achievement);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedAchievement(null);
  };

  const handleAchievementClick = (achievementId) => {
    navigate(`/achievements/${achievementId}`);
  };

  const handleCreateAchievement = () => {
    navigate('/achievements/create');
  };

  const handleHighlight = async (achievement) => {
    try {
      await axios.post(`/api/achievements/${achievement._id}/highlight`);
      toast.success('Achievement highlight status updated');
      fetchAchievements();
    } catch (err) {
      console.error('Error updating highlight status:', err);
      toast.error('Failed to update achievement highlight status');
    }
    handleMenuClose();
  };

  const handleEdit = (achievement) => {
    navigate(`/achievements/${achievement._id}/edit`);
    handleMenuClose();
  };

  const handleDelete = async (achievement) => {
    if (window.confirm('Are you sure you want to delete this achievement?')) {
      try {
        await axios.delete(`/api/achievements/${achievement._id}`);
        toast.success('Achievement deleted successfully');
        fetchAchievements();
      } catch (err) {
        console.error('Error deleting achievement:', err);
        toast.error('Failed to delete achievement');
      }
    }
    handleMenuClose();
  };

  const handleCelebrate = async (achievement) => {
    try {
      await axios.post(`/api/achievements/${achievement._id}/celebrate`, {
        message: 'Congratulations on your achievement!'
      });
      toast.success('Celebration sent!');
      fetchAchievements();
    } catch (err) {
      console.error('Error celebrating achievement:', err);
      toast.error('Failed to celebrate achievement');
    }
  };

  const handleVerify = async (achievement) => {
    try {
      await axios.post(`/api/achievements/${achievement._id}/verify`, {
        relationship: 'Colleague'
      });
      toast.success('Achievement verified!');
      fetchAchievements();
    } catch (err) {
      console.error('Error verifying achievement:', err);
      toast.error('Failed to verify achievement');
    }
  };

  const filteredAchievements = achievements.filter(achievement => {
    if (tabValue === 0) return true; // All
    if (tabValue === 1) return achievement.isHighlighted; // Highlighted
    if (tabValue === 2) return achievement.isVerified; // Verified
    
    // Category tabs start at index 3
    const categoryValue = categories[tabValue - 3]?.value;
    return achievement.category === categoryValue;
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" p={3}>
        <Typography variant="h6" color="error">{error}</Typography>
        <Button variant="contained" color="primary" onClick={fetchAchievements} sx={{ mt: 2 }}>
          Try Again
        </Button>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold">
              {userId ? 'User Achievements' : 'My Achievements'}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {userId ? 'View and celebrate achievements' : 'Track and showcase your professional growth'}
            </Typography>
          </Box>
          {!userId && (
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleCreateAchievement}
            >
              Add Achievement
            </Button>
          )}
        </Box>

        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{ mb: 4 }}
        >
          <Tab label="All" />
          <Tab label="Highlighted" />
          <Tab label="Verified" />
          {categories.map((category) => (
            <Tab key={category.value} label={category.label} />
          ))}
        </Tabs>

        {filteredAchievements.length === 0 ? (
          <Box textAlign="center" py={5}>
            <Typography variant="h6">
              No achievements found in this category.
            </Typography>
            {!userId && (
              <Button 
                variant="outlined" 
                color="primary" 
                onClick={handleCreateAchievement}
                sx={{ mt: 2 }}
              >
                Add Your First Achievement
              </Button>
            )}
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredAchievements.map((achievement) => (
              <Grid item xs={12} sm={6} md={4} key={achievement._id}>
                <AchievementCard elevation={3}>
                  <Box 
                    sx={{ 
                      cursor: 'pointer',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                    onClick={() => handleAchievementClick(achievement._id)}
                  >
                    <Box p={2} display="flex" justifyContent="space-between" alignItems="center">
                      <Box display="flex" alignItems="center">
                        {achievement.isHighlighted && (
                          <Star color="warning" sx={{ mr: 1 }} />
                        )}
                        <CategoryChip
                          label={categories.find(c => c.value === achievement.category)?.label || achievement.category}
                          size="small"
                        />
                      </Box>
                      <Box display="flex" alignItems="center">
                        {achievement.privacy && (
                          <Chip
                            icon={privacyIcons[achievement.privacy]}
                            label={achievement.privacy.charAt(0).toUpperCase() + achievement.privacy.slice(1)}
                            size="small"
                            variant="outlined"
                            sx={{ mr: 1 }}
                          />
                        )}
                        {!userId && (
                          <IconButton 
                            size="small"
                            onClick={(e) => handleMenuOpen(e, achievement)}
                          >
                            <MoreVert />
                          </IconButton>
                        )}
                      </Box>
                    </Box>
                    
                    {achievement.mediaUrls && achievement.mediaUrls.length > 0 && (
                      <CardMedia
                        component="img"
                        height="140"
                        image={achievement.mediaUrls[0]}
                        alt={achievement.title}
                      />
                    )}
                    
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography gutterBottom variant="h6" component="div" fontWeight="bold">
                        {achievement.title}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {achievement.description.length > 120
                          ? `${achievement.description.substring(0, 120)}...`
                          : achievement.description}
                      </Typography>
                      
                      {achievement.organization && (
                        <Typography variant="body2" fontWeight="medium">
                          {achievement.organization}
                          {achievement.location && `, ${achievement.location}`}
                        </Typography>
                      )}
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Achieved on {new Date(achievement.achievedAt).toLocaleDateString()}
                      </Typography>
                      
                      {achievement.skills && achievement.skills.length > 0 && (
                        <Box mt={2}>
                          <Box display="flex" flexWrap="wrap" gap={0.5}>
                            {achievement.skills.slice(0, 3).map((skill, index) => (
                              <Chip
                                key={index}
                                label={skill}
                                size="small"
                                variant="outlined"
                                color="primary"
                              />
                            ))}
                            {achievement.skills.length > 3 && (
                              <Chip
                                label={`+${achievement.skills.length - 3} more`}
                                size="small"
                                variant="outlined"
                              />
                            )}
                          </Box>
                        </Box>
                      )}
                    </CardContent>
                    
                    <CardActions sx={{ p: 2, pt: 0 }}>
                      <Box display="flex" justifyContent="space-between" width="100%">
                        <Box display="flex" alignItems="center">
                          <CelebrationBadge 
                            badgeContent={achievement.celebrationCount || 0} 
                            color="primary"
                            showZero={false}
                          >
                            <IconButton 
                              color="primary" 
                              disabled={userId === undefined}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCelebrate(achievement);
                              }}
                            >
                              <Celebration />
                            </IconButton>
                          </CelebrationBadge>
                          
                          {achievement.isVerified ? (
                            <Chip
                              icon={<VerifiedUser fontSize="small" />}
                              label={`Verified (${achievement.verifiedBy?.length || 0})`}
                              size="small"
                              color="success"
                              variant="outlined"
                              sx={{ ml: 1 }}
                            />
                          ) : userId && (
                            <Button
                              size="small"
                              startIcon={<VerifiedUser />}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleVerify(achievement);
                              }}
                              sx={{ ml: 1 }}
                            >
                              Verify
                            </Button>
                          )}
                        </Box>
                        
                        <Box>
                          {achievement.comments?.length > 0 && (
                            <Chip
                              label={`${achievement.comments.length} comments`}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </Box>
                    </CardActions>
                  </Box>
                </AchievementCard>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleHighlight(selectedAchievement)}>
          {selectedAchievement?.isHighlighted ? (
            <>
              <StarBorder sx={{ mr: 1 }} />
              Remove Highlight
            </>
          ) : (
            <>
              <Star sx={{ mr: 1 }} />
              Highlight Achievement
            </>
          )}
        </MenuItem>
        <MenuItem onClick={() => handleEdit(selectedAchievement)}>
          Edit Achievement
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleDelete(selectedAchievement)} sx={{ color: 'error.main' }}>
          Delete Achievement
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default AchievementsPage; 