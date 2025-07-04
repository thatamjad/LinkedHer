const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const mentorshipController = require('../../controllers/mentorship.controller');

// @route   POST api/mentorship/mentor-profile
// @desc    Create a mentor profile
// @access  Private
router.post('/mentor-profile', auth, mentorshipController.createMentorProfile);

// @route   GET api/mentorship/mentor-profile/:userId
// @desc    Get mentor profile by user ID
// @access  Public
router.get('/mentor-profile/:userId', mentorshipController.getMentorProfile);

// @route   PUT api/mentorship/mentor-profile
// @desc    Update mentor profile
// @access  Private
router.put('/mentor-profile', auth, mentorshipController.updateMentorProfile);

// @route   GET api/mentorship/mentors
// @desc    Get all active mentors with filtering
// @access  Public
router.get('/mentors', mentorshipController.getActiveMentors);

// @route   POST api/mentorship/request
// @desc    Request mentorship
// @access  Private
router.post('/request', auth, mentorshipController.requestMentorship);

// @route   POST api/mentorship/respond
// @desc    Respond to mentorship request
// @access  Private
router.post('/respond', auth, mentorshipController.respondToRequest);

// @route   GET api/mentorship/user-mentorships
// @desc    Get all mentorships for a user
// @access  Private
router.get('/user-mentorships', auth, mentorshipController.getUserMentorships);

// @route   POST api/mentorship/schedule-meeting
// @desc    Schedule a meeting
// @access  Private
router.post('/schedule-meeting', auth, mentorshipController.scheduleMeeting);

// @route   PUT api/mentorship/meeting-status
// @desc    Update meeting status
// @access  Private
router.put('/meeting-status', auth, mentorshipController.updateMeetingStatus);

// @route   POST api/mentorship/feedback
// @desc    Provide feedback for mentorship
// @access  Private
router.post('/feedback', auth, mentorshipController.provideFeedback);

// @route   PUT api/mentorship/complete/:mentorshipId
// @desc    Complete mentorship
// @access  Private
router.put('/complete/:mentorshipId', auth, mentorshipController.completeMentorship);

// @route   GET api/mentorship/stats
// @desc    Get mentorship statistics
// @access  Public (with enhanced data for authenticated users)
router.get('/stats', mentorshipController.getMentorshipStats);

module.exports = router; 