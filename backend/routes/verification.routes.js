const express = require('express');
const router = express.Router();
const verificationController = require('../controllers/verification.controller');
const auth = require('../middleware/auth');
const { isAdmin } = require('../middleware/auth.middleware');
const { upload } = require('../utils/fileUpload');

// LinkedIn OAuth routes
router.get('/linkedin/init', auth, verificationController.initiateLinkedInAuth);
router.get('/linkedin/callback', verificationController.handleLinkedInCallback);

// Professional Email verification routes
router.post('/email/init', auth, verificationController.initiateEmailVerification);
router.get('/email/verify/:token', verificationController.verifyProfessionalEmail);

// Government ID verification routes
router.post('/id/upload', auth, upload.single('idDocument'), verificationController.initiateIdVerification);

// Admin review route
router.post('/admin/review/:userId', auth, isAdmin, verificationController.reviewIdVerification);

// Verification status
router.get('/status', auth, verificationController.getVerificationStatus);

module.exports = router; 