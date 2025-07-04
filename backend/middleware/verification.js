const User = require('../models/user.model');

// Middleware to check if user is verified
exports.isVerified = async (req, res, next) => {
  try {
    if (req.user.verificationStatus !== 'verified') {
      return res.status(403).json({ 
        msg: 'Account verification required to access this feature' 
      });
    }
    next();
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// Middleware to check verification expiration
exports.checkVerificationStatus = async (req, res, next) => {
  try {
    const user = req.user;
    
    // If user is already verified or rejected, proceed
    if (['verified', 'rejected'].includes(user.verificationStatus)) {
      return next();
    }
    
    // Check if verification deadline has passed
    const now = new Date();
    if (user.verificationDeadline && now > user.verificationDeadline) {
      // Update user status to EXPIRED
      await User.findByIdAndUpdate(user._id, { 
        verificationStatus: 'expired' 
      });
      return res.status(403).json({ 
        msg: 'Verification period has expired. Please contact support.' 
      });
    }
    
    next();
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
}; 