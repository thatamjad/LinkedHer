const mongoose = require('mongoose');
const crypto = require('crypto');

const TwoFactorAuthSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    secret: {
      type: String,
      required: true
    },
    backupCodes: [{
      code: String,
      used: {
        type: Boolean,
        default: false
      }
    }],
    enabled: {
      type: Boolean,
      default: false
    },
    method: {
      type: String,
      enum: ['app', 'sms', 'email'],
      default: 'app'
    },
    phoneNumber: {
      type: String,
      default: null
    },
    lastUsed: {
      type: Date
    }
  },
  { timestamps: true }
);

// Generate backup codes
TwoFactorAuthSchema.methods.generateBackupCodes = function(count = 10) {
  const codes = [];
  for (let i = 0; i < count; i++) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    codes.push({
      code,
      used: false
    });
  }
  this.backupCodes = codes;
  return codes;
};

// Verify a backup code
TwoFactorAuthSchema.methods.verifyBackupCode = function(providedCode) {
  const codeEntry = this.backupCodes.find(
    entry => entry.code === providedCode && !entry.used
  );
  
  if (codeEntry) {
    codeEntry.used = true;
    return true;
  }
  
  return false;
};

module.exports = mongoose.model('TwoFactorAuth', TwoFactorAuthSchema); 