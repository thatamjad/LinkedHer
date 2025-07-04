import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Container,
  TextField,
  InputAdornment,
  Chip,
  CircularProgress,
  IconButton,
  Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import AddIcon from '@mui/icons-material/Add';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const MentalHealthResources = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    'all',
    'stress',
    'anxiety',
    'depression',
    'burnout',
    'work-life balance',
    'imposter syndrome',
    'discrimination',
    'career change',
    'professional development',
  ];

  useEffect(() => {
    const fetchResources = async () => {
      try {
        // This is a placeholder for an actual API call
        const response = await fetch('/api/mental-health-resources');
        if (!response.ok) {
          throw new Error('Failed to load resources');
        }
        const data = await response.json();
        setResources(data);
      } catch (err) {
        console.error('Error fetching resources:', err);
        setError('Failed to load mental health resources. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  const handleToggleFavorite = async (resourceId) => {
    try {
      const updatedResources = resources.map((resource) => {
        if (resource.id === resourceId) {
          return { ...resource, isFavorited: !resource.isFavorited };
        }
        return resource;
      });
      
      setResources(updatedResources);
      
      // This is a placeholder for an actual API call
      await fetch(`/api/mental-health-resources/${resourceId}/favorite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.id,
          isFavorited: updatedResources.find(r => r.id === resourceId).isFavorited
        }),
      });
    } catch (err) {
      console.error('Error updating favorite status:', err);
      toast.error('Failed to update favorite status');
    }
  };

  const filteredResources = resources.filter((resource) => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                           resource.categories.includes(selectedCategory);
    
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Mental Health Resources
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => navigate('/mental-health/resources/add')}
          >
            Add Resource
          </Button>
        </Box>

        <Box mb={4}>
          <TextField
            fullWidth
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            variant="outlined"
            sx={{ mb: 3 }}
          />

          <Box display="flex" flexWrap="wrap" gap={1}>
            {categories.map((category) => (
              <Chip
                key={category}
                label={category === 'all' ? 'All Resources' : category}
                onClick={() => setSelectedCategory(category)}
                color={selectedCategory === category ? 'primary' : 'default'}
                variant={selectedCategory === category ? 'filled' : 'outlined'}
              />
            ))}
          </Box>
        </Box>

        {filteredResources.length === 0 ? (
          <Box textAlign="center" py={6}>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              No resources found
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Try adjusting your search or filters, or add a new resource.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredResources.map((resource) => (
              <Grid item xs={12} sm={6} md={4} key={resource.id}>
                <Card 
                  elevation={3} 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                    }
                  }}
                >
                  {resource.imageUrl && (
                    <CardMedia
                      component="img"
                      height="140"
                      image={resource.imageUrl}
                      alt={resource.title}
                    />
                  )}
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Typography variant="h6" component="h2" gutterBottom>
                        {resource.title}
                      </Typography>
                      <IconButton 
                        size="small" 
                        onClick={() => handleToggleFavorite(resource.id)}
                        color="primary"
                      >
                        {resource.isFavorited ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                      </IconButton>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {resource.description.length > 120
                        ? `${resource.description.substring(0, 120)}...`
                        : resource.description}
                    </Typography>
                    
                    <Box display="flex" flexWrap="wrap" gap={0.5} mb={2}>
                      {resource.categories.map((category, index) => (
                        <Chip
                          key={index}
                          label={category}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                    
                    <Divider sx={{ my: 1 }} />
                    
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="caption" color="text.secondary">
                        Added by {resource.creator?.name || 'Anonymous'}
                      </Typography>
                      <Button 
                        size="small" 
                        onClick={() => navigate(`/mental-health/resources/${resource.id}`)}
                      >
                        View Details
                      </Button>
                    </Box>
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

export default MentalHealthResources; 