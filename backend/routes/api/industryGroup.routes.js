const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const industryGroupController = require('../../controllers/industryGroup.controller');

// @route   POST api/industry-groups
// @desc    Create a new industry group
// @access  Private
router.post('/', auth, industryGroupController.createIndustryGroup);

// @route   GET api/industry-groups
// @desc    Get all industry groups with filtering
// @access  Public (with enhanced access for authenticated users)
router.get('/', industryGroupController.getIndustryGroups);

// @route   GET api/industry-groups/:id
// @desc    Get a single industry group by ID
// @access  Public (with restricted access for private groups)
router.get('/:id', industryGroupController.getIndustryGroupById);

// @route   PUT api/industry-groups/:id
// @desc    Update an industry group
// @access  Private (admin/moderator only)
router.put('/:id', auth, industryGroupController.updateIndustryGroup);

// @route   POST api/industry-groups/:id/join
// @desc    Join an industry group
// @access  Private
router.post('/:id/join', auth, industryGroupController.joinIndustryGroup);

// @route   POST api/industry-groups/:id/leave
// @desc    Leave an industry group
// @access  Private
router.post('/:id/leave', auth, industryGroupController.leaveIndustryGroup);

// @route   PUT api/industry-groups/:id/member-role
// @desc    Change member role in industry group
// @access  Private (admin only)
router.put('/:id/member-role', auth, industryGroupController.changeMemberRole);

// @route   POST api/industry-groups/:id/resources
// @desc    Add a resource to industry group
// @access  Private
router.post('/:id/resources', auth, industryGroupController.addResource);

// @route   POST api/industry-groups/:id/resources/:resourceId/upvote
// @desc    Upvote a resource
// @access  Private
router.post('/:id/resources/:resourceId/upvote', auth, industryGroupController.upvoteResource);

// @route   POST api/industry-groups/:id/events
// @desc    Create an event in industry group
// @access  Private (admin/moderator only)
router.post('/:id/events', auth, industryGroupController.createEvent);

// @route   POST api/industry-groups/:id/events/:eventId/respond
// @desc    Respond to an event
// @access  Private
router.post('/:id/events/:eventId/respond', auth, industryGroupController.respondToEvent);

// @route   GET api/industry-groups/user/groups
// @desc    Get all industry groups for a user
// @access  Private
router.get('/user/groups', auth, industryGroupController.getUserGroups);

// @route   GET api/industry-groups/stats
// @desc    Get industry group statistics
// @access  Public (with enhanced data for authenticated users)
router.get('/stats', industryGroupController.getIndustryGroupStats);

module.exports = router; 