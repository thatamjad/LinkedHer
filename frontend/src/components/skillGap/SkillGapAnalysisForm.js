import React, { useState } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  FormControlLabel,
  Autocomplete,
  Chip,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Rating,
  Grid,
  Divider
} from '@mui/material';

// Industry options
const INDUSTRIES = [
  'Software Development',
  'Data Science',
  'UX/UI Design',
  'Product Management',
  'Marketing',
  'Sales',
  'Human Resources',
  'Finance',
  'Healthcare',
  'Education',
  'Legal'
];

// Skills database (simplified)
const SKILLS_DATABASE = {
  'Software Development': [
    'JavaScript', 'Python', 'Java', 'C++', 'React', 'Angular', 'Vue', 'Node.js',
    'Express', 'Django', 'Flask', 'Spring Boot', 'AWS', 'Azure', 'GCP',
    'Docker', 'Kubernetes', 'CI/CD', 'Git', 'REST API', 'GraphQL', 'SQL', 'NoSQL',
    'Redis', 'Kafka', 'Microservices', 'Serverless', 'TDD', 'Agile'
  ],
  'Data Science': [
    'Python', 'R', 'SQL', 'Tableau', 'Power BI', 'Machine Learning', 'Deep Learning',
    'NLP', 'Computer Vision', 'Statistics', 'A/B Testing', 'TensorFlow', 'PyTorch',
    'Pandas', 'NumPy', 'Scikit-learn', 'Big Data', 'Hadoop', 'Spark', 'Data Visualization',
    'Feature Engineering', 'Data Cleaning', 'ETL', 'Data Warehousing'
  ],
  'UX/UI Design': [
    'User Research', 'Wireframing', 'Prototyping', 'Usability Testing', 'Figma',
    'Sketch', 'Adobe XD', 'InVision', 'Visual Design', 'Interaction Design',
    'Information Architecture', 'User Flows', 'Responsive Design', 'Accessibility',
    'Design Systems', 'Typography', 'Color Theory', 'UI Animation'
  ],
  'Product Management': [
    'Product Strategy', 'Roadmapping', 'User Stories', 'Agile', 'Scrum', 'Kanban',
    'Competitive Analysis', 'Market Research', 'Prioritization', 'A/B Testing',
    'User Interviews', 'Metrics & Analytics', 'Stakeholder Management', 'Product Vision',
    'Go-to-Market Strategy', 'Pricing Strategy', 'Product Analytics'
  ]
};

const getRoleOptionsForIndustry = (industry) => {
  // Basic mapping of industries to roles
  const roleMap = {
    'Software Development': [
      'Junior Developer', 'Mid-level Developer', 'Senior Developer',
      'Tech Lead', 'Architect', 'Engineering Manager', 'CTO'
    ],
    'Data Science': [
      'Data Analyst', 'Junior Data Scientist', 'Data Scientist',
      'Senior Data Scientist', 'ML Engineer', 'Data Science Manager', 'Chief Data Officer'
    ],
    'UX/UI Design': [
      'Junior Designer', 'UX/UI Designer', 'Senior Designer',
      'Design Lead', 'UX Researcher', 'Design Manager', 'Creative Director'
    ],
    'Product Management': [
      'Associate Product Manager', 'Product Manager', 'Senior Product Manager',
      'Group Product Manager', 'Director of Product', 'VP of Product', 'Chief Product Officer'
    ]
  };
  
  return roleMap[industry] || [];
};

const SkillGapAnalysisForm = ({ onComplete }) => {
  // Steps
  const [activeStep, setActiveStep] = useState(0);
  
  // Form state
  const [industry, setIndustry] = useState('');
  const [currentTitle, setCurrentTitle] = useState('');
  const [targetTitle, setTargetTitle] = useState('');
  const [targetLevel, setTargetLevel] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [skillRatings, setSkillRatings] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Derived state
  const [availableSkills, setAvailableSkills] = useState([]);
  const [roleOptions, setRoleOptions] = useState([]);
  
  // Handle industry selection
  const handleIndustryChange = (event, newValue) => {
    setIndustry(newValue);
    if (newValue) {
      setAvailableSkills(SKILLS_DATABASE[newValue] || []);
      setRoleOptions(getRoleOptionsForIndustry(newValue));
    } else {
      setAvailableSkills([]);
      setRoleOptions([]);
    }
    setSelectedSkills([]);
    setSkillRatings({});
  };
  
  // Handle skill selection
  const handleSkillChange = (event, newValue) => {
    setSelectedSkills(newValue);
    
    // Initialize ratings for new skills
    const newRatings = { ...skillRatings };
    newValue.forEach(skill => {
      if (!newRatings[skill]) {
        newRatings[skill] = 1; // Default rating
      }
    });
    
    // Remove ratings for deselected skills
    Object.keys(newRatings).forEach(skill => {
      if (!newValue.includes(skill)) {
        delete newRatings[skill];
      }
    });
    
    setSkillRatings(newRatings);
  };
  
  // Handle rating change
  const handleRatingChange = (skill, newValue) => {
    setSkillRatings(prev => ({
      ...prev,
      [skill]: newValue
    }));
  };
  
  // Handle navigation between steps
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };
  
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Prepare skill ratings array for API
      const skills = selectedSkills.map(skill => ({
        name: skill,
        currentLevel: skillRatings[skill]
      }));
      
      const payload = {
        industry,
        currentRole: {
          title: currentTitle,
          yearsExperience: parseInt(yearsExperience, 10)
        },
        targetRole: {
          title: targetTitle,
          level: targetLevel
        },
        skills
      };
      
      const response = await axios.post('/api/skill-gap', payload);
      onComplete(response.data);
      
    } catch (err) {
      console.error('Error submitting skill gap analysis:', err);
      setError('Failed to submit skill gap analysis. Please try again.');
      setActiveStep(0);
    } finally {
      setLoading(false);
    }
  };
  
  // Check if current step is valid
  const isStepValid = () => {
    switch (activeStep) {
      case 0:
        return industry && currentTitle && yearsExperience;
      case 1:
        return targetTitle && targetLevel;
      case 2:
        return selectedSkills.length > 0;
      default:
        return true;
    }
  };
  
  // Steps content
  const steps = [
    {
      label: 'Current Position',
      description: 'Tell us about your current role and industry',
      content: (
        <Box sx={{ mt: 2 }}>
          <Autocomplete
            value={industry}
            onChange={handleIndustryChange}
            options={INDUSTRIES}
            renderInput={(params) => (
              <TextField 
                {...params} 
                label="Industry" 
                fullWidth
                required
                margin="normal"
              />
            )}
          />
          
          <TextField
            label="Current Job Title"
            value={currentTitle}
            onChange={(e) => setCurrentTitle(e.target.value)}
            fullWidth
            required
            margin="normal"
          />
          
          <TextField
            label="Years of Experience"
            value={yearsExperience}
            onChange={(e) => setYearsExperience(e.target.value)}
            type="number"
            fullWidth
            required
            margin="normal"
            inputProps={{ min: 0 }}
          />
        </Box>
      )
    },
    {
      label: 'Career Goals',
      description: 'What role are you targeting?',
      content: (
        <Box sx={{ mt: 2 }}>
          <Autocomplete
            value={targetTitle}
            onChange={(event, newValue) => setTargetTitle(newValue)}
            options={roleOptions}
            renderInput={(params) => (
              <TextField 
                {...params} 
                label="Target Role/Title" 
                fullWidth
                required
                margin="normal"
              />
            )}
          />
          
          <FormControl component="fieldset" fullWidth margin="normal" required>
            <FormLabel component="legend">Target Level</FormLabel>
            <RadioGroup
              value={targetLevel}
              onChange={(e) => setTargetLevel(e.target.value)}
              row
            >
              <FormControlLabel value="junior" control={<Radio />} label="Junior" />
              <FormControlLabel value="mid" control={<Radio />} label="Mid-level" />
              <FormControlLabel value="senior" control={<Radio />} label="Senior" />
              <FormControlLabel value="lead" control={<Radio />} label="Lead/Manager" />
            </RadioGroup>
          </FormControl>
        </Box>
      )
    },
    {
      label: 'Skills Assessment',
      description: 'Rate your current skill levels',
      content: (
        <Box sx={{ mt: 2 }}>
          <Autocomplete
            multiple
            value={selectedSkills}
            onChange={handleSkillChange}
            options={availableSkills}
            renderInput={(params) => (
              <TextField 
                {...params} 
                label="Select Your Skills" 
                placeholder="Select or type skills"
                fullWidth
                margin="normal"
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip 
                  variant="outlined"
                  label={option} 
                  {...getTagProps({ index })} 
                />
              ))
            }
          />
          
          {selectedSkills.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Rate your proficiency level for each skill:
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                {selectedSkills.map((skill) => (
                  <Grid item xs={12} md={6} key={skill}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      p: 1,
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1
                    }}>
                      <Typography variant="body2">{skill}</Typography>
                      <Rating
                        name={`rating-${skill}`}
                        value={skillRatings[skill] || 1}
                        onChange={(event, newValue) => {
                          handleRatingChange(skill, newValue);
                        }}
                      />
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Box>
      )
    }
  ];
  
  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      
      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((step, index) => (
          <Step key={step.label}>
            <StepLabel>
              <Typography variant="subtitle1">{step.label}</Typography>
            </StepLabel>
            <StepContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {step.description}
              </Typography>
              
              {step.content}
              
              <Box sx={{ mb: 2, mt: 3 }}>
                <div>
                  <Button
                    disabled={activeStep === 0 || loading}
                    onClick={handleBack}
                    sx={{ mr: 1 }}
                  >
                    Back
                  </Button>
                  
                  {activeStep === steps.length - 1 ? (
                    <Button
                      variant="contained"
                      onClick={handleSubmit}
                      disabled={!isStepValid() || loading}
                      endIcon={loading ? <CircularProgress size={24} /> : null}
                    >
                      {loading ? 'Analyzing...' : 'Complete Analysis'}
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      disabled={!isStepValid()}
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
    </Paper>
  );
};

export default SkillGapAnalysisForm; 