import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  Divider
} from '@mui/material';
import { LocationOn, Business, AttachMoney } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const JobCard = ({ job }) => {
  const formatSalary = (min, max) => {
    if (!min && !max) return 'Not Disclosed';
    if (min && max) return `$${min / 1000}k - $${max / 1000}k`;
    if (min) return `From $${min / 1000}k`;
    if (max) return `Up to $${max / 1000}k`;
  };

  return (
    <Card sx={{ mb: 2, '&:hover': { boxShadow: 4 } }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between">
          <Typography variant="h6" component={Link} to={`/jobs/${job._id}`} sx={{ textDecoration: 'none', color: 'inherit' }}>
            {job.title}
          </Typography>
          <Chip label={job.employmentType} color="primary" size="small" />
        </Box>
        <Box display="flex" alignItems="center" color="text.secondary" my={1}>
          <Business sx={{ mr: 1 }} />
          <Typography variant="body1">{job.company}</Typography>
        </Box>
        <Box display="flex" alignItems="center" color="text.secondary">
          <LocationOn sx={{ mr: 1 }} />
          <Typography variant="body1">{job.location}</Typography>
        </Box>
        <Box display="flex" alignItems="center" color="text.secondary" mt={1}>
          <AttachMoney sx={{ mr: 1 }} />
          <Typography variant="body1">{formatSalary(job.salary?.min, job.salary?.max)}</Typography>
        </Box>
        <Divider sx={{ my: 2 }} />
        <Typography variant="body2" color="text.secondary" paragraph>
          {job.description.substring(0, 150)}...
        </Typography>
        <Box>
          {job.skills?.slice(0, 5).map((skill) => (
            <Chip key={skill} label={skill} size="small" sx={{ mr: 1, mb: 1 }} />
          ))}
        </Box>
      </CardContent>
      <Divider />
      <Box p={2} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="caption" color="text.secondary">
          Posted: {new Date(job.datePosted).toLocaleDateString()}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to={`/jobs/${job._id}`}
        >
          View Details
        </Button>
      </Box>
    </Card>
  );
};

export default JobCard; 