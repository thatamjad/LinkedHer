import React, { useState } from 'react';
import {
  Box,
  Typography,
  Divider,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Slider,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Chip,
  OutlinedInput,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Female as FemaleIcon,
  Diversity3 as DiversityIcon,
  AccessibilityNew as FlexibleIcon,
  Home as RemoteIcon,
  FamilyRestroom as ParentalLeaveIcon,
  Balance as EqualPayIcon,
  FilterAlt as FilterIcon,
  Clear as ClearIcon
} from '@mui/icons-material';

const EMPLOYMENT_TYPES = [
  'Full-time',
  'Part-time',
  'Contract',
  'Temporary',
  'Internship',
  'Remote'
];

const DATE_POSTED_OPTIONS = [
  { value: 'all', label: 'Any time' },
  { value: 'last24Hours', label: 'Last 24 hours' },
  { value: 'last7Days', label: 'Last 7 days' },
  { value: 'last30Days', label: 'Last 30 days' }
];

const WOMEN_FRIENDLY_FACTORS = [
  { value: 'parentalLeave', label: 'Parental Leave', icon: <ParentalLeaveIcon /> },
  { value: 'flexibleHours', label: 'Flexible Hours', icon: <FlexibleIcon /> },
  { value: 'remoteWork', label: 'Remote Work', icon: <RemoteIcon /> },
  { value: 'equalPayPledge', label: 'Equal Pay Pledge', icon: <EqualPayIcon /> },
  { value: 'diversityInitiatives', label: 'Diversity Initiatives', icon: <DiversityIcon /> },
  { value: 'femaleLeadership', label: 'Female Leadership', icon: <FemaleIcon /> }
];

const JOB_CATEGORIES = [
  'Software Engineering',
  'Data Science',
  'Product Management',
  'UX Design',
  'Marketing',
  'Finance',
  'Human Resources',
  'Leadership',
  'Engineering',
  'Healthcare'
];

const JobFilters = ({ filters, onChange, mode }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State for showing mobile filters
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  
  // Handle women-friendly score change
  const handleScoreChange = (event, newValue) => {
    onChange({ womenFriendlyScore: newValue });
  };
  
  // Handle women-friendly factors change
  const handleFactorChange = (factor) => {
    const currentFactors = [...filters.womenFriendlyFactors];
    const factorIndex = currentFactors.indexOf(factor);
    
    if (factorIndex === -1) {
      currentFactors.push(factor);
    } else {
      currentFactors.splice(factorIndex, 1);
    }
    
    onChange({ womenFriendlyFactors: currentFactors });
  };
  
  // Handle employment type change
  const handleEmploymentTypeChange = (type) => {
    const currentTypes = [...filters.employmentTypes];
    const typeIndex = currentTypes.indexOf(type);
    
    if (typeIndex === -1) {
      currentTypes.push(type);
    } else {
      currentTypes.splice(typeIndex, 1);
    }
    
    onChange({ employmentTypes: currentTypes });
  };
  
  // Handle category change
  const handleCategoryChange = (category) => {
    const currentCategories = [...filters.categories];
    const categoryIndex = currentCategories.indexOf(category);
    
    if (categoryIndex === -1) {
      currentCategories.push(category);
    } else {
      currentCategories.splice(categoryIndex, 1);
    }
    
    onChange({ categories: currentCategories });
  };
  
  // Handle location change
  const handleLocationChange = (event) => {
    onChange({ location: event.target.value });
  };
  
  // Handle date posted change
  const handleDatePostedChange = (event) => {
    onChange({ datePosted: event.target.value });
  };
  
  // Handle salary range change
  const handleSalaryChange = (field) => (event) => {
    const value = event.target.value;
    onChange({ [field]: value ? parseInt(value) : '' });
  };
  
  // Reset all filters
  const handleResetFilters = () => {
    onChange({
      location: '',
      employmentTypes: [],
      salaryMin: '',
      salaryMax: '',
      skills: [],
      womenFriendlyScore: 0,
      womenFriendlyFactors: [],
      categories: [],
      datePosted: 'all'
    });
  };
  
  // Determine if any filters are active
  const hasActiveFilters = () => {
    return (
      filters.location ||
      filters.employmentTypes.length > 0 ||
      filters.salaryMin ||
      filters.salaryMax ||
      filters.womenFriendlyScore > 0 ||
      filters.womenFriendlyFactors.length > 0 ||
      filters.categories.length > 0 ||
      filters.datePosted !== 'all'
    );
  };
  
  // Get color based on mode
  const getColor = (isActive = false) => {
    if (mode === 'professional') {
      return isActive ? theme.palette.primary.main : theme.palette.text.primary;
    } else {
      return isActive ? theme.palette.secondary.main : theme.palette.text.secondary;
    }
  };
  
  // Render filter section with responsive design
  const renderFilterSection = () => (
    <Box sx={{ 
      p: 2, 
      bgcolor: mode === 'professional' ? 'background.paper' : 'background.default',
      borderRadius: 2,
      boxShadow: 1
    }}>
      {/* Filter Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight="bold" color={getColor()}>
          Filter Jobs
        </Typography>
        
        {hasActiveFilters() && (
          <Button 
            startIcon={<ClearIcon />}
            onClick={handleResetFilters}
            size="small"
            sx={{ 
              color: getColor(true),
              '&:hover': {
                backgroundColor: mode === 'professional' ? 'primary.light' : 'secondary.light',
                opacity: 0.8
              }
            }}
          >
            Clear All
          </Button>
        )}
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      {/* Location */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" fontWeight="medium" mb={1} color={getColor()}>
          Location
        </Typography>
        <TextField 
          fullWidth
          placeholder="Enter city, state, or remote"
          value={filters.location}
          onChange={handleLocationChange}
          variant="outlined"
          size="small"
          sx={{ 
            '& .MuiOutlinedInput-root': {
              '&.Mui-focused fieldset': {
                borderColor: mode === 'professional' ? 'primary.main' : 'secondary.main'
              }
            }
          }}
        />
      </Box>
      
      {/* Women-Friendly Score */}
      <Accordion 
        defaultExpanded 
        disableGutters
        elevation={0}
        sx={{ 
          mb: 2,
          bgcolor: 'transparent',
          '&:before': {
            display: 'none'
          }
        }}
      >
        <AccordionSummary 
          expandIcon={<ExpandMoreIcon />}
          sx={{ p: 0, minHeight: 40 }}
        >
          <Typography variant="subtitle1" fontWeight="medium" color={getColor()}>
            Women-Friendly Score
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 0, pt: 1 }}>
          <Box sx={{ px: 1 }}>
            <Slider
              value={filters.womenFriendlyScore}
              onChange={handleScoreChange}
              aria-labelledby="women-friendly-score-slider"
              valueLabelDisplay="auto"
              step={10}
              marks
              min={0}
              max={100}
              sx={{ 
                color: mode === 'professional' ? 'primary.main' : 'secondary.main',
                '& .MuiSlider-thumb': {
                  '&:hover, &.Mui-focusVisible': {
                    boxShadow: `0px 0px 0px 8px ${mode === 'professional' 
                      ? theme.palette.primary.main + '20' 
                      : theme.palette.secondary.main + '20'}`
                  }
                }
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" color="text.secondary">Min Score: {filters.womenFriendlyScore}%</Typography>
              <Typography variant="caption" color="text.secondary">100%</Typography>
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>
      
      {/* Women-Friendly Factors */}
      <Accordion 
        defaultExpanded 
        disableGutters
        elevation={0}
        sx={{ 
          mb: 2,
          bgcolor: 'transparent',
          '&:before': {
            display: 'none'
          }
        }}
      >
        <AccordionSummary 
          expandIcon={<ExpandMoreIcon />}
          sx={{ p: 0, minHeight: 40 }}
        >
          <Typography variant="subtitle1" fontWeight="medium" color={getColor()}>
            Women-Friendly Factors
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 0, pt: 1 }}>
          <FormGroup>
            {WOMEN_FRIENDLY_FACTORS.map((factor) => (
              <FormControlLabel
                key={factor.value}
                control={
                  <Checkbox 
                    checked={filters.womenFriendlyFactors.includes(factor.value)}
                    onChange={() => handleFactorChange(factor.value)}
                    sx={{ 
                      color: mode === 'professional' ? 'primary.light' : 'secondary.light',
                      '&.Mui-checked': {
                        color: mode === 'professional' ? 'primary.main' : 'secondary.main',
                      }
                    }}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {factor.icon}
                    <Typography variant="body2">{factor.label}</Typography>
                  </Box>
                }
              />
            ))}
          </FormGroup>
        </AccordionDetails>
      </Accordion>
      
      {/* Employment Type */}
      <Accordion 
        disableGutters
        elevation={0}
        sx={{ 
          mb: 2,
          bgcolor: 'transparent',
          '&:before': {
            display: 'none'
          }
        }}
      >
        <AccordionSummary 
          expandIcon={<ExpandMoreIcon />}
          sx={{ p: 0, minHeight: 40 }}
        >
          <Typography variant="subtitle1" fontWeight="medium" color={getColor()}>
            Employment Type
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 0, pt: 1 }}>
          <FormGroup>
            {EMPLOYMENT_TYPES.map((type) => (
              <FormControlLabel
                key={type}
                control={
                  <Checkbox 
                    checked={filters.employmentTypes.includes(type)}
                    onChange={() => handleEmploymentTypeChange(type)}
                    sx={{ 
                      color: mode === 'professional' ? 'primary.light' : 'secondary.light',
                      '&.Mui-checked': {
                        color: mode === 'professional' ? 'primary.main' : 'secondary.main',
                      }
                    }}
                  />
                }
                label={type}
              />
            ))}
          </FormGroup>
        </AccordionDetails>
      </Accordion>
      
      {/* Salary Range */}
      <Accordion 
        disableGutters
        elevation={0}
        sx={{ 
          mb: 2,
          bgcolor: 'transparent',
          '&:before': {
            display: 'none'
          }
        }}
      >
        <AccordionSummary 
          expandIcon={<ExpandMoreIcon />}
          sx={{ p: 0, minHeight: 40 }}
        >
          <Typography variant="subtitle1" fontWeight="medium" color={getColor()}>
            Salary Range
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 0, pt: 1 }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              label="Min"
              type="number"
              value={filters.salaryMin}
              onChange={handleSalaryChange('salaryMin')}
              size="small"
              InputProps={{ startAdornment: '$' }}
              sx={{ width: '50%' }}
            />
            <Typography variant="body2" color="text.secondary">to</Typography>
            <TextField
              label="Max"
              type="number"
              value={filters.salaryMax}
              onChange={handleSalaryChange('salaryMax')}
              size="small"
              InputProps={{ startAdornment: '$' }}
              sx={{ width: '50%' }}
            />
          </Box>
        </AccordionDetails>
      </Accordion>
      
      {/* Date Posted */}
      <Accordion 
        disableGutters
        elevation={0}
        sx={{ 
          mb: 2,
          bgcolor: 'transparent',
          '&:before': {
            display: 'none'
          }
        }}
      >
        <AccordionSummary 
          expandIcon={<ExpandMoreIcon />}
          sx={{ p: 0, minHeight: 40 }}
        >
          <Typography variant="subtitle1" fontWeight="medium" color={getColor()}>
            Date Posted
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 0, pt: 1 }}>
          <FormControl fullWidth size="small">
            <Select
              value={filters.datePosted}
              onChange={handleDatePostedChange}
              displayEmpty
              sx={{ 
                '&.MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: mode === 'professional' ? 'primary.main' : 'secondary.main'
                  }
                }
              }}
            >
              {DATE_POSTED_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </AccordionDetails>
      </Accordion>
      
      {/* Job Category */}
      <Accordion 
        disableGutters
        elevation={0}
        sx={{ 
          mb: 2,
          bgcolor: 'transparent',
          '&:before': {
            display: 'none'
          }
        }}
      >
        <AccordionSummary 
          expandIcon={<ExpandMoreIcon />}
          sx={{ p: 0, minHeight: 40 }}
        >
          <Typography variant="subtitle1" fontWeight="medium" color={getColor()}>
            Job Category
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 0, pt: 1 }}>
          <FormGroup>
            {JOB_CATEGORIES.map((category) => (
              <FormControlLabel
                key={category}
                control={
                  <Checkbox 
                    checked={filters.categories.includes(category)}
                    onChange={() => handleCategoryChange(category)}
                    sx={{ 
                      color: mode === 'professional' ? 'primary.light' : 'secondary.light',
                      '&.Mui-checked': {
                        color: mode === 'professional' ? 'primary.main' : 'secondary.main',
                      }
                    }}
                  />
                }
                label={category}
              />
            ))}
          </FormGroup>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
  
  // For mobile, render a button that shows filters in a modal/drawer
  if (isMobile) {
    return (
      <>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<FilterIcon />}
          onClick={() => setMobileFiltersOpen(true)}
          sx={{ 
            mb: 2, 
            borderColor: mode === 'professional' ? 'primary.main' : 'secondary.main',
            color: mode === 'professional' ? 'primary.main' : 'secondary.main',
            '&:hover': {
              borderColor: mode === 'professional' ? 'primary.dark' : 'secondary.dark',
              backgroundColor: mode === 'professional' ? 'primary.light' : 'secondary.light',
              opacity: 0.8
            }
          }}
        >
          Filters {hasActiveFilters() && `(${
            (filters.location ? 1 : 0) +
            (filters.employmentTypes.length > 0 ? 1 : 0) +
            (filters.salaryMin || filters.salaryMax ? 1 : 0) +
            (filters.womenFriendlyScore > 0 ? 1 : 0) +
            (filters.womenFriendlyFactors.length > 0 ? 1 : 0) +
            (filters.categories.length > 0 ? 1 : 0) +
            (filters.datePosted !== 'all' ? 1 : 0)
          })`}
        </Button>
        
        {/* Mobile filter dialog - simplified implementation */}
        {mobileFiltersOpen && (
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1300,
              bgcolor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              p: 2
            }}
            onClick={() => setMobileFiltersOpen(false)}
          >
            <Box
              sx={{
                bgcolor: mode === 'professional' ? 'background.paper' : 'background.default',
                p: 2,
                borderRadius: 2,
                width: '100%',
                maxWidth: '500px',
                maxHeight: '80vh',
                overflow: 'auto',
                boxShadow: 24
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold" color={getColor()}>
                  Filters
                </Typography>
                <Button 
                  onClick={() => setMobileFiltersOpen(false)}
                  sx={{ color: getColor(true) }}
                >
                  Done
                </Button>
              </Box>
              
              <Divider sx={{ mb: 2 }} />
              
              {renderFilterSection()}
            </Box>
          </Box>
        )}
      </>
    );
  }
  
  // For desktop, render filters directly
  return renderFilterSection();
};

export default JobFilters; 