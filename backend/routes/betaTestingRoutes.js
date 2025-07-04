const express = require('express');
const router = express.Router();
const betaTesterController = require('../controllers/betaTesterController');
const testScenarioController = require('../controllers/testScenarioController');
const bugReportController = require('../controllers/bugReportController');
const analyticsController = require('../controllers/analyticsController');
const { authenticateUser } = require('../middleware/auth.middleware');
const { isVerified } = require('../middleware/verification');

// Beta tester routes
router.post('/testers/recruit', authenticateUser, isVerified, betaTesterController.recruitTester);
router.get('/testers', authenticateUser, betaTesterController.getAllTesters);
router.get('/testers/:id', authenticateUser, betaTesterController.getTesterById);
router.put('/testers/:id', authenticateUser, betaTesterController.updateTester);
router.post('/testers/assign-scenarios', authenticateUser, betaTesterController.assignTestScenarios);
router.get('/testers/analytics', authenticateUser, betaTesterController.getBetaTestingAnalytics);

// Test scenario routes
router.post('/scenarios', authenticateUser, isVerified, testScenarioController.createTestScenario);
router.get('/scenarios', authenticateUser, testScenarioController.getAllTestScenarios);
router.get('/scenarios/:id', authenticateUser, testScenarioController.getTestScenarioById);
router.put('/scenarios/:id', authenticateUser, isVerified, testScenarioController.updateTestScenario);
router.post('/scenarios/:id/feedback', authenticateUser, testScenarioController.submitFeedback);
router.get('/scenarios/analytics', authenticateUser, testScenarioController.getTestScenarioAnalytics);

// Bug report routes
router.post('/bug-reports', authenticateUser, bugReportController.submitBugReport);
router.get('/bug-reports', authenticateUser, bugReportController.getAllBugReports);
router.get('/bug-reports/:id', authenticateUser, bugReportController.getBugReportById);
router.put('/bug-reports/:id/status', authenticateUser, isVerified, bugReportController.updateBugStatus);
router.post('/bug-reports/:id/comments', authenticateUser, bugReportController.addComment);
router.post('/bug-reports/:id/duplicate', authenticateUser, isVerified, bugReportController.markAsDuplicate);
router.get('/bug-reports/analytics', authenticateUser, bugReportController.getBugReportAnalytics);

// Analytics routes
router.post('/events', authenticateUser, analyticsController.trackEvent);
router.get('/events/counts', authenticateUser, analyticsController.getEventCounts);
router.get('/events/timeline', authenticateUser, analyticsController.getEventsTimeline);
router.get('/user-activity', authenticateUser, analyticsController.getUserActivityMetrics);
router.get('/dashboard', authenticateUser, analyticsController.getBetaTestingDashboard);

module.exports = router; 