import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Avatar,
  Chip,
  LinearProgress,
  Tooltip,
  Divider
} from '@mui/material';
import { WorkOutline, School, VerifiedUser } from '@mui/icons-material';

const MentorCard = ({ mentor, compatibilityScore, onSelect }) => {
  const { user, industry, skills, experienceYears, personalityTraits } = mentor.mentor;
  
  // Helper function to get compatibility color
  const getCompatibilityColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'primary';
    if (score >= 40) return 'warning';
    return 'error';
  };
  
  return (
    <Card 
      elevation={3} 
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            src={user.profileImage}
            alt={user.name}
            sx={{ width: 60, height: 60, mr: 2 }}
          />
          <Box>
            <Typography variant="h6" gutterBottom>
              {user.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <WorkOutline fontSize="small" color="action" sx={{ mr: 0.5 }} />
              <Typography variant="body2" color="text.secondary">
                {industry}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ ml: 'auto' }}>
            <Tooltip title="Compatibility score based on your profile match">
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  Match
                </Typography>
                <Typography
                  variant="h6"
                  color={getCompatibilityColor(compatibilityScore) + '.main'}
                >
                  {compatibilityScore}%
                </Typography>
              </Box>
            </Tooltip>
          </Box>
        </Box>
        
        <Divider sx={{ my: 1.5 }} />
        
        <Box sx={{ mb: 1.5 }}>
          <Typography variant="subtitle2" gutterBottom>
            Experience & Expertise
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <School fontSize="small" color="action" sx={{ mr: 0.5 }} />
            <Typography variant="body2">
              {experienceYears} years in {industry}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {skills && skills.slice(0, 5).map((skill, index) => (
              <Chip
                key={index}
                label={typeof skill === 'object' ? skill.name : skill}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ mr: 0.5, mb: 0.5 }}
              />
            ))}
            {skills && skills.length > 5 && (
              <Chip
                label={`+${skills.length - 5} more`}
                size="small"
                variant="outlined"
                sx={{ mr: 0.5, mb: 0.5 }}
              />
            )}
          </Box>
        </Box>
        
        {mentor.mentor.bio && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            {mentor.mentor.bio.substring(0, 120)}
            {mentor.mentor.bio.length > 120 ? '...' : ''}
          </Typography>
        )}
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Compatibility
          </Typography>
          <LinearProgress
            variant="determinate"
            value={compatibilityScore}
            color={getCompatibilityColor(compatibilityScore)}
            sx={{ height: 6, borderRadius: 3 }}
          />
        </Box>
      </CardContent>
      
      <CardActions>
        <Button 
          fullWidth 
          variant="contained" 
          color="primary"
          onClick={() => onSelect(mentor)}
        >
          Request Mentorship
        </Button>
      </CardActions>
    </Card>
  );
};

export default MentorCard; 