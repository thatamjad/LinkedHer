import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Chip,
  Divider,
  Avatar,
  AvatarGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Tab,
  Tabs,
  useTheme
} from '@mui/material';
import {
  Event,
  LocationOn,
  People,
  AccessTime,
  EventAvailable,
  EventBusy,
  CalendarToday,
  ArrowForward,
  Add,
  Edit,
  Delete,
  Link,
  Videocam
} from '@mui/icons-material';

const GroupEventsList = ({ events, groupId, onEventAction, canCreateEvents }) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Filter events based on active tab
  const upcomingEvents = events.filter(event => new Date(event.startDate) > new Date());
  const pastEvents = events.filter(event => new Date(event.startDate) <= new Date());
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const handleViewDetails = (event) => {
    setSelectedEvent(event);
    setDetailsOpen(true);
  };
  
  const handleCloseDetails = () => {
    setDetailsOpen(false);
  };
  
  const handleEventAction = async (eventId, action) => {
    setLoading(true);
    setError('');
    
    try {
      await onEventAction(eventId, action);
    } catch (err) {
      console.error(`Error performing ${action} action:`, err);
      setError(`Failed to ${action}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };
  
  const formatEventDate = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const sameDay = start.toDateString() === end.toDateString();
    
    const dateOptions = { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    };
    
    const timeOptions = { 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    
    if (sameDay) {
      return (
        <>
          <Typography variant="body2">
            {start.toLocaleDateString(undefined, dateOptions)}
          </Typography>
          <Typography variant="body2">
            {start.toLocaleTimeString(undefined, timeOptions)} - 
            {end.toLocaleTimeString(undefined, timeOptions)}
          </Typography>
        </>
      );
    } else {
      return (
        <>
          <Typography variant="body2">
            {start.toLocaleDateString(undefined, dateOptions)}, 
            {start.toLocaleTimeString(undefined, timeOptions)}
          </Typography>
          <Typography variant="body2">
            to {end.toLocaleDateString(undefined, dateOptions)}, 
            {end.toLocaleTimeString(undefined, timeOptions)}
          </Typography>
        </>
      );
    }
  };
  
  const renderEventCard = (event) => {
    const isUpcoming = new Date(event.startDate) > new Date();
    const isPast = !isUpcoming;
    
    return (
      <Grid item xs={12} md={6} key={event._id}>
        <Card sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          transition: 'transform 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 3
          },
          opacity: isPast ? 0.8 : 1
        }}>
          <CardContent sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Typography variant="h6" gutterBottom>
                {event.title}
              </Typography>
              <Chip 
                label={isUpcoming ? 'Upcoming' : 'Past'}
                color={isUpcoming ? 'primary' : 'default'}
                size="small"
              />
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <CalendarToday fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              {formatEventDate(event.startDate, event.endDate)}
            </Box>
            
            {event.location && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                {event.locationType === 'virtual' ? (
                  <Videocam fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                ) : (
                  <LocationOn fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                )}
                <Typography variant="body2">
                  {event.location}
                </Typography>
              </Box>
            )}
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {event.description}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, mt: 'auto' }}>
              <People fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2">
                {event.attendeeCount} {event.attendeeCount === 1 ? 'attendee' : 'attendees'}
              </Typography>
            </Box>
            
            {event.attendees && event.attendees.length > 0 && (
              <AvatarGroup max={5} sx={{ justifyContent: 'flex-start', mt: 1 }}>
                {event.attendees.map(attendee => (
                  <Avatar 
                    key={attendee._id} 
                    src={attendee.profileImage}
                    alt={attendee.name}
                    sx={{ width: 28, height: 28 }}
                  />
                ))}
              </AvatarGroup>
            )}
          </CardContent>
          
          <Divider />
          
          <CardActions sx={{ justifyContent: 'space-between' }}>
            <Button 
              startIcon={<Event />}
              onClick={() => handleViewDetails(event)}
            >
              Details
            </Button>
            
            {isUpcoming && (
              <Button 
                color={event.isAttending ? "error" : "primary"}
                startIcon={event.isAttending ? <EventBusy /> : <EventAvailable />}
                onClick={() => handleEventAction(
                  event._id, 
                  event.isAttending ? 'unattend' : 'attend'
                )}
                disabled={loading}
              >
                {event.isAttending ? "Can't Attend" : "Attend"}
              </Button>
            )}
          </CardActions>
        </Card>
      </Grid>
    );
  };
  
  const renderDetailDialog = () => {
    if (!selectedEvent) return null;
    
    const isUpcoming = new Date(selectedEvent.startDate) > new Date();
    const isOrganizer = selectedEvent.organizer._id === 'current-user-id'; // Replace with actual comparison
    
    return (
      <Dialog 
        open={detailsOpen} 
        onClose={handleCloseDetails}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {selectedEvent.title}
            <Chip 
              label={isUpcoming ? 'Upcoming' : 'Past'}
              color={isUpcoming ? 'primary' : 'default'}
              size="small"
            />
          </Box>
        </DialogTitle>
        
        <DialogContent dividers>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Typography variant="subtitle1" gutterBottom>
                About this event
              </Typography>
              <Typography variant="body1" paragraph>
                {selectedEvent.description}
              </Typography>
              
              {selectedEvent.additionalInfo && (
                <>
                  <Typography variant="subtitle1" gutterBottom>
                    Additional Information
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {selectedEvent.additionalInfo}
                  </Typography>
                </>
              )}
              
              {selectedEvent.agenda && (
                <>
                  <Typography variant="subtitle1" gutterBottom>
                    Agenda
                  </Typography>
                  <Typography variant="body1" component="div">
                    <div dangerouslySetInnerHTML={{ __html: selectedEvent.agenda }} />
                  </Typography>
                </>
              )}
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Event Details
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    <CalendarToday sx={{ mr: 1, color: 'text.secondary', mt: 0.5 }} />
                    <Box>
                      <Typography variant="subtitle2">
                        Date and Time
                      </Typography>
                      {formatEventDate(selectedEvent.startDate, selectedEvent.endDate)}
                    </Box>
                  </Box>
                  
                  {selectedEvent.location && (
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                      {selectedEvent.locationType === 'virtual' ? (
                        <Videocam sx={{ mr: 1, color: 'text.secondary', mt: 0.5 }} />
                      ) : (
                        <LocationOn sx={{ mr: 1, color: 'text.secondary', mt: 0.5 }} />
                      )}
                      <Box>
                        <Typography variant="subtitle2">
                          {selectedEvent.locationType === 'virtual' ? 'Virtual Event' : 'Location'}
                        </Typography>
                        <Typography variant="body2">
                          {selectedEvent.location}
                        </Typography>
                        {selectedEvent.locationLink && (
                          <Button 
                            startIcon={<Link />}
                            size="small"
                            href={selectedEvent.locationLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ mt: 0.5 }}
                          >
                            Join Link
                          </Button>
                        )}
                      </Box>
                    </Box>
                  )}
                  
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <People sx={{ mr: 1, color: 'text.secondary', mt: 0.5 }} />
                    <Box>
                      <Typography variant="subtitle2">
                        Organizer
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          src={selectedEvent.organizer.profileImage} 
                          alt={selectedEvent.organizer.name}
                          sx={{ width: 24, height: 24, mr: 1 }}
                        />
                        <Typography variant="body2">
                          {selectedEvent.organizer.name}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Attendees ({selectedEvent.attendeeCount})
                  </Typography>
                  
                  {selectedEvent.attendees && selectedEvent.attendees.length > 0 ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {selectedEvent.attendees.map(attendee => (
                        <Avatar 
                          key={attendee._id}
                          src={attendee.profileImage}
                          alt={attendee.name}
                          title={attendee.name}
                        />
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No attendees yet. Be the first to attend!
                    </Typography>
                  )}
                </CardContent>
                {isUpcoming && (
                  <CardActions>
                    <Button 
                      fullWidth
                      color={selectedEvent.isAttending ? "error" : "primary"}
                      startIcon={selectedEvent.isAttending ? <EventBusy /> : <EventAvailable />}
                      onClick={() => handleEventAction(
                        selectedEvent._id, 
                        selectedEvent.isAttending ? 'unattend' : 'attend'
                      )}
                      disabled={loading}
                    >
                      {selectedEvent.isAttending ? "Cancel Attendance" : "Attend This Event"}
                      {loading && <CircularProgress size={24} sx={{ ml: 1 }} />}
                    </Button>
                  </CardActions>
                )}
              </Card>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          {isOrganizer && isUpcoming && (
            <>
              <Button 
                startIcon={<Edit />} 
                color="primary"
                onClick={() => {
                  handleCloseDetails();
                  handleEventAction(selectedEvent._id, 'edit');
                }}
              >
                Edit
              </Button>
              <Button 
                startIcon={<Delete />} 
                color="error"
                onClick={() => {
                  handleCloseDetails();
                  handleEventAction(selectedEvent._id, 'delete');
                }}
              >
                Cancel Event
              </Button>
            </>
          )}
          <Button onClick={handleCloseDetails}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="event tabs"
        >
          <Tab 
            label={`Upcoming (${upcomingEvents.length})`} 
            id="tab-upcoming"
            aria-controls="tabpanel-upcoming"
          />
          <Tab 
            label={`Past (${pastEvents.length})`} 
            id="tab-past"
            aria-controls="tabpanel-past"
          />
        </Tabs>
        
        {canCreateEvents && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={() => onEventAction(null, 'create')}
          >
            Create Event
          </Button>
        )}
      </Box>
      
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      
      <Box role="tabpanel" id="tabpanel-upcoming" aria-labelledby="tab-upcoming" hidden={activeTab !== 0}>
        {activeTab === 0 && (
          <>
            {upcomingEvents.length > 0 ? (
              <Grid container spacing={3}>
                {upcomingEvents.map(renderEventCard)}
              </Grid>
            ) : (
              <Alert severity="info">
                No upcoming events scheduled. 
                {canCreateEvents && " Create an event to get started!"}
              </Alert>
            )}
          </>
        )}
      </Box>
      
      <Box role="tabpanel" id="tabpanel-past" aria-labelledby="tab-past" hidden={activeTab !== 1}>
        {activeTab === 1 && (
          <>
            {pastEvents.length > 0 ? (
              <Grid container spacing={3}>
                {pastEvents.map(renderEventCard)}
              </Grid>
            ) : (
              <Alert severity="info">
                No past events yet.
              </Alert>
            )}
          </>
        )}
      </Box>
      
      {renderDetailDialog()}
    </Box>
  );
};

export default GroupEventsList;