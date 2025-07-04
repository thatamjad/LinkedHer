import React, { useState } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  LinearProgress,
  Divider,
  CircularProgress,
  Alert,
  Badge,
  Tooltip
} from '@mui/material';
import {
  ChatBubbleOutline,
  EventNote,
  CheckCircle,
  Cancel,
  Timer,
  CalendarToday,
  Update,
  Star,
  StarBorder,
  Flag
} from '@mui/icons-material';

const MentorshipTracking = ({ mentorships, isActive, onUpdate }) => {
  const [selectedMentorship, setSelectedMentorship] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [noteText, setNoteText] = useState('');
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const handleDialogOpen = (mentorship, type) => {
    setSelectedMentorship(mentorship);
    setDialogType(type);
    setNoteText('');
    setRating(0);
    setFeedback('');
    setError('');
    setSuccess('');
    setDialogOpen(true);
  };
  
  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleAddMeetingNote = async () => {
    if (!noteText.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      await axios.post(`/api/mentorship/${selectedMentorship._id}/notes`, {
        note: noteText
      });
      
      setSuccess('Meeting note added successfully');
      setNoteText('');
      
      // Close dialog after short delay
      setTimeout(() => {
        handleDialogClose();
        onUpdate();
      }, 1500);
      
    } catch (err) {
      console.error('Error adding meeting note:', err);
      setError('Failed to add meeting note. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleEndMentorship = async () => {
    if (!feedback.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      await axios.post(`/api/mentorship/${selectedMentorship._id}/complete`, {
        rating,
        feedback
      });
      
      setSuccess('Mentorship completed successfully');
      
      // Close dialog after short delay
      setTimeout(() => {
        handleDialogClose();
        onUpdate();
      }, 1500);
      
    } catch (err) {
      console.error('Error completing mentorship:', err);
      setError('Failed to complete mentorship. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancelMentorship = async () => {
    setLoading(true);
    setError('');
    
    try {
      await axios.post(`/api/mentorship/${selectedMentorship._id}/cancel`, {
        reason: feedback
      });
      
      setSuccess('Mentorship canceled successfully');
      
      // Close dialog after short delay
      setTimeout(() => {
        handleDialogClose();
        onUpdate();
      }, 1500);
      
    } catch (err) {
      console.error('Error canceling mentorship:', err);
      setError('Failed to cancel mentorship. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleScheduleMeeting = async () => {
    setLoading(true);
    setError('');
    
    try {
      await axios.post(`/api/mentorship/${selectedMentorship._id}/schedule-meeting`, {
        scheduledAt: noteText // Using noteText as the date input
      });
      
      setSuccess('Meeting scheduled successfully');
      
      // Close dialog after short delay
      setTimeout(() => {
        handleDialogClose();
        onUpdate();
      }, 1500);
      
    } catch (err) {
      console.error('Error scheduling meeting:', err);
      setError('Failed to schedule meeting. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleReportIssue = async () => {
    if (!noteText.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      await axios.post(`/api/mentorship/${selectedMentorship._id}/report-issue`, {
        issue: noteText
      });
      
      setSuccess('Issue reported successfully');
      
      // Close dialog after short delay
      setTimeout(() => {
        handleDialogClose();
        onUpdate();
      }, 1500);
      
    } catch (err) {
      console.error('Error reporting issue:', err);
      setError('Failed to report issue. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const renderDialogContent = () => {
    switch (dialogType) {
      case 'note':
        return (
          <>
            <DialogTitle>Add Meeting Note</DialogTitle>
            <DialogContent>
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
              
              <TextField
                autoFocus
                margin="dense"
                label="Meeting Notes"
                fullWidth
                multiline
                rows={4}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="What did you discuss? What were your key takeaways?"
                disabled={loading}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDialogClose} disabled={loading}>Cancel</Button>
              <Button 
                onClick={handleAddMeetingNote} 
                variant="contained" 
                color="primary"
                disabled={loading || !noteText.trim()}
              >
                {loading ? <CircularProgress size={24} /> : 'Save Note'}
              </Button>
            </DialogActions>
          </>
        );
        
      case 'schedule':
        return (
          <>
            <DialogTitle>Schedule Next Meeting</DialogTitle>
            <DialogContent>
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
              
              <TextField
                autoFocus
                margin="dense"
                label="Meeting Date & Time"
                type="datetime-local"
                fullWidth
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
                disabled={loading}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDialogClose} disabled={loading}>Cancel</Button>
              <Button 
                onClick={handleScheduleMeeting} 
                variant="contained" 
                color="primary"
                disabled={loading || !noteText}
              >
                {loading ? <CircularProgress size={24} /> : 'Schedule'}
              </Button>
            </DialogActions>
          </>
        );
        
      case 'end':
        return (
          <>
            <DialogTitle>Complete Mentorship</DialogTitle>
            <DialogContent>
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
              
              <Typography variant="subtitle2" gutterBottom>
                Rate your experience with this mentor:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                {[1, 2, 3, 4, 5].map((value) => (
                  <IconButton
                    key={value}
                    onClick={() => setRating(value)}
                    disabled={loading}
                  >
                    {value <= rating ? <Star color="warning" /> : <StarBorder />}
                  </IconButton>
                ))}
                <Typography variant="body2" sx={{ ml: 1 }}>
                  {rating} / 5
                </Typography>
              </Box>
              
              <TextField
                margin="dense"
                label="Final Feedback"
                fullWidth
                multiline
                rows={4}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Share your thoughts about this mentorship experience..."
                disabled={loading}
                required
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDialogClose} disabled={loading}>Cancel</Button>
              <Button 
                onClick={handleEndMentorship} 
                variant="contained" 
                color="primary"
                disabled={loading || !feedback.trim() || rating === 0}
              >
                {loading ? <CircularProgress size={24} /> : 'Complete Mentorship'}
              </Button>
            </DialogActions>
          </>
        );
        
      case 'cancel':
        return (
          <>
            <DialogTitle>Cancel Mentorship</DialogTitle>
            <DialogContent>
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
              
              <Alert severity="warning" sx={{ mb: 2 }}>
                Are you sure you want to cancel this mentorship? This action cannot be undone.
              </Alert>
              
              <TextField
                margin="dense"
                label="Reason for Cancellation"
                fullWidth
                multiline
                rows={4}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Please explain why you're canceling this mentorship..."
                disabled={loading}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDialogClose} disabled={loading}>Go Back</Button>
              <Button 
                onClick={handleCancelMentorship} 
                variant="contained" 
                color="error"
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Confirm Cancellation'}
              </Button>
            </DialogActions>
          </>
        );
        
      case 'report':
        return (
          <>
            <DialogTitle>Report an Issue</DialogTitle>
            <DialogContent>
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
              
              <TextField
                autoFocus
                margin="dense"
                label="Describe the Issue"
                fullWidth
                multiline
                rows={4}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Please describe the issue you're experiencing with this mentorship..."
                disabled={loading}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDialogClose} disabled={loading}>Cancel</Button>
              <Button 
                onClick={handleReportIssue} 
                variant="contained" 
                color="warning"
                disabled={loading || !noteText.trim()}
              >
                {loading ? <CircularProgress size={24} /> : 'Submit Report'}
              </Button>
            </DialogActions>
          </>
        );
        
      default:
        return null;
    }
  };
  
  const getMentorshipStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'completed':
        return 'info';
      case 'canceled':
        return 'error';
      default:
        return 'default';
    }
  };
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const getProgressPercentage = (mentorship) => {
    if (!mentorship.startDate || !mentorship.endDate) return 0;
    
    const start = new Date(mentorship.startDate).getTime();
    const end = new Date(mentorship.endDate).getTime();
    const now = Date.now();
    
    if (now <= start) return 0;
    if (now >= end) return 100;
    
    return Math.round(((now - start) / (end - start)) * 100);
  };
  
  return (
    <Box>
      <Grid container spacing={3}>
        {mentorships.map((mentorship) => (
          <Grid item xs={12} key={mentorship._id}>
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={8}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar
                        src={mentorship.mentor?.user?.profileImage}
                        alt={mentorship.mentor?.user?.name}
                        sx={{ width: 60, height: 60, mr: 2 }}
                      />
                      <Box>
                        <Typography variant="h6">
                          {mentorship.mentor?.user?.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {mentorship.mentor?.industry} • {mentorship.mentor?.experienceYears} years experience
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          <Chip 
                            size="small" 
                            label={mentorship.status.charAt(0).toUpperCase() + mentorship.status.slice(1)}
                            color={getMentorshipStatusColor(mentorship.status)}
                            sx={{ mr: 1 }}
                          />
                          {mentorship.mentorshipType && (
                            <Chip 
                              size="small" 
                              label={mentorship.mentorshipType.split('_').map(word => 
                                word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </Box>
                    </Box>
                    
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Goals:
                      </Typography>
                      <Typography variant="body2">
                        {mentorship.goalDescription}
                      </Typography>
                    </Box>
                    
                    {isActive && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Progress:
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={getProgressPercentage(mentorship)}
                          sx={{ height: 8, borderRadius: 1 }}
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            Started: {formatDate(mentorship.startDate)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Ends: {formatDate(mentorship.endDate)}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                    
                    {!isActive && mentorship.rating && (
                      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                        <Typography variant="subtitle2" sx={{ mr: 1 }}>
                          Your Rating:
                        </Typography>
                        <Box sx={{ display: 'flex' }}>
                          {[1, 2, 3, 4, 5].map((value) => (
                            <Star 
                              key={value}
                              fontSize="small"
                              sx={{ 
                                color: value <= mentorship.rating ? 'warning.main' : 'action.disabled' 
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    )}
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Details:
                      </Typography>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
                          <CalendarToday fontSize="small" sx={{ mr: 1, color: 'action.active' }} />
                          Duration: {mentorship.preferredDuration.split('_').join(' ')}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
                          <Update fontSize="small" sx={{ mr: 1, color: 'action.active' }} />
                          Frequency: {mentorship.communicationFrequency}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
                          <Badge
                            badgeContent={mentorship.meetingNotes?.length || 0}
                            color="primary"
                            sx={{ mr: 1 }}
                          >
                            <EventNote fontSize="small" color="action" />
                          </Badge>
                          Meeting notes
                        </Typography>
                      </Box>
                      
                      {isActive && (
                        <Box sx={{ mt: 'auto', display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<ChatBubbleOutline />}
                            onClick={() => handleDialogOpen(mentorship, 'note')}
                          >
                            Add Note
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Timer />}
                            onClick={() => handleDialogOpen(mentorship, 'schedule')}
                          >
                            Schedule
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            color="success"
                            startIcon={<CheckCircle />}
                            onClick={() => handleDialogOpen(mentorship, 'end')}
                          >
                            Complete
                          </Button>
                          <Tooltip title="Report Issue">
                            <IconButton
                              size="small"
                              color="warning"
                              onClick={() => handleDialogOpen(mentorship, 'report')}
                            >
                              <Flag fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Cancel Mentorship">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDialogOpen(mentorship, 'cancel')}
                            >
                              <Cancel fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      <Dialog 
        open={dialogOpen} 
        onClose={handleDialogClose}
        fullWidth
        maxWidth="sm"
      >
        {renderDialogContent()}
      </Dialog>
    </Box>
  );
};

export default MentorshipTracking;