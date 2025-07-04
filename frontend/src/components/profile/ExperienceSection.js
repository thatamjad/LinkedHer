import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
  Grid,
  Stack
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import WorkIcon from '@mui/icons-material/Work';
import { useProfile } from '../../context/ProfileContext';
import dayjs from 'dayjs';
import { format } from 'date-fns';

const ExperienceSection = ({ profile, isOwnProfile }) => {
  const { addExperience, updateExperience, deleteExperience } = useProfile();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [currentExperience, setCurrentExperience] = useState(null);
  const [experienceToDelete, setExperienceToDelete] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    startDate: null,
    endDate: null,
    current: false,
    description: ''
  });

  const handleInputChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'current' ? checked : value
    }));
  };

  const handleDateChange = (name, date) => {
    setFormData(prev => ({
      ...prev,
      [name]: date ? date.toDate() : null
    }));
  };

  const openAddDialog = () => {
    setCurrentExperience(null);
    setFormData({
      title: '',
      company: '',
      location: '',
      startDate: null,
      endDate: null,
      current: false,
      description: ''
    });
    setDialogOpen(true);
  };

  const openEditDialog = (experience) => {
    setCurrentExperience(experience);
    setFormData({
      title: experience.title,
      company: experience.company,
      location: experience.location || '',
      startDate: dayjs(experience.startDate),
      endDate: experience.endDate ? dayjs(experience.endDate) : null,
      current: experience.current || false,
      description: experience.description || ''
    });
    setDialogOpen(true);
  };

  const openDeleteDialog = (experience) => {
    setExperienceToDelete(experience);
    setConfirmDeleteOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setCurrentExperience(null);
  };

  const handleDeleteDialogClose = () => {
    setConfirmDeleteOpen(false);
    setExperienceToDelete(null);
  };

  const handleSubmit = async () => {
    try {
      if (currentExperience) {
        await updateExperience(currentExperience._id, formData);
      } else {
        await addExperience(formData);
      }
      setDialogOpen(false);
    } catch (error) {
      console.error('Failed to save experience:', error);
    }
  };

  const handleDelete = async () => {
    try {
      if (experienceToDelete) {
        await deleteExperience(experienceToDelete._id);
        setConfirmDeleteOpen(false);
      }
    } catch (error) {
      console.error('Failed to delete experience:', error);
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    return format(new Date(date), 'MMM yyyy');
  };

  if (!profile) return null;

  return (
    <Card sx={{ mb: 3, boxShadow: 2, borderRadius: 2 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" component="h2" display="flex" alignItems="center">
            <WorkIcon sx={{ mr: 1 }} color="primary" />
            Experience
          </Typography>
          {isOwnProfile && (
            <Button 
              variant="outlined" 
              startIcon={<AddIcon />}
              onClick={openAddDialog}
            >
              Add Experience
            </Button>
          )}
        </Box>

        {profile.experience && profile.experience.length > 0 ? (
          profile.experience.map((exp, index) => (
            <Box key={exp._id || index}>
              {index > 0 && <Divider sx={{ my: 2 }} />}
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6">{exp.title}</Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    {exp.company}
                    {exp.location && ` · ${exp.location}`}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                  </Typography>
                  {exp.description && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {exp.description}
                    </Typography>
                  )}
                </Box>
                {isOwnProfile && (
                  <Box>
                    <IconButton 
                      size="small" 
                      onClick={() => openEditDialog(exp)}
                      aria-label="Edit experience"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => openDeleteDialog(exp)}
                      aria-label="Delete experience"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                )}
              </Box>
            </Box>
          ))
        ) : (
          <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
            No experience information available yet.
          </Typography>
        )}
      </CardContent>

      {/* Add/Edit Experience Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {currentExperience ? 'Edit Experience' : 'Add Experience'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                name="title"
                label="Job Title"
                fullWidth
                required
                value={formData.title}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="company"
                label="Company"
                fullWidth
                required
                value={formData.company}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="location"
                label="Location"
                fullWidth
                value={formData.location}
                onChange={handleInputChange}
              />
            </Grid>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Start Date"
                  value={formData.startDate ? dayjs(formData.startDate) : null}
                  onChange={(date) => handleDateChange('startDate', date)}
                  views={['month', 'year']}
                  format="MMM YYYY"
                  slotProps={{ textField: { fullWidth: true, required: true } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="End Date"
                  value={formData.endDate ? dayjs(formData.endDate) : null}
                  onChange={(date) => handleDateChange('endDate', date)}
                  views={['month', 'year']}
                  format="MMM YYYY"
                  slotProps={{ 
                    textField: { 
                      fullWidth: true, 
                      disabled: formData.current 
                    } 
                  }}
                />
              </Grid>
            </LocalizationProvider>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="current"
                    checked={formData.current}
                    onChange={handleInputChange}
                  />
                }
                label="I am currently working in this role"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                fullWidth
                multiline
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={!formData.title || !formData.company || !formData.startDate}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog open={confirmDeleteOpen} onClose={handleDeleteDialogClose}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this experience entry? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Cancel</Button>
          <Button onClick={handleDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default ExperienceSection; 