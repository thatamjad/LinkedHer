const User = require('../models/user.model');
const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const verificationConfig = require('../config/verification');

// LinkedIn OAuth 2.0 Integration
exports.initiateLinkedInAuth = (req, res) => {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const redirectUri = `${process.env.API_BASE_URL}/api/verification/linkedin/callback`;
  const scope = 'r_emailaddress r_liteprofile';
  
  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${req.user.id}`;
  
  res.json({ authUrl });
};

exports.handleLinkedInCallback = async (req, res) => {
  try {
    const { code } = req.query;
    const userId = req.query.state;
    
    if (!code || !userId) {
      return res.status(400).json({ message: 'Invalid request parameters' });
    }
    
    // Exchange authorization code for access token
    const tokenResponse = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', null, {
      params: {
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${process.env.API_BASE_URL}/api/verification/linkedin/callback`,
        client_id: process.env.LINKEDIN_CLIENT_ID,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    const { access_token } = tokenResponse.data;
    
    // Get user profile data
    const profileResponse = await axios.get('https://api.linkedin.com/v2/me', {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    });
    
    // Get user email
    const emailResponse = await axios.get('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    });
    
    const profileData = profileResponse.data;
    const emailData = emailResponse.data.elements[0]['handle~'].emailAddress;
    
    // Check if LinkedIn profile belongs to a woman
    // Note: LinkedIn doesn't provide gender information directly, so we rely on name analysis
    // This will be supplemented by other verification methods
    
    // Find user and update LinkedIn verification
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.verificationMethods.linkedIn.verified = true;
    user.verificationMethods.linkedIn.data = {
      profileId: profileData.id,
      firstName: profileData.localizedFirstName,
      lastName: profileData.localizedLastName,
      email: emailData,
      verifiedAt: new Date()
    };
    
    // Calculate new verification score
    user.updateVerificationScore();
    
    // Set verification window if not already set
    if (!user.verificationInitiatedAt) {
      user.calculateVerificationExpiry();
    }
    
    await user.save();
    
    // Redirect to frontend verification page
    res.redirect(`${process.env.FRONTEND_URL}/verification?method=linkedin&status=success`);
  } catch (error) {
    console.error('LinkedIn verification error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/verification?method=linkedin&status=error`);
  }
};

// Professional Email Verification
exports.initiateEmailVerification = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if email is a professional domain (not free email providers)
    const domain = email.split('@')[1].toLowerCase();
    
    if (verificationConfig.email.freeEmailDomains.includes(domain)) {
      return res.status(400).json({ 
        message: 'Please use a professional email domain for verification',
        isFreeDomain: true
      });
    }
    
    // Generate verification token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiry
    
    user.verificationMethods.professionalEmail.email = email;
    user.verificationMethods.professionalEmail.token = token;
    user.verificationMethods.professionalEmail.tokenExpiresAt = expiresAt;
    
    // Set verification window if not already set
    if (!user.verificationInitiatedAt) {
      user.calculateVerificationExpiry();
    }
    
    await user.save();
    
    // Send verification email with token
    const emailService = require('../utils/emailService');
    await emailService.sendVerificationEmail(
      email, 
      token, 
      user.firstName
    );
    
    res.json({ 
      message: 'Verification email sent', 
      email: email.replace(/(.{2})(.*)(@.*)/, '$1***$3') // Mask email for privacy
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Email verification failed', error: error.message });
  }
};

exports.verifyProfessionalEmail = async (req, res) => {
  try {
    const { token } = req.params;
    
    const user = await User.findOne({
      'verificationMethods.professionalEmail.token': token,
      'verificationMethods.professionalEmail.tokenExpiresAt': { $gt: new Date() }
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }
    
    user.verificationMethods.professionalEmail.verified = true;
    user.verificationMethods.professionalEmail.verifiedAt = new Date();
    user.verificationMethods.professionalEmail.token = undefined;
    user.verificationMethods.professionalEmail.tokenExpiresAt = undefined;
    
    // Calculate new verification score
    user.updateVerificationScore();
    
    await user.save();
    
    res.redirect(`${process.env.FRONTEND_URL}/verification?method=email&status=success`);
  } catch (error) {
    console.error('Email verification confirmation error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/verification?method=email&status=error`);
  }
};

// Government ID Verification
exports.initiateIdVerification = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No ID document uploaded' });
    }
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Process the uploaded ID document
    // Note: In a real implementation, this would integrate with an ID verification service
    // For this implementation, we'll simulate the process with metadata stripping
    
    // Strip metadata from image
    const strippedImagePath = await stripImageMetadata(req.file.path);
    
    // Store reference to the ID document (in a real app, you'd store in secure storage)
    user.verificationMethods.governmentId.verified = false; // Pending admin review
    user.verificationMethods.governmentId.type = req.body.idType;
    user.verificationMethods.governmentId.documentPath = strippedImagePath;
    user.verificationMethods.governmentId.uploadedAt = new Date();
    user.verificationMethods.governmentId.status = 'pending_review';
    
    // Set verification window if not already set
    if (!user.verificationInitiatedAt) {
      user.calculateVerificationExpiry();
    }
    
    // Update verification status to pending
    if (user.verificationStatus === 'unverified') {
      user.verificationStatus = 'pending';
    }
    
    await user.save();
    
    res.json({ 
      message: 'ID document uploaded successfully and pending review',
      status: 'pending_review'
    });
  } catch (error) {
    console.error('ID verification error:', error);
    res.status(500).json({ message: 'ID verification failed', error: error.message });
  }
};

// Admin functions for verification
exports.getVerificationRequests = async (req, res) => {
  try {
    // Check if user is admin
    const admin = await User.findById(req.user.id);
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized access' });
    }
    
    // Get pending ID verification requests
    const pendingRequests = await User.find({
      'verificationMethods.governmentId.status': 'pending_review'
    }).select('_id firstName lastName verificationMethods.governmentId email');
    
    res.json({ pendingRequests });
  } catch (error) {
    console.error('Get verification requests error:', error);
    res.status(500).json({ message: 'Failed to get verification requests', error: error.message });
  }
};

exports.approveIdVerification = async (req, res) => {
  try {
    const { userId, approved } = req.body;
    
    // Check if user is admin
    const admin = await User.findById(req.user.id);
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized access' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.verificationMethods.governmentId.verified = approved;
    user.verificationMethods.governmentId.status = approved ? 'approved' : 'rejected';
    user.verificationMethods.governmentId.reviewedAt = new Date();
    user.verificationMethods.governmentId.reviewedBy = req.user.id;
    
    // Calculate new verification score
    user.updateVerificationScore();
    
    await user.save();
    
    res.json({ 
      message: approved ? 'ID verification approved' : 'ID verification rejected',
      user: {
        _id: user._id,
        verificationStatus: user.verificationStatus,
        verificationScore: user.verificationScore
      }
    });
  } catch (error) {
    console.error('Approve ID verification error:', error);
    res.status(500).json({ message: 'Failed to process verification', error: error.message });
  }
};

exports.reviewIdVerification = async (req, res) => {
  try {
    const { userId } = req.params;
    const { decision, rejectionReason } = req.body;

    const userToReview = await User.findById(userId);

    if (!userToReview) {
      return res.status(404).json({ message: 'User to review not found' });
    }

    if (decision === 'approve') {
      userToReview.verificationMethods.governmentId.status = 'approved';
      userToReview.verificationMethods.governmentId.verified = true;
      userToReview.verificationMethods.governmentId.verifiedAt = new Date();
      
      userToReview.updateVerificationScore();
      
      await userToReview.save();
      
      // Optionally, send a notification to the user
      // await sendNotification(userToReview._id, 'Your ID has been verified!');

      return res.json({ message: 'ID verification approved', user: { id: userToReview._id, status: userToReview.verificationStatus } });

    } else if (decision === 'reject') {
      userToReview.verificationMethods.governmentId.status = 'rejected';
      userToReview.verificationMethods.governmentId.rejectionReason = rejectionReason || 'No reason provided';
      
      await userToReview.save();

      // Optionally, send a notification to the user
      // await sendNotification(userToReview._id, `Your ID verification was rejected. Reason: ${rejectionReason}`);
      
      return res.json({ message: 'ID verification rejected' });
    } else {
      return res.status(400).json({ message: 'Invalid decision. Must be "approve" or "reject".' });
    }

  } catch (error) {
    console.error('ID verification review error:', error);
    res.status(500).json({ message: 'Failed to review ID verification', error: error.message });
  }
};

// Utility function to strip metadata from images
async function stripImageMetadata(filePath) {
  try {
    // In a real implementation, you would use a library like sharp or imagemagick
    // to strip EXIF data and other metadata
    // For this implementation, we'll simulate the process
    
    const fileName = path.basename(filePath);
    const strippedFileName = `stripped_${fileName}`;
    const strippedPath = path.join(path.dirname(filePath), strippedFileName);
    
    // Simulate metadata stripping by copying the file
    // In a real implementation, you would process the image to remove metadata
    const readFile = promisify(fs.readFile);
    const writeFile = promisify(fs.writeFile);
    
    const imageData = await readFile(filePath);
    await writeFile(strippedPath, imageData);
    
    return strippedPath;
  } catch (error) {
    console.error('Error stripping metadata:', error);
    return filePath; // Return original path if stripping fails
  }
}

// Get verification status with countdown
exports.getVerificationStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Calculate remaining time in verification window
    let remainingTime = null;
    if (user.verificationInitiatedAt && user.verificationDeadline) {
      const now = new Date();
      const deadline = new Date(user.verificationDeadline);
      
      if (now < deadline) {
        remainingTime = deadline - now;
      }
    }
    
    // Collect verification methods data with null safety
    const verificationMethods = {
      linkedIn: user.verificationMethods?.linkedIn || { verified: false },
      professionalEmail: user.verificationMethods?.professionalEmail || { verified: false },
      governmentId: user.verificationMethods?.governmentId || { verified: false }
    };
    
    // Calculate overall verification score
    // This should match the user model's updateVerificationScore method
    let score = 0;
    if (verificationMethods.linkedIn.verified) score += 30;
    if (verificationMethods.professionalEmail.verified) score += 30;
    if (verificationMethods.governmentId.verified) score += 40;
    
    // Check if verification has expired
    const isExpired = user.verificationStatus === 'expired';
    
    // Check if fully verified
    const isVerified = user.verificationStatus === 'verified';
    
    // If verification window has expired but status isn't updated yet
    if (
      !isVerified && 
      !isExpired && 
      user.verificationDeadline && 
      new Date() > new Date(user.verificationDeadline)
    ) {
      // Update user verification status to expired
      user.verificationStatus = 'expired';
      await user.save();
    }
    
    res.json({
      status: user.verificationStatus,
      score,
      methods: verificationMethods,
      expiresAt: user.verificationDeadline,
      isExpired: isExpired || (user.verificationDeadline && new Date() > new Date(user.verificationDeadline))
    });
  } catch (error) {
    console.error('Get verification status error:', error);
    res.status(500).json({ message: 'Failed to get verification status', error: error.message });
  }
}; 