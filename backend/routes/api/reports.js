const express = require('express');
const router = express.Router();
const reportController = require('../../controllers/reportController');
const auth = require('../../middleware/auth');
const { isVerified, checkVerificationStatus } = require('../../middleware/verification');

/**
 * Report API routes
 * Requires authentication for all routes
 */

// @route   POST /api/reports
// @desc    Create a new report
// @access  Private
router.post('/', auth, reportController.createReport);

// @route   GET /api/reports
// @desc    Get all reports (for moderators)
// @access  Private/Moderator
router.get('/', auth, reportController.getReports);

// @route   GET /api/reports/:id
// @desc    Get a report by ID (for moderators)
// @access  Private/Moderator
router.get('/:id', auth, reportController.getReportById);

// @route   PUT /api/reports/:id
// @desc    Update a report's status, add resolution (for moderators)
// @access  Private/Moderator
router.put('/:id', auth, reportController.updateReport);

// @route   GET /api/reports/user
// @desc    Get reports created by the logged-in user
// @access  Private
router.get('/user', auth, reportController.getUserReports);

// @route   GET /api/reports/stats
// @desc    Get reporting statistics (for moderators)
// @access  Private/Moderator
router.get('/stats', auth, reportController.getReportStats);

// @route   POST /api/reports/:id/take-action
// @desc    Take action on a reported content (for moderators)
// @access  Private/Moderator
router.post('/:id/take-action', auth, reportController.takeAction);

module.exports = router; 