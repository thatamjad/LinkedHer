const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// Controllers
const anonymousPersonaController = require('../controllers/anonymousPersona.controller');
const anonymousPostController = require('../controllers/anonymousPost.controller');

// Middleware
const auth = require('../middleware/auth');
const anonymousAuth = require('../middleware/anonymousAuth.middleware');

// Configure multer for file uploads with anonymized filenames
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/anonymous');
  },
  filename: function (req, file, cb) {
    // Generate random filename to prevent tracking
    const randomName = crypto.randomBytes(16).toString('hex');
    cb(null, `${randomName}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: function (req, file, cb) {
    // Accept images and videos only
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images and videos are allowed'), false);
    }
  }
});

// Middleware to check for anonymous mode and handle authentication
router.use(anonymousAuth.isAnonymousMode);

/*
 * ROUTES FOR MANAGING ANONYMOUS PERSONAS
 */

// Create a new anonymous persona (requires professional mode auth)
router.post(
  '/personas', 
  auth,
  anonymousAuth.requireVerifiedForAnonymous,
  anonymousPersonaController.createPersona
);

// Get all personas for the authenticated user (requires professional mode auth)
router.get(
  '/personas/my', 
  auth, 
  anonymousPersonaController.getMyPersonas
);

// Update persona details (requires professional mode auth)
router.put(
  '/personas/:personaId', 
  auth, 
  anonymousPersonaController.updatePersona
);

// Delete a persona (requires professional mode auth)
router.delete(
  '/personas/:personaId', 
  auth, 
  anonymousPersonaController.deletePersona
);

// Switch to a specific persona (requires professional mode auth)
router.post(
  '/personas/:personaId/switch', 
  auth, 
  anonymousPersonaController.switchPersona
);

// Public endpoint to get a persona by ID
router.get(
  '/personas/:personaId', 
  anonymousPersonaController.getPersonaById
);

/*
 * ROUTES FOR ANONYMOUS POSTS
 */

// Create a new anonymous post (requires anonymous mode auth)
router.post(
  '/posts', 
  anonymousAuth.verifyAnonymousToken,
  anonymousAuth.isolateSession,
  anonymousPostController.createPost
);

// Get anonymous feed
router.get(
  '/feed', 
  anonymousPostController.getAnonymousFeed
);

// Get a specific post by ID
router.get(
  '/posts/:postId', 
  anonymousPostController.getPostById
);

// Like or unlike a post (requires anonymous mode auth)
router.post(
  '/posts/:postId/like', 
  anonymousAuth.verifyAnonymousToken,
  anonymousAuth.isolateSession,
  anonymousPostController.toggleLike
);

// Add a comment to a post (requires anonymous mode auth)
router.post(
  '/posts/:postId/comments', 
  anonymousAuth.verifyAnonymousToken,
  anonymousAuth.isolateSession,
  anonymousPostController.addComment
);

// Delete a post (requires anonymous mode auth)
router.delete(
  '/posts/:postId', 
  anonymousAuth.verifyAnonymousToken,
  anonymousAuth.isolateSession,
  anonymousPostController.deletePost
);

// Upload media for anonymous posts (requires anonymous mode auth)
router.post(
  '/upload', 
  anonymousAuth.verifyAnonymousToken,
  anonymousAuth.isolateSession,
  upload.single('media'),
  anonymousPostController.uploadMedia
);

module.exports = router; 