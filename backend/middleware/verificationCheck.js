const User = require('../models/user.model');
const verificationConfig = require('../config/verification');

/**
 * Middleware to check if user is verified
 * @param {boolean} requireFull - Whether to require full verification or partial
 */
module.exports.checkVerification = (requireFull = true) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.userId);
      
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      // Check if verification has expired
      if (user.verificationDeadline && !user.checkVerificationExpiry()) {
        // Update verification status to reflect expiry if needed
        await user.save();
      }
      
      // Calculate verification score
      let score = 0;
      if (user.verificationMethods.linkedIn.verified) score += verificationConfig.methodScores.linkedIn;
      if (user.verificationMethods.professionalEmail.verified) score += verificationConfig.methodScores.professionalEmail;
      if (user.verificationMethods.governmentId.verified) score += verificationConfig.methodScores.governmentId;
      
      // Check required verification level
      if (requireFull && score < verificationConfig.scores.full) {
        return res.status(403).json({
          message: 'Full verification required for this action',
          verificationStatus: user.verificationStatus,
          verificationScore: score,
          requiredScore: verificationConfig.scores.full
        });
      } else if (!requireFull && score < verificationConfig.scores.partial) {
        return res.status(403).json({
          message: 'Partial verification required for this action',
          verificationStatus: user.verificationStatus,
          verificationScore: score,
          requiredScore: verificationConfig.scores.partial
        });
      }
      
      // If verification has expired
      if (user.verificationStatus === 'expired') {
        return res.status(403).json({
          message: 'Your verification period has expired. Please contact support for assistance.',
          verificationStatus: 'expired'
        });
      }
      
      next();
    } catch (error) {
      console.error('Verification check error:', error);
      res.status(500).json({ message: 'Server Error' });
    }
  };
}; 