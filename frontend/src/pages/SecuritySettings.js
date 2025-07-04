import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Tabs, 
  Tab, 
  Paper, 
  Container, 
  Button, 
  CircularProgress, 
  TextField, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Grid, 
  FormControlLabel, 
  Switch, 
  Card, 
  CardContent, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemSecondaryAction, 
  IconButton, 
  Alert, 
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import DeleteIcon from '@mui/icons-material/Delete';
import LockIcon from '@mui/icons-material/Lock';
import DevicesIcon from '@mui/icons-material/Devices';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import QrCodeIcon from '@mui/icons-material/QrCode2';
import SecurityIndicator from '../components/ui/SecurityIndicator';
import { useAuth } from '../context/AuthContext'; // Assuming you have an auth context
import apiClient from '../services/apiClient';

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`security-tabpanel-${index}`}
      aria-labelledby={`security-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const SecuritySettings = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [showTwoFactorDialog, setShowTwoFactorDialog] = useState(false);
  const [securityScore, setSecurityScore] = useState(0);
  const [securityStatus, setSecurityStatus] = useState('medium');
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    connectionsVisibility: 'connections',
    searchDiscovery: {
      includeInSearch: true,
      allowProfileIndexing: true
    },
    activityVisibility: {
      posts: 'public',
      comments: 'public',
      likes: 'connections'
    }
  });
  
  // Get auth context
  const { user } = useAuth();
  
  useEffect(() => {
    // Mock data for demonstration
    // In a real implementation, you would fetch this data from your API
    
    // Check if user has 2FA enabled
    if (user?.security?.twoFactorEnabled) {
      setTwoFactorEnabled(true);
    }
    
    // Calculate security score based on features used
    let score = 0;
    
    // Base score
    score += 10;
    
    // Add for 2FA
    if (user?.security?.twoFactorEnabled) {
      score += 30;
    }
    
    // Add for strong password (mock implementation)
    score += 20;
    
    // Add for limited sessions
    if (sessions.length < 3) {
      score += 10;
    }
    
    // Add for privacy settings
    if (privacySettings.profileVisibility !== 'public') {
      score += 15;
    }
    
    // Add for email notifications
    if (user?.security?.securityNotifications?.email) {
      score += 15;
    }
    
    setSecurityScore(score);
    
    // Set security status based on score
    if (score >= 70) {
      setSecurityStatus('high');
    } else if (score >= 40) {
      setSecurityStatus('medium');
    } else {
      setSecurityStatus('low');
    }
    
    // Fetch active sessions (mock data for now)
    setSessions([
      {
        sessionId: '1',
        device: 'Chrome on Windows 10',
        ipAddress: '192.168.1.1',
        location: { city: 'New York', country: 'USA' },
        lastActivity: new Date(),
        status: 'active',
        isCurrent: true
      },
      {
        sessionId: '2',
        device: 'Safari on iPhone',
        ipAddress: '192.168.1.2',
        location: { city: 'Los Angeles', country: 'USA' },
        lastActivity: new Date(Date.now() - 86400000), // 1 day ago
        status: 'active',
        isCurrent: false
      }
    ]);
    
  }, [user]);
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const handleSetupTwoFactor = async () => {
    setLoading(true);
    try {
      const response = await apiClient.post('/auth/2fa/setup');
      setQrCodeUrl(response.data.qrCodeUrl);
      setBackupCodes(response.data.backupCodes);
      setShowTwoFactorDialog(true);
    } catch (error) {
      console.error('Error setting up 2FA:', error);
      // Show error message
    } finally {
      setLoading(false);
    }
  };
  
  const handleVerifyTwoFactor = async () => {
    if (!verificationCode) {
      return;
    }
    
    setLoading(true);
    try {
      await apiClient.post('/auth/2fa/verify', { token: verificationCode });
      setTwoFactorEnabled(true);
      setShowTwoFactorDialog(false);
      setVerificationCode('');
      
      // Update security score
      setSecurityScore(prevScore => prevScore + 30);
      if (securityScore + 30 >= 70) {
        setSecurityStatus('high');
      }
    } catch (error) {
      console.error('Error verifying 2FA:', error);
      // Show error message
    } finally {
      setLoading(false);
    }
  };
  
  const handleDisableTwoFactor = async () => {
    setLoading(true);
    try {
      await apiClient.post('/auth/2fa/disable');
      setTwoFactorEnabled(false);
      
      // Update security score
      setSecurityScore(prevScore => Math.max(prevScore - 30, 0));
      if (securityScore - 30 < 70) {
        setSecurityStatus('medium');
      }
      if (securityScore - 30 < 40) {
        setSecurityStatus('low');
      }
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      // Show error message
    } finally {
      setLoading(false);
    }
  };
  
  const handleRevokeSession = async (sessionId) => {
    try {
      // In a real implementation, you would make an API call to revoke the session
      
      // Mock successful revocation
      setSessions(prevSessions => 
        prevSessions.filter(session => session.sessionId !== sessionId)
      );
    } catch (error) {
      console.error('Error revoking session:', error);
      // Show error message
    }
  };
  
  const handleRevokeAllSessions = async () => {
    try {
      // In a real implementation, you would make an API call to revoke all sessions except current
      
      // Mock successful revocation - keep only current session
      setSessions(prevSessions => 
        prevSessions.filter(session => session.isCurrent)
      );
    } catch (error) {
      console.error('Error revoking all sessions:', error);
      // Show error message
    }
  };
  
  const handlePrivacySettingChange = (section, value) => {
    // In a real implementation, you would make an API call to update privacy settings
    
    setPrivacySettings(prev => {
      const newSettings = { ...prev };
      
      if (section.includes('.')) {
        // Handle nested properties
        const [parent, child] = section.split('.');
        newSettings[parent] = { 
          ...newSettings[parent], 
          [child]: value 
        };
      } else {
        // Handle top-level properties
        newSettings[section] = value;
      }
      
      return newSettings;
    });
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <SecurityIcon fontSize="large" color="primary" />
          <Typography variant="h4" component="h1">Security & Privacy Settings</Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box>
            <Typography variant="subtitle1" gutterBottom>Your Security Score</Typography>
            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
              <CircularProgress 
                variant="determinate" 
                value={securityScore} 
                size={60}
                sx={{ 
                  color: securityStatus === 'high' 
                    ? 'success.main' 
                    : securityStatus === 'medium' 
                      ? 'warning.main' 
                      : 'error.main'
                }}
              />
              <Box
                sx={{
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  position: 'absolute',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="caption" component="div" color="text.secondary">
                  {`${Math.round(securityScore)}%`}
                </Typography>
              </Box>
            </Box>
          </Box>
          <SecurityIndicator status={securityStatus} />
        </Box>
        
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="security settings tabs">
          <Tab label="Two-Factor Authentication" />
          <Tab label="Active Sessions" />
          <Tab label="Privacy Controls" />
          <Tab label="Anonymous Mode Security" />
        </Tabs>
        
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>Two-Factor Authentication</Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Two-factor authentication adds an extra layer of security to your account by requiring
              both your password and a verification code to sign in.
            </Typography>
            
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <LockIcon color={twoFactorEnabled ? "success" : "disabled"} />
                    <Box>
                      <Typography variant="subtitle1">
                        {twoFactorEnabled ? 'Two-Factor Authentication is Enabled' : 'Two-Factor Authentication is Disabled'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {twoFactorEnabled 
                          ? 'Your account is protected with an additional layer of security.'
                          : 'Enable two-factor authentication for enhanced security.'}
                      </Typography>
                    </Box>
                  </Box>
                  
                  {twoFactorEnabled ? (
                    <Button 
                      variant="outlined" 
                      color="error" 
                      onClick={handleDisableTwoFactor}
                      disabled={loading}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Disable'}
                    </Button>
                  ) : (
                    <Button 
                      variant="contained" 
                      color="primary" 
                      onClick={handleSetupTwoFactor}
                      disabled={loading}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Enable Two-Factor'}
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
            
            {twoFactorEnabled && (
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>Backup Codes</Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Use these backup codes to sign in if you don't have access to your authentication app.
                    Each code can only be used once.
                  </Typography>
                  
                  <Grid container spacing={1} sx={{ mb: 2 }}>
                    {backupCodes.map((code, index) => (
                      <Grid item xs={6} sm={4} key={index}>
                        <Paper 
                          variant="outlined" 
                          sx={{ 
                            p: 1, 
                            textAlign: 'center',
                            fontFamily: 'monospace',
                            bgcolor: 'action.hover'
                          }}
                        >
                          {code}
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                  
                  <Button variant="outlined" size="small">
                    Generate New Backup Codes
                  </Button>
                </CardContent>
              </Card>
            )}
          </Box>
        </TabPanel>
        
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>Active Sessions</Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              These are the devices and locations where your account is currently signed in.
              If you don't recognize a session, revoke it immediately.
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button 
                variant="outlined" 
                color="error" 
                onClick={handleRevokeAllSessions}
                disabled={sessions.length <= 1}
              >
                Revoke All Other Sessions
              </Button>
            </Box>
            
            <List>
              {sessions.map((session) => (
                <React.Fragment key={session.sessionId}>
                  <ListItem
                    secondaryAction={
                      !session.isCurrent && (
                        <IconButton 
                          edge="end" 
                          aria-label="revoke" 
                          onClick={() => handleRevokeSession(session.sessionId)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )
                    }
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <DevicesIcon fontSize="small" />
                          <Typography variant="subtitle2">
                            {session.device}
                            {session.isCurrent && (
                              <Typography 
                                component="span" 
                                sx={{ 
                                  ml: 1, 
                                  bgcolor: 'primary.main', 
                                  color: 'primary.contrastText',
                                  px: 1,
                                  py: 0.5,
                                  borderRadius: 1,
                                  fontSize: '0.75rem'
                                }}
                              >
                                Current
                              </Typography>
                            )}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" color="text.secondary">
                            {session.location.city}, {session.location.country} • IP: {session.ipAddress}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Last activity: {new Date(session.lastActivity).toLocaleString()}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </Box>
        </TabPanel>
        
        <TabPanel value={activeTab} index={2}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>Privacy Controls</Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Control who can see your profile, activity, and how your data is used.
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>Profile Visibility</Typography>
                    
                    <FormControl fullWidth margin="normal">
                      <InputLabel id="profile-visibility-label">Who can view your profile</InputLabel>
                      <Select
                        labelId="profile-visibility-label"
                        id="profile-visibility"
                        value={privacySettings.profileVisibility}
                        label="Who can view your profile"
                        onChange={(e) => handlePrivacySettingChange('profileVisibility', e.target.value)}
                      >
                        <MenuItem value="public">Everyone (Public)</MenuItem>
                        <MenuItem value="connections">Connections Only</MenuItem>
                        <MenuItem value="private">Only Me (Private)</MenuItem>
                      </Select>
                    </FormControl>
                    
                    <FormControl fullWidth margin="normal">
                      <InputLabel id="connections-visibility-label">Who can see your connections</InputLabel>
                      <Select
                        labelId="connections-visibility-label"
                        id="connections-visibility"
                        value={privacySettings.connectionsVisibility}
                        label="Who can see your connections"
                        onChange={(e) => handlePrivacySettingChange('connectionsVisibility', e.target.value)}
                      >
                        <MenuItem value="public">Everyone (Public)</MenuItem>
                        <MenuItem value="connections">Connections Only</MenuItem>
                        <MenuItem value="private">Only Me (Private)</MenuItem>
                      </Select>
                    </FormControl>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>Activity Visibility</Typography>
                    
                    <FormControl fullWidth margin="normal">
                      <InputLabel id="posts-visibility-label">Who can see your posts</InputLabel>
                      <Select
                        labelId="posts-visibility-label"
                        id="posts-visibility"
                        value={privacySettings.activityVisibility.posts}
                        label="Who can see your posts"
                        onChange={(e) => handlePrivacySettingChange('activityVisibility.posts', e.target.value)}
                      >
                        <MenuItem value="public">Everyone (Public)</MenuItem>
                        <MenuItem value="connections">Connections Only</MenuItem>
                        <MenuItem value="private">Only Me (Private)</MenuItem>
                      </Select>
                    </FormControl>
                    
                    <FormControl fullWidth margin="normal">
                      <InputLabel id="comments-visibility-label">Who can see your comments</InputLabel>
                      <Select
                        labelId="comments-visibility-label"
                        id="comments-visibility"
                        value={privacySettings.activityVisibility.comments}
                        label="Who can see your comments"
                        onChange={(e) => handlePrivacySettingChange('activityVisibility.comments', e.target.value)}
                      >
                        <MenuItem value="public">Everyone (Public)</MenuItem>
                        <MenuItem value="connections">Connections Only</MenuItem>
                        <MenuItem value="private">Only Me (Private)</MenuItem>
                      </Select>
                    </FormControl>
                    
                    <FormControl fullWidth margin="normal">
                      <InputLabel id="likes-visibility-label">Who can see your likes</InputLabel>
                      <Select
                        labelId="likes-visibility-label"
                        id="likes-visibility"
                        value={privacySettings.activityVisibility.likes}
                        label="Who can see your likes"
                        onChange={(e) => handlePrivacySettingChange('activityVisibility.likes', e.target.value)}
                      >
                        <MenuItem value="public">Everyone (Public)</MenuItem>
                        <MenuItem value="connections">Connections Only</MenuItem>
                        <MenuItem value="private">Only Me (Private)</MenuItem>
                      </Select>
                    </FormControl>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>Search & Discovery</Typography>
                    
                    <FormControlLabel
                      control={
                        <Switch
                          checked={privacySettings.searchDiscovery.includeInSearch}
                          onChange={(e) => handlePrivacySettingChange('searchDiscovery.includeInSearch', e.target.checked)}
                        />
                      }
                      label="Include your profile in search results"
                    />
                    
                    <FormControlLabel
                      control={
                        <Switch
                          checked={privacySettings.searchDiscovery.allowProfileIndexing}
                          onChange={(e) => handlePrivacySettingChange('searchDiscovery.allowProfileIndexing', e.target.checked)}
                        />
                      }
                      label="Allow search engines to index your profile"
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>
        
        <TabPanel value={activeTab} index={3}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>Anonymous Mode Security</Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Configure security settings for your anonymous mode experience.
            </Typography>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              Anonymous mode settings are applied to all your anonymous personas.
              For persona-specific settings, visit the Personas page.
            </Alert>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>Metadata Protection</Typography>
                    
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Strip EXIF data from images"
                    />
                    
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Obfuscate timestamps"
                    />
                    
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Route traffic through proxy"
                    />
                    
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Randomize file metadata"
                    />
                    
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Prevent browser fingerprinting"
                    />
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>Network Traffic Mixing</Typography>
                    
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Enable timing noise"
                    />
                    
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Use multi-path routing"
                    />
                    
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" gutterBottom>Number of proxy hops:</Typography>
                      <TextField
                        type="number"
                        defaultValue={3}
                        inputProps={{ min: 1, max: 5 }}
                        size="small"
                        sx={{ width: 100 }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>Security Settings</Typography>
                    
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Auto-switch back to professional mode after inactivity"
                    />
                    
                    <Box sx={{ ml: 4, mt: 1 }}>
                      <Typography variant="body2" gutterBottom>Timeout (minutes):</Typography>
                      <TextField
                        type="number"
                        defaultValue={30}
                        inputProps={{ min: 5, max: 120 }}
                        size="small"
                        sx={{ width: 100 }}
                      />
                    </Box>
                    
                    <Box sx={{ mt: 2 }}>
                      <FormControlLabel
                        control={<Switch defaultChecked />}
                        label="Purge session data on logout"
                      />
                      
                      <FormControlLabel
                        control={<Switch defaultChecked />}
                        label="Notify on suspicious activity"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>
      </Paper>
      
      {/* Two-Factor Setup Dialog */}
      <Dialog 
        open={showTwoFactorDialog} 
        onClose={() => setShowTwoFactorDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Set Up Two-Factor Authentication</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" paragraph>
              1. Scan this QR code with your authenticator app (like Google Authenticator or Authy).
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              {qrCodeUrl && (
                <img src={qrCodeUrl} alt="QR Code for Two-Factor Authentication" width="200" height="200" />
              )}
            </Box>
            
            <Typography variant="body1" paragraph>
              2. Enter the 6-digit verification code from your authenticator app.
            </Typography>
            
            <TextField
              label="Verification Code"
              variant="outlined"
              fullWidth
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              inputProps={{ maxLength: 6 }}
              placeholder="000000"
              sx={{ mb: 2 }}
            />
            
            <Typography variant="body1" paragraph>
              3. Save your backup codes in a safe place. You'll need them if you lose access to your device.
            </Typography>
            
            <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 1 }}>
              <Typography variant="caption" sx={{ fontFamily: 'monospace', display: 'block' }}>
                {backupCodes.join(' • ')}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTwoFactorDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleVerifyTwoFactor} 
            variant="contained" 
            disabled={!verificationCode || verificationCode.length < 6 || loading}
            startIcon={loading ? <CircularProgress size={20} /> : <CheckCircleIcon />}
          >
            Verify and Enable
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SecuritySettings; 