import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Slider,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Divider,
  Button,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  alpha
} from '@mui/material';
import {
  Security,
  Visibility,
  VisibilityOff,
  Notifications,
  DoNotDisturb,
  Schedule,
  DeleteOutline,
  SaveOutlined,
  InfoOutlined,
  ColorLens,
  TouchApp,
  ArrowBack,
  Check
} from '@mui/icons-material';
import { useAnonymous } from '../../context/AnonymousContext';

// Settings Panel component
const ModeSettings = ({ onBack }) => {
  const { anonymousMode } = useAnonymous();
  const [currentTab, setCurrentTab] = useState(0);
  const [settings, setSettings] = useState({
    // Privacy settings
    hideOnlineStatus: anonymousMode,
    maskIpAddress: anonymousMode,
    autoDeletePosts: anonymousMode,
    autoDeleteTime: 24,
    
    // Notification settings
    enableNotifications: !anonymousMode,
    notificationSound: !anonymousMode,
    mentionAlerts: !anonymousMode,
    
    // Appearance settings
    animationSpeed: 300,
    gestureControl: true,
    colorTheme: anonymousMode ? 'dark' : 'light',
    
    // Context persistence
    persistSearch: !anonymousMode,
    persistDrafts: true,
    persistLastLocation: true
  });

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  // Handle setting change
  const handleSettingChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  // Save settings
  const handleSaveSettings = () => {
    // Here you would save the settings to the user's profile or anonymous persona
    console.log('Saving settings:', settings);
    // Show success message
    alert('Settings saved successfully!');
  };

  return (
    <Card 
      elevation={3}
      sx={{
        maxWidth: 600,
        mx: 'auto',
        borderRadius: 2,
        overflow: 'hidden',
        bgcolor: anonymousMode ? 'background.paper' : 'background.paper',
      }}
    >
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          bgcolor: anonymousMode ? 'primary.dark' : 'primary.main',
          color: 'white',
        }}
      >
        <IconButton 
          color="inherit" 
          onClick={onBack}
          sx={{ mr: 1 }}
        >
          <ArrowBack />
        </IconButton>
        <Typography variant="h6" fontWeight={600}>
          {anonymousMode ? 'Anonymous Mode Settings' : 'Professional Mode Settings'}
        </Typography>
      </Box>

      <Tabs
        value={currentTab}
        onChange={handleTabChange}
        variant="fullWidth"
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: anonymousMode ? 'background.default' : 'secondary.light',
        }}
      >
        <Tab 
          label="Privacy" 
          icon={<Security fontSize="small" />} 
          iconPosition="start"
        />
        <Tab 
          label="Notifications" 
          icon={<Notifications fontSize="small" />} 
          iconPosition="start"
        />
        <Tab 
          label="Appearance" 
          icon={<ColorLens fontSize="small" />} 
          iconPosition="start"
        />
        <Tab 
          label="Context" 
          icon={<TouchApp fontSize="small" />} 
          iconPosition="start"
        />
      </Tabs>

      <CardContent sx={{ p: 3 }}>
        {/* Privacy Settings */}
        {currentTab === 0 && (
          <Box>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Privacy & Security
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Customize how your data is handled and who can see your activity.
            </Typography>

            <Box sx={{ mt: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.hideOnlineStatus}
                    onChange={(e) => handleSettingChange('hideOnlineStatus', e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="body2">Hide Online Status</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Other users won't see when you're active
                    </Typography>
                  </Box>
                }
              />

              <Divider sx={{ my: 2 }} />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.maskIpAddress}
                    onChange={(e) => handleSettingChange('maskIpAddress', e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="body2">IP Address Protection</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Route traffic through secure proxy
                    </Typography>
                  </Box>
                }
              />

              <Divider sx={{ my: 2 }} />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.autoDeletePosts}
                    onChange={(e) => handleSettingChange('autoDeletePosts', e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="body2">Auto-Delete Posts</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Automatically delete posts after a set time
                    </Typography>
                  </Box>
                }
              />
              
              {settings.autoDeletePosts && (
                <Box sx={{ ml: 4, mt: 1 }}>
                  <Typography variant="body2" gutterBottom>
                    Delete after {settings.autoDeleteTime} hours
                  </Typography>
                  <Slider
                    value={settings.autoDeleteTime}
                    onChange={(e, value) => handleSettingChange('autoDeleteTime', value)}
                    min={1}
                    max={72}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `${value}h`}
                  />
                </Box>
              )}
              
              {/* Security level indicator */}
              <Box 
                sx={{ 
                  mt: 4,
                  p: 2,
                  bgcolor: anonymousMode ? alpha('#9C27B0', 0.1) : alpha('#8B5FBF', 0.1),
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Security color="primary" />
                  <Typography variant="body2">
                    Security Level: {calculateSecurityLevel(settings)}
                  </Typography>
                </Box>
                <Tooltip title="These settings determine your privacy level within the platform">
                  <IconButton size="small">
                    <InfoOutlined fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Box>
        )}

        {/* Notification Settings */}
        {currentTab === 1 && (
          <Box>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Notifications
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Control how and when you receive notifications.
            </Typography>

            <Box sx={{ mt: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.enableNotifications}
                    onChange={(e) => handleSettingChange('enableNotifications', e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="body2">Enable Notifications</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Turn on/off all notifications
                    </Typography>
                  </Box>
                }
              />
              
              {settings.enableNotifications && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notificationSound}
                        onChange={(e) => handleSettingChange('notificationSound', e.target.checked)}
                        color="primary"
                        disabled={!settings.enableNotifications}
                      />
                    }
                    label="Notification Sound"
                  />

                  <Divider sx={{ my: 2 }} />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.mentionAlerts}
                        onChange={(e) => handleSettingChange('mentionAlerts', e.target.checked)}
                        color="primary"
                        disabled={!settings.enableNotifications}
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="body2">Mention Alerts</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Get notified when you're mentioned in a post or comment
                        </Typography>
                      </Box>
                    }
                  />
                </>
              )}
              
              <Box 
                sx={{ 
                  mt: 4,
                  p: 2,
                  bgcolor: settings.enableNotifications ? alpha('#27AE60', 0.1) : alpha('#E74C3C', 0.1),
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                {settings.enableNotifications ? (
                  <>
                    <Notifications color="success" />
                    <Typography variant="body2">
                      You will receive notifications based on your settings
                    </Typography>
                  </>
                ) : (
                  <>
                    <DoNotDisturb color="error" />
                    <Typography variant="body2">
                      All notifications are currently disabled
                    </Typography>
                  </>
                )}
              </Box>
            </Box>
          </Box>
        )}

        {/* Appearance Settings */}
        {currentTab === 2 && (
          <Box>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Appearance & Interface
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Customize how the application looks and behaves.
            </Typography>

            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" gutterBottom>
                Animation Speed (ms)
              </Typography>
              <Slider
                value={settings.animationSpeed}
                onChange={(e, value) => handleSettingChange('animationSpeed', value)}
                min={0}
                max={500}
                step={50}
                marks={[
                  { value: 0, label: 'Off' },
                  { value: 250, label: 'Default' },
                  { value: 500, label: 'Slow' },
                ]}
                valueLabelDisplay="auto"
              />

              <Divider sx={{ my: 3 }} />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.gestureControl}
                    onChange={(e) => handleSettingChange('gestureControl', e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="body2">Gesture Controls</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Enable swipe gestures for navigation
                    </Typography>
                  </Box>
                }
              />

              <Divider sx={{ my: 3 }} />
              
              <FormControl fullWidth>
                <InputLabel id="color-theme-label">Color Theme</InputLabel>
                <Select
                  labelId="color-theme-label"
                  id="color-theme"
                  value={settings.colorTheme}
                  label="Color Theme"
                  onChange={(e) => handleSettingChange('colorTheme', e.target.value)}
                >
                  <MenuItem value="light">Light Mode</MenuItem>
                  <MenuItem value="dark">Dark Mode</MenuItem>
                  <MenuItem value="system">System Default</MenuItem>
                </Select>
              </FormControl>
              
              <Box 
                sx={{ 
                  display: 'flex', 
                  gap: 2, 
                  mt: 3, 
                  justifyContent: 'center',
                  flexWrap: 'wrap'
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: 2,
                    bgcolor: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    border: settings.colorTheme === 'light' ? '2px solid' : 'none',
                    borderColor: 'primary.dark',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleSettingChange('colorTheme', 'light')}
                >
                  <Typography variant="subtitle2">Light</Typography>
                </Box>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: 2,
                    bgcolor: '#121212',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    border: settings.colorTheme === 'dark' ? '2px solid' : 'none',
                    borderColor: 'primary.dark',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleSettingChange('colorTheme', 'dark')}
                >
                  <Typography variant="subtitle2">Dark</Typography>
                </Box>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #ffffff 0%, #ffffff 50%, #121212 50%, #121212 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    border: settings.colorTheme === 'system' ? '2px solid' : 'none',
                    borderColor: 'primary.dark',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleSettingChange('colorTheme', 'system')}
                >
                  <Typography variant="subtitle2" sx={{ color: '#333', textShadow: '0px 0px 2px white' }}>
                    Auto
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        )}

        {/* Context Persistence Settings */}
        {currentTab === 3 && (
          <Box>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Context Persistence
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Control what information persists when switching between modes.
            </Typography>

            <Box sx={{ mt: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.persistSearch}
                    onChange={(e) => handleSettingChange('persistSearch', e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="body2">Remember Search History</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Maintain search history across mode switches
                    </Typography>
                  </Box>
                }
              />

              <Divider sx={{ my: 2 }} />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.persistDrafts}
                    onChange={(e) => handleSettingChange('persistDrafts', e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="body2">Save Post Drafts</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Keep draft posts when switching modes
                    </Typography>
                  </Box>
                }
              />

              <Divider sx={{ my: 2 }} />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.persistLastLocation}
                    onChange={(e) => handleSettingChange('persistLastLocation', e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="body2">Remember Last Location</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Return to the same view when switching back to a mode
                    </Typography>
                  </Box>
                }
              />
              
              <Box 
                sx={{ 
                  mt: 4,
                  p: 2,
                  bgcolor: alpha('#3498DB', 0.1),
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'start',
                  gap: 1
                }}
              >
                <InfoOutlined color="info" sx={{ mt: 0.5 }} />
                <Typography variant="body2">
                  Context persistence settings help maintain your workflow when switching between professional and anonymous modes, but may affect privacy if set too permissively.
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </CardContent>

      <Box 
        sx={{ 
          p: 2, 
          borderTop: 1, 
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between'
        }}
      >
        <Button 
          startIcon={<DeleteOutline />} 
          color="error" 
          variant="text"
          onClick={() => {
            // Reset settings to defaults based on mode
            setSettings({
              hideOnlineStatus: anonymousMode,
              maskIpAddress: anonymousMode,
              autoDeletePosts: anonymousMode,
              autoDeleteTime: 24,
              enableNotifications: !anonymousMode,
              notificationSound: !anonymousMode,
              mentionAlerts: !anonymousMode,
              animationSpeed: 300,
              gestureControl: true,
              colorTheme: anonymousMode ? 'dark' : 'light',
              persistSearch: !anonymousMode,
              persistDrafts: true,
              persistLastLocation: true
            });
          }}
        >
          Reset
        </Button>
        <Button 
          startIcon={<SaveOutlined />} 
          color="primary" 
          variant="contained"
          onClick={handleSaveSettings}
        >
          Save Settings
        </Button>
      </Box>
    </Card>
  );
};

// Helper function to calculate security level based on settings
const calculateSecurityLevel = (settings) => {
  let score = 0;
  
  if (settings.hideOnlineStatus) score += 1;
  if (settings.maskIpAddress) score += 2;
  if (settings.autoDeletePosts) {
    score += 1;
    if (settings.autoDeleteTime <= 24) score += 1;
  }
  
  if (score >= 4) return 'High';
  if (score >= 2) return 'Medium';
  return 'Low';
};

export default ModeSettings; 