import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Button,
  Chip,
  Divider,
  CircularProgress,
  IconButton,
  Paper,
  Grid,
  LinearProgress,
  Tooltip,
  Stack,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Snackbar,
  Alert,
  Avatar,
  Card,
  CardContent
} from '@mui/material';
import {
  Home as HomeIcon,
  Work as WorkIcon,
  LocationOn as LocationIcon,
  AttachMoney as SalaryIcon,
  AccessTime as TimeIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Share as ShareIcon,
  ArrowBack as ArrowBackIcon,
  Send as SendIcon,
  Warning as WarningIcon,
  Check as CheckIcon,
  Female as FemaleIcon,
  Diversity3 as DiversityIcon,
  AccessibilityNew as FlexibleIcon,
  Home as RemoteIcon,
  FamilyRestroom as ParentalLeaveIcon,
  Balance as EqualPayIcon,
  Launch as LaunchIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useMode } from '../context/ModeContext';
import apiClient from '../services/apiClient';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import jobService from '../services/jobService';
import { useSnackbar } from 'notistack';
import ShareJobModal from '../components/jobs/ShareJobModal';
import EmptyState from '../components/ui/EmptyState';
import LoadingScreen from '../components/ui/LoadingScreen';

// Initialize dayjs plugins
dayjs.extend(relativeTime);

const JobDetailPage = () => {
  const { jobId } = useParams();
  const theme = useTheme();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { mode } = useMode();
  const { enqueueSnackbar } = useSnackbar();
  
  // State
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [similarJobs, setSimilarJobs] = useState([]);
  
  // State for application
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [applicationMethod, setApplicationMethod] = useState('direct');
  const [applicationNotes, setApplicationNotes] = useState('');
  const [applying, setApplying] = useState(false);
  const [applicationSuccess, setApplicationSuccess] = useState(false);
  
  // Fetch job details
  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        const data = await jobService.getJob(jobId);
        setJob(data.job);
        setSaved(data.job.isBookmarked || false);
        
        // Fetch similar jobs
        if (data.job) {
          const filters = {
            categories: [data.job.category],
            limit: 3
          };
          const similarJobsData = await jobService.getJobs(filters);
          setSimilarJobs(similarJobsData.jobs.filter(j => j._id !== jobId).slice(0, 3));
        }
      } catch (error) {
        console.error('Error fetching job details:', error);
        setError('Failed to load job details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobDetails();
  }, [jobId]);
  
  // Handle save/unsave job
  const handleSaveToggle = async () => {
    if (!isAuthenticated) {
      enqueueSnackbar('Please sign in to save jobs', { variant: 'info' });
      return;
    }
    
    try {
      setSaving(true);
      
      if (saved) {
        await jobService.unsaveJob(jobId);
        setSaved(false);
        enqueueSnackbar('Job removed from saved jobs', { variant: 'success' });
      } else {
        await jobService.saveJob(jobId);
        setSaved(true);
        enqueueSnackbar('Job saved successfully', { variant: 'success' });
      }
    } catch (error) {
      console.error('Error toggling job save:', error);
      enqueueSnackbar('Failed to save job. Please try again.', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };
  
  // Handle apply to job
  const handleApply = async () => {
    try {
      if (!isAuthenticated) {
        enqueueSnackbar('Please sign in to apply for jobs', { variant: 'info' });
        return;
      }
      
      // Record application
      await jobService.recordApplication(jobId);
      enqueueSnackbar('Application recorded successfully', { variant: 'success' });
      
      // Redirect to external application URL if available
      if (job.applicationUrl) {
        window.open(job.applicationUrl, '_blank');
      } else {
        window.open(job.sourceUrl, '_blank');
      }
    } catch (error) {
      console.error('Error applying to job:', error);
      enqueueSnackbar('Failed to record application. Please try again.', { variant: 'error' });
    }
  };
  
  // Handle share
  const handleShare = () => {
    setShareModalOpen(true);
  };
  
  // Handle apply dialog close
  const handleApplyDialogClose = () => {
    setApplyDialogOpen(false);
    setApplicationMethod('direct');
    setApplicationNotes('');
  };
  
  // Handle application submission
  const handleSubmitApplication = async () => {
    try {
      setApplying(true);
      
      await apiClient.post(`/jobs/${jobId}/apply`, {
        applicationMethod,
        notes: applicationNotes
      });
      
      setApplicationSuccess(true);
      setTimeout(() => {
        handleApplyDialogClose();
      }, 1000);
    } catch (error) {
      console.error('Error submitting application:', error);
    } finally {
      setApplying(false);
    }
  };
  
  // Handle back navigation
  const handleBack = () => {
    navigate(-1);
  };
  
  // Format salary
  const formatSalary = () => {
    if (!job.salary || (!job.salary.min && !job.salary.max)) {
      return 'Salary not specified';
    }
    
    if (job.salary.min && job.salary.max) {
      return `${job.salary.currency || '$'}${job.salary.min.toLocaleString()} - ${job.salary.currency || '$'}${job.salary.max.toLocaleString()}`;
    }
    
    if (job.salary.min) {
      return `${job.salary.currency || '$'}${job.salary.min.toLocaleString()}+`;
    }
    
    return `Up to ${job.salary.currency || '$'}${job.salary.max.toLocaleString()}`;
  };
  
  // Get women-friendly score color
  const getScoreColor = (score) => {
    if (score >= 80) return theme.palette.success.main;
    if (score >= 60) return theme.palette.success.light;
    if (score >= 40) return theme.palette.warning.main;
    return theme.palette.grey[500];
  };
  
  // Extract women-friendly factors
  const getWomenFriendlyFactors = () => {
    if (!job || !job.womenFriendlyFactors) return [];
    
    const factors = [];
    const wf = job.womenFriendlyFactors;
    
    if (wf.parentalLeave) factors.push({ id: 'parentalLeave', label: 'Parental Leave', icon: <ParentalLeaveIcon /> });
    if (wf.flexibleHours) factors.push({ id: 'flexibleHours', label: 'Flexible Hours', icon: <FlexibleIcon /> });
    if (wf.remoteWork) factors.push({ id: 'remoteWork', label: 'Remote Work', icon: <RemoteIcon /> });
    if (wf.equalPayPledge) factors.push({ id: 'equalPayPledge', label: 'Equal Pay Pledge', icon: <EqualPayIcon /> });
    if (wf.diversityInitiatives) factors.push({ id: 'diversityInitiatives', label: 'Diversity Initiatives', icon: <DiversityIcon /> });
    if (wf.femaleLeadership) factors.push({ id: 'femaleLeadership', label: 'Female Leadership', icon: <FemaleIcon /> });
    
    return factors;
  };
  
  // Handle application success alert close
  const handleAlertClose = () => {
    setApplicationSuccess(false);
  };
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  if (error || !job) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5" color="error" gutterBottom>
          {error || 'Job not found'}
        </Typography>
        <Button
          component={RouterLink}
          to="/jobs"
          startIcon={<ArrowBackIcon />}
          variant="contained"
          sx={{ mt: 2 }}
        >
          Back to Job Board
        </Button>
      </Container>
    );
  }
  
  // Extract women-friendly factors
  const womenFriendlyFactors = job.womenFriendlyFactors || {};
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }} separator="›">
        <Link
          component={RouterLink}
          to="/"
          underline="hover"
          sx={{ display: 'flex', alignItems: 'center' }}
          color="inherit"
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Home
        </Link>
        <Link
          component={RouterLink}
          to="/jobs"
          underline="hover"
          sx={{ display: 'flex', alignItems: 'center' }}
          color="inherit"
        >
          <WorkIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Jobs
        </Link>
        <Typography sx={{ display: 'flex', alignItems: 'center' }} color="text.primary">
          {job.title}
        </Typography>
      </Breadcrumbs>
      
      {/* Job Header */}
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3, 
          mb: 4, 
          borderRadius: 2,
          borderLeft: '6px solid',
          borderColor: getScoreColor(job.womenFriendlyScore)
        }}
      >
        <Grid container spacing={3}>
          {/* Company Logo */}
          <Grid item xs={12} sm="auto" sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              src={job.logoUrl}
              alt={job.company}
              sx={{
                width: 80,
                height: 80,
                bgcolor: mode === 'professional' ? 'primary.light' : 'secondary.dark'
              }}
            >
              {job.company?.charAt(0)}
            </Avatar>
          </Grid>
          
          {/* Job Title and Company */}
          <Grid item xs={12} sm sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              {job.title}
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {job.company}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                <Typography variant="body1">{job.location}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <WorkIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                <Typography variant="body1">{job.employmentType}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TimeIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                <Typography variant="body1">Posted {dayjs(job.datePosted).fromNow()}</Typography>
              </Box>
            </Box>
          </Grid>
          
          {/* Actions */}
          <Grid item xs={12} sm="auto" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              variant="contained"
              color={mode === 'professional' ? 'primary' : 'secondary'}
              size="large"
              onClick={handleApply}
              endIcon={<LaunchIcon />}
              sx={{ minWidth: 150 }}
            >
              Apply Now
            </Button>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
              <Tooltip title={saved ? "Unsave Job" : "Save Job"}>
                <IconButton
                  onClick={handleSaveToggle}
                  disabled={saving}
                  sx={{
                    color: saved
                      ? (mode === 'professional' ? 'primary.main' : 'secondary.main')
                      : 'action.active'
                  }}
                >
                  {saved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                </IconButton>
              </Tooltip>
              <Tooltip title="Share Job">
                <IconButton onClick={handleShare}>
                  <ShareIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      <Grid container spacing={4}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {/* Women-Friendly Score */}
          <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Women-Friendly Score
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box sx={{ flexGrow: 1, mr: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={job.womenFriendlyScore}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: theme.palette.grey[300],
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: getScoreColor(job.womenFriendlyScore)
                    }
                  }}
                />
              </Box>
              <Typography variant="h6" fontWeight="bold" sx={{ color: getScoreColor(job.womenFriendlyScore) }}>
                {job.womenFriendlyScore}/100
              </Typography>
            </Box>
            
            {/* Women-Friendly Factors */}
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
              {womenFriendlyFactors.parentalLeave && (
                <Chip
                  icon={<ParentalLeaveIcon />}
                  label="Parental Leave"
                  color={mode === 'professional' ? 'primary' : 'secondary'}
                  variant="outlined"
                  size="small"
                />
              )}
              {womenFriendlyFactors.flexibleHours && (
                <Chip
                  icon={<FlexibleIcon />}
                  label="Flexible Hours"
                  color={mode === 'professional' ? 'primary' : 'secondary'}
                  variant="outlined"
                  size="small"
                />
              )}
              {womenFriendlyFactors.remoteWork && (
                <Chip
                  icon={<RemoteIcon />}
                  label="Remote Work"
                  color={mode === 'professional' ? 'primary' : 'secondary'}
                  variant="outlined"
                  size="small"
                />
              )}
              {womenFriendlyFactors.equalPayPledge && (
                <Chip
                  icon={<EqualPayIcon />}
                  label="Equal Pay Pledge"
                  color={mode === 'professional' ? 'primary' : 'secondary'}
                  variant="outlined"
                  size="small"
                />
              )}
              {womenFriendlyFactors.diversityInitiatives && (
                <Chip
                  icon={<DiversityIcon />}
                  label="Diversity Initiatives"
                  color={mode === 'professional' ? 'primary' : 'secondary'}
                  variant="outlined"
                  size="small"
                />
              )}
              {womenFriendlyFactors.femaleLeadership && (
                <Chip
                  icon={<FemaleIcon />}
                  label="Female Leadership"
                  color={mode === 'professional' ? 'primary' : 'secondary'}
                  variant="outlined"
                  size="small"
                />
              )}
            </Stack>
          </Paper>
          
          {/* Job Description */}
          <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Job Description
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
              {job.description}
            </Typography>
          </Paper>
          
          {/* Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Requirements
              </Typography>
              <Box component="ul" sx={{ pl: 2 }}>
                {job.requirements.map((requirement, index) => (
                  <Typography component="li" variant="body1" key={index} sx={{ mb: 1 }}>
                    {requirement}
                  </Typography>
                ))}
              </Box>
            </Paper>
          )}
          
          {/* Responsibilities */}
          {job.responsibilities && job.responsibilities.length > 0 && (
            <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Responsibilities
              </Typography>
              <Box component="ul" sx={{ pl: 2 }}>
                {job.responsibilities.map((responsibility, index) => (
                  <Typography component="li" variant="body1" key={index} sx={{ mb: 1 }}>
                    {responsibility}
                  </Typography>
                ))}
              </Box>
            </Paper>
          )}
          
          {/* Skills */}
          {job.skills && job.skills.length > 0 && (
            <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Skills
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {job.skills.map((skill, index) => (
                  <Chip
                    key={index}
                    label={skill}
                    size="small"
                    sx={{
                      bgcolor: mode === 'professional' ? 'primary.light' : 'secondary.light',
                      color: mode === 'professional' ? 'primary.dark' : 'secondary.dark'
                    }}
                  />
                ))}
              </Box>
            </Paper>
          )}
        </Grid>
        
        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Apply Button (Sticky) */}
          <Box
            sx={{
              position: { md: 'sticky' },
              top: { md: 100 },
              mb: 4
            }}
          >
            <Paper sx={{ p: 3, borderRadius: 2, mb: 4 }}>
              <Button
                variant="contained"
                color={mode === 'professional' ? 'primary' : 'secondary'}
                size="large"
                fullWidth
                onClick={handleApply}
                sx={{ mb: 2 }}
              >
                Apply Now
              </Button>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" color="text.secondary" align="center">
                {job.views || 0} people have viewed this job
              </Typography>
            </Paper>
            
            {/* Job Details */}
            <Paper sx={{ p: 3, borderRadius: 2, mb: 4 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Job Details
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Category
                  </Typography>
                  <Typography variant="body1">{job.category}</Typography>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Employment Type
                  </Typography>
                  <Typography variant="body1">{job.employmentType}</Typography>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Salary
                  </Typography>
                  <Typography variant="body1">{formatSalary()}</Typography>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Posted On
                  </Typography>
                  <Typography variant="body1">
                    {dayjs(job.datePosted).format('MMMM D, YYYY')}
                  </Typography>
                </Box>
                {job.deadline && (
                  <>
                    <Divider />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Application Deadline
                      </Typography>
                      <Typography variant="body1">
                        {dayjs(job.deadline).format('MMMM D, YYYY')}
                      </Typography>
                    </Box>
                  </>
                )}
                <Divider />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Source
                  </Typography>
                  <Link href={job.sourceUrl} target="_blank" rel="noopener noreferrer">
                    {job.jobSource}
                  </Link>
                </Box>
              </Box>
            </Paper>
            
            {/* Similar Jobs */}
            {similarJobs.length > 0 && (
              <Paper sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Similar Jobs
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {similarJobs.map(similarJob => (
                    <Card
                      key={similarJob._id}
                      variant="outlined"
                      sx={{
                        '&:hover': {
                          boxShadow: 1
                        }
                      }}
                    >
                      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        <Link
                          component={RouterLink}
                          to={`/jobs/${similarJob._id}`}
                          underline="hover"
                          color="inherit"
                        >
                          <Typography variant="subtitle1" fontWeight="medium">
                            {similarJob.title}
                          </Typography>
                        </Link>
                        <Typography variant="body2" color="text.secondary">
                          {similarJob.company}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <LocationIcon fontSize="small" sx={{ mr: 0.5, color: 'text.disabled' }} />
                          <Typography variant="body2" color="text.secondary">
                            {similarJob.location}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                  <Button
                    component={RouterLink}
                    to="/jobs"
                    variant="outlined"
                    color={mode === 'professional' ? 'primary' : 'secondary'}
                    size="small"
                    fullWidth
                  >
                    View All Jobs
                  </Button>
                </Box>
              </Paper>
            )}
          </Box>
        </Grid>
      </Grid>
      
      {/* Share Job Modal */}
      <ShareJobModal
        open={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        job={job}
      />
      
      {/* Apply Dialog */}
      <Dialog 
        open={applyDialogOpen}
        onClose={handleApplyDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          color: mode === 'professional' ? 'text.primary' : 'text.secondary'
        }}>
          <SendIcon color={mode === 'professional' ? 'primary' : 'secondary'} />
          Apply for {job.title}
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Application Method
            </Typography>
            <TextField
              select
              fullWidth
              value={applicationMethod}
              onChange={(e) => setApplicationMethod(e.target.value)}
              variant="outlined"
              margin="dense"
            >
              <MenuItem value="direct">Apply Through Linker</MenuItem>
              <MenuItem value="external">Apply on Company Website</MenuItem>
              <MenuItem value="email">Apply via Email</MenuItem>
            </TextField>
          </Box>
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Notes (Optional)
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Add any notes about your application..."
              value={applicationNotes}
              onChange={(e) => setApplicationNotes(e.target.value)}
              variant="outlined"
              margin="dense"
            />
          </Box>
          
          <Box sx={{ mt: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              By applying, we'll track this application in your Linker profile. This helps you manage your job search and allows us to provide better job recommendations.
            </Typography>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={handleApplyDialogClose}
            sx={{ color: 'text.secondary' }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained"
            onClick={handleSubmitApplication}
            disabled={applying}
            startIcon={applying ? <CircularProgress size={20} /> : (applicationSuccess ? <CheckIcon /> : <SendIcon />)}
            sx={{ 
              bgcolor: applicationSuccess 
                ? theme.palette.success.main 
                : (mode === 'professional' ? 'primary.main' : 'secondary.main'),
              '&:hover': {
                bgcolor: applicationSuccess 
                  ? theme.palette.success.dark 
                  : (mode === 'professional' ? 'primary.dark' : 'secondary.dark')
              }
            }}
          >
            {applying ? 'Applying...' : (applicationSuccess ? 'Applied!' : 'Submit Application')}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Application Success Notification */}
      <Snackbar
        open={applicationSuccess}
        autoHideDuration={5000}
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleAlertClose} 
          severity="success"
          sx={{ width: '100%' }}
        >
          Application submitted successfully!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default JobDetailPage; 