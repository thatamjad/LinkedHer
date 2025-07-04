import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Button,
  Chip,
  IconButton,
  Tooltip,
  useTheme
} from '@mui/material';
import {
  Search as SearchIcon,
  BookmarkAdd as BookmarkAddIcon,
  NotificationsActive as NotificationsIcon,
  FilterAlt as FilterIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useMode } from '../../context/ModeContext';

const JobBoardHeader = ({ totalJobs, keywords, onSearch, onSaveSearch }) => {
  const theme = useTheme();
  const { user, anonymousPersona } = useAuth();
  const { mode } = useMode();
  const [searchValue, setSearchValue] = useState(keywords || '');
  
  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchValue(event.target.value);
  };
  
  // Handle search form submit
  const handleSubmit = (event) => {
    event.preventDefault();
    onSearch(searchValue);
  };
  
  // Handle save search button click
  const handleSaveSearch = () => {
    onSaveSearch();
  };
  
  return (
    <Box>
      {/* Header Title and Stats */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2,
        mb: 3
      }}>
        <Box>
          <Typography 
            variant="h4" 
            fontWeight="bold"
            color={mode === 'professional' ? 'text.primary' : 'text.secondary'}
          >
            Job Board
          </Typography>
          <Typography 
            variant="subtitle1"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            {totalJobs > 0 
              ? `Found ${totalJobs} ${totalJobs === 1 ? 'job' : 'jobs'}${keywords ? ` for "${keywords}"` : ''}`
              : 'Search for your next opportunity'}
          </Typography>
        </Box>
        
        {/* Save Search Button - only show if user has searched something */}
        {(searchValue || keywords) && (user || anonymousPersona) && (
          <Button
            variant="outlined"
            startIcon={<BookmarkAddIcon />}
            onClick={handleSaveSearch}
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
            Save Search
          </Button>
        )}
      </Box>
      
      {/* Search Bar */}
      <Box 
        component="form" 
        onSubmit={handleSubmit}
        sx={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: 1,
          mb: 3
        }}
      >
        <TextField
          fullWidth
          placeholder="Search jobs by title, company, or keywords..."
          value={searchValue}
          onChange={handleSearchChange}
          variant="outlined"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            sx: {
              borderRadius: 2,
              bgcolor: mode === 'professional' ? 'background.paper' : 'background.default',
              '&.Mui-focused': {
                boxShadow: `0 0 0 2px ${mode === 'professional' ? theme.palette.primary.main : theme.palette.secondary.main}`
              }
            }
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              '&.Mui-focused fieldset': {
                borderColor: mode === 'professional' ? 'primary.main' : 'secondary.main'
              }
            }
          }}
        />
        <Button 
          type="submit" 
          variant="contained"
          sx={{ 
            minWidth: 120,
            height: 56,
            borderRadius: 2,
            bgcolor: mode === 'professional' ? 'primary.main' : 'secondary.main',
            '&:hover': {
              bgcolor: mode === 'professional' ? 'primary.dark' : 'secondary.dark'
            }
          }}
        >
          Search
        </Button>
      </Box>
      
      {/* Feature tags */}
      <Box 
        sx={{ 
          display: 'flex', 
          gap: 1,
          flexWrap: 'wrap',
          mb: 3
        }}
      >
        <Chip 
          icon={<FilterIcon />} 
          label="Women-Friendly Score Filter" 
          variant="outlined"
          sx={{ 
            borderColor: mode === 'professional' ? 'primary.light' : 'secondary.light',
            color: mode === 'professional' ? 'text.primary' : 'text.secondary'
          }}
        />
        <Chip 
          icon={<NotificationsIcon />} 
          label="Job Alerts" 
          variant="outlined"
          sx={{ 
            borderColor: mode === 'professional' ? 'primary.light' : 'secondary.light',
            color: mode === 'professional' ? 'text.primary' : 'text.secondary'
          }}
        />
        
        {/* Mode indicator */}
        <Chip 
          label={mode === 'professional' ? 'Professional Mode' : 'Anonymous Mode'} 
          color={mode === 'professional' ? 'primary' : 'secondary'}
          sx={{ 
            ml: 'auto',
            fontWeight: 'medium'
          }}
        />
      </Box>
    </Box>
  );
};

export default JobBoardHeader; 