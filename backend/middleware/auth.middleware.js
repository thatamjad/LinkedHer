const { verifyAccessToken } = require('../utils/jwt.utils');
const User = require('../models/user.model');

/**
 * Authenticate user middleware - validates JWT token
 */
const authenticateUser = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No token provided.'
      });
    }
    
    // Extract token
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = verifyAccessToken(token);
    
    // Find user
    const user = await User.findById(decoded.userId);
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User not found or account inactive'
      });
    }
    
    // Set user in req object
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message || 'Authentication failed'
    });
  }
};

/**
 * Authenticate token middleware - validates JWT token and sets userId in req
 * This is a simplified version of authenticateUser that doesn't load the full user object
 */
const authenticateToken = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No token provided.'
      });
    }
    
    // Extract token
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = verifyAccessToken(token);
    
    // Set userId in req object
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message || 'Authentication failed'
    });
  }
};

/**
 * Role-based middleware - checks if the user has the required role
 */
const requireRole = (role) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      if (user.role !== role) {
        return res.status(403).json({
          success: false,
          message: `${role} role required to access this resource`
        });
      }
      
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Error checking user role'
      });
    }
  };
};

/**
 * Verification status middleware - checks if user is verified
 * - If verified, allows full access
 * - If in verification window, allows read-only access
 * - If verification expired, restricts access
 */
const verificationCheck = async (req, res, next) => {
  try {
    const user = req.user;
    
    // If user is verified, allow access
    if (user.verificationStatus === 'verified') {
      return next();
    }
    
    // If request is GET (read-only), check verification window
    if (req.method === 'GET') {
      // If in verification window
      if (
        user.verificationStatus === 'pending' &&
        user.verificationExpiresAt &&
        new Date(user.verificationExpiresAt) > new Date()
      ) {
        return next();
      }
    }
    
    // For any other case, restrict access
    return res.status(403).json({
      success: false,
      message: 'Verification required to access this feature',
      verificationStatus: user.verificationStatus,
      verificationExpiresAt: user.verificationExpiresAt
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error checking verification status'
    });
  }
};

/**
 * Check if account verification has expired and update if needed
 */
const checkVerificationExpiry = async (req, res, next) => {
  try {
    const user = req.user;
    
    // If user is verified or no verification process started, continue
    if (
      user.verificationStatus === 'verified' || 
      !user.verificationInitiatedAt ||
      !user.verificationExpiresAt
    ) {
      return next();
    }
    
    // Check if verification window has expired
    const now = new Date();
    if (new Date(user.verificationExpiresAt) < now) {
      // If expired and still not verified, mark as expired
      if (user.verificationStatus !== 'verified') {
        user.verificationStatus = 'unverified';
        user.isActive = false; // Deactivate account
        await user.save();
      }
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Admin role check middleware
 */
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  
  return res.status(403).json({
    success: false,
    message: 'Admin access required'
  });
};

module.exports = {
  authenticateUser,
  authenticateToken,
  requireRole,
  verificationCheck,
  checkVerificationExpiry,
  isAdmin
}; 