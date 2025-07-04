const express = require('express');
const router = express.Router();
const collaborativeProjectsController = require('../controllers/collaborativeProjects.controller');
const { authJwt } = require('../middleware');

// Apply authentication middleware to all routes
router.use(authJwt.verifyToken);

// Collaborative Project routes
router.post('/', collaborativeProjectsController.createProject);
router.get('/', collaborativeProjectsController.getProjects);
router.get('/:id', collaborativeProjectsController.getProjectById);
router.put('/:id', collaborativeProjectsController.updateProject);
router.post('/:id/apply', collaborativeProjectsController.applyToProject);
router.post('/:id/handle-application', collaborativeProjectsController.handleApplication);
router.post('/:id/resource', collaborativeProjectsController.addResource);
router.post('/:id/milestone', collaborativeProjectsController.addMilestone);
router.put('/:id/milestone', collaborativeProjectsController.updateMilestone);
router.put('/:id/member-permissions', collaborativeProjectsController.updateMemberPermissions);
router.delete('/:id/member/:memberId', collaborativeProjectsController.removeMember);
router.post('/:id/meeting', collaborativeProjectsController.addMeeting);
router.put('/:id/attendance', collaborativeProjectsController.updateAttendance);

module.exports = router; 