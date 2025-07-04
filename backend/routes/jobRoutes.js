const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { authenticateUser } = require('../middleware/auth.middleware');

// Routes for both authenticated and anonymous users
// Note: The authMiddleware will handle both regular users and anonymous personas

// Get jobs with filters
router.get('/', authenticateUser, jobController.getJobs);

// Get single job
router.get('/:id', authenticateUser, jobController.getJob);

// Get recommended jobs
router.get('/recommended/for-me', authenticateUser, jobController.getRecommendedJobs);

// Save job
router.post('/:id/save', authenticateUser, jobController.saveJob);

// Unsave job
router.delete('/:id/save', authenticateUser, jobController.unsaveJob);

// Apply for job
router.post('/:id/apply', authenticateUser, jobController.applyForJob);

// Share job
router.post('/:id/share', authenticateUser, jobController.shareJob);

// Saved searches
router.post('/searches', authenticateUser, jobController.saveSearch);
router.get('/searches', authenticateUser, jobController.getSavedSearches);
router.delete('/searches/:id', authenticateUser, jobController.deleteSavedSearch);

// Get saved jobs
router.get('/saved/list', authenticateUser, jobController.getSavedJobs);

// Get applied jobs
router.get('/applied/list', authenticateUser, jobController.getAppliedJobs);

module.exports = router; 