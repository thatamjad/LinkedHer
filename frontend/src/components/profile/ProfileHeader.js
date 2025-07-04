import React from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Avatar,
  Typography,
  Button,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Card,
  CardContent
} from '@mui/material';
import { styled } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import VerifiedIcon from '@mui/icons-material/Verified';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const ProfileCover = styled(Box)(({ theme }) => ({
  height: 200,
  position: 'relative',
  backgroundColor: theme.palette.primary.light,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  borderRadius: theme.shape.borderRadius,
  marginBottom: 72,
}));

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  border: `4px solid ${theme.palette.background.paper}`,
  position: 'absolute',
  bottom: -60,
  left: theme.spacing(3),
}));

const ProfileHeader = ({ profile, isOwnProfile, user }) => {
  if (!profile || !user) return null;

  return (
    <Card sx={{ mb: 3, boxShadow: 2, borderRadius: 2 }}>
      <ProfileCover 
        sx={{ 
          backgroundImage: profile.coverImage ? `url(${profile.coverImage})` : 'none'
        }}
      >
        <ProfileAvatar
          src={user.profileImage || '/default-avatar.png'}
          alt={`${user.firstName} ${user.lastName}`}
        />
        
        {isOwnProfile && (
          <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
            <Button
              component={Link}
              to="/edit-profile"
              variant="contained"
              startIcon={<EditIcon />}
              sx={{ bgcolor: 'rgba(255, 255, 255, 0.9)', color: 'text.primary' }}
            >
              Edit Profile
            </Button>
          </Box>
        )}
      </ProfileCover>
      
      <CardContent sx={{ pt: 2, pb: 3 }}>
        <Box sx={{ ml: { xs: 0, sm: '150px' }, mt: { xs: 8, sm: 0 } }}>
          <Box display="flex" alignItems="center" mb={0.5}>
            <Typography variant="h4" component="h1" fontWeight="bold">
              {user.firstName} {user.lastName}
            </Typography>
            {user.verificationStatus === 'verified' && (
              <Tooltip title="Verified User">
                <VerifiedIcon color="primary" sx={{ ml: 1 }} />
              </Tooltip>
            )}
          </Box>
          
          {profile.headline && (
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {profile.headline}
            </Typography>
          )}
          
          {user.location && (
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}
            >
              <LocationOnIcon fontSize="small" sx={{ mr: 0.5 }} />
              {user.location}
            </Typography>
          )}
          
          {profile.skills && profile.skills.length > 0 && (
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 2 }}>
              {profile.skills.slice(0, 5).map((skill, index) => (
                <Chip 
                  key={index} 
                  label={skill.name} 
                  size="small" 
                  sx={{ mb: 1 }}
                />
              ))}
              {profile.skills.length > 5 && (
                <Chip 
                  label={`+${profile.skills.length - 5} more`} 
                  size="small" 
                  variant="outlined"
                  sx={{ mb: 1 }}
                />
              )}
            </Stack>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProfileHeader; 