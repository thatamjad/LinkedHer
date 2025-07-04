import React, { useState } from 'react';
import axios from 'axios';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  RadioGroup,
  Radio,
  Chip,
  Stack,
  Typography,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Autocomplete,
  useTheme
} from '@mui/material';
import {
  Add,
  Public,
  Lock,
  People,
  Person,
  Language,
  Work,
  School,
  LocalOffer
} from '@mui/icons-material';

const INDUSTRY_OPTIONS = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Marketing',
  'Design',
  'Engineering',
  'Science',
  'Arts',
  'Legal',
  'Nonprofit',
  'Entrepreneurship',
  'Other'
];

const CreateGroupDialog = ({ open, onClose, onCreateSuccess }) => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    privacy: 'public',
    industry: '',
    tags: [],
    rules: [],
    coverImage: null,
    coverImagePreview: null
  });
  
  const [tagInput, setTagInput] = useState('');
  const [ruleTitle, setRuleTitle] = useState('');
  const [ruleDescription, setRuleDescription] = useState('');
  
  // Handle basic form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };
  
  // Handle file upload for cover image
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prevData => ({
        ...prevData,
        coverImage: file,
        coverImagePreview: URL.createObjectURL(file)
      }));
    }
  };
  
  // Add tag to tags array
  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prevData => ({
        ...prevData,
        tags: [...prevData.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };
  
  // Remove tag from tags array
  const handleDeleteTag = (tagToDelete) => {
    setFormData(prevData => ({
      ...prevData,
      tags: prevData.tags.filter(tag => tag !== tagToDelete)
    }));
  };
  
  // Add rule to rules array
  const handleAddRule = () => {
    if (ruleTitle.trim()) {
      setFormData(prevData => ({
        ...prevData,
        rules: [
          ...prevData.rules,
          {
            title: ruleTitle.trim(),
            description: ruleDescription.trim()
          }
        ]
      }));
      setRuleTitle('');
      setRuleDescription('');
    }
  };
  
  // Remove rule from rules array
  const handleDeleteRule = (index) => {
    setFormData(prevData => ({
      ...prevData,
      rules: prevData.rules.filter((_, i) => i !== index)
    }));
  };
  
  // Navigate to next step
  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };
  
  // Navigate to previous step
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };
  
  // Check if current step is valid
  const isStepValid = (step) => {
    switch (step) {
      case 0:
        return formData.name.trim().length >= 3 && formData.description.trim().length >= 10;
      case 1:
        return formData.industry;
      case 2:
        return true; // Rules and tags are optional
      default:
        return true;
    }
  };
  
  // Submit form to create group
  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Create FormData object for file upload
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('privacy', formData.privacy);
      data.append('industry', formData.industry);
      
      // Add tags and rules as JSON strings
      data.append('tags', JSON.stringify(formData.tags));
      data.append('rules', JSON.stringify(formData.rules));
      
      // Add cover image if exists
      if (formData.coverImage) {
        data.append('coverImage', formData.coverImage);
      }
      
      const response = await axios.post('/api/industry-groups', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Reset form and close dialog
      setFormData({
        name: '',
        description: '',
        privacy: 'public',
        industry: '',
        tags: [],
        rules: [],
        coverImage: null,
        coverImagePreview: null
      });
      setActiveStep(0);
      onCreateSuccess(response.data);
      onClose();
      
    } catch (err) {
      console.error('Error creating group:', err);
      setError(err.response?.data?.message || 'Failed to create group. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Steps for the stepper
  const steps = [
    {
      label: 'Basic Information',
      description: 'Create your group with a name and description',
      content: (
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Group Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            margin="normal"
            helperText={`${formData.name.length}/50 characters`}
            inputProps={{ maxLength: 50 }}
            error={formData.name.length > 0 && formData.name.length < 3}
          />
          
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            multiline
            rows={4}
            margin="normal"
            helperText={`${formData.description.length}/500 characters. Describe what your group is about.`}
            inputProps={{ maxLength: 500 }}
            error={formData.description.length > 0 && formData.description.length < 10}
          />
          
          <FormControl component="fieldset" margin="normal">
            <FormLabel component="legend">Privacy</FormLabel>
            <RadioGroup
              row
              name="privacy"
              value={formData.privacy}
              onChange={handleChange}
            >
              <FormControlLabel 
                value="public" 
                control={<Radio />} 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Public sx={{ mr: 0.5 }} fontSize="small" />
                    Public
                  </Box>
                }
              />
              <FormControlLabel 
                value="private" 
                control={<Radio />} 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Lock sx={{ mr: 0.5 }} fontSize="small" />
                    Private
                  </Box>
                }
              />
            </RadioGroup>
          </FormControl>
          
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
            {formData.privacy === 'public' 
              ? 'Anyone can see the group, its members and their posts.'
              : 'Only members can see the group, its members and their posts.'}
          </Typography>
        </Box>
      )
    },
    {
      label: 'Industry & Focus',
      description: 'Define your group's industry and focus',
      content: (
        <Box sx={{ mt: 2 }}>
          <Autocomplete
            options={INDUSTRY_OPTIONS}
            value={formData.industry}
            onChange={(e, newValue) => {
              setFormData(prev => ({ ...prev, industry: newValue }));
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Industry"
                required
                margin="normal"
              />
            )}
          />
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Tags (optional)
            </Typography>
            <Typography variant="caption" color="text.secondary" paragraph>
              Add tags to help others find your group. Press Enter or click Add after each tag.
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TextField
                label="Add tag"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                sx={{ flex: 1 }}
              />
              <Button 
                startIcon={<Add />}
                onClick={handleAddTag}
                sx={{ ml: 1 }}
              >
                Add
              </Button>
            </Box>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 2 }}>
              {formData.tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  onDelete={() => handleDeleteTag(tag)}
                  color="primary"
                  variant="outlined"
                  size="small"
                  icon={<LocalOffer />}
                />
              ))}
              {formData.tags.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No tags added yet.
                </Typography>
              )}
            </Box>
          </Box>
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Cover Image (optional)
            </Typography>
            <Typography variant="caption" color="text.secondary" paragraph>
              Add a cover image to make your group stand out.
            </Typography>
            
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="cover-image-upload"
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="cover-image-upload">
              <Button
                variant="outlined"
                component="span"
              >
                Upload Cover Image
              </Button>
            </label>
            
            {formData.coverImagePreview && (
              <Box sx={{ mt: 2, position: 'relative' }}>
                <img 
                  src={formData.coverImagePreview} 
                  alt="Cover preview" 
                  style={{ 
                    width: '100%', 
                    maxHeight: '200px', 
                    objectFit: 'cover',
                    borderRadius: theme.shape.borderRadius
                  }}
                />
                <Button
                  variant="contained"
                  size="small"
                  color="error"
                  sx={{ position: 'absolute', top: 8, right: 8 }}
                  onClick={() => setFormData(prev => ({ 
                    ...prev, 
                    coverImage: null, 
                    coverImagePreview: null 
                  }))}
                >
                  Remove
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      )
    },
    {
      label: 'Group Rules',
      description: 'Add rules to help members understand what's allowed',
      content: (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Group Rules (optional)
          </Typography>
          <Typography variant="caption" color="text.secondary" paragraph>
            Set guidelines for members to follow. Clear rules help create a positive environment.
          </Typography>
          
          <TextField
            fullWidth
            label="Rule Title"
            value={ruleTitle}
            onChange={(e) => setRuleTitle(e.target.value)}
            margin="normal"
            placeholder="E.g., Be respectful to all members"
          />
          
          <TextField
            fullWidth
            label="Rule Description"
            value={ruleDescription}
            onChange={(e) => setRuleDescription(e.target.value)}
            multiline
            rows={2}
            margin="normal"
            placeholder="Add details to help members understand this rule"
          />
          
          <Button
            startIcon={<Add />}
            onClick={handleAddRule}
            disabled={!ruleTitle.trim()}
            sx={{ mt: 1 }}
          >
            Add Rule
          </Button>
          
          <Box sx={{ mt: 3 }}>
            {formData.rules.length > 0 ? (
              formData.rules.map((rule, index) => (
                <Box 
                  key={index} 
                  sx={{ 
                    border: 1, 
                    borderColor: 'divider', 
                    borderRadius: 1, 
                    p: 2, 
                    mb: 2 
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography variant="subtitle2">
                      {index + 1}. {rule.title}
                    </Typography>
                    <Button 
                      size="small" 
                      color="error" 
                      onClick={() => handleDeleteRule(index)}
                    >
                      Remove
                    </Button>
                  </Box>
                  {rule.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {rule.description}
                    </Typography>
                  )}
                </Box>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                No rules added yet. We recommend adding at least a few basic rules.
              </Typography>
            )}
          </Box>
          
          <Box sx={{ mt: 3, bgcolor: 'background.default', p: 2, borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Ready to create your group?
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Once created, you'll be the group admin and can invite others to join.
            </Typography>
          </Box>
        </Box>
      )
    }
  ];

  return (
    <Dialog 
      open={open} 
      onClose={!loading ? onClose : undefined}
      fullWidth
      maxWidth="md"
      scroll="paper"
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <People sx={{ mr: 1 }} />
          Create a New Industry Group
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel>{step.label}</StepLabel>
              <StepContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {step.description}
                </Typography>
                
                {step.content}
                
                <Box sx={{ mb: 2, mt: 3 }}>
                  <div>
                    <Button
                      disabled={index === 0 || loading}
                      onClick={handleBack}
                      sx={{ mr: 1 }}
                    >
                      Back
                    </Button>
                    
                    {index === steps.length - 1 ? (
                      <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={!isStepValid(index) || loading}
                      >
                        {loading ? <CircularProgress size={24} /> : 'Create Group'}
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        onClick={handleNext}
                        disabled={!isStepValid(index)}
                      >
                        Next
                      </Button>
                    )}
                  </div>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateGroupDialog;