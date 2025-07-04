import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  FormControlLabel,
  CircularProgress,
  Alert,
  Slider,
  Divider,
  Chip,
  Avatar
} from '@mui/material';
import { ArrowBack, Send } from '@mui/icons-material';

const MentorshipRequestForm = ({ mentor, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    goalDescription: '',
    preferredDuration: '3_months',
    communicationFrequency: 'biweekly',
    specificSkills: '',
    mentorshipType: 'career_guidance'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const result = await onSubmit(formData);
      
      if (result.success) {
        setSuccess(result.message);
        // Form will be unmounted by parent component after success
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error('Error submitting mentorship request:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={onCancel}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h6">
          Request Mentorship from {mentor.mentor.user.name}
        </Typography>
      </Box>
      
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <Avatar 
          src={mentor.mentor.user.profileImage} 
          alt={mentor.mentor.user.name}
          sx={{ width: 50, height: 50, mr: 2 }}
        />
        <Box>
          <Typography variant="body1" fontWeight="bold">
            {mentor.mentor.user.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {mentor.mentor.industry} • {mentor.mentor.experienceYears} years experience
          </Typography>
        </Box>
        <Chip 
          label={`${mentor.compatibilityScore}% Match`}
          color={mentor.compatibilityScore >= 80 ? "success" : mentor.compatibilityScore >= 60 ? "primary" : "default"}
          sx={{ ml: 'auto' }}
        />
      </Box>
      
      <Divider sx={{ mb: 3 }} />
      
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}
      
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="What are your goals for this mentorship?"
          name="goalDescription"
          multiline
          rows={4}
          value={formData.goalDescription}
          onChange={handleChange}
          margin="normal"
          required
          placeholder="Describe what you hope to achieve with this mentor's guidance..."
        />
        
        <FormControl component="fieldset" fullWidth margin="normal">
          <FormLabel component="legend">Preferred Duration</FormLabel>
          <RadioGroup
            name="preferredDuration"
            value={formData.preferredDuration}
            onChange={handleChange}
            row
          >
            <FormControlLabel value="1_month" control={<Radio />} label="1 month" />
            <FormControlLabel value="3_months" control={<Radio />} label="3 months" />
            <FormControlLabel value="6_months" control={<Radio />} label="6 months" />
            <FormControlLabel value="ongoing" control={<Radio />} label="Ongoing" />
          </RadioGroup>
        </FormControl>
        
        <FormControl component="fieldset" fullWidth margin="normal">
          <FormLabel component="legend">Communication Frequency</FormLabel>
          <RadioGroup
            name="communicationFrequency"
            value={formData.communicationFrequency}
            onChange={handleChange}
            row
          >
            <FormControlLabel value="weekly" control={<Radio />} label="Weekly" />
            <FormControlLabel value="biweekly" control={<Radio />} label="Bi-weekly" />
            <FormControlLabel value="monthly" control={<Radio />} label="Monthly" />
          </RadioGroup>
        </FormControl>
        
        <TextField
          fullWidth
          label="Specific skills you want to develop"
          name="specificSkills"
          value={formData.specificSkills}
          onChange={handleChange}
          margin="normal"
          placeholder="E.g., leadership, public speaking, technical skills..."
        />
        
        <FormControl component="fieldset" fullWidth margin="normal">
          <FormLabel component="legend">Mentorship Type</FormLabel>
          <RadioGroup
            name="mentorshipType"
            value={formData.mentorshipType}
            onChange={handleChange}
          >
            <FormControlLabel 
              value="career_guidance" 
              control={<Radio />} 
              label="Career Guidance & Professional Development" 
            />
            <FormControlLabel 
              value="skill_development" 
              control={<Radio />} 
              label="Skill Development & Technical Growth" 
            />
            <FormControlLabel 
              value="work_life_balance" 
              control={<Radio />} 
              label="Work-Life Balance & Wellbeing" 
            />
            <FormControlLabel 
              value="leadership" 
              control={<Radio />} 
              label="Leadership & Management Skills" 
            />
          </RadioGroup>
        </FormControl>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button 
            variant="outlined" 
            onClick={onCancel}
            sx={{ mr: 2 }}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            endIcon={loading ? <CircularProgress size={24} /> : <Send />}
            disabled={loading}
          >
            Send Request
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default MentorshipRequestForm; 