const express = require('express');
const router = express.Router();
const twoFactorAuthController = require('../controllers/twoFactorAuth.controller');
const userSessionController = require('../controllers/userSession.controller');
const profilePrivacyController = require('../controllers/profilePrivacy.controller');
const anonymousTrafficController = require('../controllers/anonymousTraffic.controller');
const { authenticateUser } = require('../middleware/auth.middleware');

// Two-factor authentication routes
router.post('/2fa/setup', authenticateUser, twoFactorAuthController.setupTwoFactorAuth);
router.post('/2fa/verify', authenticateUser, twoFactorAuthController.verifyTwoFactorAuth);
router.post('/2fa/verify-login', twoFactorAuthController.verify2FALogin);
router.post('/2fa/disable', authenticateUser, twoFactorAuthController.disableTwoFactorAuth);
router.post('/2fa/backup-codes', authenticateUser, twoFactorAuthController.generateBackupCodes);

// User session management routes
router.post('/sessions', authenticateUser, userSessionController.createSession);
router.get('/sessions', authenticateUser, userSessionController.getUserSessions);
router.delete('/sessions/:sessionId', authenticateUser, userSessionController.revokeSession);
router.delete('/sessions', authenticateUser, userSessionController.revokeAllOtherSessions);
router.patch('/sessions/activity', authenticateUser, userSessionController.updateSessionActivity);
router.post('/sessions/:sessionId/suspicious', authenticateUser, userSessionController.markSessionSuspicious);

// Profile privacy routes
router.get('/privacy/profile', authenticateUser, profilePrivacyController.getPrivacySettings);
router.put('/privacy/profile', authenticateUser, profilePrivacyController.updatePrivacySettings);
router.patch('/privacy/item', authenticateUser, profilePrivacyController.updateItemVisibility);
router.get('/privacy/profile/:userId', profilePrivacyController.getProfileWithVisibility);

// Anonymous traffic mixing routes
router.get('/anonymous/:personaId/routing', authenticateUser, anonymousTrafficController.generateRoutingPath);
router.get('/anonymous/:personaId/delay', authenticateUser, anonymousTrafficController.getRandomDelayParams);
router.get('/anonymous/:personaId/headers', authenticateUser, anonymousTrafficController.getRandomizedHeaders);
router.put('/anonymous/:personaId/security', authenticateUser, anonymousTrafficController.updateSecuritySettings);
router.put('/anonymous/:personaId/metadata', authenticateUser, anonymousTrafficController.updateMetadataSettings);
router.put('/anonymous/:personaId/mixing', authenticateUser, anonymousTrafficController.updateMixingParameters);

module.exports = router;