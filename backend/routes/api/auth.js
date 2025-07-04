const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const authController = require('../../controllers/auth.controller');
const auth = require('../../middleware/auth');
const twoFactorController = require('../../controllers/twoFactorAuth.controller');

// @route    POST api/auth/register
// @desc     Register user
// @access   Public
router.post(
  '/register',
  [
    check('firstName', 'First name is required').not().isEmpty(),
    check('lastName', 'Last name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
  ],
  authController.register
);

// @route    POST api/auth/login
// @desc     Authenticate user & get token
// @access   Public
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  authController.login
);

// @route    GET api/auth/me
// @desc     Get current user
// @access   Private
router.get('/me', auth, authController.getCurrentUser);

// 2FA routes
router.post('/2fa/setup', auth, twoFactorController.setupTwoFactorAuth);
router.post('/2fa/verify', auth, twoFactorController.verifyTwoFactorAuth);
router.post('/2fa/disable', auth, twoFactorController.disableTwoFactorAuth);

module.exports = router; 