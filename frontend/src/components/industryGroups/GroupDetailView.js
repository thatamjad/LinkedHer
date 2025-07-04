import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Button,
  Avatar,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemIcon,
  ListItemButton,
  Divider,
  Chip,
  Paper,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  AvatarGroup,
  Menu,
  MenuItem,
  Tooltip,
  useTheme
} from '@mui/material';
import {
  ArrowBack,
  Event,
  People,
  Person,
  Description,
  Share,
  MoreVert,
  Edit,
  Add,
  Link,
  Download,
  Send,
  Bookmark,
  BookmarkBorder,
  Flag,
  ExitToApp,
  PersonAdd
} from '@mui/icons-material';

const GroupDetailView = ({ group, onBack }) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [members, setMembers] = useState([]);
  const [resources, setResources] = useState([]);
  const [events, setEvents] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [resourceDialogOpen, setResourceDialogOpen] = useState(false);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [discussionDialogOpen, setDiscussionDialogOpen] = useState(false);
  const [optionsMenuAnchor, setOptionsMenuAnchor] = useState(null);
  const [userRole, setUserRole] = useState('member'); // 'admin', 'moderator', 'member'
  
  useEffect(() => {
    loadGroupData();
  }, [group._id]);
  
  const loadGroupData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Make parallel requests for efficiency
      const [membersRes, resourcesRes, eventsRes, discussionsRes, userRoleRes] = await Promise.all([
        axios.get(`/api/industry-groups/${group._id}/members`),
        axios.get(`/api/industry-groups/${group._id}/resources`),
        axios.get(`/api/industry-groups/${group._id}/events`),
        axios.get(`/api/industry-groups/${group._id}/discussions`),
        axios.get(`/api/industry-groups/${group._id}/user-role`)
      ]);
      
      setMembers(membersRes.data);
      setResources(resourcesRes.data);
      setEvents(eventsRes.data);
      setDiscussions(discussionsRes.data);
      setUserRole(userRoleRes.data.role);
      
    } catch (err) {
      console.error('Error loading group data:', err);
      setError('Failed to load group data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const handleOptionsClick = (event) => {
    setOptionsMenuAnchor(event.currentTarget);
  };
  
  const handleOptionsClose = () => {
    setOptionsMenuAnchor(null);
  };
  
  const handleLeaveGroup = async () => {
    try {
      await axios.post(`/api/industry-groups/${group._id}/leave`);
      onBack(); // Return to group list after leaving
    } catch (err) {
      console.error('Error leaving group:', err);
      setError('Failed to leave group. Please try again.');
    }
    handleOptionsClose();
  };
  
  const handleAddResource = async (resourceData) => {
    try {
      await axios.post(`/api/industry-groups/${group._id}/resources`, resourceData);
      loadGroupData(); // Refresh data
      setResourceDialogOpen(false);
    } catch (err) {
      console.error('Error adding resource:', err);
      return { success: false, message: 'Failed to add resource' };
    }
  };
  
  const handleAddEvent = async (eventData) => {
    try {
      await axios.post(`/api/industry-groups/${group._id}/events`, eventData);
      loadGroupData(); // Refresh data
      setEventDialogOpen(false);
    } catch (err) {
      console.error('Error adding event:', err);
      return { success: false, message: 'Failed to add event' };
    }
  };
  
  const handleStartDiscussion = async (discussionData) => {
    try {
      await axios.post(`/api/industry-groups/${group._id}/discussions`, discussionData);
      loadGroupData(); // Refresh data
      setDiscussionDialogOpen(false);
    } catch (err) {
      console.error('Error starting discussion:', err);
      return { success: false, message: 'Failed to start discussion' };
    }
  };
  
  const canManageGroup = userRole === 'admin' || userRole === 'moderator';
  
  // Tab for About section
  const renderAboutTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            About This Group
          </Typography>
          <Typography variant="body1" paragraph>
            {group.description}
          </Typography>
          
          {group.tags && group.tags.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Tags:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {group.tags.map((tag, index) => (
                  <Chip 
                    key={index} 
                    label={tag} 
                    size="small"
                    sx={{ mr: 0.5, mb: 0.5 }}
                  />
                ))}
              </Box>
            </Box>
          )}
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Group Administrators:
            </Typography>
            <AvatarGroup max={5} sx={{ justifyContent: 'flex-start' }}>
              {members
                .filter(member => member.role === 'admin')
                .map(admin => (
                  <Tooltip key={admin._id} title={admin.name}>
                    <Avatar 
                      src={admin.profileImage} 
                      alt={admin.name}
                      sx={{ width: 32, height: 32 }}
                    />
                  </Tooltip>
                ))}
            </AvatarGroup>
          </Box>
        </Paper>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Group Details
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <People color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Members" 
                  secondary={`${members.length} members`}
                />
              </ListItem>
              <Divider variant="inset" component="li" />
              <ListItem>
                <ListItemIcon>
                  <Description color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Resources" 
                  secondary={`${resources.length} shared resources`}
                />
              </ListItem>
              <Divider variant="inset" component="li" />
              <ListItem>
                <ListItemIcon>
                  <Event color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Events" 
                  secondary={`${events.length} upcoming events`}
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Group Rules
            </Typography>
            <List>
              {group.rules ? (
                group.rules.map((rule, index) => (
                  <ListItem key={index}>
                    <ListItemText 
                      primary={`${index + 1}. ${rule.title}`}
                      secondary={rule.description}
                    />
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <ListItemText 
                    primary="Default Community Guidelines"
                    secondary="Be respectful, share relevant content, and support fellow members."
                  />
                </ListItem>
              )}
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
  
  // Tab for Members section
  const renderMembersTab = () => (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Members ({members.length})
        </Typography>
        {canManageGroup && (
          <Button
            startIcon={<PersonAdd />}
            size="small"
          >
            Invite Members
          </Button>
        )}
      </Box>
      
      <List>
        {members.map((member) => (
          <React.Fragment key={member._id}>
            <ListItem 
              secondaryAction={
                canManageGroup && member.role !== 'admin' && (
                  <IconButton edge="end" size="small">
                    <MoreVert />
                  </IconButton>
                )
              }
            >
              <ListItemAvatar>
                <Avatar 
                  src={member.profileImage} 
                  alt={member.name}
                />
              </ListItemAvatar>
              <ListItemText 
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {member.name}
                    {member.role !== 'member' && (
                      <Chip 
                        label={member.role} 
                        size="small" 
                        color={member.role === 'admin' ? 'primary' : 'secondary'}
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Box>
                }
                secondary={member.title || 'Member'}
              />
            </ListItem>
            <Divider variant="inset" component="li" />
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
  
  // Tab for Resources section
  const renderResourcesTab = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Shared Resources
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setResourceDialogOpen(true)}
        >
          Share Resource
        </Button>
      </Box>
      
      {resources.length === 0 ? (
        <Alert severity="info">
          No resources have been shared in this group yet. Be the first to share!
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {resources.map((resource) => (
            <Grid item xs={12} md={6} key={resource._id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        {resource.title}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {resource.description}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
                        <Chip 
                          icon={<Link />} 
                          label={resource.type} 
                          size="small"
                          sx={{ mr: 1 }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          Shared by {resource.sharedBy.name} • {new Date(resource.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ ml: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <IconButton 
                        size="small" 
                        color="primary"
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <OpenInNew />
                      </IconButton>
                      
                      <IconButton size="small">
                        <BookmarkBorder />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Resource Dialog */}
      <Dialog 
        open={resourceDialogOpen} 
        onClose={() => setResourceDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Share a Resource</DialogTitle>
        <ResourceForm onSubmit={handleAddResource} onCancel={() => setResourceDialogOpen(false)} />
      </Dialog>
    </Box>
  );
  
  // Tab for Events section
  const renderEventsTab = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Upcoming Events
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setEventDialogOpen(true)}
        >
          Create Event
        </Button>
      </Box>
      
      {events.length === 0 ? (
        <Alert severity="info">
          No upcoming events in this group. Create one to get started!
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {events.map((event) => (
            <Grid item xs={12} key={event._id}>
              <Card>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={8}>
                      <Typography variant="h6" gutterBottom>
                        {event.title}
                      </Typography>
                      
                      <Typography variant="body2" paragraph>
                        {event.description}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
                        <Chip 
                          icon={<Event />} 
                          label={new Date(event.startDate).toLocaleDateString(undefined, {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                          size="small"
                        />
                        
                        <Chip 
                          label={`${new Date(event.startDate).toLocaleTimeString(undefined, {
                            hour: '2-digit',
                            minute: '2-digit'
                          })} - ${new Date(event.endDate).toLocaleTimeString(undefined, {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}`}
                          size="small"
                          variant="outlined"
                        />
                        
                        {event.location && (
                          <Chip 
                            label={event.location}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} sm={4}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            Organized by:
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar 
                              src={event.organizer.profileImage} 
                              alt={event.organizer.name}
                              sx={{ width: 24, height: 24, mr: 1 }}
                            />
                            <Typography variant="body2">
                              {event.organizer.name}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                          <Button 
                            variant="outlined" 
                            size="small"
                            startIcon={event.isAttending ? <EventBusy /> : <EventAvailable />}
                          >
                            {event.isAttending ? 'Can\'t Attend' : 'Attend'}
                          </Button>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Event Dialog */}
      <Dialog 
        open={eventDialogOpen} 
        onClose={() => setEventDialogOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Create an Event</DialogTitle>
        <EventForm onSubmit={handleAddEvent} onCancel={() => setEventDialogOpen(false)} />
      </Dialog>
    </Box>
  );
  
  // Tab for Discussions section
  const renderDiscussionsTab = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Discussions
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setDiscussionDialogOpen(true)}
        >
          Start Discussion
        </Button>
      </Box>
      
      {discussions.length === 0 ? (
        <Alert severity="info">
          No discussions have been started in this group yet. Start a conversation!
        </Alert>
      ) : (
        <List>
          {discussions.map((discussion) => (
            <React.Fragment key={discussion._id}>
              <Paper sx={{ mb: 2, overflow: 'hidden' }}>
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar 
                      src={discussion.startedBy.profileImage} 
                      alt={discussion.startedBy.name}
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" component="div">
                        {discussion.title}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" color="text.secondary" component="span">
                          Started by {discussion.startedBy.name} • {new Date(discussion.createdAt).toLocaleDateString()}
                        </Typography>
                        <Typography variant="body1" paragraph sx={{ mt: 1 }}>
                          {discussion.content}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <Chip 
                            label={`${discussion.replies} replies`}
                            size="small"
                            variant="outlined"
                            sx={{ mr: 1 }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            Last activity: {new Date(discussion.lastActivity).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </>
                    }
                  />
                </ListItem>
                
                <Divider />
                
                <Box sx={{ display: 'flex', p: 1 }}>
                  <Button 
                    fullWidth 
                    startIcon={<Forum />}
                    size="small"
                  >
                    View Discussion
                  </Button>
                </Box>
              </Paper>
            </React.Fragment>
          ))}
        </List>
      )}
      
      {/* Discussion Dialog */}
      <Dialog 
        open={discussionDialogOpen} 
        onClose={() => setDiscussionDialogOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Start a Discussion</DialogTitle>
        <DiscussionForm onSubmit={handleStartDiscussion} onCancel={() => setDiscussionDialogOpen(false)} />
      </Dialog>
    </Box>
  );
  
  // Resource Form Component
  const ResourceForm = ({ onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
      title: '',
      description: '',
      url: '',
      type: 'article'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      
      try {
        await onSubmit(formData);
      } catch (err) {
        setError('Failed to add resource. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    return (
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <TextField
            fullWidth
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            margin="normal"
          />
          
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={3}
            margin="normal"
          />
          
          <TextField
            fullWidth
            label="URL"
            name="url"
            value={formData.url}
            onChange={handleChange}
            required
            margin="normal"
            placeholder="https://example.com"
          />
          
          <TextField
            fullWidth
            select
            label="Resource Type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            margin="normal"
          >
            <MenuItem value="article">Article</MenuItem>
            <MenuItem value="video">Video</MenuItem>
            <MenuItem value="podcast">Podcast</MenuItem>
            <MenuItem value="course">Course</MenuItem>
            <MenuItem value="ebook">eBook</MenuItem>
            <MenuItem value="tool">Tool</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </TextField>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={loading || !formData.title || !formData.url}
          >
            {loading ? <CircularProgress size={24} /> : 'Share Resource'}
          </Button>
        </DialogActions>
      </form>
    );
  };
  
  // Event Form Component
  const EventForm = ({ onSubmit, onCancel }) => {
    // Implementation similar to ResourceForm
    return (
      <DialogContent>
        <Typography>Event form placeholder</Typography>
      </DialogContent>
    );
  };
  
  // Discussion Form Component
  const DiscussionForm = ({ onSubmit, onCancel }) => {
    // Implementation similar to ResourceForm
    return (
      <DialogContent>
        <Typography>Discussion form placeholder</Typography>
      </DialogContent>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={onBack}
          sx={{ mb: 2 }}
        >
          Back to Groups
        </Button>
        
        <Box sx={{ 
          position: 'relative', 
          height: 200, 
          borderRadius: 2, 
          overflow: 'hidden',
          mb: 2
        }}>
          <CardMedia
            component="img"
            image={group.coverImage || '/images/default-group-cover.jpg'}
            alt={group.name}
            sx={{ height: '100%', objectFit: 'cover' }}
          />
          
          <Box sx={{ 
            position: 'absolute', 
            bottom: 0, 
            left: 0, 
            right: 0,
            p: 2,
            background: 'linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0))'
          }}>
            <Typography variant="h4" component="h1" color="white">
              {group.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Chip
                icon={<People sx={{ color: 'white' }} />}
                label={`${group.memberCount} members`}
                size="small"
                sx={{ mr: 1, bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
              <Chip
                label={group.privacy === 'public' ? 'Public' : 'Private'}
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
            </Box>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            startIcon={<Share />}
            sx={{ mr: 1 }}
          >
            Share
          </Button>
          <IconButton onClick={handleOptionsClick}>
            <MoreVert />
          </IconButton>
          <Menu
            anchorEl={optionsMenuAnchor}
            open={Boolean(optionsMenuAnchor)}
            onClose={handleOptionsClose}
          >
            {canManageGroup && (
              <MenuItem onClick={handleOptionsClose}>
                <ListItemIcon>
                  <Edit fontSize="small" />
                </ListItemIcon>
                <ListItemText>Edit Group</ListItemText>
              </MenuItem>
            )}
            <MenuItem onClick={handleOptionsClose}>
              <ListItemIcon>
                <Flag fontSize="small" />
              </ListItemIcon>
              <ListItemText>Report Group</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleLeaveGroup}>
              <ListItemIcon>
                <ExitToApp fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText sx={{ color: 'error.main' }}>Leave Group</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      </Box>
      
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
      >
        <Tab label="About" />
        <Tab label="Members" />
        <Tab label="Resources" />
        <Tab label="Events" />
        <Tab label="Discussions" />
      </Tabs>
      
      <Box sx={{ py: 2 }}>
        {activeTab === 0 && renderAboutTab()}
        {activeTab === 1 && renderMembersTab()}
        {activeTab === 2 && renderResourcesTab()}
        {activeTab === 3 && renderEventsTab()}
        {activeTab === 4 && renderDiscussionsTab()}
      </Box>
    </Box>
  );
};

export default GroupDetailView;