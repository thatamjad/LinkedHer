const express = require('express');
const router = express.Router();

// Import routes
const authRoutes = require('./auth');
const verificationRoutes = require('./verification');
const jobsRoutes = require('./jobs');
const postsRoutes = require('./posts');
const reportsRoutes = require('./reports');
const mentorshipRoutes = require('./mentorship.routes');
const supportGroupRoutes = require('./supportGroup.routes');
const industryGroupRoutes = require('./industryGroup.routes');
const twoFactorAuthRoutes = require('./twoFactorAuth.routes');

// Use routes
router.use('/auth', authRoutes);
router.use('/verification', verificationRoutes);
router.use('/jobs', jobsRoutes);
router.use('/posts', postsRoutes);
router.use('/reports', reportsRoutes);
router.use('/mentorship', mentorshipRoutes);
router.use('/support-groups', supportGroupRoutes);
router.use('/industry-groups', industryGroupRoutes);
router.use('/two-factor-auth', twoFactorAuthRoutes);
router.use('/auth/2fa', twoFactorAuthRoutes);

module.exports = router; 