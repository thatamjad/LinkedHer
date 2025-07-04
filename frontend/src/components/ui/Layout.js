import React, { useState, useEffect } from 'react';
import { 
  Box, 
  AppBar, 
  Toolbar, 
  IconButton, 
  Typography, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  useMediaQuery, 
  useTheme,
  SwipeableDrawer,
  Fab,
  Paper,
  BottomNavigation,
  BottomNavigationAction,
  Badge,
  Slide,
  Zoom,
  Fade
} from '@mui/material';
import { 
  Menu as MenuIcon,
  Home as HomeIcon,
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  Work as WorkIcon,
  Settings as SettingsIcon,
  ExploreOutlined as ExploreIcon,
  ChatBubbleOutline as ChatIcon,
  Masks as MasksIcon,
  AccountCircle as AccountIcon,
  NightsStay as NightIcon,
  LightMode as LightIcon,
  Add as AddIcon,
  Security as SecurityIcon,
  Shield as ShieldIcon
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAnonymous } from '../../context/AnonymousContext';
import ModeToggle from './ModeToggle';
import SecurityIndicator from './SecurityIndicator';

const drawerWidth = 240;

const Layout = ({ children }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const { currentUser } = useAuth();
  const { anonymousMode, activePersona } = useAnonymous();
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [fabVisible, setFabVisible] = useState(true);
  const [lastScrollTop, setLastScrollTop] = useState(0);
  
  // Handle scroll to show/hide FAB and AppBar
  useEffect(() => {
    const handleScroll = () => {
      const st = window.pageYOffset || document.documentElement.scrollTop;
      setFabVisible(st < lastScrollTop || st < 100);
      setLastScrollTop(st <= 0 ? 0 : st);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollTop]);

  // Determine current active nav item
  const getActiveNav = () => {
    const path = location.pathname;
    if (anonymousMode) {
      if (path === '/anonymous') return 'anonymous-feed';
      if (path.startsWith('/anonymous/personas')) return 'personas';
      if (path.startsWith('/security')) return 'security';
      return 'anonymous-feed';
    } else {
      if (path === '/') return 'home';
      if (path.startsWith('/profile')) return 'profile';
      if (path.startsWith('/notifications')) return 'notifications';
      if (path.startsWith('/jobs')) return 'jobs';
      if (path.startsWith('/security')) return 'security';
      return 'home';
    }
  };
  
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  const handleNavigation = (route) => {
    navigate(route);
    if (!isDesktop) setMobileOpen(false);
  };
  
  // Create New Post/Anonymous Post Action
  const handleCreateNew = () => {
    if (anonymousMode) {
      navigate('/anonymous/create-post');
    } else {
      navigate('/create-post');
    }
  };
  
  // Navigation items based on mode
  const getNavigationItems = () => {
    if (anonymousMode) {
      return [
        { 
          text: 'Anonymous Feed', 
          icon: <NightIcon />, 
          route: '/anonymous',
          id: 'anonymous-feed'
        },
        { 
          text: 'Personas', 
          icon: <MasksIcon />, 
          route: '/anonymous/personas',
          id: 'personas'
        },
        { 
          text: 'Explore', 
          icon: <ExploreIcon />, 
          route: '/anonymous/explore',
          id: 'explore'
        },
        { 
          text: 'Anonymous Chat', 
          icon: <ChatIcon />, 
          route: '/anonymous/chat',
          id: 'chat'
        },
        { 
          text: 'Security & Privacy', 
          icon: <ShieldIcon />, 
          route: '/security',
          id: 'security'
        }
      ];
    } else {
      return [
        { 
          text: 'Home', 
          icon: <HomeIcon />, 
          route: '/',
          id: 'home'
        },
        { 
          text: 'Profile', 
          icon: <PersonIcon />, 
          route: '/profile',
          id: 'profile'
        },
        { 
          text: 'Notifications', 
          icon: <Badge badgeContent={3} color="error"><NotificationsIcon /></Badge>, 
          route: '/notifications',
          id: 'notifications'
        },
        { 
          text: 'Jobs', 
          icon: <WorkIcon />, 
          route: '/jobs',
          id: 'jobs'
        },
        { 
          text: 'Security & Privacy', 
          icon: <SecurityIcon />, 
          route: '/security',
          id: 'security'
        },
        { 
          text: 'Settings', 
          icon: <SettingsIcon />, 
          route: '/settings',
          id: 'settings'
        }
      ];
    }
  };
  
  const navigationItems = getNavigationItems();
  const activeNav = getActiveNav();
  
  // Create drawer content
  const drawer = (
    <Box>
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: anonymousMode ? 'background.paper' : 'secondary.light'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 1,
            justifyContent: 'center',
            width: '100%',
          }}
        >          <Typography
            variant="h6"
            component="div"
            sx={{ 
              fontWeight: 600,
              textAlign: 'center',
              color: anonymousMode ? 'primary.main' : 'professional.main'
            }}
          >
            {anonymousMode ? 'Anonymous Mode' : 'Linker'}
          </Typography>
        </Box>
        {anonymousMode && activePersona && (
          <Typography variant="body2" color="text.secondary">
            Persona: {activePersona.name}
          </Typography>
        )}
        
        {currentUser && (
          <Box sx={{ mt: 1 }}>
            <SecurityIndicator 
              status={currentUser?.security?.twoFactorEnabled ? 'high' : 'medium'} 
              showText={false}
              onClick={() => handleNavigation('/security')}
            />
          </Box>
        )}
      </Box>
      
      <List sx={{ p: 1 }}>
        {navigationItems.map((item) => (
          <ListItem 
            button 
            key={item.text}
            onClick={() => handleNavigation(item.route)}
            selected={activeNav === item.id}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              '&.Mui-selected': {
                bgcolor: anonymousMode ? 'primary.dark' : 'primary.light',
                color: 'white',
                '&:hover': {
                  bgcolor: anonymousMode ? 'primary.main' : 'primary.main',
                }
              }
            }}
          >
            <ListItemIcon sx={{ 
              color: activeNav === item.id ? 'white' : 'inherit'
            }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      
      <Box sx={{ 
        mt: 'auto', 
        p: 2, 
        borderTop: 1, 
        borderColor: 'divider',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <ModeToggle />
      </Box>
    </Box>
  );
  
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* App Bar */}
      <Slide appear={false} direction="down" in={fabVisible}>
        <AppBar 
          position="fixed" 
          color={anonymousMode ? 'default' : 'primary'}
          elevation={1}
          sx={{
            width: { md: `calc(100% - ${isDesktop ? drawerWidth : 0}px)` },
            ml: { md: isDesktop ? `${drawerWidth}px` : 0 },
            bgcolor: anonymousMode ? 'background.paper' : 'primary.main',
            transition: theme => theme.transitions.create(['margin', 'width'], {
              easing: theme.transitions.easing.easeOut,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography 
              variant="h6" 
              noWrap 
              component="div"
              sx={{ 
                flexGrow: 1,
                color: anonymousMode ? 'text.primary' : 'white'
              }}
            >
              {anonymousMode ? 'Anonymous Mode' : 'Linker'}
            </Typography>
            
            {!isDesktop && (
              <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
                <ModeToggle />
              </Box>
            )}
          </Toolbar>
        </AppBar>
      </Slide>
      
      {/* Side drawer - permanent on desktop, temporary on mobile */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        {/* The mobile drawer implementation */}
        {!isDesktop && (
          <SwipeableDrawer
            variant="temporary"
            open={mobileOpen}
            onOpen={() => setMobileOpen(true)}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': { 
                boxSizing: 'border-box', 
                width: drawerWidth,
                borderRadius: { xs: '0 16px 16px 0', md: 0 }
              },
            }}
          >
            {drawer}
          </SwipeableDrawer>
        )}
        
        {/* The desktop permanent drawer */}
        {isDesktop && (
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', md: 'block' },
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: drawerWidth,
              },
            }}
            open
          >
            {drawer}
          </Drawer>
        )}
      </Box>
      
      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          pt: { xs: 7, sm: 8 },
          pb: { xs: 7, sm: 0 },
          px: { xs: 2, sm: 3 },
          transition: theme => theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Fade in={true} timeout={500}>
          {children}
        </Fade>
      </Box>
      
      {/* Floating Action Button for new post */}
      <Zoom in={fabVisible}>
        <Fab
          color={anonymousMode ? 'primary' : 'primary'}
          aria-label={anonymousMode ? 'new anonymous post' : 'new post'}
          onClick={handleCreateNew}
          sx={{
            position: 'fixed',
            bottom: { xs: 80, sm: 32 },
            right: 24,
            transition: 'all 0.3s ease-in-out',
          }}
        >
          <AddIcon />
        </Fab>
      </Zoom>
      
      {/* Bottom navigation for mobile */}
      {!isDesktop && (
        <Paper 
          sx={{ 
            position: 'fixed', 
            bottom: 0, 
            left: 0, 
            right: 0,
            borderRadius: '16px 16px 0 0',
            overflow: 'hidden',
            zIndex: 1100,
            boxShadow: '0px -2px 10px rgba(0,0,0,0.1)'
          }} 
          elevation={3}
        >
          <BottomNavigation 
            value={activeNav}
            onChange={(event, newValue) => {
              // Find the item with matching id and navigate to its route
              const item = navigationItems.find(item => item.id === newValue);
              if (item) {
                navigate(item.route);
              }
            }}
            sx={{ 
              height: 60,
              bgcolor: anonymousMode ? 'background.paper' : 'background.paper',
            }}
          >
            {navigationItems.slice(0, 4).map((item) => (
              <BottomNavigationAction 
                key={item.id}
                label={item.text} 
                value={item.id} 
                icon={item.icon}
                sx={{
                  color: activeNav === item.id 
                    ? (anonymousMode ? 'primary.main' : 'primary.main') 
                    : 'text.secondary',
                  '&.Mui-selected': {
                    color: anonymousMode ? 'primary.main' : 'primary.main',
                  }
                }}
              />
            ))}
          </BottomNavigation>
        </Paper>
      )}
    </Box>
  );
};

export default Layout; 