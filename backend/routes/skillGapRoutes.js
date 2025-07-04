const express = require('express');
const router = express.Router();
const skillGapController = require('../controllers/skillGapController');
const { authenticateUser } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticateUser);

// POST /api/skill-gap - Create or update skill gap analysis
router.post('/', skillGapController.createOrUpdateSkillGap);

// GET /api/skill-gap - Get user's skill gap analysis
router.get('/', skillGapController.getUserSkillGap);

// PATCH /api/skill-gap/progress - Update skill progress
router.patch('/progress', skillGapController.updateSkillProgress);

// GET /api/skill-gap/recommendations - Get learning recommendations
router.get('/recommendations', skillGapController.getLearningRecommendations);

// GET /api/skill-gap/stats - Get skill gap statistics
router.get('/stats', skillGapController.getSkillGapStats);

module.exports = router; 