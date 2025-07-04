import React, { useState, useEffect } from 'react';
import { 
  Container, Box, Typography, Grid, Card, CardContent, 
  CardMedia, CardActionArea, Chip, Button, TextField, 
  MenuItem, Select, FormControl, InputLabel, Pagination, 
  CircularProgress, Divider, Avatar, AvatarGroup
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

const ProjectCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[8],
  }
}));

const StageChip = styled(Chip)(({ theme, stage }) => {
  const stageColors = {
    idea: theme.palette.info.light,
    concept: theme.palette.info.main,
    prototype: theme.palette.warning.light,
    validation: theme.palette.warning.main,
    scaling: theme.palette.success.light,
    established: theme.palette.success.main
  };
  
  return {
    backgroundColor: stageColors[stage] || theme.palette.primary.light,
    color: theme.palette.getContrastText(stageColors[stage] || theme.palette.primary.light),
    fontWeight: 'bold'
  };
});

const StatusChip = styled(Chip)(({ theme, status }) => {
  const statusColors = {
    active: theme.palette.success.light,
    completed: theme.palette.success.main,
    on_hold: theme.palette.warning.light,
    seeking_members: theme.palette.info.main,
    seeking_funding: theme.palette.secondary.main
  };
  
  return {
    backgroundColor: statusColors[status] || theme.palette.primary.light,
    color: theme.palette.getContrastText(statusColors[status] || theme.palette.primary.light),
    fontWeight: 'bold'
  };
});

const CollaborativeProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [stage, setStage] = useState('');
  const [status, setStatus] = useState('');
  const [skillNeeded, setSkillNeeded] = useState('');
  const navigate = useNavigate();

  const categories = [
    { value: 'startup', label: 'Startup' },
    { value: 'social_enterprise', label: 'Social Enterprise' },
    { value: 'nonprofit', label: 'Nonprofit' },
    { value: 'research', label: 'Research' },
    { value: 'technology', label: 'Technology' },
    { value: 'creative', label: 'Creative' },
    { value: 'community_initiative', label: 'Community Initiative' },
    { value: 'other', label: 'Other' }
  ];

  const stages = [
    { value: 'idea', label: 'Idea' },
    { value: 'concept', label: 'Concept' },
    { value: 'prototype', label: 'Prototype' },
    { value: 'validation', label: 'Validation' },
    { value: 'scaling', label: 'Scaling' },
    { value: 'established', label: 'Established' }
  ];

  const statuses = [
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
    { value: 'on_hold', label: 'On Hold' },
    { value: 'seeking_members', label: 'Seeking Members' },
    { value: 'seeking_funding', label: 'Seeking Funding' }
  ];

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 12
      };

      if (search) params.search = search;
      if (category) params.category = category;
      if (stage) params.stage = stage;
      if (status) params.status = status;
      if (skillNeeded) params.skillNeeded = skillNeeded;

      const response = await axios.get('/api/collaborative-projects', { params });
      setProjects(response.data.projects);
      setTotalPages(response.data.pagination.pages);
    } catch (err) {
      console.error('Error fetching collaborative projects:', err);
      setError('Failed to load projects. Please try again later.');
      toast.error('Failed to load collaborative projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [page, category, stage, status]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProjects();
  };

  const handleSkillSearch = (e) => {
    setSkillNeeded(e.target.value);
    if (e.key === 'Enter') {
      setPage(1);
      fetchProjects();
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleProjectClick = (projectId) => {
    navigate(`/collaborative-projects/${projectId}`);
  };

  const handleCreateProject = () => {
    navigate('/collaborative-projects/create');
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
        <Button variant="contained" color="primary" onClick={fetchProjects} sx={{ mt: 2 }}>
          Try Again
        </Button>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold">
              Collaborative Projects
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Connect with other women entrepreneurs and professionals
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleCreateProject}
          >
            Start New Project
          </Button>
        </Box>

        <Divider sx={{ mb: 4 }} />

        <Box 
          component="form" 
          onSubmit={handleSearch}
          display="flex" 
          gap={2} 
          mb={4}
          flexDirection={{ xs: 'column', md: 'row' }}
          flexWrap={{ md: 'wrap' }}
        >
          <TextField
            label="Search projects"
            variant="outlined"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
            sx={{ flexGrow: 1, minWidth: { md: '30%' } }}
          />
          
          <FormControl sx={{ minWidth: { xs: '100%', md: '180px' } }}>
            <InputLabel id="category-select-label">Category</InputLabel>
            <Select
              labelId="category-select-label"
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
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
          
          <FormControl sx={{ minWidth: { xs: '100%', md: '150px' } }}>
            <InputLabel id="stage-select-label">Stage</InputLabel>
            <Select
              labelId="stage-select-label"
              value={stage}
              onChange={(e) => { setStage(e.target.value); setPage(1); }}
              label="Stage"
              fullWidth
            >
              <MenuItem value="">All Stages</MenuItem>
              {stages.map((s) => (
                <MenuItem key={s.value} value={s.value}>
                  {s.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl sx={{ minWidth: { xs: '100%', md: '180px' } }}>
            <InputLabel id="status-select-label">Status</InputLabel>
            <Select
              labelId="status-select-label"
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              label="Status"
              fullWidth
            >
              <MenuItem value="">All Statuses</MenuItem>
              {statuses.map((s) => (
                <MenuItem key={s.value} value={s.value}>
                  {s.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField
            label="Skill needed"
            variant="outlined"
            value={skillNeeded}
            onChange={(e) => setSkillNeeded(e.target.value)}
            onKeyDown={handleSkillSearch}
            placeholder="E.g. marketing, design"
            fullWidth
            sx={{ minWidth: { md: '180px' } }}
          />
          
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            sx={{ height: { md: 56 }, px: 4 }}
          >
            Search
          </Button>
        </Box>

        {projects.length === 0 ? (
          <Box textAlign="center" py={5}>
            <Typography variant="h6">
              No collaborative projects found matching your criteria.
            </Typography>
            <Button 
              variant="outlined" 
              color="primary" 
              onClick={() => {
                setSearch('');
                setCategory('');
                setStage('');
                setStatus('');
                setSkillNeeded('');
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
              {projects.map((project) => (
                <Grid item xs={12} sm={6} md={4} key={project._id}>
                  <ProjectCard elevation={3}>
                    <CardActionArea onClick={() => handleProjectClick(project._id)}>
                      <Box p={2} display="flex" justifyContent="space-between">
                        <StageChip
                          label={stages.find(s => s.value === project.stage)?.label || project.stage}
                          size="small"
                          stage={project.stage}
                        />
                        <StatusChip
                          label={statuses.find(s => s.value === project.status)?.label || project.status}
                          size="small"
                          status={project.status}
                        />
                      </Box>
                      <CardContent>
                        <Typography gutterBottom variant="h6" component="div" fontWeight="bold">
                          {project.title}
                        </Typography>
                        <Box display="flex" mb={1}>
                          <CategoryChip
                            label={categories.find(c => c.value === project.category)?.label || project.category}
                            size="small"
                          />
                          {project.isPrivate && (
                            <Chip
                              label="Private"
                              size="small"
                              color="secondary"
                            />
                          )}
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, minHeight: '60px' }}>
                          {project.description.length > 120
                            ? `${project.description.substring(0, 120)}...`
                            : project.description}
                        </Typography>
                        
                        {project.skillsNeeded?.length > 0 && (
                          <Box mb={2}>
                            <Typography variant="body2" fontWeight="medium" mb={0.5}>
                              Skills needed:
                            </Typography>
                            <Box display="flex" flexWrap="wrap" gap={0.5}>
                              {project.skillsNeeded.slice(0, 3).map((skill, index) => (
                                <Chip
                                  key={index}
                                  label={skill.skill}
                                  size="small"
                                  variant={skill.isFilled ? "outlined" : "filled"}
                                  color="primary"
                                />
                              ))}
                              {project.skillsNeeded.length > 3 && (
                                <Chip
                                  label={`+${project.skillsNeeded.length - 3} more`}
                                  size="small"
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          </Box>
                        )}
                        
                        <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                          <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 28, height: 28 } }}>
                            {project.members?.map((member, index) => (
                              <Avatar 
                                key={index} 
                                alt={member.user?.firstName || 'Member'} 
                                src={member.user?.profileImage} 
                                sx={{ width: 28, height: 28 }}
                              />
                            ))}
                          </AvatarGroup>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(project.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </CardContent>
                    </CardActionArea>
                  </ProjectCard>
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
    </Container>
  );
};

export default CollaborativeProjects; 