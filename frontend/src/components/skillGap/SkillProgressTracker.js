import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Slider,
  Button,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Chip,
  Paper,
  Divider,
  useTheme
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Remove,
  Lock,
  LockOpen,
  Check,
  ArrowUpward,
  Info
} from '@mui/icons-material';

const SkillProgressTracker = ({ skillGap, onSkillUpdate }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [activeSkillId, setActiveSkillId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  
  // Sort skills into categories
  const topSkills = skillGap.skills
    .filter(skill => skill.gapScore <= 2)
    .sort((a, b) => a.gapScore - b.gapScore);
  
  const developmentNeeded = skillGap.skills
    .filter(skill => skill.gapScore > 2)
    .sort((a, b) => b.gapScore - a.gapScore);

  const handleSkillUpdate = async (skillId, newLevel) => {
    setLoading(true);
    setActiveSkillId(skillId);
    setSuccessMessage('');
    setError('');
    
    try {
      const result = await onSkillUpdate(skillId, newLevel);
      
      if (result.success) {
        setSuccessMessage(`Skill level updated successfully!`);
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error updating skill level:', err);
      setError('Failed to update skill level. Please try again.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
      setActiveSkillId(null);
    }
  };

  const getSkillLevelText = (level) => {
    switch (level) {
      case 1: return 'Beginner';
      case 2: return 'Basic';
      case 3: return 'Intermediate';
      case 4: return 'Advanced';
      case 5: return 'Expert';
      default: return 'Not Rated';
    }
  };
  
  const getSkillGapText = (gapScore) => {
    if (gapScore <= 0) return 'Exceeds Requirements';
    if (gapScore <= 1) return 'Meets Requirements';
    if (gapScore <= 2) return 'Minor Gap';
    if (gapScore <= 3) return 'Moderate Gap';
    return 'Significant Gap';
  };
  
  const getSkillGapColor = (gapScore) => {
    if (gapScore <= 0) return 'success';
    if (gapScore <= 1) return 'primary';
    if (gapScore <= 2) return 'info';
    if (gapScore <= 3) return 'warning';
    return 'error';
  };
  
  const renderSkillCard = (skill) => {
    const { _id, name, currentLevel, targetLevel, gapScore, importance } = skill;
    const isUpdating = activeSkillId === _id && loading;
    
    return (
      <Card 
        key={_id} 
        sx={{ 
          mb: 2,
          transition: 'transform 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 3
          }
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ flex: 1 }}>
              {name}
            </Typography>
            <Chip 
              label={getSkillGapText(gapScore)} 
              color={getSkillGapColor(gapScore)}
              size="small"
              icon={gapScore <= 1 ? <Check /> : <ArrowUpward />}
            />
          </Box>
          
          <Grid container spacing={1} alignItems="center">
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Current Level: 
                  <Typography 
                    component="span" 
                    variant="body2" 
                    fontWeight="bold"
                    sx={{ ml: 1 }}
                  >
                    {getSkillLevelText(currentLevel)}
                  </Typography>
                </Typography>
                
                <Box sx={{ px: 1, my: 2 }}>
                  <Slider
                    value={currentLevel}
                    min={1}
                    max={5}
                    step={1}
                    marks
                    disabled={isUpdating}
                    onChange={(e, newValue) => {
                      if (newValue !== currentLevel) {
                        handleSkillUpdate(_id, newValue);
                      }
                    }}
                    sx={{
                      '& .MuiSlider-mark': {
                        height: 8,
                        width: 8,
                        borderRadius: '50%'
                      }
                    }}
                  />
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Box sx={{ pl: { xs: 0, sm: 2 } }}>
                <Typography variant="body2" color="text.secondary">
                  Target Level: 
                  <Typography 
                    component="span" 
                    variant="body2" 
                    fontWeight="bold"
                    sx={{ ml: 1 }}
                  >
                    {getSkillLevelText(targetLevel)}
                  </Typography>
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <Box sx={{ 
                    flex: 1,
                    height: 8,
                    position: 'relative',
                    mt: 2,
                    mb: 2,
                    borderRadius: 4,
                    bgcolor: theme.palette.grey[200]
                  }}>
                    <Box sx={{ 
                      position: 'absolute',
                      height: '100%',
                      left: `${((currentLevel - 1) / 4) * 100}%`,
                      width: `${((targetLevel - currentLevel) / 4) * 100}%`,
                      bgcolor: getSkillGapColor(gapScore),
                      borderRadius: 4
                    }} />
                    
                    {/* Current level marker */}
                    <Box sx={{ 
                      position: 'absolute',
                      left: `${((currentLevel - 1) / 4) * 100}%`,
                      top: -4,
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      bgcolor: theme.palette.background.paper,
                      border: 2,
                      borderColor: 'primary.main',
                      transform: 'translateX(-50%)'
                    }} />
                    
                    {/* Target level marker */}
                    <Box sx={{ 
                      position: 'absolute',
                      left: `${((targetLevel - 1) / 4) * 100}%`,
                      top: -4,
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      bgcolor: theme.palette.background.paper,
                      border: 2,
                      borderColor: getSkillGapColor(gapScore),
                      transform: 'translateX(-50%)'
                    }} />
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    Importance: {importance === 'high' ? 'High' : importance === 'medium' ? 'Medium' : 'Nice to have'}
                  </Typography>
                  
                  {isUpdating && <CircularProgress size={16} />}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box>
      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TrendingUp color="success" sx={{ mr: 1 }} />
              <Typography variant="h6">
                Your Strongest Skills
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" paragraph>
              These skills already meet or are close to the requirements for your target role.
            </Typography>
            
            {topSkills.length === 0 ? (
              <Alert severity="info">No skills in this category yet.</Alert>
            ) : (
              topSkills.map(renderSkillCard)
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TrendingDown color="error" sx={{ mr: 1 }} />
              <Typography variant="h6">
                Development Needed
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" paragraph>
              Focus on improving these skills to close the gap for your target role.
            </Typography>
            
            {developmentNeeded.length === 0 ? (
              <Alert severity="success">All your skills meet the requirements!</Alert>
            ) : (
              developmentNeeded.map(renderSkillCard)
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Overall Skill Gap Analysis
            </Typography>
            <Typography variant="body2" paragraph>
              Your current skill profile is {skillGap.overallGapScore <= 2 
                ? <strong>well-aligned</strong> 
                : skillGap.overallGapScore <= 3
                  ? <strong>partially aligned</strong>
                  : <strong>significantly misaligned</strong>} with your target role.
              {skillGap.overallGapScore > 2 && 
                " Focus on the skills in the 'Development Needed' section to increase your readiness."}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ flex: 1, mr: 2 }}>
                <Box sx={{ 
                  height: 10,
                  borderRadius: 5,
                  bgcolor: theme.palette.grey[200],
                  position: 'relative'
                }}>
                  <Box sx={{ 
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    height: '100%',
                    width: `${(1 - (skillGap.overallGapScore / 5)) * 100}%`,
                    bgcolor: 
                      skillGap.overallGapScore <= 1 ? theme.palette.success.main :
                      skillGap.overallGapScore <= 2 ? theme.palette.primary.main :
                      skillGap.overallGapScore <= 3 ? theme.palette.warning.main :
                      theme.palette.error.main,
                    borderRadius: 5
                  }} />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                  <Typography variant="caption">Job Ready</Typography>
                  <Typography variant="caption">Development Needed</Typography>
                </Box>
              </Box>
              
              <Tooltip title="Overall gap score based on the weighted average of all skills">
                <Chip 
                  label={`Score: ${skillGap.overallGapScore.toFixed(1)}`}
                  color={
                    skillGap.overallGapScore <= 1 ? 'success' :
                    skillGap.overallGapScore <= 2 ? 'primary' :
                    skillGap.overallGapScore <= 3 ? 'warning' :
                    'error'
                  }
                  icon={<Info />}
                />
              </Tooltip>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SkillProgressTracker; 