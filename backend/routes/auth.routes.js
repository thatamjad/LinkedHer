const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticateUser } = require('../middleware/auth.middleware');

// Input validation rules
const registerValidation = [
  body('email').isEmail().withMessage('Please provide a valid email address'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email address'),
  body('password').notEmpty().withMessage('Password is required'),
];

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', registerValidation, authController.register);

// @route   POST /api/auth/login
// @desc    Login user and return tokens
// @access  Public
router.post('/login', loginValidation, authController.login);

// @route   POST /api/auth/refresh-token
// @desc    Refresh access token using refresh token
// @access  Public (with refresh token cookie)
router.post('/refresh-token', authController.refreshToken);

// @route   POST /api/auth/logout
// @desc    Logout user and clear tokens
// @access  Private
router.post('/logout', authenticateUser, authController.logout);

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authenticateUser, authController.getCurrentUser);

// Test login route (only available in development)
router.post('/test-login', authController.testLogin);

module.exports = router; 