import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Alert, 
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress
} from '@mui/material';
import { 
  CheckCircle as CheckIcon, 
  Error as ErrorIcon,
  Warning as WarningIcon 
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const ConnectionDebugger = () => {
  const { currentUser, testLogin, error } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState({
    backend: 'checking',
    auth: 'checking',
    database: 'checking'
  });
  const [debugInfo, setDebugInfo] = useState([]);
  const [testing, setTesting] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    checkConnections();
  }, []);

  const addDebugInfo = (message, type = 'info') => {
    setDebugInfo(prev => [...prev, { 
      message, 
      type, 
      timestamp: new Date().toLocaleTimeString() 
    }]);
  };

  const checkConnections = async () => {
    addDebugInfo('Starting connection checks...', 'info');

    // Check backend server
    try {
      const response = await axios.get(API_URL.replace('/api', ''), { timeout: 5000 });
      setConnectionStatus(prev => ({ ...prev, backend: 'connected' }));
      addDebugInfo('✅ Backend server is reachable', 'success');
    } catch (error) {
      setConnectionStatus(prev => ({ ...prev, backend: 'error' }));
      addDebugInfo('❌ Backend server unreachable: ' + error.message, 'error');
    }

    // Check auth endpoint
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await axios.get(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000
        });
        setConnectionStatus(prev => ({ ...prev, auth: 'connected' }));
        addDebugInfo('✅ Authentication working', 'success');
      } else {
        setConnectionStatus(prev => ({ ...prev, auth: 'no-token' }));
        addDebugInfo('⚠️ No auth token found', 'warning');
      }
    } catch (error) {
      setConnectionStatus(prev => ({ ...prev, auth: 'error' }));
      addDebugInfo('❌ Auth check failed: ' + error.message, 'error');
    }

    // Check database connection (through backend)
    try {
      const response = await axios.get(`${API_URL}/health`, { timeout: 5000 });
      setConnectionStatus(prev => ({ ...prev, database: 'connected' }));
      addDebugInfo('✅ Database connection OK', 'success');
    } catch (error) {
      setConnectionStatus(prev => ({ ...prev, database: 'unknown' }));
      addDebugInfo('⚠️ Cannot verify database status', 'warning');
    }
  };

  const handleTestLogin = async () => {
    setTesting(true);
    addDebugInfo('Testing login...', 'info');
    
    try {
      await testLogin();
      addDebugInfo('✅ Test login successful!', 'success');
    } catch (error) {
      addDebugInfo('❌ Test login failed: ' + error.message, 'error');
    } finally {
      setTesting(false);
    }
  };

  const testCreatePost = async () => {
    if (!currentUser) {
      addDebugInfo('❌ Please login first', 'error');
      return;
    }

    addDebugInfo('Testing post creation...', 'info');
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/posts/professional`, {
        content: {
          text: 'Test post from debug component - ' + new Date().toLocaleString()
        },
        visibility: 'public'
      }, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      addDebugInfo('✅ Post creation successful!', 'success');
    } catch (error) {
      addDebugInfo('❌ Post creation failed: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected':
        return <CheckIcon color="success" />;
      case 'error':
        return <ErrorIcon color="error" />;
      case 'checking':
        return <CircularProgress size={20} />;
      default:
        return <WarningIcon color="warning" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected':
        return 'success';
      case 'error':
        return 'error';
      case 'checking':
        return 'default';
      default:
        return 'warning';
    }
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Connection Debug Tool
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Connection Status:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip 
              icon={getStatusIcon(connectionStatus.backend)}
              label="Backend Server"
              color={getStatusColor(connectionStatus.backend)}
              variant="outlined"
            />
            <Chip 
              icon={getStatusIcon(connectionStatus.auth)}
              label="Authentication"
              color={getStatusColor(connectionStatus.auth)}
              variant="outlined"
            />
            <Chip 
              icon={getStatusIcon(connectionStatus.database)}
              label="Database"
              color={getStatusColor(connectionStatus.database)}
              variant="outlined"
            />
          </Box>
        </Box>

        {currentUser && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Logged in as: {currentUser.firstName} {currentUser.lastName} ({currentUser.email})
          </Alert>
        )}

        <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button 
            variant="outlined" 
            onClick={checkConnections}
            size="small"
          >
            Recheck Connections
          </Button>
          <Button 
            variant="contained" 
            onClick={handleTestLogin}
            disabled={testing}
            size="small"
          >
            {testing ? 'Testing...' : 'Test Login'}
          </Button>
          <Button 
            variant="outlined" 
            onClick={testCreatePost}
            disabled={!currentUser}
            size="small"
          >
            Test Create Post
          </Button>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" gutterBottom>
          Debug Log:
        </Typography>
        <Box 
          sx={{ 
            maxHeight: 200, 
            overflow: 'auto', 
            backgroundColor: 'grey.50', 
            borderRadius: 1,
            p: 1
          }}
        >
          <List dense>
            {debugInfo.slice(-10).map((info, index) => (
              <ListItem key={index} sx={{ py: 0.5 }}>
                <ListItemText 
                  primary={
                    <Typography 
                      variant="body2" 
                      color={
                        info.type === 'error' ? 'error' : 
                        info.type === 'success' ? 'success.main' : 
                        info.type === 'warning' ? 'warning.main' : 'text.primary'
                      }
                    >
                      [{info.timestamp}] {info.message}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
          API URL: {API_URL}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default ConnectionDebugger;
