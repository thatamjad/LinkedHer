import React, { useState, useEffect, useCallback } from 'react';
import { Box, Grid, Typography, CircularProgress, Pagination, useTheme } from '@mui/material';
import JobFilters from './JobFilters';
import JobCard from './JobCard';
import JobBoardHeader from './JobBoardHeader';
import SaveSearchModal from './SaveSearchModal';
import { useAuth } from '../../context/AuthContext';
import { useMode } from '../../context/ModeContext';
import jobService from '../../services/jobService';
import EmptyState from '../ui/EmptyState';
import { Search as SearchIcon } from '@mui/icons-material';

const JobBoard = () => {
  const theme = useTheme();
  const { user, anonymousPersona } = useAuth();
  const { mode } = useMode();
  
  // State for jobs and loading
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  
  // Filter state
  const [filters, setFilters] = useState({
    keywords: '',
    location: '',
    employmentTypes: [],
    salaryMin: '',
    salaryMax: '',
    skills: [],
    womenFriendlyScore: 50,
    womenFriendlyFactors: [],
    categories: [],
    datePosted: 'all',
    sortBy: 'datePosted',
    sortOrder: 'desc'
  });
  
  // Save search modal state
  const [saveSearchOpen, setSaveSearchOpen] = useState(false);
  
  // Fetch jobs when filters or pagination changes
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await jobService.getJobs(filters, page);
      setJobs(data.jobs);
      setTotalPages(data.totalPages);
      setTotalJobs(data.total);
    } catch (err) {
      setError('Failed to load jobs.');
    } finally {
      setLoading(false);
    }
  }, [filters, page]);
  
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);
  
  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(1); // Reset to first page when filters change
  };
  
  // Handle pagination change
  const handlePageChange = (event, value) => {
    setPage(value);
    // Scroll to top of job board
    window.scrollTo({
      top: document.getElementById('job-board-top').offsetTop - 80,
      behavior: 'smooth'
    });
  };
  
  // Open save search modal
  const handleSaveSearch = () => {
    setSaveSearchOpen(true);
  };
  
  // Save search to backend
  const saveSearch = async (name, notificationsEnabled) => {
    try {
      await jobService.saveSearch({
        name,
        filters,
        notificationsEnabled
      });
      
      setSaveSearchOpen(false);
    } catch (err) {
      console.error('Error saving search:', err);
      alert('Failed to save search. Please try again.');
    }
  };
  
  return (
    <Box id="job-board-top" sx={{ width: '100%', p: { xs: 2, md: 4 } }}>
      {/* Job Board Header */}
      <JobBoardHeader 
        totalJobs={totalJobs}
        keywords={filters.keywords}
        onSearch={(keywords) => handleFilterChange({ keywords })}
        onSaveSearch={handleSaveSearch}
      />
      
      <Grid container spacing={3} mt={1}>
        {/* Filters */}
        <Grid item xs={12} md={3}>
          <JobFilters 
            filters={filters}
            onChange={handleFilterChange}
            mode={mode}
          />
        </Grid>
        
        {/* Job Listings */}
        <Grid item xs={12} md={9}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress 
                size={60} 
                sx={{ 
                  color: mode === 'professional' ? theme.palette.primary.main : theme.palette.secondary.main 
                }} 
              />
            </Box>
          ) : error ? (
            <Box sx={{ 
              p: 4, 
              backgroundColor: 'error.light', 
              borderRadius: 2,
              color: 'error.dark'
            }}>
              <Typography variant="h6">{error}</Typography>
            </Box>
          ) : jobs.length === 0 ? (
            <EmptyState 
              icon={<SearchIcon sx={{ fontSize: 60 }} />}
              title="No jobs found"
              description="Try adjusting your search filters to find more opportunities."
              actionText="Clear Filters"
              onAction={() => handleFilterChange({
                keywords: '',
                location: '',
                employmentTypes: [],
                salaryMin: '',
                salaryMax: '',
                skills: [],
                womenFriendlyScore: 0,
                womenFriendlyFactors: [],
                categories: [],
                datePosted: 'all'
              })}
            />
          ) : (
            <>
              {/* Job Cards */}
              <Box sx={{ mb: 4 }}>
                {jobs.map(job => (
                  <JobCard 
                    key={job._id} 
                    job={job} 
                    mode={mode}
                  />
                ))}
              </Box>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
                  <Pagination 
                    count={totalPages} 
                    page={page} 
                    onChange={handlePageChange}
                    color={mode === 'professional' ? 'primary' : 'secondary'}
                    size="large"
                    showFirstButton
                    showLastButton
                  />
                </Box>
              )}
            </>
          )}
        </Grid>
      </Grid>
      
      {/* Save Search Modal */}
      <SaveSearchModal 
        open={saveSearchOpen}
        onClose={() => setSaveSearchOpen(false)}
        onSave={saveSearch}
        filters={filters}
      />
    </Box>
  );
};

export default JobBoard; 