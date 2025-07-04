const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const {
  setupTwoFactorAuth,
  verifyTwoFactorAuth,
  disableTwoFactorAuth
} = require('../../controllers/twoFactorAuth.controller');

// POST /api/auth/2fa/setup
router.post('/setup', auth, setupTwoFactorAuth);

// POST /api/auth/2fa/verify
router.post('/verify', auth, verifyTwoFactorAuth);

// POST /api/auth/2fa/disable
router.post('/disable', auth, disableTwoFactorAuth);

module.exports = router; 