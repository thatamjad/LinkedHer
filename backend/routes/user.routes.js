const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticateUser, verificationCheck, checkVerificationExpiry } = require('../middleware/auth.middleware');

// Apply authentication middleware to all routes
router.use(authenticateUser);
router.use(checkVerificationExpiry);

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', userController.getUserProfile);

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put(
  '/profile',
  [
    body('firstName').optional().notEmpty().withMessage('First name cannot be empty'),
    body('lastName').optional().notEmpty().withMessage('Last name cannot be empty'),
    body('bio').optional().isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters')
  ],
  userController.updateUserProfile
);

// Verification routes
// @route   POST /api/users/verification/start
// @desc    Start verification process and set 7-day window
// @access  Private
router.post('/verification/start', userController.startVerificationProcess);

// @route   PUT /api/users/verification/linkedin
// @desc    Verify user via LinkedIn
// @access  Private
router.put('/verification/linkedin', userController.verifyViaLinkedIn);

// @route   PUT /api/users/verification/email
// @desc    Verify user via professional email
// @access  Private
router.put(
  '/verification/email',
  [
    body('email').isEmail().withMessage('Please provide a valid email address')
  ],
  userController.verifyViaProfessionalEmail
);

// @route   PUT /api/users/verification/government-id
// @desc    Verify user via government ID
// @access  Private
router.put(
  '/verification/government-id',
  [
    body('idType').isIn(['passport', 'drivers_license', 'national_id', 'other'])
      .withMessage('Invalid ID type')
  ],
  userController.verifyViaGovernmentId
);

// @route   GET /api/users/verification/status
// @desc    Get verification status
// @access  Private
router.get('/verification/status', userController.getVerificationStatus);

// Routes that require verification
router.use(verificationCheck);

// @route   GET /api/users/feed
// @desc    Get user feed
// @access  Private (verified or in verification window)
router.get('/feed', userController.getUserFeed);

module.exports = router; 