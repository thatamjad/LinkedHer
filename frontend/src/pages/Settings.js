import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Divider,
  Button,
  IconButton,
  Skeleton,
  useTheme
} from '@mui/material';
import { 
  Security as SecurityIcon,
  AccountCircle as AccountIcon,
  Notifications as NotificationsIcon,
  Logout as LogoutIcon,
  Help as HelpIcon,
  Palette as PaletteIcon,
  ArrowForwardIos as ArrowIcon,
  DataObject as DataIcon,
  Language as LanguageIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useAnonymous } from '../context/AnonymousContext';
import ModeSettings from '../components/ui/ModeSettings';
import Layout from '../components/ui/Layout';

const Settings = () => {
  const theme = useTheme();
  const { currentUser, logout } = useAuth();
  const { anonymousMode, activePersona } = useAnonymous();
  const [selectedSetting, setSelectedSetting] = useState(null);
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };
  
  // If a specific setting is selected, show its detailed view
  if (selectedSetting === 'mode') {
    return (
      <Layout>
        <Container maxWidth="md" sx={{ py: 2 }}>
          <ModeSettings onBack={() => setSelectedSetting(null)} />
        </Container>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <Container maxWidth="md">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" fontWeight={600} gutterBottom>
            Settings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your account settings and preferences
          </Typography>
        </Box>
        
        {/* User Profile Summary */}
        <Card 
          sx={{ 
            mb: 4,
            borderRadius: 2,
            bgcolor: anonymousMode ? 'background.paper' : theme.palette.secondary.light,
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)'
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item>
                <Avatar 
                  src={currentUser?.profileImage} 
                  sx={{ 
                    width: 80, 
                    height: 80,
                    bgcolor: anonymousMode ? 'primary.main' : 'professional.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {anonymousMode ? activePersona?.name?.charAt(0) || 'A' : currentUser?.name?.charAt(0) || 'U'}
                </Avatar>
              </Grid>
              <Grid item xs>
                <Typography variant="h6" fontWeight={600}>
                  {anonymousMode ? activePersona?.name || 'Anonymous' : currentUser?.name || 'User'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {anonymousMode ? 'Anonymous Mode Active' : currentUser?.email || 'No email provided'}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    mt: 1,
                    color: anonymousMode ? 'primary.main' : 'professional.main',
                    fontWeight: 500
                  }}
                >
                  {anonymousMode ? 'Anonymous Account' : 'Professional Account'}
                </Typography>
              </Grid>
              <Grid item>
                <Button 
                  variant="outlined" 
                  color={anonymousMode ? 'primary' : 'inherit'}
                  onClick={() => setSelectedSetting('account')}
                >
                  Edit Profile
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        
        {/* Settings Menu */}
        <Paper 
          elevation={1} 
          sx={{ 
            borderRadius: 2,
            mb: 4,
            overflow: 'hidden'
          }}
        >
          <List disablePadding>
            <ListItem 
              button 
              onClick={() => setSelectedSetting('mode')}
              sx={{ 
                py: 2,
                '&:hover': {
                  bgcolor: anonymousMode ? alpha => theme.palette.primary.main + '10' : alpha => theme.palette.primary.main + '10'
                }
              }}
            >
              <ListItemIcon>
                <SecurityIcon color={anonymousMode ? 'primary' : 'primary'} />
              </ListItemIcon>
              <ListItemText 
                primary="Mode Settings" 
                secondary={anonymousMode ? 'Anonymous mode preferences' : 'Professional mode preferences'} 
              />
              <ArrowIcon color="action" fontSize="small" />
            </ListItem>
            
            <Divider />
            
            <ListItem 
              button 
              onClick={() => setSelectedSetting('notifications')}
              sx={{ py: 2 }}
            >
              <ListItemIcon>
                <NotificationsIcon color="action" />
              </ListItemIcon>
              <ListItemText 
                primary="Notification Preferences" 
                secondary="Control how you receive notifications" 
              />
              <ArrowIcon color="action" fontSize="small" />
            </ListItem>
            
            <Divider />
            
            <ListItem 
              button 
              onClick={() => setSelectedSetting('appearance')}
              sx={{ py: 2 }}
            >
              <ListItemIcon>
                <PaletteIcon color="action" />
              </ListItemIcon>
              <ListItemText 
                primary="Appearance" 
                secondary="Customize how the app looks" 
              />
              <ArrowIcon color="action" fontSize="small" />
            </ListItem>
            
            <Divider />
            
            <ListItem 
              button 
              onClick={() => setSelectedSetting('language')}
              sx={{ py: 2 }}
            >
              <ListItemIcon>
                <LanguageIcon color="action" />
              </ListItemIcon>
              <ListItemText 
                primary="Language & Region" 
                secondary="Change your language preferences" 
              />
              <ArrowIcon color="action" fontSize="small" />
            </ListItem>
            
            <Divider />
            
            <ListItem 
              button 
              onClick={() => setSelectedSetting('data')}
              sx={{ py: 2 }}
            >
              <ListItemIcon>
                <DataIcon color="action" />
              </ListItemIcon>
              <ListItemText 
                primary="Data & Privacy" 
                secondary="Manage your data and privacy options" 
              />
              <ArrowIcon color="action" fontSize="small" />
            </ListItem>
            
            <Divider />
            
            <ListItem 
              button 
              onClick={() => setSelectedSetting('help')}
              sx={{ py: 2 }}
            >
              <ListItemIcon>
                <HelpIcon color="action" />
              </ListItemIcon>
              <ListItemText 
                primary="Help & Support" 
                secondary="Get assistance with issues" 
              />
              <ArrowIcon color="action" fontSize="small" />
            </ListItem>
          </List>
        </Paper>
        
        {/* Logout Button */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <Button 
            variant="outlined" 
            color="error" 
            size="large"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{ px: 4 }}
          >
            Log Out
          </Button>
        </Box>
        
        {/* App Version */}
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Linker v1.0.0
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            © 2023 Linker. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Layout>
  );
};

export default Settings; 