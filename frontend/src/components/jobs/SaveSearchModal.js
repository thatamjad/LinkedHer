import React, { useState } from 'react';
import {
  Box,
  Modal,
  Typography,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Divider,
  Chip,
  useTheme
} from '@mui/material';
import {
  Bookmark as BookmarkIcon,
  NotificationsActive as NotificationsIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useMode } from '../../context/ModeContext';

const SaveSearchModal = ({ open, onClose, onSave, filters }) => {
  const theme = useTheme();
  const { mode } = useMode();
  
  // State for form
  const [name, setName] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [error, setError] = useState('');
  
  // Handle input change
  const handleNameChange = (event) => {
    setName(event.target.value);
    if (error) setError('');
  };
  
  // Handle notification toggle
  const handleNotificationToggle = (event) => {
    setNotificationsEnabled(event.target.checked);
  };
  
  // Handle save button click
  const handleSave = () => {
    // Validate name
    if (!name.trim()) {
      setError('Please enter a name for this search');
      return;
    }
    
    // Call onSave callback with form data
    onSave(name, notificationsEnabled);
    
    // Reset form
    resetForm();
  };
  
  // Handle close
  const handleClose = () => {
    resetForm();
    onClose();
  };
  
  // Reset form
  const resetForm = () => {
    setName('');
    setNotificationsEnabled(false);
    setError('');
  };
  
  // Generate a summary of the filters for display
  const getFilterSummary = () => {
    const summaryItems = [];
    
    if (filters.keywords) {
      summaryItems.push(`Keywords: "${filters.keywords}"`);
    }
    
    if (filters.location) {
      summaryItems.push(`Location: ${filters.location}`);
    }
    
    if (filters.employmentTypes.length > 0) {
      summaryItems.push(`Employment Types: ${filters.employmentTypes.join(', ')}`);
    }
    
    if (filters.salaryMin || filters.salaryMax) {
      let salaryText = 'Salary: ';
      if (filters.salaryMin) salaryText += `$${filters.salaryMin.toLocaleString()}`;
      if (filters.salaryMin && filters.salaryMax) salaryText += ' - ';
      if (filters.salaryMax) salaryText += `$${filters.salaryMax.toLocaleString()}`;
      summaryItems.push(salaryText);
    }
    
    if (filters.womenFriendlyScore > 0) {
      summaryItems.push(`Women-Friendly Score: ${filters.womenFriendlyScore}%+`);
    }
    
    if (filters.womenFriendlyFactors.length > 0) {
      summaryItems.push(`Women-Friendly Factors: ${filters.womenFriendlyFactors.length} selected`);
    }
    
    if (filters.categories.length > 0) {
      summaryItems.push(`Categories: ${filters.categories.join(', ')}`);
    }
    
    if (filters.datePosted !== 'all') {
      const dateLabels = {
        last24Hours: 'Last 24 hours',
        last7Days: 'Last 7 days',
        last30Days: 'Last 30 days'
      };
      summaryItems.push(`Date Posted: ${dateLabels[filters.datePosted] || filters.datePosted}`);
    }
    
    return summaryItems.length > 0 
      ? summaryItems 
      : ['No filters applied'];
  };
  
  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="save-search-modal-title"
    >
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: { xs: '90%', sm: 500 },
        bgcolor: mode === 'professional' ? 'background.paper' : 'background.default',
        boxShadow: 24,
        borderRadius: 2,
        p: 4
      }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography 
            id="save-search-modal-title" 
            variant="h5" 
            component="h2"
            fontWeight="bold"
            color={mode === 'professional' ? 'text.primary' : 'text.secondary'}
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <BookmarkIcon color={mode === 'professional' ? 'primary' : 'secondary'} />
            Save Search
          </Typography>
          <Button 
            onClick={handleClose}
            sx={{ minWidth: 'auto', p: 1 }}
          >
            <CloseIcon />
          </Button>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        {/* Form */}
        <Box sx={{ mb: 3 }}>
          <Typography 
            variant="subtitle1" 
            sx={{ mb: 1 }}
            color={mode === 'professional' ? 'text.primary' : 'text.secondary'}
          >
            Name your search
          </Typography>
          <TextField
            fullWidth
            placeholder="E.g., 'Remote UX Designer Jobs'"
            value={name}
            onChange={handleNameChange}
            error={!!error}
            helperText={error}
            variant="outlined"
            sx={{ 
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': {
                  borderColor: mode === 'professional' ? 'primary.main' : 'secondary.main'
                }
              }
            }}
          />
        </Box>
        
        {/* Notifications */}
        <Box sx={{ mb: 3 }}>
          <FormControlLabel
            control={
              <Switch 
                checked={notificationsEnabled}
                onChange={handleNotificationToggle}
                color={mode === 'professional' ? 'primary' : 'secondary'}
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <NotificationsIcon fontSize="small" color={notificationsEnabled ? (mode === 'professional' ? 'primary' : 'secondary') : 'action'} />
                <Typography>
                  Get email notifications for new matching jobs
                </Typography>
              </Box>
            }
          />
        </Box>
        
        {/* Filter Summary */}
        <Box sx={{ mb: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
          <Typography 
            variant="subtitle1" 
            fontWeight="medium"
            sx={{ mb: 1.5 }}
            color={mode === 'professional' ? 'text.primary' : 'text.secondary'}
          >
            Search Filters Summary
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {getFilterSummary().map((item, index) => (
              <Chip 
                key={index}
                label={item}
                size="small"
                variant="outlined"
                sx={{ 
                  borderColor: mode === 'professional' ? 'primary.light' : 'secondary.light',
                  color: mode === 'professional' ? 'text.primary' : 'text.secondary'
                }}
              />
            ))}
          </Box>
        </Box>
        
        {/* Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button 
            onClick={handleClose}
            variant="outlined"
            sx={{ 
              borderColor: mode === 'professional' ? 'primary.main' : 'secondary.main',
              color: mode === 'professional' ? 'primary.main' : 'secondary.main',
              '&:hover': {
                borderColor: mode === 'professional' ? 'primary.dark' : 'secondary.dark',
                backgroundColor: mode === 'professional' ? 'primary.light' : 'secondary.light',
                opacity: 0.8
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            variant="contained"
            sx={{ 
              bgcolor: mode === 'professional' ? 'primary.main' : 'secondary.main',
              '&:hover': {
                bgcolor: mode === 'professional' ? 'primary.dark' : 'secondary.dark'
              }
            }}
          >
            Save Search
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default SaveSearchModal; 