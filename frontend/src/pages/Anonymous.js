import React from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  Alert,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import {
  TheaterComedy,
  Security,
  VpnKey,
  Psychology,
  Group
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Anonymous = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Anonymous Mode
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          Switch to anonymous mode to share sensitive topics, seek advice, or discuss workplace challenges 
          with complete privacy and cryptographic anonymity.
        </Typography>

        <Alert severity="info" sx={{ mb: 4 }}>
          <strong>Coming Soon:</strong> Anonymous mode with cryptographically secure personas is currently in development. 
          This feature will allow you to post text, images, and videos completely anonymously.
        </Alert>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card elevation={2}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Security color="primary" sx={{ mr: 1, fontSize: 28 }} />
                  <Typography variant="h6">Complete Privacy</Typography>
                </Box>
                <Typography variant="body2" paragraph>
                  Your anonymous posts cannot be traced back to your professional identity using 
                  advanced cryptographic techniques and anonymous routing.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card elevation={2}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <VpnKey color="primary" sx={{ mr: 1, fontSize: 28 }} />
                  <Typography variant="h6">Multiple Personas</Typography>
                </Box>
                <Typography variant="body2" paragraph>
                  Create different anonymous personas for different types of discussions 
                  while maintaining complete separation from your professional profile.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card elevation={2}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Psychology color="primary" sx={{ mr: 1, fontSize: 28 }} />
                  <Typography variant="h6">Mental Health Support</Typography>
                </Box>
                <Typography variant="body2" paragraph>
                  Discuss mental health challenges, workplace stress, or personal struggles 
                  in a safe space without fear of professional repercussions.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card elevation={2}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Group color="primary" sx={{ mr: 1, fontSize: 28 }} />
                  <Typography variant="h6">Community Support</Typography>
                </Box>
                <Typography variant="body2" paragraph>
                  Get advice on sensitive workplace issues like harassment, discrimination, 
                  or challenging career decisions from other women in similar situations.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Paper sx={{ p: 4, mt: 4, textAlign: 'center' }}>
          <TheaterComedy sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Anonymous Mode Coming Soon
          </Typography>
          <Typography variant="body1" paragraph color="text.secondary">
            We're building a state-of-the-art anonymous posting system that will allow you to:
          </Typography>
          <Box component="ul" sx={{ textAlign: 'left', maxWidth: 600, mx: 'auto', mb: 3 }}>
            <Typography component="li" variant="body2">Share text, images, and video content anonymously</Typography>
            <Typography component="li" variant="body2">Create and manage multiple anonymous personas</Typography>
            <Typography component="li" variant="body2">Set content to disappear after specified time periods</Typography>
            <Typography component="li" variant="body2">Participate in anonymous polls and discussions</Typography>
            <Typography component="li" variant="body2">Access mental health and workplace support resources</Typography>
          </Box>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/dashboard')}
          >
            Return to Dashboard
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default Anonymous;
