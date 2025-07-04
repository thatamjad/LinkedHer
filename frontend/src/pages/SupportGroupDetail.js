import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, Box, Typography, Button, Avatar, Chip, 
  Divider, Grid, Card, CardContent, Tabs, Tab,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, CircularProgress, Alert, Paper, List, ListItem, ListItemAvatar, ListItemText
} from '@mui/material';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';

const SupportGroupDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [group, setGroup] = useState(null);
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [isJoined, setIsJoined] = useState(false);
  const [openJoinDialog, setOpenJoinDialog] = useState(false);
  const [joinReason, setJoinReason] = useState('');
  const [openNewDiscussionDialog, setOpenNewDiscussionDialog] = useState(false);
  const [newDiscussion, setNewDiscussion] = useState({
    title: '',
    content: '',
    isAnonymous: false
  });
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);

  const categories = {
    'career_development': 'Career Development',
    'workplace_challenges': 'Workplace Challenges',
    'work_life_balance': 'Work-Life Balance',
    'leadership': 'Leadership',
    'discrimination': 'Discrimination & Bias',
    'harassment': 'Harassment',
    'mental_health': 'Mental Health',
    'entrepreneurship': 'Entrepreneurship',
    'negotiation': 'Negotiation',
    'other': 'Other'
  };

  useEffect(() => {
    const fetchSupportGroup = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/support-groups/${id}`);
        setGroup(response.data);
        
        // Check if user is a member
        if (user && response.data.members) {
          setIsJoined(response.data.members.some(member => member._id === user._id));
        }
        
        // Fetch discussions
        const discussionsResponse = await axios.get(`/api/support-groups/${id}/discussions`);
        setDiscussions(discussionsResponse.data);
        setMessages(response.data.messages || []);
        setMembers(response.data.members || []);
      } catch (err) {
        console.error('Error fetching support group:', err);
        setError('Failed to load support group details.');
        toast.error('Failed to load support group details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchSupportGroup();
    }
  }, [id, user]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleJoinGroup = async () => {
    try {
      await axios.post(`/api/support-groups/${id}/join`, { reason: joinReason });
      setIsJoined(true);
      setOpenJoinDialog(false);
      toast.success('Successfully joined the support group!');
      // Refresh group data
      const response = await axios.get(`/api/support-groups/${id}`);
      setGroup(response.data);
      setMembers(response.data.members || []);
    } catch (err) {
      console.error('Error joining support group:', err);
      toast.error(err.response?.data?.message || 'Failed to join support group');
    }
  };

  const handleLeaveGroup = async () => {
    if (window.confirm('Are you sure you want to leave this support group?')) {
      try {
        await axios.post(`/api/support-groups/${id}/leave`);
        setIsJoined(false);
        toast.success('Successfully left the support group');
        // Refresh group data
        const response = await axios.get(`/api/support-groups/${id}`);
        setGroup(response.data);
        setMembers(response.data.members?.filter(member => member._id !== user._id) || []);
      } catch (err) {
        console.error('Error leaving support group:', err);
        toast.error(err.response?.data?.message || 'Failed to leave support group');
      }
    }
  };

  const handleCreateDiscussion = async () => {
    try {
      if (!newDiscussion.title.trim() || !newDiscussion.content.trim()) {
        toast.error('Please fill in all required fields');
        return;
      }

      const response = await axios.post(`/api/support-groups/${id}/discussions`, newDiscussion);
      setDiscussions([response.data, ...discussions]);
      setOpenNewDiscussionDialog(false);
      setNewDiscussion({ title: '', content: '', isAnonymous: false });
      toast.success('Discussion created successfully!');
    } catch (err) {
      console.error('Error creating discussion:', err);
      toast.error(err.response?.data?.message || 'Failed to create discussion');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    try {
      const response = await axios.post(`/api/support-groups/${id}/messages`, {
        content: message,
        userId: user._id,
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const newMessage = await response.data;
      setMessages([...messages, newMessage]);
      setMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error('Failed to send message. Please try again.');
    }
  };

  const navigateToDiscussion = (discussionId) => {
    navigate(`/support-groups/${id}/discussions/${discussionId}`);
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

  if (error || !group) {
    return (
      <Container maxWidth="lg">
        <Box textAlign="center" p={3}>
          <Typography variant="h6" color="error">{error || 'Support group not found'}</Typography>
          <Button variant="contained" color="primary" onClick={() => navigate('/support-groups')} sx={{ mt: 2 }}>
            Back to Support Groups
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
          onClick={() => navigate('/support-groups')}
          sx={{ mb: 3 }}
        >
          Back to Support Groups
        </Button>

        {/* Group header */}
        <Box mb={4}>
          {group.bannerImage && (
            <Box 
              component="img" 
              src={group.bannerImage} 
              alt={group.name}
              sx={{ 
                width: '100%', 
                height: 200, 
                objectFit: 'cover', 
                borderRadius: 2,
                mb: 2 
              }}
            />
          )}
          
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            {group.name}
          </Typography>
          
          <Box display="flex" alignItems="center" mb={2}>
            <Chip 
              label={categories[group.category] || group.category} 
              color="primary"
              sx={{ mr: 1 }}
            />
            {group.isPrivate && (
              <Chip 
                label="Private" 
                color="secondary" 
                size="small" 
              />
            )}
          </Box>
          
          <Typography variant="body1" paragraph>
            {group.description}
          </Typography>
          
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="body2" color="text.secondary">
                Created {formatDistanceToNow(new Date(group.createdAt))} ago
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {group.members?.length || 0} members
              </Typography>
            </Box>
            
            {isJoined ? (
              <Button 
                variant="outlined" 
                color="error"
                onClick={handleLeaveGroup}
              >
                Leave Group
              </Button>
            ) : (
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => setOpenJoinDialog(true)}
              >
                Join Group
              </Button>
            )}
          </Box>
        </Box>
        
        <Divider sx={{ mb: 4 }} />
        
        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Discussions" />
            <Tab label="Members" />
            <Tab label="About" />
          </Tabs>
        </Box>
        
        {/* Discussions Tab */}
        {tabValue === 0 && (
          <>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6">
                Discussions
              </Typography>
              {isJoined && (
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => setOpenNewDiscussionDialog(true)}
                >
                  Start New Discussion
                </Button>
              )}
            </Box>
            
            {!isJoined && (
              <Alert severity="info" sx={{ mb: 3 }}>
                Join this support group to participate in discussions
              </Alert>
            )}
            
            {discussions.length === 0 ? (
              <Typography variant="body1" textAlign="center" py={4}>
                No discussions yet. Be the first to start a conversation!
              </Typography>
            ) : (
              discussions.map(discussion => (
                <Card 
                  key={discussion._id} 
                  onClick={() => navigateToDiscussion(discussion._id)}
                  sx={{ cursor: 'pointer', mb: 2, transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-3px)', boxShadow: 3 } }}
                >
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Typography variant="h6" fontWeight="bold">
                        {discussion.title}
                      </Typography>
                      {discussion.isAnonymous && (
                        <Chip 
                          label="Anonymous" 
                          size="small" 
                          color="secondary" 
                        />
                      )}
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {discussion.content.length > 200
                        ? `${discussion.content.substring(0, 200)}...`
                        : discussion.content}
                    </Typography>
                    
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box display="flex" alignItems="center">
                        {!discussion.isAnonymous && discussion.author && (
                          <>
                            <Avatar 
                              src={discussion.author.profilePicture} 
                              alt={discussion.author.name}
                              sx={{ width: 24, height: 24, mr: 1 }}
                            />
                            <Typography variant="body2">
                              {discussion.author.name}
                            </Typography>
                          </>
                        )}
                        {discussion.isAnonymous && (
                          <Typography variant="body2">
                            Anonymous Member
                          </Typography>
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {formatDistanceToNow(new Date(discussion.createdAt))} ago
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))
            )}
          </>
        )}
        
        {/* Members Tab */}
        {tabValue === 1 && (
          <>
            <Typography variant="h6" gutterBottom>
              Members ({group.members?.length || 0})
            </Typography>
            
            <Grid container spacing={2}>
              {group.members?.map(member => (
                <Grid item xs={12} sm={6} md={4} key={member._id}>
                  <Card>
                    <CardContent>
                      <Box display="flex" alignItems="center">
                        <Avatar 
                          src={member.profilePicture} 
                          alt={member.name}
                          sx={{ width: 50, height: 50, mr: 2 }}
                        />
                        <Box>
                          <Typography variant="body1" fontWeight="bold">
                            {member.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {member.isAdmin ? 'Admin' : 'Member'}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}
        
        {/* About Tab */}
        {tabValue === 2 && (
          <>
            <Typography variant="h6" gutterBottom>About this Support Group</Typography>
            
            <Typography variant="body1" paragraph>
              {group.description}
            </Typography>
            
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Guidelines
            </Typography>
            
            <Typography variant="body1" paragraph>
              {group.guidelines || 'Be respectful and supportive to all members. Keep discussions constructive and relevant to the group\'s purpose.'}
            </Typography>
            
            {group.resources && group.resources.length > 0 && (
              <>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Resources
                </Typography>
                
                <ul>
                  {group.resources.map((resource, index) => (
                    <li key={index}>
                      <Typography variant="body1">
                        <a href={resource.url} target="_blank" rel="noopener noreferrer">
                          {resource.title}
                        </a>
                      </Typography>
                    </li>
                  ))}
                </ul>
              </>
            )}
            
            {group.createdBy && (
              <>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Created By
                </Typography>
                
                <Box display="flex" alignItems="center">
                  <Avatar 
                    src={group.createdBy.profilePicture} 
                    alt={group.createdBy.name}
                    sx={{ width: 40, height: 40, mr: 1 }}
                  />
                  <Typography variant="body1">
                    {group.createdBy.name}
                  </Typography>
                </Box>
              </>
            )}
          </>
        )}
      </Box>
      
      {/* Join Group Dialog */}
      <Dialog open={openJoinDialog} onClose={() => setOpenJoinDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Join Support Group</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            You're about to join "{group.name}". Please tell us briefly why you'd like to join this support group.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Reason for joining"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={joinReason}
            onChange={(e) => setJoinReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenJoinDialog(false)}>Cancel</Button>
          <Button onClick={handleJoinGroup} variant="contained" color="primary">
            Join Group
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* New Discussion Dialog */}
      <Dialog open={openNewDiscussionDialog} onClose={() => setOpenNewDiscussionDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Start New Discussion</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Discussion Title"
            type="text"
            fullWidth
            value={newDiscussion.title}
            onChange={(e) => setNewDiscussion({...newDiscussion, title: e.target.value})}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Discussion Content"
            multiline
            rows={6}
            fullWidth
            value={newDiscussion.content}
            onChange={(e) => setNewDiscussion({...newDiscussion, content: e.target.value})}
          />
          <Box display="flex" alignItems="center" mt={2}>
            <Typography variant="body2" mr={1}>Post anonymously:</Typography>
            <Chip
              label={newDiscussion.isAnonymous ? "Yes" : "No"}
              color={newDiscussion.isAnonymous ? "secondary" : "default"}
              onClick={() => setNewDiscussion({...newDiscussion, isAnonymous: !newDiscussion.isAnonymous})}
              sx={{ cursor: 'pointer' }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNewDiscussionDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateDiscussion} variant="contained" color="primary">
            Create Discussion
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SupportGroupDetail;
