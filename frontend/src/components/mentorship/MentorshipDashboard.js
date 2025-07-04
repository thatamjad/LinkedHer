import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import { PersonAdd, Person, Assessment, History } from '@mui/icons-material';
import MentorCard from './MentorCard';
import MentorshipRequestForm from './MentorshipRequestForm';
import MentorshipTracking from './MentorshipTracking';
import MentorshipStats from './MentorshipStats';

const MentorshipDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [potentialMentors, setPotentialMentors] = useState([]);
  const [mentorships, setMentorships] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMentor, setSelectedMentor] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, [activeTab]);

  const loadDashboardData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Load different data based on active tab
      if (activeTab === 0) {
        // Find Mentors Tab
        const response = await axios.get('/api/mentorship/potential-mentors');
        setPotentialMentors(response.data);
      } else if (activeTab === 1) {
        // Active Mentorships Tab
        const response = await axios.get('/api/mentorship', {
          params: { status: 'active' }
        });
        setMentorships(response.data);
      } else if (activeTab === 2) {
        // Past Mentorships Tab
        const response = await axios.get('/api/mentorship', {
          params: { status: 'completed' }
        });
        setMentorships(response.data);
      } else if (activeTab === 3) {
        // Stats Tab
        const response = await axios.get('/api/mentorship/stats');
        setStats(response.data);
      }
    } catch (err) {
      console.error('Error loading mentorship data:', err);
      setError('Failed to load mentorship data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleMentorSelect = (mentor) => {
    setSelectedMentor(mentor);
  };

  const handleMentorshipRequest = async (requestData) => {
    try {
      await axios.post('/api/mentorship/request', {
        mentorId: selectedMentor.mentor.user._id,
        ...requestData,
      });
      
      // Reset selected mentor & refresh mentor list
      setSelectedMentor(null);
      loadDashboardData();
      
      return { success: true, message: 'Mentorship request sent successfully!' };
    } catch (err) {
      console.error('Error requesting mentorship:', err);
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to send mentorship request.'
      };
    }
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

    switch (activeTab) {
      case 0: // Find Mentors
        return (
          <Box>
            {selectedMentor ? (
              <MentorshipRequestForm
                mentor={selectedMentor}
                onSubmit={handleMentorshipRequest}
                onCancel={() => setSelectedMentor(null)}
              />
            ) : (
              <>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Recommended Mentors Based on Compatibility
                </Typography>
                
                {potentialMentors.length === 0 ? (
                  <Alert severity="info">
                    No potential mentors found. Complete your profile to improve matching!
                  </Alert>
                ) : (
                  <Grid container spacing={3}>
                    {potentialMentors.map((mentor) => (
                      <Grid item xs={12} md={6} lg={4} key={mentor.mentor.user._id}>
                        <MentorCard
                          mentor={mentor}
                          compatibilityScore={mentor.compatibilityScore}
                          onSelect={() => handleMentorSelect(mentor)}
                        />
                      </Grid>
                    ))}
                  </Grid>
                )}
              </>
            )}
          </Box>
        );
      
      case 1: // Active Mentorships
      case 2: // Past Mentorships
        return (
          <Box>
            {mentorships.length === 0 ? (
              <Alert severity="info">
                {activeTab === 1
                  ? "You don't have any active mentorships. Find a mentor to get started!"
                  : "You don't have any past mentorships."}
              </Alert>
            ) : (
              <MentorshipTracking 
                mentorships={mentorships}
                isActive={activeTab === 1}
                onUpdate={loadDashboardData}
              />
            )}
          </Box>
        );
      
      case 3: // Stats
        return stats ? <MentorshipStats stats={stats} /> : <Alert severity="info">No stats available yet.</Alert>;
      
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Mentorship
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Connect with experienced professionals for guidance and career growth
        </Typography>
      </Box>
      
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
      >
        <Tab icon={<PersonAdd />} label="Find Mentors" />
        <Tab icon={<Person />} label="Active Mentorships" />
        <Tab icon={<History />} label="Past Mentorships" />
        <Tab icon={<Assessment />} label="My Stats" />
      </Tabs>
      
      {renderTabContent()}
    </Container>
  );
};

export default MentorshipDashboard; 