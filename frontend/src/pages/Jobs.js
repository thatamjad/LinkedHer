import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Work,
  LocationOn,
  Business,
  AttachMoney
} from '@mui/icons-material';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    type: '',
    remote: ''
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      // For now, showing sample data since job scraping isn't implemented yet
      const sampleJobs = [
        {
          _id: '1',
          title: 'Senior Software Engineer',
          company: 'TechCorp Women',
          location: 'Remote',
          type: 'Full-time',
          salary: '$100k - $120k',
          description: 'Join our diverse team of engineers building the future. We offer excellent work-life balance, career growth opportunities, and support for women in tech.',
          tags: ['JavaScript', 'React', 'Node.js'],
          womenFriendly: true,
          benefits: ['Flexible hours', 'Maternity leave', 'Career mentorship']
        },
        {
          _id: '2',
          title: 'Product Manager',
          company: 'InnovateLab',
          location: 'San Francisco, CA',
          type: 'Full-time',
          salary: '$110k - $130k',
          description: 'Lead product development in a company that values diversity and inclusion. 40% of leadership positions are held by women.',
          tags: ['Product Strategy', 'Analytics', 'User Research'],
          womenFriendly: true,
          benefits: ['Equal pay certified', 'Leadership development', 'On-site childcare']
        },
        {
          _id: '3',
          title: 'UX Designer',
          company: 'DesignFirst',
          location: 'New York, NY',
          type: 'Contract',
          salary: '$80k - $95k',
          description: 'Create amazing user experiences in a collaborative environment. We actively promote women in design leadership roles.',
          tags: ['Figma', 'User Research', 'Prototyping'],
          womenFriendly: true,
          benefits: ['Flexible schedule', 'Professional development', 'Mental health support']
        }
      ];
      
      setJobs(sampleJobs);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to load jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const filteredJobs = jobs.filter(job => {
    return (
      (filters.search === '' || 
       job.title.toLowerCase().includes(filters.search.toLowerCase()) ||
       job.company.toLowerCase().includes(filters.search.toLowerCase())) &&
      (filters.location === '' || job.location.toLowerCase().includes(filters.location.toLowerCase())) &&
      (filters.type === '' || job.type === filters.type)
    );
  });

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Women-Friendly Job Opportunities
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          Discover career opportunities at companies with inclusive policies, pay equity, and advancement opportunities for women.
        </Typography>

        <Alert severity="info" sx={{ mb: 3 }}>
          <strong>Coming Soon:</strong> Advanced job matching based on your profile, salary transparency, and company diversity ratings.
        </Alert>

        {/* Filters */}
        <Card sx={{ mb: 3, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Filter Jobs
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Search jobs or companies"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Location"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Job Type</InputLabel>
                <Select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  label="Job Type"
                >
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value="Full-time">Full-time</MenuItem>
                  <MenuItem value="Part-time">Part-time</MenuItem>
                  <MenuItem value="Contract">Contract</MenuItem>
                  <MenuItem value="Internship">Internship</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => setFilters({ search: '', location: '', type: '', remote: '' })}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </Card>

        {/* Job Results */}
        <Typography variant="h6" gutterBottom>
          {filteredJobs.length} Job{filteredJobs.length !== 1 ? 's' : ''} Found
        </Typography>

        {filteredJobs.length === 0 ? (
          <Card sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              No jobs found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your filters or check back later for new opportunities.
            </Typography>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {filteredJobs.map((job) => (
              <Grid item xs={12} key={job._id}>
                <Card elevation={2}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Box>
                        <Typography variant="h6" component="h3" gutterBottom>
                          {job.title}
                        </Typography>
                        <Box display="flex" alignItems="center" mb={1}>
                          <Business sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {job.company}
                          </Typography>
                          {job.womenFriendly && (
                            <Chip 
                              label="Women-Friendly" 
                              size="small" 
                              color="secondary" 
                              sx={{ ml: 1 }}
                            />
                          )}
                        </Box>
                        <Box display="flex" alignItems="center" mb={1}>
                          <LocationOn sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {job.location}
                          </Typography>
                          <Work sx={{ ml: 2, mr: 1, fontSize: 18, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {job.type}
                          </Typography>
                          {job.salary && (
                            <>
                              <AttachMoney sx={{ ml: 2, mr: 1, fontSize: 18, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                {job.salary}
                              </Typography>
                            </>
                          )}
                        </Box>
                      </Box>
                      <Button
                        variant="contained"
                        color="primary"
                        disabled
                      >
                        Apply (Coming Soon)
                      </Button>
                    </Box>

                    <Typography variant="body2" paragraph>
                      {job.description}
                    </Typography>

                    {job.tags && job.tags.length > 0 && (
                      <Box mb={2}>
                        {job.tags.map((tag, index) => (
                          <Chip
                            key={index}
                            label={tag}
                            size="small"
                            variant="outlined"
                            sx={{ mr: 1, mb: 1 }}
                          />
                        ))}
                      </Box>
                    )}

                    {job.benefits && job.benefits.length > 0 && (
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          Women-Focused Benefits:
                        </Typography>
                        <Box display="flex" flexWrap="wrap">
                          {job.benefits.map((benefit, index) => (
                            <Chip
                              key={index}
                              label={benefit}
                              size="small"
                              color="primary"
                              variant="outlined"
                              sx={{ mr: 1, mb: 1 }}
                            />
                          ))}
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default Jobs;
