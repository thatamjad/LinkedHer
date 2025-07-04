const { validationResult } = require('express-validator');
const User = require('../models/user.model');
const { 
  generateAccessToken, 
  generateRefreshToken, 
  verifyRefreshToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie
} = require('../utils/jwt.utils');
const jwt = require('jsonwebtoken');
const { handleAsync } = require('../utils/errorHandler');
const config = require('../config');

/**
 * Generate JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    { user: { id: user.id } },
    config.jwtSecret,
    { expiresIn: config.jwtExpiration }
  );
};

/**
 * User registration
 * @route POST /api/auth/register
 */
exports.register = handleAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, firstName, lastName } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ msg: 'User with this email already exists' });
  }

  const user = new User({ email, password, firstName, lastName });
  await user.save();

  const tokenPayload = { userId: user.id, role: user.role };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  user.refreshToken = refreshToken;
  await user.save();

  setRefreshTokenCookie(res, refreshToken);

  res.status(201).json({
    accessToken,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      verificationStatus: user.verificationStatus
    }
  });
});

/**
 * User login
 * @route POST /api/auth/login
 */
exports.login = handleAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !user.isActive) {
    return res.status(401).json({ msg: 'Invalid credentials or account inactive' });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ msg: 'Invalid credentials' });
  }

  const tokenPayload = { userId: user.id, role: user.role };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  user.refreshToken = refreshToken;
  await user.save();

  setRefreshTokenCookie(res, refreshToken);

  res.json({
    accessToken,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      verificationStatus: user.verificationStatus
    }
  });
});

/**
 * Refresh access token
 * @route POST /api/auth/refresh-token
 */
exports.refreshToken = async (req, res) => {
  try {
    // Get refresh token from cookie
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token not found'
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Find user
    const user = await User.findById(decoded.userId);
    if (!user || user.refreshToken !== refreshToken || !user.isActive) {
      clearRefreshTokenCookie(res);
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Create token payload
    const tokenPayload = {
      userId: user._id,
      role: user.role
    };

    // Generate new tokens with rotation
    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    // Update refresh token in database
    user.refreshToken = newRefreshToken;
    await user.save();

    // Set new refresh token cookie
    setRefreshTokenCookie(res, newRefreshToken);

    // Return new access token
    res.status(200).json({
      success: true,
      accessToken: newAccessToken
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    clearRefreshTokenCookie(res);
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
};

/**
 * User logout
 * @route POST /api/auth/logout
 */
exports.logout = async (req, res) => {
  try {
    const user = req.user;
    
    // Clear refresh token in database
    user.refreshToken = null;
    await user.save();

    // Clear refresh token cookie
    clearRefreshTokenCookie(res);

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
};

/**
 * Get current user
 * @route GET /api/auth/me
 */
exports.getCurrentUser = async (req, res) => {
  try {
    // User is already attached to req by auth middleware
    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId).select('-password -refreshToken');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        bio: user.bio,
        profileImage: user.profileImage,
        verificationStatus: user.verificationStatus,
        verificationScore: user.verificationScore,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (err) {
    console.error('Get current user error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error retrieving user data' 
    });
  }
};

/**
 * @desc    Test login endpoint for development
 * @route   POST /api/auth/test-login
 * @access  Public (only in development environment)
 */
exports.testLogin = handleAsync(async (req, res) => {
  // Check if we're in production environment
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({
      success: false,
      error: 'Endpoint not found'
    });
  }

  try {
    console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');
    console.log('JWT_REFRESH_SECRET:', process.env.JWT_REFRESH_SECRET ? 'Set' : 'Not set');
      // Find existing test user first
    let testUser = await User.findOne({ email: 'testuser@auraconnect.com' });
    
    if (!testUser) {
      // Create test user if it doesn't exist
      const bcrypt = require('bcrypt');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('TestPassword123!', salt);
      testUser = new User({
        email: 'testuser@auraconnect.com',
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'User',
        verificationStatus: 'verified',
        bio: 'This is a test user account for development purposes.',
        role: 'user',
        isActive: true,
        security: {
          twoFactorEnabled: false
        },        verificationMethods: {
          linkedIn: { 
            verified: true,
            data: {
              profileId: 'test-linkedin-id',
              firstName: 'Test',
              lastName: 'User',
              email: 'testuser@auraconnect.com',
              verifiedAt: new Date()
            }
          },
          professionalEmail: { 
            verified: true, 
            email: 'testuser@auraconnect.com',
            verifiedAt: new Date()
          }
        },
        verificationScore: 60
      });      await testUser.save();
      console.log('Test user created automatically for development');
      
      // Create comprehensive test data for this user
      const { createComprehensiveTestData } = require('../utils/testDataHelper');
      await createComprehensiveTestData(testUser._id);
      
    } else {
      console.log('Using existing test user for development');
      
      // Ensure test data exists for this user
      const { createComprehensiveTestData } = require('../utils/testDataHelper');
      await createComprehensiveTestData(testUser._id);
    }

    // Generate tokens using the same method as regular login
    const tokenPayload = {
      userId: testUser._id,
      role: testUser.role
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Update refresh token in database
    testUser.refreshToken = refreshToken;
    await testUser.save();

    // Set refresh token cookie
    setRefreshTokenCookie(res, refreshToken);

    res.json({
      success: true,
      token: accessToken,
      user: {
        id: testUser._id,
        email: testUser.email,
        firstName: testUser.firstName,
        lastName: testUser.lastName,
        verificationStatus: testUser.verificationStatus,
        verificationScore: testUser.verificationScore,
        role: testUser.role
      }
    });
  } catch (error) {
    console.error('Test login error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create test login',
      message: error.message
    });
  }
});