const express = require('express');
const router = express.Router();
const verificationController = require('../../controllers/verification.controller');
const auth = require('../../middleware/auth');
const { upload } = require('../../utils/fileUpload');

// LinkedIn OAuth routes
router.get('/linkedin/init', auth, verificationController.initiateLinkedInAuth);
router.get('/linkedin/callback', verificationController.handleLinkedInCallback);

// Professional Email verification routes
router.post('/email/init', auth, verificationController.initiateEmailVerification);
router.get('/email/verify/:token', verificationController.verifyProfessionalEmail);

// Verification status
router.get('/status', auth, verificationController.getVerificationStatus);

module.exports = router; 