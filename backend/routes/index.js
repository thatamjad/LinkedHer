const express = require('express');
const router = express.Router();
const userRoutes = require('./user.routes');
const postRoutes = require('./post.routes');
const reportRoutes = require('./reportRoutes');
const mentorshipRoutes = require('./mentorshipRoutes');
const skillGapRoutes = require('./skillGapRoutes');
const negotiationRoutes = require('./negotiationRoutes');
const industryGroupRoutes = require('./industryGroupRoutes');
const profileRoutes = require('./profile.routes');
const verificationRoutes = require('./verification.routes');
const commentRoutes = require('./comment.routes');
const notificationRoutes = require('./notification.routes');
const anonymousRoutes = require('./anonymous.routes');
const jobRoutes = require('./jobRoutes');
const securityRoutes = require('./securityRoutes');
const authRoutes = require('./auth.routes');
const supportGroupRoutes = require('./supportGroup.routes');
const mentalHealthRoutes = require('./mentalHealth.routes');
const collaborativeProjectsRoutes = require('./collaborativeProjects.routes');
const achievementsRoutes = require('./achievements.routes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/posts', postRoutes);
router.use('/reports', reportRoutes);
router.use('/profiles', profileRoutes);
router.use('/verification', verificationRoutes);
router.use('/comments', commentRoutes);
router.use('/notifications', notificationRoutes);
router.use('/anonymous', anonymousRoutes);
router.use('/jobs', jobRoutes);
router.use('/security', securityRoutes);

// New women-specific professional features routes
router.use('/mentorship', mentorshipRoutes);
router.use('/skill-gap', skillGapRoutes);
router.use('/negotiation', negotiationRoutes);
router.use('/industry-groups', industryGroupRoutes);

// Community and support system routes
router.use('/support-groups', supportGroupRoutes);
router.use('/mental-health', mentalHealthRoutes);
router.use('/collaborative-projects', collaborativeProjectsRoutes);
router.use('/achievements', achievementsRoutes);

module.exports = router; 