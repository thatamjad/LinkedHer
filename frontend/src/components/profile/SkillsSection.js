import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  IconButton,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SchoolIcon from '@mui/icons-material/School';
import { useProfile } from '../../context/ProfileContext';

const SkillsSection = ({ profile, isOwnProfile }) => {
  const { addSkill, deleteSkill } = useProfile();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [error, setError] = useState('');

  const handleOpen = () => {
    setDialogOpen(true);
    setNewSkill('');
    setError('');
  };

  const handleClose = () => {
    setDialogOpen(false);
  };

  const handleSubmit = async () => {
    if (!newSkill.trim()) {
      setError('Skill name is required');
      return;
    }

    try {
      await addSkill({ name: newSkill.trim() });
      setDialogOpen(false);
    } catch (err) {
      if (err.response?.data?.error === 'Skill already exists') {
        setError('This skill is already in your profile');
      } else {
        setError('Failed to add skill. Please try again.');
      }
    }
  };

  const handleDelete = async (skillId) => {
    try {
      await deleteSkill(skillId);
    } catch (err) {
      console.error('Failed to delete skill:', err);
    }
  };

  if (!profile) return null;

  return (
    <Card sx={{ mb: 3, boxShadow: 2, borderRadius: 2 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" component="h2" display="flex" alignItems="center">
            <SchoolIcon sx={{ mr: 1 }} color="primary" />
            Skills
          </Typography>
          {isOwnProfile && (
            <Button 
              variant="outlined" 
              startIcon={<AddIcon />}
              onClick={handleOpen}
            >
              Add Skill
            </Button>
          )}
        </Box>
        
        {profile.skills && profile.skills.length > 0 ? (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {profile.skills.map((skill) => (
              <Chip
                key={skill._id}
                label={skill.name}
                onDelete={isOwnProfile ? () => handleDelete(skill._id) : undefined}
                sx={{ mb: 1 }}
              />
            ))}
          </Box>
        ) : (
          <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
            No skills listed yet.
          </Typography>
        )}
      </CardContent>

      {/* Add Skill Dialog */}
      <Dialog open={dialogOpen} onClose={handleClose}>
        <DialogTitle>Add Skill</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            autoFocus
            margin="dense"
            label="Skill Name"
            fullWidth
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            error={!!error}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default SkillsSection; 