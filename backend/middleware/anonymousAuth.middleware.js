const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const AnonymousPersona = require('../models/anonymousPersona.model');
const { generateAnonymousSessionToken } = require('../utils/cryptoUtils');
const crypto = require('crypto');

/**
 * Middleware for anonymous mode authentication
 * Provides a completely isolated authentication path for anonymous mode
 * Ensures there's no session linkage between professional and anonymous modes
 */

// Check if anonymous mode is active
const isAnonymousMode = (req, res, next) => {
  const anonymousMode = req.headers['x-anonymous-mode'] === 'true';
  req.anonymousMode = anonymousMode;
  next();
};

// Verify anonymous persona token
const verifyAnonymousToken = async (req, res, next) => {
  try {
    // Skip if not in anonymous mode
    if (!req.anonymousMode) {
      return next();
    }
    
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Anonymous access requires authentication' 
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.ANONYMOUS_JWT_SECRET);
    
    // Find the anonymous persona
    const persona = await AnonymousPersona.findById(decoded.personaId);
    
    if (!persona) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid anonymous identity' 
      });
    }
    
    // Find the user associated with this persona (for internal use only)
    const user = await User.findById(persona.userId);
    
    if (!user || user.verificationStatus !== 'verified') {
      return res.status(401).json({ 
        success: false, 
        message: 'Only verified users can use anonymous mode' 
      });
    }
    
    // Add persona to request object (never expose the userId)
    req.anonymousPersona = {
      personaId: persona.personaId,
      displayName: persona.displayName,
      avatarUrl: persona.avatarUrl,
      // Include any other non-identifying information
    };
    
    // Also store the real userId internally (never sent to client)
    req._internalUserId = persona.userId;
    
    next();
  } catch (error) {
    console.error('Anonymous authentication error:', error);
    return res.status(401).json({ 
      success: false, 
      message: 'Anonymous authentication failed' 
    });
  }
};

// Create anonymous token for a persona
const createAnonymousToken = async (personaId) => {
  // Create a JWT token specific to anonymous mode
  // This token should be completely separate from professional mode
  return jwt.sign(
    { personaId },
    process.env.ANONYMOUS_JWT_SECRET,
    { expiresIn: '24h' } // Shorter expiry for security
  );
};

// Create session isolation between modes
// This ensures activities in anonymous mode can't be linked to professional mode
const isolateSession = async (req, res, next) => {
  try {
    // Skip if not in anonymous mode
    if (!req.anonymousPersona) {
      return next();
    }
    
    // Generate an isolated session token for the anonymous persona
    const sessionToken = generateAnonymousSessionToken(
      req.anonymousPersona.personaId,
      req.headers['user-agent']
    );
    
    // Store session token in request for later use
    req.anonymousSessionToken = sessionToken;
    
    next();
  } catch (error) {
    console.error('Session isolation error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to create isolated session' 
    });
  }
};

// Middleware to verify user is allowed to use anonymous mode
const requireVerifiedForAnonymous = async (req, res, next) => {
  try {
    // Get user ID from JWT or session (normal auth middleware should run first)
    const userId = req.user?.id || req.user?._id || req._internalUserId;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }
    
    // Find user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Check if user is verified (only verified users can use anonymous mode)
    if (user.verificationStatus !== 'verified') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only verified users can access anonymous mode' 
      });
    }
    
    next();
  } catch (error) {
    console.error('Verification check error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to verify user status' 
    });
  }
};

// Function to generate a temporary anonymous token for unauthenticated users
const generateTemporaryAnonymousToken = (req, res) => {
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'];
  
  // Create a temporary identifier
  const tempId = crypto.createHash('sha256').update(ip + userAgent).digest('hex');
  
  // Generate a short-lived token
  const token = jwt.sign(
    { tempId, isTemporary: true },
    process.env.ANONYMOUS_JWT_SECRET,
    { expiresIn: '1h' }
  );
  
  return token;
};

module.exports = {
  isAnonymousMode,
  verifyAnonymousToken,
  createAnonymousToken,
  isolateSession,
  requireVerifiedForAnonymous,
  generateTemporaryAnonymousToken
}; 