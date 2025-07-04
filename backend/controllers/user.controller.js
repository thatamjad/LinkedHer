const { validationResult } = require('express-validator');
const User = require('../models/user.model');

/**
 * Get user profile
 * @route GET /api/users/profile
 */
exports.getUserProfile = async (req, res) => {
  try {
    const user = req.user;
    
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        bio: user.bio,
        profileImage: user.profileImage,
        verificationStatus: user.verificationStatus,
        verificationExpiresAt: user.verificationExpiresAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving user profile'
    });
  }
};

/**
 * Update user profile
 * @route PUT /api/users/profile
 */
exports.updateUserProfile = async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const user = req.user;
    const { firstName, lastName, bio } = req.body;

    // Update fields if provided
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (bio !== undefined) user.bio = bio;

    // Save updates
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        bio: user.bio
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user profile'
    });
  }
};

/**
 * Start verification process
 * @route POST /api/users/verification/start
 */
exports.startVerificationProcess = async (req, res) => {
  try {
    const user = req.user;

    // Cannot start if already verified
    if (user.verificationStatus === 'verified') {
      return res.status(400).json({
        success: false,
        message: 'User is already verified'
      });
    }

    // Calculate verification window expiry
    user.calculateVerificationExpiry();
    user.verificationStatus = 'pending';
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Verification process started',
      verificationStatus: user.verificationStatus,
      verificationExpiresAt: user.verificationExpiresAt
    });
  } catch (error) {
    console.error('Start verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error starting verification process'
    });
  }
};

/**
 * Verify via LinkedIn
 * @route PUT /api/users/verification/linkedin
 */
exports.verifyViaLinkedIn = async (req, res) => {
  try {
    const user = req.user;
    
    // Simulate LinkedIn verification (in a real app, this would integrate with LinkedIn OAuth)
    // For this implementation, we'll just mark it as verified
    
    user.verificationMethods.linkedIn.verified = true;
    user.verificationMethods.linkedIn.data = {
      linkedInId: 'mock_linkedin_id',
      verifiedAt: new Date()
    };
    
    // Update verification score
    user.updateVerificationScore();
    await user.save();

    res.status(200).json({
      success: true,
      message: 'LinkedIn verification successful',
      verificationStatus: user.verificationStatus,
      verificationScore: user.verificationScore
    });
  } catch (error) {
    console.error('LinkedIn verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying via LinkedIn'
    });
  }
};

/**
 * Verify via professional email
 * @route PUT /api/users/verification/email
 */
exports.verifyViaProfessionalEmail = async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const user = req.user;
    const { email } = req.body;
    
    // In a real app, we would send verification email and confirm it
    // For this implementation, we'll simulate verification for certain domains
    
    // Check if email is from a recognized professional domain
    const professionalDomains = ['company.com', 'ibm.com', 'microsoft.com', 'amazon.com', 'google.com'];
    const emailDomain = email.split('@')[1];
    
    if (!professionalDomains.includes(emailDomain)) {
      return res.status(400).json({
        success: false,
        message: 'Email domain not recognized as professional'
      });
    }
    
    // Mark professional email as verified
    user.verificationMethods.professionalEmail.verified = true;
    user.verificationMethods.professionalEmail.email = email;
    
    // Update verification score
    user.updateVerificationScore();
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Professional email verification successful',
      verificationStatus: user.verificationStatus,
      verificationScore: user.verificationScore
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying via professional email'
    });
  }
};

/**
 * Verify via government ID
 * @route PUT /api/users/verification/government-id
 */
exports.verifyViaGovernmentId = async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const user = req.user;
    const { idType } = req.body;
    
    // In a real app, we would have an ID verification flow
    // For this implementation, we'll simulate verification
    
    // Mark government ID as verified
    user.verificationMethods.governmentId.verified = true;
    user.verificationMethods.governmentId.type = idType;
    
    // Update verification score
    user.updateVerificationScore();
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Government ID verification successful',
      verificationStatus: user.verificationStatus,
      verificationScore: user.verificationScore
    });
  } catch (error) {
    console.error('ID verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying via government ID'
    });
  }
};

/**
 * Get verification status
 * @route GET /api/users/verification/status
 */
exports.getVerificationStatus = async (req, res) => {
  try {
    const user = req.user;
    
    // Calculate days remaining in verification window
    let daysRemaining = null;
    if (user.verificationExpiresAt) {
      const now = new Date();
      const expiryDate = new Date(user.verificationExpiresAt);
      const timeDiff = expiryDate - now;
      daysRemaining = Math.max(0, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)));
    }
    
    res.status(200).json({
      success: true,
      verificationStatus: user.verificationStatus,
      verificationInitiatedAt: user.verificationInitiatedAt,
      verificationExpiresAt: user.verificationExpiresAt,
      daysRemaining,
      verificationMethods: user.verificationMethods,
      verificationScore: user.verificationScore
    });
  } catch (error) {
    console.error('Get verification status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving verification status'
    });
  }
};

/**
 * Get user feed (placeholder for now)
 * @route GET /api/users/feed
 */
exports.getUserFeed = async (req, res) => {
  try {
    // For now, just return placeholder data
    res.status(200).json({
      success: true,
      feed: [
        {
          id: '1',
          title: 'Welcome to Linker',
          content: 'This is a placeholder post for the feed.',
          createdAt: new Date()
        }
      ]
    });
  } catch (error) {
    console.error('Get feed error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving user feed'
    });
  }
}; 