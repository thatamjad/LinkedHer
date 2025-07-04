const TwoFactorAuth = require('../models/twoFactorAuth.model');
const User = require('../models/user.model');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const asyncHandler = require('express-async-handler');

/**
 * POST /api/auth/2fa/setup
 * Generate a secret and QR code for the authenticated user
 */
exports.setupTwoFactorAuth = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    // If already enabled, return error
    if (user.security?.twoFactorEnabled) {
      return res.status(400).json({ msg: 'Two-factor authentication already enabled' });
    }

    // Create/retrieve 2FA record
    let record = await TwoFactorAuth.findOne({ userId: user._id });
    if (!record) {
      record = new TwoFactorAuth({ userId: user._id });
    }

    // Generate new secret and backup codes each time to avoid reuse
    const secret = speakeasy.generateSecret({ name: `Linker (${user.email})` });
    record.secret = secret.base32;
    record.generateBackupCodes(5); // create 5 backup codes
    await record.save();

    // QR Code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    res.json({ qrCodeUrl, backupCodes: record.backupCodes.map(b => b.code) });
  } catch (err) {
    console.error('2FA setup error:', err);
    res.status(500).json({ msg: 'Server error setting up 2FA' });
  }
};

/**
 * POST /api/auth/2fa/verify
 * Verify the provided TOTP token and enable 2FA
 */
exports.verifyTwoFactorAuth = async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ msg: 'Token required' });

  try {
    const record = await TwoFactorAuth.findOne({ userId: req.user._id });
    if (!record) return res.status(400).json({ msg: '2FA not set up' });

    const verified = speakeasy.totp.verify({
      secret: record.secret,
      encoding: 'base32',
      token,
      window: 1
    });
    if (!verified) return res.status(400).json({ msg: 'Invalid token' });

    // enable on user
    await User.updateOne({ _id: req.user._id }, { 'security.twoFactorEnabled': true });
    record.enabled = true;
    await record.save();

    res.json({ msg: 'Two-factor authentication enabled' });
  } catch (err) {
    console.error('2FA verify error:', err);
    res.status(500).json({ msg: 'Server error verifying 2FA' });
  }
};

/**
 * POST /api/auth/2fa/disable
 * Disable 2FA for the authenticated user
 */
exports.disableTwoFactorAuth = async (req, res) => {
  try {
    await User.updateOne({ _id: req.user._id }, { 'security.twoFactorEnabled': false });
    await TwoFactorAuth.deleteOne({ userId: req.user._id });
    res.json({ msg: 'Two-factor authentication disabled' });
  } catch (err) {
    console.error('2FA disable error:', err);
    res.status(500).json({ msg: 'Server error disabling 2FA' });
  }
};

// Verify 2FA during login
exports.verify2FALogin = asyncHandler(async (req, res) => {
  const { token, userId, backupCode } = req.body;
  
  if (!userId) {
    return res.status(400).json({ 
      success: false, 
      message: 'User ID is required' 
    });
  }
  
  if (!token && !backupCode) {
    return res.status(400).json({ 
      success: false, 
      message: 'Verification token or backup code is required' 
    });
  }
  
  // Get 2FA record
  const twoFactorAuth = await TwoFactorAuth.findOne({ userId });
  
  if (!twoFactorAuth || !twoFactorAuth.enabled) {
    return res.status(404).json({ 
      success: false, 
      message: 'Two-factor authentication not enabled for this account' 
    });
  }
  
  let verified = false;
  
  // Check if using backup code
  if (backupCode) {
    verified = twoFactorAuth.verifyBackupCode(backupCode);
  } else {
    // Verify token
    verified = speakeasy.totp.verify({
      secret: twoFactorAuth.secret,
      encoding: 'base32',
      token: token.toString(),
      window: 1
    });
  }
  
  if (!verified) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid verification code or backup code' 
    });
  }
  
  // Update last used timestamp
  twoFactorAuth.lastUsed = new Date();
  await twoFactorAuth.save();
  
  res.status(200).json({
    success: true,
    message: 'Two-factor authentication verified successfully'
  });
});

// Generate new backup codes
exports.generateBackupCodes = asyncHandler(async (req, res) => {
  const { token } = req.body;
  const userId = req.user.id;
  
  if (!token) {
    return res.status(400).json({ 
      success: false, 
      message: 'Verification token is required' 
    });
  }
  
  // Get 2FA record
  const twoFactorAuth = await TwoFactorAuth.findOne({ userId });
  
  if (!twoFactorAuth || !twoFactorAuth.enabled) {
    return res.status(404).json({ 
      success: false, 
      message: 'Two-factor authentication not enabled for this account' 
    });
  }
  
  // Verify token
  const verified = speakeasy.totp.verify({
    secret: twoFactorAuth.secret,
    encoding: 'base32',
    token: token.toString(),
    window: 1
  });
  
  if (!verified) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid verification code' 
    });
  }
  
  // Generate new backup codes
  const backupCodes = twoFactorAuth.generateBackupCodes();
  await twoFactorAuth.save();
  
  res.status(200).json({
    success: true,
    data: {
      backupCodes: backupCodes.map(code => code.code)
    },
    message: 'New backup codes generated successfully'
  });
}); 