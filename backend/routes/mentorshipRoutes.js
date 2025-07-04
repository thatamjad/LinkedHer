const express = require('express');
const router = express.Router();
const mentorshipController = require('../controllers/mentorshipController');
const { authenticateUser } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticateUser);

// GET /api/mentorship/potential-mentors - Find potential mentors
router.get('/potential-mentors', mentorshipController.findPotentialMentors);

// POST /api/mentorship/request - Request mentorship
router.post('/request', mentorshipController.requestMentorship);

// POST /api/mentorship/respond - Respond to mentorship request
router.post('/respond', mentorshipController.respondToMentorshipRequest);

// GET /api/mentorship - Get all mentorships (with filters)
router.get('/', mentorshipController.getMentorships);

// PATCH /api/mentorship/:mentorshipId - Update a mentorship
router.patch('/:mentorshipId', mentorshipController.updateMentorship);

// POST /api/mentorship/:mentorshipId/complete - Complete a mentorship
router.post('/:mentorshipId/complete', mentorshipController.completeMentorship);

// GET /api/mentorship/stats - Get mentorship statistics
router.get('/stats', mentorshipController.getMentorshipStats);

module.exports = router; 