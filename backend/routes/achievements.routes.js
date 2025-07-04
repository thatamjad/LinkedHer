const express = require('express');
const router = express.Router();
const achievementsController = require('../controllers/achievements.controller');
const { authenticateUser } = require('../middleware/auth.middleware');

// Apply authentication middleware to all routes
router.use(authenticateUser);

// Basic Achievement routes (only implemented functions)
router.post('/', achievementsController.createAchievement);

// Add a simple route to get user's achievements
router.get('/my', async (req, res) => {
  try {
    const Achievement = require('../models/achievement.model');
    const achievements = await Achievement.find({ user: req.user.id }).sort({ achievedAt: -1 });
    res.json({ data: achievements });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;