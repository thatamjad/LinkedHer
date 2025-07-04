const express = require('express');
const router = express.Router();
const industryGroupController = require('../controllers/industryGroupController');
const { authenticateUser } = require('../middleware/auth.middleware');

// All routes require a valid JWT-authenticated user
router.use(authenticateUser);

// POST /api/industry-groups - Create a new industry group
router.post('/', industryGroupController.createGroup);

// GET /api/industry-groups - Get all industry groups (with filtering)
router.get('/', industryGroupController.getGroups);

// GET /api/industry-groups/:groupId - Get a specific industry group
router.get('/:groupId', industryGroupController.getGroupById);

// POST /api/industry-groups/:groupId/join - Join an industry group
router.post('/:groupId/join', industryGroupController.joinGroup);

// POST /api/industry-groups/:groupId/leave - Leave an industry group
router.post('/:groupId/leave', industryGroupController.leaveGroup);

// PATCH /api/industry-groups/:groupId - Update an industry group
router.patch('/:groupId', industryGroupController.updateGroup);

// PATCH /api/industry-groups/:groupId/member-role - Change a member's role
router.patch('/:groupId/member-role', industryGroupController.changeMemberRole);

// DELETE /api/industry-groups/:groupId/member - Remove a member
router.delete('/:groupId/member', industryGroupController.removeMember);

// POST /api/industry-groups/:groupId/resources - Add a resource
router.post('/:groupId/resources', industryGroupController.addResource);

// DELETE /api/industry-groups/:groupId/resources/:resourceId - Remove a resource
router.delete('/:groupId/resources/:resourceId', industryGroupController.removeResource);

// POST /api/industry-groups/:groupId/events - Add an event
router.post('/:groupId/events', industryGroupController.addEvent);

// PATCH /api/industry-groups/:groupId/events/:eventId/attendance - Update event attendance
router.patch('/:groupId/events/:eventId/attendance', industryGroupController.updateEventAttendance);

// GET /api/industry-groups/:groupId/stats - Get group statistics
router.get('/:groupId/stats', industryGroupController.getGroupStats);

module.exports = router; 