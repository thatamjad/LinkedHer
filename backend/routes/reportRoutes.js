const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticateToken, isAdmin } = require('../middleware/auth.middleware');
const anonymousAuth = require('../middleware/anonymousAuth.middleware');

// --- Professional Mode Reporting ---

// Create a new report in professional mode
router.post('/professional', authenticateToken, reportController.createProfessionalReport);

// --- Anonymous Mode Reporting ---

// Create a new report in anonymous mode
router.post(
  '/anonymous',
  anonymousAuth.verifyAnonymousToken,
  anonymousAuth.isolateSession,
  reportController.createAnonymousReport
);

// --- Moderator Routes ---

// Get all reports (moderator only)
router.get('/', authenticateToken, isAdmin, reportController.getReports);

// Get report statistics (moderator only)
router.get('/stats', authenticateToken, isAdmin, reportController.getReportStats);

// Get a specific report by ID (moderator only)
router.get('/:id', authenticateToken, isAdmin, reportController.getReportById);

// Update a report's status and take action (moderator only)
router.put('/:id', authenticateToken, isAdmin, reportController.updateReport);

module.exports = router; 