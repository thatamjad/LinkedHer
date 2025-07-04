import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Chip,
  Avatar,
  Grid,
  Card,
  CardContent,
  Divider,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Tab,
  Tabs,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Paper,
  IconButton
} from '@mui/material';
import {
  Group as GroupIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  Edit as EditIcon,
  Link as LinkIcon,
  Send as SendIcon
} from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow, format } from 'date-fns';

const CollaborativeProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [team, setTeam] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [isTeamMember, setIsTeamMember] = useState(false);
  const [openJoinDialog, setOpenJoinDialog] = useState(false);
  const [joinMessage, setJoinMessage] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [openNewDiscussionDialog, setOpenNewDiscussionDialog] = useState(false);
  const [newDiscussion, setNewDiscussion] = useState({
    title: '',
    content: ''
  });
  const [newComment, setNewComment] = useState('');
  const [loadingComment, setLoadingComment] = useState(false);
  
  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch project details
        const projectResponse = await axios.get(`/api/collaborative-projects/${id}`);
        setProject(projectResponse.data);
        
        // Check if user is a team member
        if (user) {
          const isMember = projectResponse.data.team.some(member => member.user._id === user._id);
          setIsTeamMember(isMember);
        }
        
        // Fetch team members
        const teamResponse = await axios.get(`/api/collaborative-projects/${id}/team`);
        setTeam(teamResponse.data);
        
        // Fetch tasks
        const tasksResponse = await axios.get(`/api/collaborative-projects/${id}/tasks`);
        setTasks(tasksResponse.data);
        
        // Fetch discussions
        const discussionsResponse = await axios.get(`/api/collaborative-projects/${id}/discussions`);
        setDiscussions(discussionsResponse.data);
      } catch (err) {
        console.error('Error fetching project details:', err);
        setError('Failed to load project details.');
        toast.error('Failed to load project details');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchProjectDetails();
    }
  }, [id, user]);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleJoinRequest = async () => {
    try {
      if (!joinMessage.trim()) {
        toast.error('Please provide a message explaining why you want to join this project');
        return;
      }
      
      await axios.post(`/api/collaborative-projects/${id}/join`, { 
        message: joinMessage,
        skills: selectedSkills 
      });
      
      setOpenJoinDialog(false);
      setJoinMessage('');
      setSelectedSkills([]);
      toast.success('Join request sent successfully!');
    } catch (err) {
      console.error('Error sending join request:', err);
      toast.error(err.response?.data?.message || 'Failed to send join request');
    }
  };
  
  const handleSkillSelection = (skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };
  
  const handleCreateDiscussion = async () => {
    try {
      if (!newDiscussion.title.trim() || !newDiscussion.content.trim()) {
        toast.error('Please fill in all required fields');
        return;
      }
      
      const response = await axios.post(`/api/collaborative-projects/${id}/discussions`, newDiscussion);
      setDiscussions([response.data, ...discussions]);
      setOpenNewDiscussionDialog(false);
      setNewDiscussion({ title: '', content: '' });
      toast.success('Discussion created successfully!');
    } catch (err) {
      console.error('Error creating discussion:', err);
      toast.error(err.response?.data?.message || 'Failed to create discussion');
    }
  };
  
  const handleTaskStatusChange = async (taskId, isCompleted) => {
    try {
      await axios.patch(`/api/collaborative-projects/${id}/tasks/${taskId}`, {
        isCompleted
      });
      
      // Update tasks in the UI
      setTasks(tasks.map(task => 
        task._id === taskId ? { ...task, isCompleted } : task
      ));
      
      toast.success(`Task ${isCompleted ? 'completed' : 'reopened'}`);
    } catch (err) {
      console.error('Error updating task status:', err);
      toast.error('Failed to update task status');
    }
  };
  
  const handleAddComment = async (discussionId) => {
    if (!newComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }
    
    try {
      setLoadingComment(true);
      
      const response = await axios.post(`/api/collaborative-projects/${id}/discussions/${discussionId}/comments`, {
        content: newComment
      });
      
      // Update discussions with the new comment
      setDiscussions(discussions.map(discussion => 
        discussion._id === discussionId 
          ? { ...discussion, comments: [...discussion.comments, response.data] }
          : discussion
      ));
      
      setNewComment('');
      toast.success('Comment added successfully');
    } catch (err) {
      console.error('Error adding comment:', err);
      toast.error('Failed to add comment');
    } finally {
      setLoadingComment(false);
    }
  };
  
  const calculateProgress = () => {
    if (!tasks.length) return 0;
    const completedTasks = tasks.filter(task => task.isCompleted).length;
    return (completedTasks / tasks.length) * 100;
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
  
  if (error || !project) {
    return (
      <Container maxWidth="lg">
        <Box textAlign="center" p={3}>
          <Typography variant="h6" color="error">{error || 'Project not found'}</Typography>
          <Button variant="contained" color="primary" onClick={() => navigate('/collaborative-projects')} sx={{ mt: 2 }}>
            Back to Projects
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
          onClick={() => navigate('/collaborative-projects')}
          sx={{ mb: 3 }}
        >
          Back to Projects
        </Button>
        
        {/* Project Header */}
        <Box mb={4}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                {project.title}
              </Typography>
              
              <Box display="flex" alignItems="center" mb={1} flexWrap="wrap" gap={1}>
                <Chip 
                  label={project.category} 
                  color="primary"
                  size="small"
                />
                <Chip 
                  icon={<CalendarIcon fontSize="small" />}
                  label={`Deadline: ${format(new Date(project.deadline), 'MMM d, yyyy')}`}
                  variant="outlined"
                  size="small"
                />
                <Chip
                  icon={<GroupIcon fontSize="small" />}
                  label={`${project.team.length} Team Members`}
                  variant="outlined"
                  size="small"
                />
              </Box>
              
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                Created by {project.createdBy.name} • {formatDistanceToNow(new Date(project.createdAt))} ago
              </Typography>
            </Box>
            
            {!isTeamMember && project.status !== 'completed' && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => setOpenJoinDialog(true)}
              >
                Request to Join
              </Button>
            )}
            
            {isTeamMember && project.createdBy._id === user._id && (
              <Button
                variant="outlined"
                color="primary"
                startIcon={<EditIcon />}
                onClick={() => navigate(`/collaborative-projects/${id}/edit`)}
              >
                Edit Project
              </Button>
            )}
          </Box>
          
          <Typography variant="body1" paragraph>
            {project.description}
          </Typography>
          
          <Box mb={3}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Skills Needed
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {project.requiredSkills.map((skill, index) => (
                <Chip 
                  key={index} 
                  label={skill} 
                  variant="outlined" 
                />
              ))}
            </Box>
          </Box>
          
          {project.links && project.links.length > 0 && (
            <Box mb={3}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Project Links
              </Typography>
              <List dense>
                {project.links.map((link, index) => (
                  <ListItem key={index} disablePadding>
                    <ListItemAvatar sx={{ minWidth: 36 }}>
                      <LinkIcon color="primary" fontSize="small" />
                    </ListItemAvatar>
                    <ListItemText 
                      primary={
                        <a 
                          href={link.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                          {link.title}
                        </a>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
          
          <Box mb={3}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Project Progress
            </Typography>
            <Box display="flex" alignItems="center">
              <Box sx={{ width: '100%', mr: 1 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={calculateProgress()} 
                  sx={{ height: 10, borderRadius: 5 }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                {Math.round(calculateProgress())}%
              </Typography>
            </Box>
          </Box>
        </Box>
        
        <Divider sx={{ mb: 4 }} />
        
        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Team" />
            <Tab label="Tasks" />
            <Tab label="Discussions" />
          </Tabs>
        </Box>
        
        {/* Team Tab */}
        {tabValue === 0 && (
          <>
            <Typography variant="h6" gutterBottom>
              Team Members ({team.length})
            </Typography>
            
            <Grid container spacing={2}>
              {team.map((member) => (
                <Grid item xs={12} sm={6} md={4} key={member._id}>
                  <Card>
                    <CardContent>
                      <Box display="flex" alignItems="center">
                        <Avatar 
                          src={member.user.profilePicture} 
                          alt={member.user.name}
                          sx={{ width: 50, height: 50, mr: 2 }}
                        />
                        <Box>
                          <Typography variant="body1" fontWeight="bold">
                            {member.user.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {member.role || 'Team Member'}
                          </Typography>
                          {member.skills && member.skills.length > 0 && (
                            <Box display="flex" flexWrap="wrap" gap={0.5} mt={0.5}>
                              {member.skills.map((skill, index) => (
                                <Chip 
                                  key={index} 
                                  label={skill} 
                                  size="small" 
                                  variant="outlined" 
                                />
                              ))}
                            </Box>
                          )}
                        </Box>
                      </Box>
                      {member.user._id === project.createdBy._id && (
                        <Chip 
                          label="Project Leader" 
                          color="primary" 
                          size="small" 
                          sx={{ mt: 1 }}
                        />
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}
        
        {/* Tasks Tab */}
        {tabValue === 1 && (
          <>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6">
                Tasks
              </Typography>
              {isTeamMember && (
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => navigate(`/collaborative-projects/${id}/tasks/add`)}
                >
                  Add Task
                </Button>
              )}
            </Box>
            
            {tasks.length === 0 ? (
              <Typography variant="body1" textAlign="center" py={4}>
                No tasks have been added to this project yet.
              </Typography>
            ) : (
              <Grid container spacing={2}>
                {tasks.map((task) => (
                  <Grid item xs={12} key={task._id}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Box display="flex" alignItems="flex-start">
                          {isTeamMember ? (
                            <IconButton 
                              color={task.isCompleted ? "success" : "default"}
                              onClick={() => handleTaskStatusChange(task._id, !task.isCompleted)}
                              sx={{ mr: 1, mt: -0.5 }}
                            >
                              {task.isCompleted ? <CheckCircleIcon /> : <RadioButtonUncheckedIcon />}
                            </IconButton>
                          ) : (
                            <Box sx={{ mr: 1, mt: 0.5 }}>
                              {task.isCompleted ? (
                                <CheckCircleIcon color="success" />
                              ) : (
                                <RadioButtonUncheckedIcon />
                              )}
                            </Box>
                          )}
                          <Box>
                            <Typography 
                              variant="subtitle1" 
                              fontWeight="bold"
                              sx={{ textDecoration: task.isCompleted ? 'line-through' : 'none' }}
                            >
                              {task.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {task.description}
                            </Typography>
                            {task.assignedTo && (
                              <Box display="flex" alignItems="center" mt={1}>
                                <Avatar 
                                  src={task.assignedTo.profilePicture} 
                                  alt={task.assignedTo.name}
                                  sx={{ width: 24, height: 24, mr: 1 }}
                                />
                                <Typography variant="body2">
                                  Assigned to {task.assignedTo.name}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </Box>
                        <Box textAlign="right">
                          <Typography variant="body2" color="text.secondary">
                            Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}
                          </Typography>
                          {task.isCompleted && (
                            <Typography variant="body2" color="success.main">
                              Completed
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        )}
        
        {/* Discussions Tab */}
        {tabValue === 2 && (
          <>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6">
                Discussions
              </Typography>
              {isTeamMember && (
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => setOpenNewDiscussionDialog(true)}
                >
                  Start Discussion
                </Button>
              )}
            </Box>
            
            {!isTeamMember && (
              <Alert severity="info" sx={{ mb: 3 }}>
                You need to be a team member to participate in discussions
              </Alert>
            )}
            
            {discussions.length === 0 ? (
              <Typography variant="body1" textAlign="center" py={4}>
                No discussions yet. Start a conversation with your team!
              </Typography>
            ) : (
              discussions.map((discussion) => (
                <Paper key={discussion._id} elevation={1} sx={{ mb: 3, p: 3 }}>
                  <Box display="flex" alignItems="flex-start" mb={2}>
                    <Avatar 
                      src={discussion.author.profilePicture} 
                      alt={discussion.author.name}
                      sx={{ mr: 2 }}
                    />
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {discussion.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Started by {discussion.author.name} • {formatDistanceToNow(new Date(discussion.createdAt))} ago
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Typography variant="body1" paragraph>
                    {discussion.content}
                  </Typography>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle2" gutterBottom>
                    {discussion.comments?.length || 0} Comments
                  </Typography>
                  
                  {discussion.comments && discussion.comments.length > 0 && (
                    <List>
                      {discussion.comments.map((comment) => (
                        <ListItem key={comment._id} alignItems="flex-start" sx={{ px: 0 }}>
                          <ListItemAvatar>
                            <Avatar src={comment.author.profilePicture} alt={comment.author.name} />
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box display="flex" justifyContent="space-between">
                                <Typography variant="subtitle2">
                                  {comment.author.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {formatDistanceToNow(new Date(comment.createdAt))} ago
                                </Typography>
                              </Box>
                            }
                            secondary={comment.content}
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                  
                  {isTeamMember && (
                    <Box display="flex" mt={2}>
                      <TextField
                        placeholder="Add a comment..."
                        variant="outlined"
                        fullWidth
                        size="small"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                      />
                      <Button
                        variant="contained"
                        color="primary"
                        sx={{ ml: 1 }}
                        disabled={loadingComment || !newComment.trim()}
                        onClick={() => handleAddComment(discussion._id)}
                      >
                        {loadingComment ? <CircularProgress size={24} /> : <SendIcon />}
                      </Button>
                    </Box>
                  )}
                </Paper>
              ))
            )}
          </>
        )}
      </Box>
      
      {/* Join Project Dialog */}
      <Dialog open={openJoinDialog} onClose={() => setOpenJoinDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Request to Join Project</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            You're requesting to join "{project.title}". Please provide some information about how you can contribute to this project.
          </Typography>
          
          <TextField
            autoFocus
            margin="dense"
            label="Message to Project Leader"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={joinMessage}
            onChange={(e) => setJoinMessage(e.target.value)}
            placeholder="Describe your interest in this project and how your skills can contribute..."
            sx={{ mb: 3 }}
          />
          
          <Typography variant="subtitle1" gutterBottom>
            Select skills you can contribute:
          </Typography>
          
          <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
            {project.requiredSkills.map((skill, index) => (
              <Chip
                key={index}
                label={skill}
                onClick={() => handleSkillSelection(skill)}
                color={selectedSkills.includes(skill) ? "primary" : "default"}
                variant={selectedSkills.includes(skill) ? "filled" : "outlined"}
                sx={{ cursor: 'pointer' }}
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenJoinDialog(false)}>Cancel</Button>
          <Button onClick={handleJoinRequest} variant="contained" color="primary">
            Send Request
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

export default CollaborativeProjectDetail;
