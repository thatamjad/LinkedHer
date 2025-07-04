const express = require('express');
const router = express.Router();
const abTestController = require('../controllers/abTestController');
const { authenticateUser, isAdmin } = require('../middleware/auth.middleware');
const { isVerified } = require('../middleware/verification');

// A/B test routes
router.post('/', authenticateUser, isAdmin, abTestController.createABTest);
router.get('/', authenticateUser, abTestController.getAllABTests);
router.get('/:id', authenticateUser, abTestController.getABTestById);
router.put('/:id', authenticateUser, isAdmin, abTestController.updateABTest);
router.post('/:id/start', authenticateUser, isAdmin, abTestController.startABTest);
router.post('/:id/pause', authenticateUser, isAdmin, abTestController.pauseABTest);
router.post('/:id/complete', authenticateUser, isAdmin, abTestController.completeABTest);
router.post('/:id/analyze', authenticateUser, isAdmin, abTestController.analyzeABTestResults);
router.post('/track-event', authenticateUser, abTestController.trackEvent);

module.exports = router; 