const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const supportGroupController = require('../../controllers/supportGroup.controller');

// @route   POST api/support-groups
// @desc    Create a new support group
// @access  Private
router.post('/', auth, supportGroupController.createSupportGroup);

// @route   GET api/support-groups
// @desc    Get all support groups with filtering
// @access  Public (with enhanced access for authenticated users)
router.get('/', supportGroupController.getSupportGroups);

// @route   GET api/support-groups/:id
// @desc    Get a single support group by ID
// @access  Public (with restricted access for private groups)
router.get('/:id', supportGroupController.getSupportGroupById);

// @route   PUT api/support-groups/:id
// @desc    Update a support group
// @access  Private (moderators only)
router.put('/:id', auth, supportGroupController.updateSupportGroup);

// @route   POST api/support-groups/:id/join
// @desc    Join a support group
// @access  Private
router.post('/:id/join', auth, supportGroupController.joinSupportGroup);

// @route   POST api/support-groups/:id/leave
// @desc    Leave a support group
// @access  Private
router.post('/:id/leave', auth, supportGroupController.leaveSupportGroup);

// @route   POST api/support-groups/:id/request
// @desc    Handle join request
// @access  Private (moderators only)
router.post('/:id/request', auth, supportGroupController.handleJoinRequest);

// @route   POST api/support-groups/:id/discussions
// @desc    Create a new discussion in a support group
// @access  Private
router.post('/:id/discussions', auth, supportGroupController.createDiscussion);

// @route   GET api/support-groups/:id/discussions
// @desc    Get all discussions for a support group
// @access  Public (with restricted access for private groups)
router.get('/:id/discussions', supportGroupController.getDiscussions);

// @route   GET api/support-groups/discussions/:discussionId
// @desc    Get a single discussion with replies
// @access  Public (with restricted access for private groups)
router.get('/discussions/:discussionId', supportGroupController.getDiscussionById);

// @route   POST api/support-groups/discussions/:discussionId/reply
// @desc    Add a reply to a discussion
// @access  Private
router.post('/discussions/:discussionId/reply', auth, supportGroupController.addReply);

// @route   POST api/support-groups/discussions/:discussionId/reaction
// @desc    Add a reaction to a discussion or reply
// @access  Private
router.post('/discussions/:discussionId/reaction', auth, supportGroupController.addReaction);

// @route   GET api/support-groups/user/groups
// @desc    Get all support groups for a user
// @access  Private
router.get('/user/groups', auth, supportGroupController.getUserGroups);

// @route   POST api/support-groups/:id/moderators
// @desc    Add or remove moderator
// @access  Private (moderators only)
router.post('/:id/moderators', auth, supportGroupController.manageGroupModerators);

// @route   GET api/support-groups/stats
// @desc    Get support group statistics
// @access  Public (with enhanced data for authenticated users)
router.get('/stats', supportGroupController.getSupportGroupStats);

module.exports = router; 