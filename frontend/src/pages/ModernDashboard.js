import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Alert,
  Grid,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { motion } from 'framer-motion';
import { 
  Feed, 
  Users, 
  Briefcase, 
  Shield, 
  TrendingUp, 
  MessageSquare,
  Heart,
  Star,
  ChevronRight,
  Bell,
  Settings
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { ModernCard, ModernButton, ModernBadge } from '../components/ui/ModernComponents';
import EnhancedNavigation from '../components/navigation/EnhancedNavigation';

const ModernDashboard = () => {
  const { currentUser, getVerificationStatus } = useAuth();
  const [verificationData, setVerificationData] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [quickStats, setQuickStats] = useState({
    posts: 0,
    connections: 0,
    views: 0,
    likes: 0
  });
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  // Fetch verification status and user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (currentUser) {
          const response = await getVerificationStatus();
          setVerificationData(response);
          
          // Mock data for demonstration - replace with actual API calls
          setRecentActivity([
            { id: 1, type: 'like', user: 'Sarah M.', action: 'liked your post', time: '2 hours ago' },
            { id: 2, type: 'comment', user: 'Emily R.', action: 'commented on your post', time: '4 hours ago' },
            { id: 3, type: 'connection', user: 'Jennifer L.', action: 'sent you a connection request', time: '1 day ago' }
          ]);
          
          setQuickStats({
            posts: 12,
            connections: 487,
            views: 2543,
            likes: 189
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    
    fetchUserData();
  }, [currentUser, getVerificationStatus]);

  const quickActions = [
    {
      icon: <MessageSquare className="w-5 h-5" />,
      title: 'Create Post',
      description: 'Share your professional insights',
      link: '/create-post',
      gradient: 'from-blue-500 to-purple-600',
      popular: true
    },
    {
      icon: <Feed className="w-5 h-5" />,
      title: 'Browse Feed',
      description: 'See what\'s happening in your network',
      link: '/feed',
      gradient: 'from-green-500 to-blue-500'
    },
    {
      icon: <Briefcase className="w-5 h-5" />,
      title: 'Job Opportunities',
      description: 'Find your next career move',
      link: '/jobs',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: 'Anonymous Mode',
      description: 'Share safely and confidentially',
      link: '/anonymous',
      gradient: 'from-purple-500 to-pink-500',
      secure: true
    }
  ];

  const trendingTopics = [
    { tag: 'Women in Tech', posts: 234 },
    { tag: 'Leadership', posts: 189 },
    { tag: 'Work-Life Balance', posts: 156 },
    { tag: 'Career Growth', posts: 98 },
    { tag: 'Mentorship', posts: 67 }
  ];

  return (
    <Box className="min-h-screen bg-gradient-subtle">
      <EnhancedNavigation />
      
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box sx={{ mb: 4 }}>
            <Typography 
              variant="h3" 
              component="h1" 
              className="gradient-text font-bold mb-2"
            >
              Welcome back, {currentUser?.firstName || 'User'}! 👋
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.7, mb: 3 }}>
              Ready to connect, grow, and make an impact today?
            </Typography>

            {/* Verification Alert */}
            {currentUser?.verificationStatus !== 'verified' && (
              <Alert 
                severity="info" 
                sx={{ 
                  mb: 3, 
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(156, 39, 176, 0.1) 100%)',
                  border: '1px solid rgba(33, 150, 243, 0.2)'
                }}
                action={
                  <ModernButton 
                    variant="outlined"
                    size="small"
                    onClick={() => navigate('/verification')}
                  >
                    Verify Now
                  </ModernButton>
                }
              >
                {currentUser?.verificationStatus === 'pending' 
                  ? 'Your account is partially verified. Complete all verification steps to unlock premium features!' 
                  : 'Verify your account to access all features and join our trusted community.'}
              </Alert>
            )}
          </Box>
        </motion.div>

        <Grid container spacing={4}>
          {/* Main Content Area */}
          <Grid item xs={12} lg={8}>
            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Grid container spacing={3} sx={{ mb: 4 }}>
                {[
                  { label: 'Posts', value: quickStats.posts, icon: <MessageSquare className="w-4 h-4" />, color: 'blue' },
                  { label: 'Connections', value: quickStats.connections, icon: <Users className="w-4 h-4" />, color: 'green' },
                  { label: 'Profile Views', value: quickStats.views, icon: <TrendingUp className="w-4 h-4" />, color: 'orange' },
                  { label: 'Likes Received', value: quickStats.likes, icon: <Heart className="w-4 h-4" />, color: 'pink' }
                ].map((stat, index) => (
                  <Grid item xs={6} md={3} key={stat.label}>
                    <ModernCard className="h-full">
                      <Box className="flex items-center justify-between">
                        <Box>
                          <Typography variant="h4" className="font-bold mb-1">
                            {stat.value.toLocaleString()}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.7 }}>
                            {stat.label}
                          </Typography>
                        </Box>
                        <Box className={`p-3 rounded-full bg-${stat.color}-100 text-${stat.color}-600`}>
                          {stat.icon}
                        </Box>
                      </Box>
                    </ModernCard>
                  </Grid>
                ))}
              </Grid>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Typography variant="h5" className="font-semibold mb-3">
                Quick Actions
              </Typography>
              <Grid container spacing={3} sx={{ mb: 4 }}>
                {quickActions.map((action, index) => (
                  <Grid item xs={12} sm={6} key={action.title}>
                    <ModernCard 
                      className="h-full cursor-pointer group hover:shadow-lg transition-all duration-300"
                      onClick={() => navigate(action.link)}
                    >
                      <Box className="relative overflow-hidden">
                        <Box className={`absolute inset-0 bg-gradient-to-r ${action.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
                        <Box className="relative p-6">
                          <Box className="flex items-start justify-between mb-3">
                            <Box className={`p-3 rounded-xl bg-gradient-to-r ${action.gradient} text-white`}>
                              {action.icon}
                            </Box>
                            <Box className="flex items-center space-x-2">
                              {action.popular && <ModernBadge variant="success">Popular</ModernBadge>}
                              {action.secure && <ModernBadge variant="warning">Secure</ModernBadge>}
                              <ChevronRight className="w-5 h-5 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                            </Box>
                          </Box>
                          <Typography variant="h6" className="font-semibold mb-2">
                            {action.title}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.7 }}>
                            {action.description}
                          </Typography>
                        </Box>
                      </Box>
                    </ModernCard>
                  </Grid>
                ))}
              </Grid>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Typography variant="h5" className="font-semibold mb-3">
                Recent Activity
              </Typography>
              <ModernCard>
                <Box className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <Box key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                      <Box className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-semibold">
                        {activity.user.charAt(0)}
                      </Box>
                      <Box className="flex-1">
                        <Typography variant="body2" className="font-medium">
                          <span className="text-blue-600">{activity.user}</span> {activity.action}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.6 }}>
                          {activity.time}
                        </Typography>
                      </Box>
                      <Box className="flex items-center space-x-2">
                        {activity.type === 'like' && <Heart className="w-4 h-4 text-red-500" />}
                        {activity.type === 'comment' && <MessageSquare className="w-4 h-4 text-blue-500" />}
                        {activity.type === 'connection' && <Users className="w-4 h-4 text-green-500" />}
                      </Box>
                    </Box>
                  ))}
                  <Box className="pt-3 border-t">
                    <ModernButton 
                      variant="outlined" 
                      fullWidth
                      onClick={() => navigate('/notifications')}
                    >
                      View All Notifications
                    </ModernButton>
                  </Box>
                </Box>
              </ModernCard>
            </motion.div>
          </Grid>

          {/* Right Sidebar */}
          <Grid item xs={12} lg={4}>
            <Box className="space-y-4">
              {/* Trending Topics */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <ModernCard>
                  <Typography variant="h6" className="font-semibold mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-orange-500" />
                    Trending Topics
                  </Typography>
                  <Box className="space-y-3">
                    {trendingTopics.map((topic, index) => (
                      <Box key={topic.tag} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200">
                        <Box>
                          <Typography variant="body2" className="font-medium">
                            #{topic.tag}
                          </Typography>
                          <Typography variant="caption" sx={{ opacity: 0.6 }}>
                            {topic.posts} posts
                          </Typography>
                        </Box>
                        <Star className="w-4 h-4 text-yellow-500" />
                      </Box>
                    ))}
                  </Box>
                </ModernCard>
              </motion.div>

              {/* Profile Completion */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <ModernCard>
                  <Typography variant="h6" className="font-semibold mb-4">
                    Profile Completion
                  </Typography>
                  <Box className="space-y-3">
                    <Box className="relative">
                      <Box className="flex justify-between items-center mb-2">
                        <Typography variant="body2">85% Complete</Typography>
                        <Typography variant="caption" sx={{ opacity: 0.6 }}>
                          Almost there!
                        </Typography>
                      </Box>
                      <Box className="w-full bg-gray-200 rounded-full h-2">
                        <Box 
                          className="bg-gradient-primary h-2 rounded-full transition-all duration-500"
                          sx={{ width: '85%' }}
                        />
                      </Box>
                    </Box>
                    <ModernButton 
                      variant="outlined" 
                      size="small" 
                      fullWidth
                      onClick={() => navigate('/edit-profile')}
                    >
                      Complete Profile
                    </ModernButton>
                  </Box>
                </ModernCard>
              </motion.div>

              {/* Quick Settings */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <ModernCard>
                  <Typography variant="h6" className="font-semibold mb-4 flex items-center">
                    <Settings className="w-5 h-5 mr-2 text-gray-600" />
                    Quick Settings
                  </Typography>
                  <Box className="space-y-2">
                    {[
                      { label: 'Privacy Settings', link: '/settings' },
                      { label: 'Notification Preferences', link: '/settings' },
                      { label: 'Security Settings', link: '/security' }
                    ].map((setting) => (
                      <Box 
                        key={setting.label}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                        onClick={() => navigate(setting.link)}
                      >
                        <Typography variant="body2">
                          {setting.label}
                        </Typography>
                        <ChevronRight className="w-4 h-4 opacity-50" />
                      </Box>
                    ))}
                  </Box>
                </ModernCard>
              </motion.div>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ModernDashboard;
