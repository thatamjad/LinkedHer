import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper,
  Tab,
  Tabs,
  Divider
} from '@mui/material';
import ConnectionDebugger from '../components/debug/ConnectionDebugger';
import ImprovedCreatePost from '../components/posts/ImprovedCreatePost';
import { useAuth } from '../context/AuthContext';

const DebugDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const { currentUser, loading } = useAuth();

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handlePostCreated = (newPost) => {
    console.log('Post created in debug mode:', newPost);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Debug Dashboard
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          Use this dashboard to troubleshoot connection issues and test functionality.
        </Typography>

        <Paper sx={{ mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tab label="Connection Test" />
            <Tab label="Post Creation Test" />
            <Tab label="User Info" />
          </Tabs>

          <Box sx={{ p: 3 }}>
            {tabValue === 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Connection Diagnostics
                </Typography>
                <ConnectionDebugger />
              </Box>
            )}

            {tabValue === 1 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Test Post Creation
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Use this component to test if post creation buttons are working properly.
                </Typography>
                <ImprovedCreatePost onPostCreated={handlePostCreated} />
              </Box>
            )}

            {tabValue === 2 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Current User Information
                </Typography>
                {loading ? (
                  <Typography>Loading user data...</Typography>
                ) : currentUser ? (
                  <Box>
                    <Typography variant="body1"><strong>Name:</strong> {currentUser.firstName} {currentUser.lastName}</Typography>
                    <Typography variant="body1"><strong>Email:</strong> {currentUser.email}</Typography>
                    <Typography variant="body1"><strong>Role:</strong> {currentUser.role}</Typography>
                    <Typography variant="body1"><strong>Verification Status:</strong> {currentUser.verificationStatus}</Typography>
                    <Typography variant="body1"><strong>Account Active:</strong> {currentUser.isActive ? 'Yes' : 'No'}</Typography>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      Token: {localStorage.getItem('token') ? 'Present' : 'Missing'}
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body1" color="text.secondary">
                    No user logged in
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Troubleshooting Steps
          </Typography>
          <Box component="ol" sx={{ pl: 2 }}>
            <li>
              <Typography variant="body2" paragraph>
                <strong>Backend Not Running:</strong> Ensure the backend server is running on port 5000 by running `npm start` in the backend directory.
              </Typography>
            </li>
            <li>
              <Typography variant="body2" paragraph>
                <strong>Authentication Issues:</strong> Try the test login or create a permanent account using the credentials below.
              </Typography>
            </li>
            <li>
              <Typography variant="body2" paragraph>
                <strong>Button Clicks Not Working:</strong> Check the browser console for error messages and use the connection debugger above.
              </Typography>
            </li>
            <li>
              <Typography variant="body2" paragraph>
                <strong>Database:</strong> The backend connects to a local MongoDB instance. Ensure your local MongoDB server is running.
              </Typography>
            </li>
          </Box>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Permanent Test Accounts
          </Typography>
          <Typography variant="body2" paragraph>
            Run the following command in the backend directory to create permanent test accounts:
          </Typography>
          <Box sx={{ 
            backgroundColor: 'grey.100', 
            p: 2, 
            borderRadius: 1,
            fontFamily: 'monospace',
            mb: 2
          }}>
            node fix-test-account.js
          </Box>
          <Typography variant="body2" paragraph>
            This will create these permanent accounts:
          </Typography>
          <Box sx={{ pl: 2 }}>
            <Typography variant="body2">
              <strong>Account 1:</strong> testuser@linker.com / TestPassword123!
            </Typography>
            <Typography variant="body2">
              <strong>Account 2:</strong> demo@linker.com / TestPassword123!
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default DebugDashboard;
