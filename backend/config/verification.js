/**
 * Verification settings for Linker
 */
module.exports = {
  // Days until verification expires after initiation
  verificationWindow: 7,
  
  // Scores needed for each verification tier
  scores: {
    partial: 30, // Min score to access basic features
    full: 70,    // Min score to access all features
  },
  
  // Contribution of each verification method to total score
  methodScores: {
    linkedIn: 30,
    professionalEmail: 30,
    governmentId: 40,
  },
  
  // LinkedIn OAuth settings
  linkedIn: {
    redirectUri: '/api/verification/linkedin/callback',
    scope: 'r_emailaddress r_liteprofile',
  },
  
  // Email verification settings
  email: {
    tokenExpiryHours: 24,
    freeEmailDomains: [
      'gmail.com', 
      'yahoo.com', 
      'hotmail.com', 
      'outlook.com', 
      'aol.com', 
      'icloud.com',
      'protonmail.com',
      'mail.com',
      'zoho.com',
      'yandex.com',
      'gmx.com'
    ]
  }
}; 