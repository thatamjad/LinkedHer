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
  AccessTime,
  People,
  Star,
  Chat,
  EmojiEvents,
  School
} from '@mui/icons-material';

const MentorshipStats = ({ stats }) => {
  const theme = useTheme();

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

  const SkillProgressCard = () => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Skills Development
        </Typography>
        
        {stats.skillsProgress.map((skill) => (
          <Box key={skill.name} sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2">{skill.name}</Typography>
              <Typography variant="body2">{skill.progress}%</Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={skill.progress}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: theme.palette.grey[200],
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  bgcolor: skill.progress >= 80
                    ? theme.palette.success.main
                    : skill.progress >= 50
                      ? theme.palette.primary.main
                      : theme.palette.warning.main
                }
              }}
            />
          </Box>
        ))}
      </CardContent>
    </Card>
  );

  const TopMentorsCard = () => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Top Mentors
        </Typography>
        
        <List>
          {stats.topMentors.map((mentor, index) => (
            <React.Fragment key={mentor.mentorId}>
              {index > 0 && <Divider component="li" />}
              <ListItem>
                <ListItemIcon>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      bgcolor: theme.palette.primary.main,
                      color: theme.palette.primary.contrastText,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                    }}
                  >
                    {index + 1}
                  </Box>
                </ListItemIcon>
                <ListItemText
                  primary={mentor.name}
                  secondary={`${mentor.industry} • ${mentor.rating.toFixed(1)}★`}
                />
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      </CardContent>
    </Card>
  );

  const RecentAchievementsCard = () => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Recent Achievements
        </Typography>
        
        <List>
          {stats.recentAchievements.map((achievement, index) => (
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

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Mentorships"
            value={stats.totalMentorships}
            subtitle={`${stats.activeMentorships} currently active`}
            icon={<People />}
            color="primary"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Hours"
            value={stats.totalHours}
            subtitle="Spent in mentorship sessions"
            icon={<AccessTime />}
            color="secondary"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Average Rating"
            value={stats.averageRating.toFixed(1)}
            subtitle={`From ${stats.completedMentorships} completed mentorships`}
            icon={<Star />}
            color="warning"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Skills Improved"
            value={stats.skillsImproved}
            subtitle="Across all mentorships"
            icon={<School />}
            color="success"
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <SkillProgressCard />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Grid container spacing={3} height="100%">
            <Grid item xs={12}>
              <TopMentorsCard />
            </Grid>
            <Grid item xs={12}>
              <RecentAchievementsCard />
            </Grid>
          </Grid>
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Mentorship Growth
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Your mentorship activity has grown by <strong>{stats.growthRate}%</strong> compared to the previous period.
              You've participated in more sessions and improved your skills consistently.
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
              <TrendingUp color="success" sx={{ mr: 1 }} />
              <Typography variant="body2" color="success.main">
                Keep up the good work! Regular mentorship sessions are significantly contributing to your professional growth.
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MentorshipStats; 