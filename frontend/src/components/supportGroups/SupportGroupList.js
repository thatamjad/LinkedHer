import React, { useState, useEffect } from 'react';
import { 
  Box, Grid, Typography, Card, CardContent, 
  CardMedia, CardActionArea, Chip, Button,
  TextField, MenuItem, Select, FormControl, 
  InputLabel, Pagination, CircularProgress
} from '@mui/material';
import { styled } from '@mui/system';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const CategoryChip = styled(Chip)(({ theme }) => ({
  backgroundColor: theme.palette.primary.light,
  color: theme.palette.primary.contrastText,
  fontWeight: 600,
  marginRight: theme.spacing(1)
}));

const GroupCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[8],
  }
}));

const SupportGroupList = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const navigate = useNavigate();

  const categories = [
    { value: 'career_development', label: 'Career Development' },
    { value: 'workplace_challenges', label: 'Workplace Challenges' },
    { value: 'work_life_balance', label: 'Work-Life Balance' },
    { value: 'leadership', label: 'Leadership' },
    { value: 'discrimination', label: 'Discrimination & Bias' },
    { value: 'harassment', label: 'Harassment' },
    { value: 'mental_health', label: 'Mental Health' },
    { value: 'entrepreneurship', label: 'Entrepreneurship' },
    { value: 'negotiation', label: 'Negotiation' },
    { value: 'other', label: 'Other' }
  ];

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 12
      };

      if (search) params.search = search;
      if (category) params.category = category;

      const response = await axios.get('/api/support-groups', { params });
      setGroups(response.data.supportGroups);
      setTotalPages(response.data.pagination.pages);
    } catch (err) {
      console.error('Error fetching support groups:', err);
      setError('Failed to load support groups. Please try again later.');
      toast.error('Failed to load support groups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [page, category]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchGroups();
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setPage(1);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleGroupClick = (groupId) => {
    navigate(`/support-groups/${groupId}`);
  };

  const handleCreateGroup = () => {
    navigate('/support-groups/create');
  };

  if (loading && page === 1) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" p={3}>
        <Typography variant="h6" color="error">{error}</Typography>
        <Button variant="contained" color="primary" onClick={fetchGroups} sx={{ mt: 2 }}>
          Try Again
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Support Groups
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleCreateGroup}
        >
          Create Support Group
        </Button>
      </Box>

      <Box 
        component="form" 
        onSubmit={handleSearch}
        display="flex" 
        gap={2} 
        mb={4}
        flexDirection={{ xs: 'column', md: 'row' }}
      >
        <TextField
          label="Search groups"
          variant="outlined"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
          sx={{ flexGrow: 1 }}
        />
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="category-select-label">Category</InputLabel>
          <Select
            labelId="category-select-label"
            value={category}
            onChange={handleCategoryChange}
            label="Category"
            fullWidth
          >
            <MenuItem value="">All Categories</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat.value} value={cat.value}>
                {cat.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button 
          type="submit" 
          variant="contained" 
          color="primary"
          sx={{ height: { md: 56 }, px: 4 }}
        >
          Search
        </Button>
      </Box>

      {groups.length === 0 ? (
        <Box textAlign="center" py={5}>
          <Typography variant="h6">
            No support groups found matching your criteria.
          </Typography>
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={() => {
              setSearch('');
              setCategory('');
              setPage(1);
            }}
            sx={{ mt: 2 }}
          >
            Clear Filters
          </Button>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {groups.map((group) => (
              <Grid item xs={12} sm={6} md={4} key={group._id}>
                <GroupCard elevation={3}>
                  <CardActionArea onClick={() => handleGroupClick(group._id)}>
                    {group.bannerImage && (
                      <CardMedia
                        component="img"
                        height="140"
                        image={group.bannerImage}
                        alt={group.name}
                      />
                    )}
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography gutterBottom variant="h6" component="div" fontWeight="bold">
                        {group.name}
                      </Typography>
                      <Box display="flex" mb={1}>
                        <CategoryChip
                          label={categories.find(c => c.value === group.category)?.label || group.category}
                          size="small"
                        />
                        {group.isPrivate && (
                          <Chip
                            label="Private"
                            size="small"
                            color="secondary"
                          />
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {group.description.length > 120
                          ? `${group.description.substring(0, 120)}...`
                          : group.description}
                      </Typography>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" color="text.secondary">
                          {group.members?.length || 0} members
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(group.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </GroupCard>
              </Grid>
            ))}
          </Grid>

          <Box display="flex" justifyContent="center" mt={4}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        </>
      )}
    </Box>
  );
};

export default SupportGroupList; 