import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent,
  Avatar,
  Button,
  Divider,
  Chip,
  LinearProgress
} from '@mui/material';
import { 
  Users, 
  MessageCircle, 
  TrendingUp, 
  Award, 
  Plus,
  Briefcase,
  Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    connections: 0,
    posts: 0,
    profileViews: 0,
    achievements: 0
  });

  useEffect(() => {
    // Fetch dashboard data
    const fetchDashboardData = async () => {
      try {
        setLoading(false);
        // Placeholder data
        setStats({
          connections: 245,
          posts: 12,
          profileViews: 89,
          achievements: 5
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const quickActions = [
    { icon: Plus, label: 'Create Post', color: '#6366f1', path: '/create-post' },
    { icon: Users, label: 'Network', color: '#10b981', path: '/network' },
    { icon: Briefcase, label: 'Jobs', color: '#f59e0b', path: '/jobs' },
    { icon: MessageCircle, label: 'Messages', color: '#ef4444', path: '/messages' },
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'connection',
      user: 'Sarah Johnson',
      action: 'connected with you',
      time: '2 hours ago',
      avatar: '/placeholder-avatar.jpg'
    },
    {
      id: 2,
      type: 'post',
      user: 'Tech Community',
      action: 'shared your post',
      time: '4 hours ago',
      avatar: '/placeholder-avatar.jpg'
    },
    {
      id: 3,
      type: 'achievement',
      user: 'System',
      action: 'You earned a new badge',
      time: '1 day ago',
      avatar: '/placeholder-avatar.jpg'
    }
  ];

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Welcome back, {currentUser?.firstName}! 👋
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Here's what's happening in your professional network today.
          </Typography>
        </Box>
      </motion.div>

      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            {[
              { label: 'Connections', value: stats.connections, icon: Users, color: '#6366f1' },
              { label: 'Posts', value: stats.posts, icon: MessageCircle, color: '#10b981' },
              { label: 'Profile Views', value: stats.profileViews, icon: TrendingUp, color: '#f59e0b' },
              { label: 'Achievements', value: stats.achievements, icon: Award, color: '#ef4444' },
            ].map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card sx={{ p: 2, height: '100%' }}>
                    <CardContent sx={{ p: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography variant="h4" fontWeight="bold" color={stat.color}>
                            {stat.value}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {stat.label}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            p: 1,
                            borderRadius: 2,
                            backgroundColor: `${stat.color}20`,
                            color: stat.color,
                          }}
                        >
                          <stat.icon size={24} />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={8}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Quick Actions
                </Typography>
                <Grid container spacing={2}>
                  {quickActions.map((action, index) => (
                    <Grid item xs={6} sm={3} key={index}>
                      <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => navigate(action.path)}
                        startIcon={<action.icon size={20} />}
                        sx={{
                          p: 2,
                          borderColor: action.color,
                          color: action.color,
                          '&:hover': {
                            borderColor: action.color,
                            backgroundColor: `${action.color}10`,
                          },
                        }}
                      >
                        {action.label}
                      </Button>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Recent Activity
                </Typography>
                <Box>
                  {recentActivities.map((activity, index) => (
                    <Box key={activity.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', py: 2 }}>
                        <Avatar sx={{ width: 40, height: 40, mr: 2 }}>
                          {activity.user.charAt(0)}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2">
                            <strong>{activity.user}</strong> {activity.action}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {activity.time}
                          </Typography>
                        </Box>
                      </Box>
                      {index < recentActivities.length - 1 && <Divider />}
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Profile Completion */}
        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Profile Strength
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={75} 
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    75% Complete
                  </Typography>
                </Box>
                <Typography variant="body2" gutterBottom>
                  Complete your profile to get better visibility
                </Typography>
                <Button variant="outlined" size="small" fullWidth>
                  Complete Profile
                </Button>
              </CardContent>
            </Card>

            {/* Verification Status */}
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Verification Status
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Shield size={20} style={{ marginRight: 8 }} />
                  <Typography variant="body2">
                    Account Security
                  </Typography>
                  <Chip 
                    label={currentUser?.verificationStatus || 'Unverified'} 
                    size="small" 
                    color={currentUser?.verificationStatus === 'verified' ? 'success' : 'warning'}
                    sx={{ ml: 'auto' }}
                  />
                </Box>
                {currentUser?.verificationStatus !== 'verified' && (
                  <Button variant="outlined" size="small" fullWidth>
                    Start Verification
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
