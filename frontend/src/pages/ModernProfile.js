import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Box, 
  Typography, 
  Grid,
  Avatar,
  Divider,
  Alert,
  Chip,
  IconButton,
  Tab,
  Tabs,
  Badge,
  LinearProgress
} from '@mui/material';
import { 
  Edit, 
  Mail, 
  MapPin, 
  Calendar, 
  Users, 
  Award, 
  Settings, 
  Share2,
  MoreVertical,
  Camera,
  Star,
  BookOpen,
  TrendingUp
} from 'lucide-react';
import { ModernButton, ModernCard, ModernAvatar } from '../components/ui/ModernComponents';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [profileCompletion, setProfileCompletion] = useState(0);

  // Calculate profile completion percentage
  useEffect(() => {
    if (currentUser) {
      const fields = [
        currentUser.firstName,
        currentUser.lastName,
        currentUser.email,
        currentUser.bio,
        currentUser.industry,
        currentUser.location,
        currentUser.profilePicture
      ];
      
      const completedFields = fields.filter(field => field && field.length > 0).length;
      const completion = Math.round((completedFields / fields.length) * 100);
      setProfileCompletion(completion);
    }
  }, [currentUser]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const TabPanel = ({ children, value, index }) => (
    <Box role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </Box>
  );

  return (
    <Box className="min-h-screen bg-gray-50 py-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-6xl mx-auto px-4"
      >
        {/* Profile Header */}
        <motion.div variants={itemVariants}>
          <ModernCard className="mb-6 overflow-hidden">
            {/* Cover Photo */}
            <Box 
              className="h-48 bg-gradient-primary relative"
              sx={{
                background: 'linear-gradient(135deg, var(--accent-purple), var(--primary-500))',
                position: 'relative'
              }}
            >
              <IconButton
                className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm"
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(8px)',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  }
                }}
              >
                <Camera size={20} />
              </IconButton>
              
              {/* Floating decoration */}
              <motion.div
                className="absolute top-8 left-8 w-16 h-16 rounded-full bg-white/10"
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            </Box>

            {/* Profile Info */}
            <Box className="relative px-6 pb-6">
              {/* Avatar */}
              <Box className="flex items-end justify-between -mt-16 mb-4">
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    <IconButton
                      size="small"
                      sx={{
                        backgroundColor: 'var(--accent-purple)',
                        color: 'white',
                        width: 32,
                        height: 32,
                        '&:hover': {
                          backgroundColor: 'var(--primary-500)',
                        }
                      }}
                    >
                      <Camera size={16} />
                    </IconButton>
                  }
                >
                  <ModernAvatar
                    src={currentUser?.profilePicture}
                    alt={`${currentUser?.firstName} ${currentUser?.lastName}`}
                    size="xl"
                    className="border-4 border-white shadow-xl"
                    sx={{
                      width: 128,
                      height: 128,
                      border: '4px solid white',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    {currentUser?.firstName?.[0]}{currentUser?.lastName?.[0]}
                  </ModernAvatar>
                </Badge>

                <Box className="flex gap-2">
                  <ModernButton
                    variant="secondary"
                    size="sm"
                    startIcon={<Share2 size={16} />}
                    className="shadow-sm"
                  >
                    Share
                  </ModernButton>
                  <ModernButton
                    variant="primary"
                    size="sm"
                    startIcon={<Edit size={16} />}
                    href="/edit-profile"
                  >
                    Edit Profile
                  </ModernButton>
                  <IconButton
                    size="small"
                    sx={{
                      backgroundColor: 'var(--gray-100)',
                      '&:hover': {
                        backgroundColor: 'var(--gray-200)',
                      }
                    }}
                  >
                    <MoreVertical size={20} />
                  </IconButton>
                </Box>
              </Box>

              {/* Name and Title */}
              <Box className="mb-4">
                <Box className="flex items-center gap-2 mb-2">
                  <Typography variant="h4" className="font-bold text-gray-900">
                    {currentUser?.firstName} {currentUser?.lastName}
                  </Typography>
                  {currentUser?.verificationStatus === 'verified' && (
                    <Chip
                      label="Verified"
                      size="small"
                      icon={<Award size={16} />}
                      sx={{
                        backgroundColor: 'var(--success-100)',
                        color: 'var(--success-700)',
                        fontWeight: 600
                      }}
                    />
                  )}
                </Box>
                
                <Typography variant="h6" color="text.secondary" className="mb-2">
                  {currentUser?.title || 'Professional Title'}
                </Typography>
                
                <Box className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  {currentUser?.location && (
                    <Box className="flex items-center gap-1">
                      <MapPin size={16} />
                      <span>{currentUser.location}</span>
                    </Box>
                  )}
                  {currentUser?.industry && (
                    <Box className="flex items-center gap-1">
                      <BookOpen size={16} />
                      <span>{currentUser.industry}</span>
                    </Box>
                  )}
                  <Box className="flex items-center gap-1">
                    <Calendar size={16} />
                    <span>Joined {new Date(currentUser?.createdAt).toLocaleDateString()}</span>
                  </Box>
                </Box>
              </Box>

              {/* Stats */}
              <Box className="grid grid-cols-4 gap-4 mb-4">
                <Box className="text-center">
                  <Typography variant="h6" className="font-bold text-purple-600">
                    {currentUser?.connectionsCount || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Connections
                  </Typography>
                </Box>
                <Box className="text-center">
                  <Typography variant="h6" className="font-bold text-blue-600">
                    {currentUser?.postsCount || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Posts
                  </Typography>
                </Box>
                <Box className="text-center">
                  <Typography variant="h6" className="font-bold text-green-600">
                    {currentUser?.achievementsCount || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Achievements
                  </Typography>
                </Box>
                <Box className="text-center">
                  <Typography variant="h6" className="font-bold text-orange-600">
                    {profileCompletion}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Complete
                  </Typography>
                </Box>
              </Box>

              {/* Profile Completion */}
              {profileCompletion < 100 && (
                <Box className="mb-4">
                  <Box className="flex items-center justify-between mb-2">
                    <Typography variant="body2" className="font-medium">
                      Profile Completion
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {profileCompletion}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={profileCompletion}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'var(--gray-200)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: 'var(--accent-purple)',
                        borderRadius: 4,
                      }
                    }}
                  />
                </Box>
              )}

              {/* Bio */}
              {currentUser?.bio && (
                <Typography variant="body1" className="text-gray-700 leading-relaxed">
                  {currentUser.bio}
                </Typography>
              )}
            </Box>
          </ModernCard>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div variants={itemVariants}>
          <ModernCard className="mb-6">
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                  minHeight: 64,
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: 'var(--accent-purple)',
                  height: 3,
                },
              }}
            >
              <Tab
                label="Overview"
                icon={<TrendingUp size={20} />}
                iconPosition="start"
              />
              <Tab
                label="Posts"
                icon={<BookOpen size={20} />}
                iconPosition="start"
              />
              <Tab
                label="Achievements"
                icon={<Award size={20} />}
                iconPosition="start"
              />
              <Tab
                label="Connections"
                icon={<Users size={20} />}
                iconPosition="start"
              />
              <Tab
                label="Settings"
                icon={<Settings size={20} />}
                iconPosition="start"
              />
            </Tabs>
          </ModernCard>
        </motion.div>

        {/* Tab Content */}
        <motion.div variants={itemVariants}>
          {/* Overview Tab */}
          <TabPanel value={activeTab} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <ModernCard className="p-6">
                  <Typography variant="h6" className="font-bold mb-4">
                    Recent Activity
                  </Typography>
                  <Box className="space-y-4">
                    {[1, 2, 3].map((item) => (
                      <Box key={item} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                        <ModernAvatar size="sm" />
                        <Box className="flex-1">
                          <Typography variant="body2" className="font-medium">
                            You shared a new post
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            2 hours ago
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </ModernCard>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <ModernCard className="p-6 mb-4">
                  <Typography variant="h6" className="font-bold mb-4">
                    Skills & Expertise
                  </Typography>
                  <Box className="flex flex-wrap gap-2">
                    {['Leadership', 'Project Management', 'Strategic Planning', 'Team Building'].map((skill) => (
                      <Chip
                        key={skill}
                        label={skill}
                        size="small"
                        sx={{
                          backgroundColor: 'var(--accent-purple)',
                          color: 'white',
                          fontWeight: 500
                        }}
                      />
                    ))}
                  </Box>
                </ModernCard>

                <ModernCard className="p-6">
                  <Typography variant="h6" className="font-bold mb-4">
                    Quick Actions
                  </Typography>
                  <Box className="space-y-2">
                    <ModernButton variant="ghost" fullWidth className="justify-start">
                      <Edit size={16} className="mr-2" />
                      Edit Profile
                    </ModernButton>
                    <ModernButton variant="ghost" fullWidth className="justify-start">
                      <Settings size={16} className="mr-2" />
                      Account Settings
                    </ModernButton>
                    <ModernButton variant="ghost" fullWidth className="justify-start">
                      <Share2 size={16} className="mr-2" />
                      Share Profile
                    </ModernButton>
                  </Box>
                </ModernCard>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Other Tab Panels */}
          <TabPanel value={activeTab} index={1}>
            <ModernCard className="p-6">
              <Typography variant="h6" className="font-bold mb-4">
                Your Posts
              </Typography>
              <Typography color="text.secondary">
                Posts will be displayed here...
              </Typography>
            </ModernCard>
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <ModernCard className="p-6">
              <Typography variant="h6" className="font-bold mb-4">
                Achievements
              </Typography>
              <Typography color="text.secondary">
                Your achievements will be displayed here...
              </Typography>
            </ModernCard>
          </TabPanel>

          <TabPanel value={activeTab} index={3}>
            <ModernCard className="p-6">
              <Typography variant="h6" className="font-bold mb-4">
                Connections
              </Typography>
              <Typography color="text.secondary">
                Your professional connections will be displayed here...
              </Typography>
            </ModernCard>
          </TabPanel>

          <TabPanel value={activeTab} index={4}>
            <ModernCard className="p-6">
              <Typography variant="h6" className="font-bold mb-4">
                Profile Settings
              </Typography>
              <Typography color="text.secondary">
                Profile settings and privacy controls will be displayed here...
              </Typography>
            </ModernCard>
          </TabPanel>
        </motion.div>
      </motion.div>
    </Box>
  );
};

export default Profile;
