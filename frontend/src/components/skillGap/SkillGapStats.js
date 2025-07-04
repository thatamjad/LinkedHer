import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress,
  useTheme
} from '@mui/material';
import {
  TrendingUp,
  CheckCircle,
  EmojiEvents,
  Timeline,
  School,
  Equalizer,
  DonutLarge
} from '@mui/icons-material';

const SkillGapStats = ({ stats }) => {
  const theme = useTheme();

  // Component to display stat card
  const StatCard = ({ title, value, subtitle, icon, color }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: '50%',
              bgcolor: `${color}.light`,
              color: `${color}.main`,
              mr: 2
            }}
          >
            {icon}
          </Box>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" component="div" gutterBottom>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  // Component to show skill improvement progress
  const SkillProgressCard = () => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Skill Improvements
        </Typography>
        
        {stats.skillImprovements.map((skill) => (
          <Box key={skill.name} sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2">{skill.name}</Typography>
              <Typography variant="body2">+{skill.improvement} levels</Typography>
            </Box>
            <Box sx={{ position: 'relative' }}>
              <LinearProgress
                variant="determinate"
                value={(skill.currentLevel / 5) * 100}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: theme.palette.grey[200],
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    bgcolor: 
                      skill.currentLevel >= 4 ? theme.palette.success.main :
                      skill.currentLevel >= 3 ? theme.palette.primary.main :
                      theme.palette.warning.main
                  }
                }}
              />
              
              {/* Previous level marker */}
              <Box sx={{ 
                position: 'absolute',
                left: `${((skill.currentLevel - skill.improvement) / 5) * 100}%`,
                top: 0,
                height: 8,
                width: 2,
                bgcolor: theme.palette.divider,
                transform: 'translateX(-1px)'
              }} />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                {skill.initialDate && new Date(skill.initialDate).toLocaleDateString(undefined, {
                  month: 'short',
                  year: 'numeric'
                })}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {skill.lastUpdated && new Date(skill.lastUpdated).toLocaleDateString(undefined, {
                  month: 'short',
                  year: 'numeric'
                })}
              </Typography>
            </Box>
          </Box>
        ))}
      </CardContent>
    </Card>
  );

  // Component to show recent achievements
  const AchievementsCard = () => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Recent Achievements
        </Typography>
        
        <List>
          {stats.achievements.map((achievement, index) => (
            <React.Fragment key={index}>
              {index > 0 && <Divider component="li" />}
              <ListItem>
                <ListItemIcon>
                  <EmojiEvents color={achievement.important ? 'warning' : 'action'} />
                </ListItemIcon>
                <ListItemText
                  primary={achievement.title}
                  secondary={
                    <Typography variant="caption" color="text.secondary">
                      {new Date(achievement.date).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </Typography>
                  }
                />
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      </CardContent>
    </Card>
  );

  // Component to show learning activity
  const LearningActivityCard = () => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Learning Activity
        </Typography>
        
        <List>
          {stats.learningActivity.map((activity, index) => (
            <React.Fragment key={index}>
              {index > 0 && <Divider component="li" />}
              <ListItem>
                <ListItemIcon>
                  <School color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary={activity.resourceTitle}
                  secondary={
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {activity.type} • {activity.completionStatus}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(activity.date).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Skills Improved"
            value={stats.totalSkillsImproved}
            subtitle="Skills with level increases"
            icon={<TrendingUp />}
            color="success"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Gap Reduction"
            value={`${stats.overallGapReduction}%`}
            subtitle="Overall gap score decrease"
            icon={<Timeline />}
            color="primary"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Resources Completed"
            value={stats.resourcesCompleted}
            subtitle="Learning resources finished"
            icon={<CheckCircle />}
            color="info"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Learning Hours"
            value={stats.learningHours}
            subtitle="Time spent on learning"
            icon={<School />}
            color="secondary"
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <SkillProgressCard />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Grid container spacing={3} height="100%">
            <Grid item xs={12}>
              <AchievementsCard />
            </Grid>
            <Grid item xs={12}>
              <LearningActivityCard />
            </Grid>
          </Grid>
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Career Readiness Progress
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Your progress toward {stats.targetRole} readiness has increased by{' '}
              <strong>{stats.careerReadinessIncrease}%</strong> since you started.
              {stats.estimatedTimeToReadiness && (
                ` At this rate, you'll reach your target level in approximately ${stats.estimatedTimeToReadiness}.`
              )}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
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
                    width: `${stats.careerReadinessPercentage}%`,
                    bgcolor: 
                      stats.careerReadinessPercentage >= 80 ? theme.palette.success.main :
                      stats.careerReadinessPercentage >= 50 ? theme.palette.primary.main :
                      theme.palette.warning.main,
                    borderRadius: 5
                  }} />
                  
                  {/* Initial marker */}
                  <Box sx={{ 
                    position: 'absolute',
                    left: `${stats.initialReadinessPercentage}%`,
                    top: -4,
                    height: 16,
                    width: 2,
                    bgcolor: theme.palette.divider
                  }} />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                  <Typography variant="caption">0%</Typography>
                  <Typography variant="caption">50%</Typography>
                  <Typography variant="caption">100%</Typography>
                </Box>
              </Box>
              
              <Typography variant="h6" color="primary.main">
                {stats.careerReadinessPercentage}%
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 3 }}>
              <DonutLarge color="primary" sx={{ mr: 1 }} />
              <Typography variant="body2" color="primary.main">
                {stats.careerReadinessPercentage >= 80
                  ? 'You are well-prepared for your target role!'
                  : stats.careerReadinessPercentage >= 50
                    ? 'You are making good progress toward your target role.'
                    : 'Continue focusing on your skill development to reach your target role.'}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SkillGapStats; 