import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  TextField,
  InputAdornment,
  IconButton,
  useTheme
} from '@mui/material';
import { 
  People, 
  Event, 
  Book, 
  Add, 
  Search, 
  Favorite,
  FavoriteBorder,
  Group,
  Public,
  Lock
} from '@mui/icons-material';

import GroupDetailView from './GroupDetailView';
import CreateGroupDialog from './CreateGroupDialog';
import GroupEventsList from './GroupEventsList';

const IndustryGroupDashboard = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [industryGroups, setIndustryGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [groupEvents, setGroupEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    loadGroups();
  }, [activeTab]);

  const loadGroups = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (activeTab === 0) {
        // Discover Groups Tab
        const response = await axios.get('/api/industry-groups', {
          params: { filter: 'all', query: searchQuery }
        });
        setIndustryGroups(response.data);
      } else if (activeTab === 1) {
        // My Groups Tab
        const response = await axios.get('/api/industry-groups/my-groups');
        setMyGroups(response.data);
      } else if (activeTab === 2) {
        // Upcoming Events Tab
        const response = await axios.get('/api/industry-groups/events');
        setGroupEvents(response.data);
      }
    } catch (err) {
      console.error('Error loading industry groups data:', err);
      setError('Failed to load industry groups. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadGroups();
  };

  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
  };

  const handleBackToGroups = () => {
    setSelectedGroup(null);
    loadGroups(); // Refresh groups in case changes were made
  };

  const handleToggleFavorite = async (groupId, isFavorite) => {
    try {
      await axios.post(`/api/industry-groups/${groupId}/${isFavorite ? 'unfavorite' : 'favorite'}`);
      // Update the groups list
      setIndustryGroups(groups => 
        groups.map(group => 
          group._id === groupId
            ? { ...group, isFavorite: !isFavorite }
            : group
        )
      );
      
      // Also update myGroups if needed
      if (activeTab === 1) {
        loadGroups();
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  const handleJoinGroup = async (groupId) => {
    try {
      await axios.post(`/api/industry-groups/${groupId}/join`);
      // Update the group in the list to show as joined
      setIndustryGroups(groups => 
        groups.map(group => 
          group._id === groupId
            ? { ...group, isMember: true }
            : group
        )
      );
    } catch (err) {
      console.error('Error joining group:', err);
    }
  };

  const handleCreateGroup = async (groupData) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/industry-groups', groupData);
      setShowCreateDialog(false);
      // Add new group to the list and select it
      setSelectedGroup(response.data);
    } catch (err) {
      console.error('Error creating group:', err);
      return { success: false, message: 'Failed to create group' };
    } finally {
      setLoading(false);
    }
  };

  const renderGroupsList = (groups) => {
    if (groups.length === 0) {
      return (
        <Alert severity="info" sx={{ mt: 2 }}>
          {activeTab === 0
            ? 'No industry groups found. Try adjusting your search or create a new group!'
            : 'You have not joined any industry groups yet.'}
        </Alert>
      );
    }

    return (
      <Grid container spacing={3}>
        {groups.map((group) => (
          <Grid item xs={12} sm={6} md={4} key={group._id}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6
                }
              }}
            >
              <CardMedia
                component="img"
                height="140"
                image={group.coverImage || '/images/default-group-cover.jpg'}
                alt={group.name}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6" component="h2" noWrap>
                    {group.name}
                  </Typography>
                  <IconButton 
                    size="small" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(group._id, group.isFavorite);
                    }}
                  >
                    {group.isFavorite ? (
                      <Favorite color="error" fontSize="small" />
                    ) : (
                      <FavoriteBorder fontSize="small" />
                    )}
                  </IconButton>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Chip
                    icon={group.privacy === 'public' ? <Public fontSize="small" /> : <Lock fontSize="small" />}
                    label={group.privacy === 'public' ? 'Public' : 'Private'}
                    size="small"
                    color={group.privacy === 'public' ? 'primary' : 'secondary'}
                    variant="outlined"
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    icon={<Group fontSize="small" />}
                    label={`${group.memberCount} members`}
                    size="small"
                    variant="outlined"
                  />
                </Box>
                
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ 
                    mb: 1, 
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    height: '36px'
                  }}
                >
                  {group.description}
                </Typography>
                
                {group.tags && group.tags.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                    {group.tags.slice(0, 3).map((tag, index) => (
                      <Chip 
                        key={index} 
                        label={tag}
                        size="small"
                        sx={{ fontSize: '0.7rem' }}
                      />
                    ))}
                    {group.tags.length > 3 && (
                      <Chip 
                        label={`+${group.tags.length - 3}`} 
                        size="small"
                        sx={{ fontSize: '0.7rem' }}
                      />
                    )}
                  </Box>
                )}
              </CardContent>
              <CardActions>
                <Button 
                  size="small"
                  onClick={() => handleGroupSelect(group)}
                >
                  View Details
                </Button>
                {!group.isMember && (
                  <Button 
                    size="small" 
                    variant="contained" 
                    color="primary"
                    onClick={() => handleJoinGroup(group._id)}
                  >
                    Join Group
                  </Button>
                )}
                {group.isMember && activeTab === 0 && (
                  <Button 
                    size="small"
                    variant="outlined"
                    disabled
                  >
                    Member
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  const renderTabContent = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>;
    }

    if (selectedGroup) {
      return (
        <GroupDetailView
          group={selectedGroup}
          onBack={handleBackToGroups}
        />
      );
    }

    switch (activeTab) {
      case 0: // Discover Groups
        return (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <form onSubmit={handleSearchSubmit} style={{ width: '100%', maxWidth: 500 }}>
                <TextField
                  fullWidth
                  placeholder="Search industry groups..."
                  value={searchQuery}
                  onChange={handleSearch}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button type="submit" size="small">Search</Button>
                      </InputAdornment>
                    )
                  }}
                />
              </form>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Add />}
                onClick={() => setShowCreateDialog(true)}
              >
                Create Group
              </Button>
            </Box>
            {renderGroupsList(industryGroups)}
          </Box>
        );
      
      case 1: // My Groups
        return (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Add />}
                onClick={() => setShowCreateDialog(true)}
              >
                Create Group
              </Button>
            </Box>
            {renderGroupsList(myGroups)}
          </Box>
        );
      
      case 2: // Upcoming Events
        return (
          <Box>
            {groupEvents.length === 0 ? (
              <Alert severity="info">
                No upcoming events in your groups.
              </Alert>
            ) : (
              <GroupEventsList events={groupEvents} />
            )}
          </Box>
        );
      
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Industry Groups
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Connect with women in your industry, share resources, and attend events
        </Typography>
      </Box>
      
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="fullWidth"
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
      >
        <Tab icon={<People />} label="Discover Groups" />
        <Tab icon={<Group />} label="My Groups" />
        <Tab icon={<Event />} label="Upcoming Events" />
      </Tabs>
      
      {renderTabContent()}
      
      <CreateGroupDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSubmit={handleCreateGroup}
      />
    </Container>
  );
};

export default IndustryGroupDashboard; 