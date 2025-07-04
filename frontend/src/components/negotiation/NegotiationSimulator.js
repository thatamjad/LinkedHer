import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Stepper,
  Step,
  StepLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme
} from '@mui/material';
import { 
  Send, 
  Assessment, 
  TrendingUp, 
  EmojiObjects,
  AttachMoney,
  Work,
  ArrowUpward,
  Check,
  Warning,
  Lightbulb
} from '@mui/icons-material';

const NegotiationSimulator = () => {
  const theme = useTheme();
  const chatContainerRef = useRef(null);
  const [activeStep, setActiveStep] = useState(0);
  const [scenarioType, setScenarioType] = useState('');
  const [industry, setIndustry] = useState('');
  const [roleLevel, setRoleLevel] = useState('');
  const [currentSalary, setCurrentSalary] = useState('');
  const [targetSalary, setTargetSalary] = useState('');
  const [currentTitle, setCurrentTitle] = useState('');
  const [targetTitle, setTargetTitle] = useState('');
  const [negotiationId, setNegotiationId] = useState(null);
  const [userPrompt, setUserPrompt] = useState('');
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [showResults, setShowResults] = useState(false);
  
  // First step - Choose scenario type
  const handleScenarioSelect = (type) => {
    setScenarioType(type);
    setActiveStep(1);
  };
  
  // Second step - Enter scenario details
  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const payload = {
        scenarioType,
        industry,
        roleLevel,
        currentStats: {
          salary: currentSalary ? parseInt(currentSalary) : undefined,
          title: currentTitle
        },
        targetStats: {
          salary: targetSalary ? parseInt(targetSalary) : undefined,
          title: targetTitle
        }
      };
      
      const response = await axios.post('/api/negotiation', payload);
      setNegotiationId(response.data.negotiation._id);
      setActiveStep(2);
      
      // Add initial instruction message to conversation
      setConversation([
        { 
          type: 'system', 
          message: scenarioType === 'salary_negotiation' 
            ? 'You are now in a salary negotiation simulation. Start the conversation as if you were talking to a hiring manager or your supervisor about your compensation.'
            : 'You are now in a promotion discussion. Start the conversation as if you were discussing your promotion prospects with your manager.'
        }
      ]);
      
    } catch (err) {
      console.error('Error creating negotiation scenario:', err);
      setError('Failed to create negotiation scenario. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Third step - Send message in simulation
  const handleSendMessage = async () => {
    if (!userPrompt.trim()) return;
    
    // Add user message to conversation
    const updatedConversation = [
      ...conversation, 
      { type: 'user', message: userPrompt }
    ];
    setConversation(updatedConversation);
    setUserPrompt('');
    setLoading(true);
    
    try {
      // Send prompt to simulation API
      const response = await axios.post(`/api/negotiation/${negotiationId}/simulate`, {
        userPrompt: userPrompt.trim()
      });
      
      // Add AI response and update feedback
      setConversation([
        ...updatedConversation,
        { type: 'ai', message: response.data.response }
      ]);
      setFeedback(response.data);
      
    } catch (err) {
      console.error('Error in negotiation simulation:', err);
      setConversation([
        ...updatedConversation,
        { 
          type: 'system', 
          message: 'There was an error processing your message. Please try again.' 
        }
      ]);
    } finally {
      setLoading(false);
    }
  };
  
  // Scroll to bottom of chat when conversation updates
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [conversation]);
  
  // End simulation and show results
  const handleEndSimulation = () => {
    setShowResults(true);
  };
  
  // Start a new simulation
  const handleNewSimulation = () => {
    setActiveStep(0);
    setScenarioType('');
    setIndustry('');
    setRoleLevel('');
    setCurrentSalary('');
    setTargetSalary('');
    setCurrentTitle('');
    setTargetTitle('');
    setNegotiationId(null);
    setConversation([]);
    setFeedback(null);
    setShowResults(false);
  };
  
  // Step 1: Choose scenario type
  const renderScenarioSelection = () => (
    <Box sx={{ my: 4 }}>
      <Typography variant="h6" gutterBottom>
        Choose Negotiation Scenario
      </Typography>
      
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Card 
            onClick={() => handleScenarioSelect('salary_negotiation')}
            sx={{ 
              cursor: 'pointer',
              height: '100%',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 6
              },
              bgcolor: scenarioType === 'salary_negotiation' ? theme.palette.primary.light : null,
              color: scenarioType === 'salary_negotiation' ? theme.palette.primary.contrastText : null
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AttachMoney fontSize="large" sx={{ mr: 2 }} />
                <Typography variant="h5">
                  Salary Negotiation
                </Typography>
              </Box>
              <Typography variant="body1">
                Practice negotiating your salary for a new job or requesting a raise in your current position.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card 
            onClick={() => handleScenarioSelect('promotion_discussion')}
            sx={{ 
              cursor: 'pointer',
              height: '100%',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 6
              },
              bgcolor: scenarioType === 'promotion_discussion' ? theme.palette.primary.light : null,
              color: scenarioType === 'promotion_discussion' ? theme.palette.primary.contrastText : null
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ArrowUpward fontSize="large" sx={{ mr: 2 }} />
                <Typography variant="h5">
                  Promotion Discussion
                </Typography>
              </Box>
              <Typography variant="body1">
                Practice discussing your career advancement and making a case for a promotion with your manager.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
        <Button
          variant="contained"
          color="primary"
          disabled={!scenarioType}
          onClick={() => setActiveStep(1)}
        >
          Next
        </Button>
      </Box>
    </Box>
  );
  
  // Step 2: Enter scenario details
  const renderScenarioDetails = () => (
    <Box sx={{ my: 4 }}>
      <Typography variant="h6" gutterBottom>
        Enter Scenario Details
      </Typography>
      
      <Paper sx={{ p: 3, mt: 2 }}>
        <form onSubmit={handleDetailsSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <FormLabel>Industry</FormLabel>
                <RadioGroup
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  row
                >
                  <FormControlLabel value="software_development" control={<Radio />} label="Software" />
                  <FormControlLabel value="design" control={<Radio />} label="Design" />
                  <FormControlLabel value="marketing" control={<Radio />} label="Marketing" />
                  <FormControlLabel value="product_management" control={<Radio />} label="Product" />
                </RadioGroup>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <FormLabel>Role Level</FormLabel>
                <RadioGroup
                  value={roleLevel}
                  onChange={(e) => setRoleLevel(e.target.value)}
                  row
                >
                  <FormControlLabel value="entry" control={<Radio />} label="Entry" />
                  <FormControlLabel value="mid" control={<Radio />} label="Mid-level" />
                  <FormControlLabel value="senior" control={<Radio />} label="Senior" />
                  <FormControlLabel value="lead" control={<Radio />} label="Lead/Manager" />
                </RadioGroup>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }}>
                <Chip label={scenarioType === 'salary_negotiation' ? 'Salary Information' : 'Position Information'} />
              </Divider>
            </Grid>
            
            {scenarioType === 'salary_negotiation' && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Current Salary"
                    value={currentSalary}
                    onChange={(e) => setCurrentSalary(e.target.value)}
                    type="number"
                    inputProps={{ min: 0 }}
                    placeholder="e.g. 75000"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Target Salary"
                    value={targetSalary}
                    onChange={(e) => setTargetSalary(e.target.value)}
                    type="number"
                    inputProps={{ min: 0 }}
                    placeholder="e.g. 85000"
                    required
                  />
                </Grid>
              </>
            )}
            
            {scenarioType === 'promotion_discussion' && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Current Position/Title"
                    value={currentTitle}
                    onChange={(e) => setCurrentTitle(e.target.value)}
                    placeholder="e.g. Software Engineer"
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Target Position/Title"
                    value={targetTitle}
                    onChange={(e) => setTargetTitle(e.target.value)}
                    placeholder="e.g. Senior Software Engineer"
                    required
                  />
                </Grid>
              </>
            )}
          </Grid>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              variant="outlined"
              onClick={() => setActiveStep(0)}
            >
              Back
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading || !industry || !roleLevel || (
                scenarioType === 'salary_negotiation' ? !targetSalary : !currentTitle || !targetTitle
              )}
            >
              {loading ? <CircularProgress size={24} /> : 'Start Simulation'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
  
  // Step 3: Conversation simulator
  const renderConversationSimulator = () => (
    <Box sx={{ my: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Typography variant="h6" gutterBottom>
            {scenarioType === 'salary_negotiation' ? 'Salary Negotiation Simulator' : 'Promotion Discussion Simulator'}
          </Typography>
          
          {/* Chat messages container */}
          <Paper 
            elevation={1}
            sx={{ 
              height: 400, 
              p: 2, 
              mb: 2, 
              overflow: 'auto',
              bgcolor: theme.palette.background.default
            }}
            ref={chatContainerRef}
          >
            {conversation.map((entry, index) => (
              <Box
                key={index}
                sx={{
                  mb: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: entry.type === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <Box
                  sx={{
                    maxWidth: '75%',
                    p: 2,
                    borderRadius: 2,
                    bgcolor: entry.type === 'user' 
                      ? theme.palette.primary.main 
                      : entry.type === 'system'
                        ? theme.palette.warning.light
                        : theme.palette.grey[200],
                    color: entry.type === 'user' 
                      ? theme.palette.primary.contrastText 
                      : entry.type === 'system'
                        ? theme.palette.warning.contrastText
                        : theme.palette.text.primary,
                  }}
                >
                  <Typography variant="body1">{entry.message}</Typography>
                </Box>
              </Box>
            ))}
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <CircularProgress size={24} />
              </Box>
            )}
          </Paper>
          
          {/* Input area */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              placeholder="Type your message..."
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              disabled={loading}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              variant="outlined"
              size="medium"
            />
            <Button
              variant="contained"
              color="primary"
              endIcon={<Send />}
              onClick={handleSendMessage}
              disabled={loading || !userPrompt.trim()}
            >
              Send
            </Button>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleEndSimulation}
            >
              End Simulation & See Results
            </Button>
          </Box>
        </Grid>
        
        {/* Feedback panel */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Real-time Feedback
              </Typography>
              
              {feedback ? (
                <>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2">Performance Metrics</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <Typography variant="body2" sx={{ minWidth: 120 }}>Confidence:</Typography>
                      <Box sx={{ flex: 1, mr: 1 }}>
                        <LinearProgressWithLabel value={feedback.metrics.confidenceLevel * 10} />
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <Typography variant="body2" sx={{ minWidth: 120 }}>Preparedness:</Typography>
                      <Box sx={{ flex: 1, mr: 1 }}>
                        <LinearProgressWithLabel value={feedback.metrics.preparednessScore * 10} />
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <Typography variant="body2" sx={{ minWidth: 120 }}>Goal Achievement:</Typography>
                      <Box sx={{ flex: 1, mr: 1 }}>
                        <LinearProgressWithLabel value={feedback.metrics.achievedTargets} />
                      </Box>
                    </Box>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Check sx={{ mr: 1, color: 'success.main' }} />
                        Strengths
                      </Box>
                    </Typography>
                    <List dense disablePadding>
                      {feedback.feedback.strengths.map((strength, index) => (
                        <ListItem key={index} disableGutters>
                          <ListItemIcon sx={{ minWidth: 'auto', mr: 1 }}>
                            <Check fontSize="small" color="success" />
                          </ListItemIcon>
                          <ListItemText primary={strength} />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                  
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Warning sx={{ mr: 1, color: 'warning.main' }} />
                        Areas to Improve
                      </Box>
                    </Typography>
                    <List dense disablePadding>
                      {feedback.feedback.improvementAreas.map((area, index) => (
                        <ListItem key={index} disableGutters>
                          <ListItemIcon sx={{ minWidth: 'auto', mr: 1 }}>
                            <Warning fontSize="small" color="warning" />
                          </ListItemIcon>
                          <ListItemText primary={area} />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Start the conversation to receive feedback on your negotiation approach.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
  
  // Results dialog
  const renderResultsDialog = () => (
    <Dialog 
      open={showResults} 
      maxWidth="md" 
      fullWidth
      onClose={() => setShowResults(false)}
    >
      <DialogTitle>
        Negotiation Simulation Results
      </DialogTitle>
      <DialogContent>
        {feedback ? (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Performance Summary
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Card sx={{ flex: '1 0 30%', minWidth: 200 }}>
                    <CardContent>
                      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                        Confidence Level
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                        <Typography variant="h4" component="span">
                          {feedback.metrics.confidenceLevel}
                        </Typography>
                        <Typography variant="body2" component="span" sx={{ ml: 1 }}>
                          / 10
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                  <Card sx={{ flex: '1 0 30%', minWidth: 200 }}>
                    <CardContent>
                      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                        Preparedness
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                        <Typography variant="h4" component="span">
                          {feedback.metrics.preparednessScore}
                        </Typography>
                        <Typography variant="body2" component="span" sx={{ ml: 1 }}>
                          / 10
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                  <Card sx={{ flex: '1 0 30%', minWidth: 200 }}>
                    <CardContent>
                      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                        Goal Achievement
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                        <Typography variant="h4" component="span">
                          {feedback.metrics.achievedTargets}%
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Check sx={{ mr: 1, color: 'success.main' }} />
                    What Went Well
                  </Box>
                </Typography>
                <List>
                  {feedback.feedback.strengths.map((strength, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <Check color="success" />
                      </ListItemIcon>
                      <ListItemText primary={strength} />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Warning sx={{ mr: 1, color: 'warning.main' }} />
                    Areas for Improvement
                  </Box>
                </Typography>
                <List>
                  {feedback.feedback.improvementAreas.map((area, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <Warning color="warning" />
                      </ListItemIcon>
                      <ListItemText primary={area} />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
            
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Lightbulb sx={{ mr: 1, color: 'info.main' }} />
                    Strategies for Future Negotiations
                  </Box>
                </Typography>
                <List>
                  {feedback.feedback.strategySuggestions.map((strategy, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <Lightbulb color="info" />
                      </ListItemIcon>
                      <ListItemText primary={strategy} />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
          </Grid>
        ) : (
          <Alert severity="info">
            No feedback available. Please complete a simulation first.
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowResults(false)}>
          Continue Practice
        </Button>
        <Button onClick={handleNewSimulation} variant="contained" color="primary">
          Start New Simulation
        </Button>
      </DialogActions>
    </Dialog>
  );
  
  // Stepper for navigation
  const steps = ['Choose Scenario', 'Enter Details', 'Practice Negotiation'];
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Negotiation Simulator
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Practice and improve your salary negotiation and promotion discussion skills
        </Typography>
      </Box>
      
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      
      {activeStep === 0 && renderScenarioSelection()}
      {activeStep === 1 && renderScenarioDetails()}
      {activeStep === 2 && renderConversationSimulator()}
      
      {renderResultsDialog()}
    </Container>
  );
};

// Helper component for linear progress with label
const LinearProgressWithLabel = ({ value }) => {
  const theme = useTheme();
  
  const getColor = (val) => {
    if (val >= 80) return 'success';
    if (val >= 60) return 'primary';
    if (val >= 40) return 'warning';
    return 'error';
  };
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
      <Box sx={{ width: '100%', mr: 1 }}>
        <Box 
          sx={{ 
            height: 8, 
            borderRadius: 4,
            bgcolor: theme.palette.grey[200],
            position: 'relative'
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              top: 0,
              height: '100%',
              width: `${Math.min(100, Math.max(0, value))}%`,
              bgcolor: theme.palette[getColor(value)].main,
              borderRadius: 4,
              transition: 'width 0.4s ease'
            }}
          />
        </Box>
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" color="text.secondary">{`${Math.round(value)}%`}</Typography>
      </Box>
    </Box>
  );
};

export default NegotiationSimulator;