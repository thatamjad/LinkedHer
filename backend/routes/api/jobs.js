const express = require('express');
const router = express.Router();
const jobController = require('../../controllers/jobController');
const auth = require('../../middleware/auth');
const { isVerified } = require('../../middleware/verification');

// @route   GET api/jobs
// @desc    Get all jobs with filters
// @access  Public
router.get('/', jobController.getJobs);

// @route   GET api/jobs/:id
// @desc    Get a single job by ID
// @access  Public
router.get('/:id', jobController.getJob);

// @route   POST api/jobs/save/:id
// @desc    Save a job for later
// @access  Private
router.post('/save/:id', auth, jobController.saveJob);

// @route   DELETE api/jobs/save/:id
// @desc    Unsave a job
// @access  Private
router.delete('/save/:id', auth, jobController.unsaveJob);

// @route   GET api/jobs/saved
// @desc    Get user's saved jobs
// @access  Private
router.get('/saved', auth, jobController.getSavedJobs);

// @route   POST api/jobs/apply/:id
// @desc    Record job application
// @access  Private
router.post('/apply/:id', auth, jobController.recordJobApplication);

// @route   GET api/jobs/applied
// @desc    Get user's applied jobs
// @access  Private
router.get('/applied', auth, jobController.getAppliedJobs);

// @route   POST api/jobs/search/save
// @desc    Save a job search
// @access  Private
router.post('/search/save', auth, jobController.saveJobSearch);

// @route   GET api/jobs/search/saved
// @desc    Get user's saved searches
// @access  Private
router.get('/search/saved', auth, jobController.getSavedSearches);

// @route   DELETE api/jobs/search/saved/:id
// @desc    Delete a saved search
// @access  Private
router.delete('/search/saved/:id', auth, jobController.deleteSavedSearch);

// @route   GET api/jobs/recommendations
// @desc    Get personalized job recommendations
// @access  Private
router.get('/recommendations', auth, isVerified, jobController.getJobRecommendations);

// @route   GET api/jobs/stats
// @desc    Get job statistics
// @access  Public
router.get('/stats', jobController.getJobStats);

module.exports = router; 