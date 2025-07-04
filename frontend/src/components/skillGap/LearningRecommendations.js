import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  Button,
  Chip,
  Divider,
  Paper,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Collapse,
  useTheme
} from '@mui/material';
import {
  ExpandMore,
  ExpandLess,
  School,
  Book,
  OpenInNew,
  VideoLibrary,
  Forum,
  Code,
  StarRate,
  Bookmark,
  BookmarkBorder,
  FilterList,
  Sort
} from '@mui/icons-material';

const LearningRecommendations = ({ recommendations }) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [expandedResource, setExpandedResource] = useState(null);
  const [bookmarkedResources, setBookmarkedResources] = useState([]);
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const handleExpandResource = (resourceId) => {
    setExpandedResource(expandedResource === resourceId ? null : resourceId);
  };
  
  const handleToggleBookmark = (resourceId) => {
    setBookmarkedResources(prev => 
      prev.includes(resourceId) 
        ? prev.filter(id => id !== resourceId)
        : [...prev, resourceId]
    );
  };
  
  const getResourceTypeIcon = (type) => {
    switch (type) {
      case 'course':
        return <School />;
      case 'book':
        return <Book />;
      case 'video':
        return <VideoLibrary />;
      case 'article':
        return <Forum />;
      case 'tutorial':
        return <Code />;
      default:
        return <School />;
    }
  };
  
  const getResourceTypeColor = (type) => {
    switch (type) {
      case 'course':
        return 'primary';
      case 'book':
        return 'secondary';
      case 'video':
        return 'error';
      case 'article':
        return 'info';
      case 'tutorial':
        return 'success';
      default:
        return 'default';
    }
  };
  
  // Group recommendations by skill
  const recommendationsBySkill = recommendations.reduce((acc, rec) => {
    if (!acc[rec.skillId]) {
      acc[rec.skillId] = {
        skillName: rec.skillName,
        gapScore: rec.gapScore,
        resources: []
      };
    }
    acc[rec.skillId].resources.push(rec);
    return acc;
  }, {});
  
  // Filter recommendations based on active tab
  const filteredRecommendations = Object.values(recommendationsBySkill).sort((a, b) => {
    if (activeTab === 0) {
      // Sort by priority (gap score)
      return b.gapScore - a.gapScore;
    }
    return 0;
  });
  
  const renderResourceCard = (resource) => {
    const isBookmarked = bookmarkedResources.includes(resource._id);
    const isExpanded = expandedResource === resource._id;
    
    return (
      <Card 
        key={resource._id} 
        sx={{ 
          mb: 2,
          transition: 'transform 0.2s',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: 3
          }
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Chip 
                  icon={getResourceTypeIcon(resource.type)} 
                  label={resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                  size="small" 
                  color={getResourceTypeColor(resource.type)}
                  sx={{ mr: 1 }}
                />
                {resource.difficulty && (
                  <Chip 
                    label={resource.difficulty}
                    size="small"
                    variant="outlined"
                  />
                )}
                <Box sx={{ flex: 1 }} />
                <IconButton 
                  size="small" 
                  onClick={() => handleToggleBookmark(resource._id)}
                  color={isBookmarked ? 'primary' : 'default'}
                >
                  {isBookmarked ? <Bookmark /> : <BookmarkBorder />}
                </IconButton>
              </Box>
              
              <Typography variant="h6" gutterBottom>
                {resource.title}
              </Typography>
              
              {resource.provider && (
                <Typography variant="body2" color="text.secondary">
                  By {resource.provider}
                </Typography>
              )}
              
              {resource.rating && (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                  <StarRate sx={{ color: theme.palette.warning.main, fontSize: 18 }} />
                  <Typography variant="body2" sx={{ ml: 0.5 }}>
                    {resource.rating} {resource.reviewCount && `(${resource.reviewCount} reviews)`}
                  </Typography>
                </Box>
              )}
            </Box>
            
            {resource.imageUrl && (
              <CardMedia
                component="img"
                sx={{ width: 80, height: 80, borderRadius: 1, ml: 2 }}
                image={resource.imageUrl}
                alt={resource.title}
              />
            )}
          </Box>
          
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" paragraph>
                {resource.description}
              </Typography>
              
              {resource.keyTopics && resource.keyTopics.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Key Topics:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {resource.keyTopics.map((topic, index) => (
                      <Chip 
                        key={index} 
                        label={topic} 
                        size="small" 
                        variant="outlined"
                        sx={{ mb: 0.5 }}
                      />
                    ))}
                  </Box>
                </Box>
              )}
              
              {resource.timeToComplete && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Time to complete: {resource.timeToComplete}
                </Typography>
              )}
            </Box>
          </Collapse>
        </CardContent>
        
        <CardActions sx={{ justifyContent: 'space-between' }}>
          <Button
            size="small"
            startIcon={isExpanded ? <ExpandLess /> : <ExpandMore />}
            onClick={() => handleExpandResource(resource._id)}
          >
            {isExpanded ? 'Show Less' : 'Show More'}
          </Button>
          
          <Button
            size="small"
            color="primary"
            startIcon={<OpenInNew />}
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            View Resource
          </Button>
        </CardActions>
      </Card>
    );
  };

  return (
    <Box>
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          aria-label="learning recommendation tabs"
        >
          <Tab 
            icon={<FilterList />} 
            label="Priority Skills" 
            id="tab-0"
            aria-controls="tabpanel-0"
          />
          <Tab 
            icon={<Bookmark />} 
            label="Bookmarked" 
            id="tab-1"
            aria-controls="tabpanel-1"
          />
        </Tabs>
      </Paper>
      
      <Box role="tabpanel" id="tabpanel-0" aria-labelledby="tab-0" hidden={activeTab !== 0}>
        {activeTab === 0 && (
          <>
            {filteredRecommendations.map((skillRec) => (
              <Paper key={skillRec.skillName} sx={{ mb: 3, overflow: 'hidden' }}>
                <Box sx={{ 
                  bgcolor: theme.palette.primary.light, 
                  color: theme.palette.primary.contrastText,
                  p: 2
                }}>
                  <Typography variant="h6">
                    {skillRec.skillName}
                  </Typography>
                  <Typography variant="body2">
                    Gap Score: {skillRec.gapScore.toFixed(1)} - 
                    {skillRec.gapScore > 3 ? ' High Priority' : 
                      skillRec.gapScore > 2 ? ' Medium Priority' : ' Low Priority'}
                  </Typography>
                </Box>
                
                <Box sx={{ p: 2 }}>
                  <Typography variant="body2" paragraph>
                    Focus on these resources to improve your {skillRec.skillName} skills 
                    and close the gap for your target role.
                  </Typography>
                  
                  {skillRec.resources.map(renderResourceCard)}
                </Box>
              </Paper>
            ))}
            
            {filteredRecommendations.length === 0 && (
              <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
                No recommendations available. Complete your skill gap analysis to get personalized recommendations.
              </Typography>
            )}
          </>
        )}
      </Box>
      
      <Box role="tabpanel" id="tabpanel-1" aria-labelledby="tab-1" hidden={activeTab !== 1}>
        {activeTab === 1 && (
          <>
            {recommendations
              .filter(rec => bookmarkedResources.includes(rec._id))
              .map(renderResourceCard)}
            
            {bookmarkedResources.length === 0 && (
              <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
                No bookmarked resources yet. Bookmark resources you want to save for later.
              </Typography>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default LearningRecommendations; 