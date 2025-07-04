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
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Divider,
  useTheme
} from '@mui/material';
import { 
  Assessment, 
  TrendingUp, 
  School, 
  BarChart 
} from '@mui/icons-material';

import SkillGapAnalysisForm from './SkillGapAnalysisForm';
import SkillProgressTracker from './SkillProgressTracker';
import LearningRecommendations from './LearningRecommendations';
import SkillGapStats from './SkillGapStats';

const SkillGapDashboard = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [skillGapData, setSkillGapData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [analysisComplete, setAnalysisComplete] = useState(false);

  useEffect(() => {
    checkExistingAnalysis();
  }, []);

  useEffect(() => {
    if (analysisComplete) {
      loadTabData();
    }
  }, [activeTab, analysisComplete]);

  const checkExistingAnalysis = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.get('/api/skill-gap');
      if (response.data) {
        setSkillGapData(response.data);
        setAnalysisComplete(true);
      }
    } catch (err) {
      // If 404, no analysis exists yet, which is fine
      if (err.response && err.response.status !== 404) {
        console.error('Error checking skill gap analysis:', err);
        setError('Failed to load your skill gap data. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const loadTabData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Load different data based on active tab
      if (activeTab === 1) {
        // Learning Recommendations Tab
        const response = await axios.get('/api/skill-gap/recommendations');
        setRecommendations(response.data);
      } else if (activeTab === 2) {
        // Stats Tab
        const response = await axios.get('/api/skill-gap/stats');
        setStats(response.data);
      }
    } catch (err) {
      console.error('Error loading skill gap data:', err);
      setError('Failed to load skill gap data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const handleAnalysisComplete = (data) => {
    setSkillGapData(data);
    setAnalysisComplete(true);
    // After analysis is complete, load recommendations
    loadTabData();
  };
  
  const handleSkillProgressUpdate = async (skill, newLevel) => {
    try {
      const response = await axios.patch('/api/skill-gap/progress', {
        skill,
        newLevel
      });
      
      // Update the local state with new skill gap data
      setSkillGapData(response.data.skillGap);
      
      // Refresh recommendations and stats if on those tabs
      if (activeTab === 1 || activeTab === 2) {
        loadTabData();
      }
      
      return { success: true };
    } catch (err) {
      console.error('Error updating skill progress:', err);
      return { 
        success: false, 
        message: err.response?.data?.message || 'Failed to update skill progress.'
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

    // If analysis not completed yet, show the form on all tabs
    if (!analysisComplete) {
      return (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Complete Your Skill Gap Analysis
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Identify skill gaps based on your career goals and get personalized learning recommendations.
          </Typography>
          <SkillGapAnalysisForm onComplete={handleAnalysisComplete} />
        </Box>
      );
    }

    switch (activeTab) {
      case 0: // Skills Analysis
        return (
          <Box>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <SkillProgressTracker
                  skillGap={skillGapData}
                  onSkillUpdate={handleSkillProgressUpdate}
                />
              </Grid>
            </Grid>
          </Box>
        );
      
      case 1: // Learning Recommendations
        return (
          <Box>
            {recommendations.length === 0 ? (
              <Alert severity="info">
                No learning recommendations available. Complete your skill gap analysis first.
              </Alert>
            ) : (
              <LearningRecommendations recommendations={recommendations} />
            )}
          </Box>
        );
      
      case 2: // Stats
        return (
          <Box>
            {!stats ? (
              <Alert severity="info">No stats available yet.</Alert>
            ) : (
              <SkillGapStats stats={stats} />
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
          Skill Gap Analysis
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Analyze your skills, identify gaps, and get personalized learning recommendations
        </Typography>
      </Box>
      
      {analysisComplete && (
        <Card sx={{ mb: 4, bgcolor: theme.palette.primary.light, color: theme.palette.primary.contrastText }}>
          <CardContent>
            <Typography variant="h6">
              Industry: {skillGapData.industry}
            </Typography>
            {skillGapData.targetRole && (
              <Typography variant="body1">
                Target Role: {skillGapData.targetRole.title || 'Not specified'}
                {skillGapData.targetRole.level && ` (${skillGapData.targetRole.level})`}
              </Typography>
            )}
          </CardContent>
        </Card>
      )}
      
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="fullWidth"
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
      >
        <Tab icon={<Assessment />} label="Skills Analysis" />
        <Tab icon={<School />} label="Learning Recommendations" />
        <Tab icon={<BarChart />} label="Progress Stats" />
      </Tabs>
      
      {renderTabContent()}
    </Container>
  );
};

export default SkillGapDashboard; 