const express = require('express');
const router = express.Router();
const mentalHealthController = require('../controllers/mentalHealth.controller');
const { authJwt } = require('../middleware');

// Apply authentication middleware to all routes
router.use(authJwt.verifyToken);

// Mental Health Resource routes
router.post('/resources', mentalHealthController.createResource);
router.get('/resources', mentalHealthController.getResources);
router.get('/resources/:id', mentalHealthController.getResourceById);
router.put('/resources/:id', mentalHealthController.updateResource);
router.delete('/resources/:id', mentalHealthController.deleteResource);
router.post('/resources/:id/review', mentalHealthController.addReview);
router.delete('/resources/:id/review/:reviewId', mentalHealthController.deleteReview);
router.post('/resources/:id/review/:reviewId/helpful', mentalHealthController.markReviewHelpful);
router.post('/resources/:id/verify', mentalHealthController.verifyResource);

module.exports = router; 