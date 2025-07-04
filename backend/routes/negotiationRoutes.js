const express = require('express');
const router = express.Router();
const negotiationController = require('../controllers/negotiationController');
const { authenticateUser } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticateUser);

// POST /api/negotiation - Create a new negotiation scenario
router.post('/', negotiationController.createNegotiationScenario);

// GET /api/negotiation - Get all user's negotiation scenarios
router.get('/', negotiationController.getUserNegotiations);

// GET /api/negotiation/:negotiationId - Get specific negotiation scenario
router.get('/:negotiationId', negotiationController.getNegotiationById);

// PATCH /api/negotiation/:negotiationId - Update negotiation scenario
router.patch('/:negotiationId', negotiationController.updateNegotiation);

// POST /api/negotiation/:negotiationId/simulate - Run a negotiation simulation
router.post('/:negotiationId/simulate', negotiationController.runSimulation);

// GET /api/negotiation/stats - Get negotiation statistics
router.get('/stats', negotiationController.getNegotiationStats);

module.exports = router; 