const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const bcrypt = require('bcrypt');
const verificationConfig = require('../config/verification');

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long']
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true
    },
    profileImage: {
      type: String,
      default: ''
    },
    bio: {
      type: String,
      default: '',
      maxlength: [500, 'Bio cannot exceed 500 characters']
    },
    // Verification fields
    verificationStatus: {
      type: String,
      enum: ['unverified', 'pending', 'verified', 'expired', 'rejected'],
      default: 'unverified'
    },    verificationInitiatedAt: {
      type: Date
    },
    verificationExpiresAt: {
      type: Date
    },
    verificationDeadline: {
      type: Date
    },
    verificationMethods: {
      linkedIn: {
        verified: { type: Boolean, default: false },
        data: {
          profileId: String,
          firstName: String,
          lastName: String,
          email: String,
          verifiedAt: Date
        }
      },
      professionalEmail: {
        verified: { type: Boolean, default: false },
        email: String,
        token: String,
        tokenExpiresAt: Date,
        verifiedAt: Date
      },
      governmentId: {
        verified: { type: Boolean, default: false },
        type: String,
        documentPath: String,
        uploadedAt: Date,
        verifiedAt: Date,
        status: {
          type: String,
          enum: ['pending_upload', 'pending_review', 'approved', 'rejected'],
          default: 'pending_upload'
        }
      }
    },
    verificationScore: {
      type: Number,
      default: 0
    },
    // Account status
    isActive: {
      type: Boolean,
      default: true
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'moderator'],
      default: 'user'
    },
    refreshToken: {
      type: String
    },
    // Enhanced security fields
    security: {
      // Two-factor authentication status
      twoFactorEnabled: {
        type: Boolean,
        default: false
      },
      // Password history to prevent reusing old passwords
      passwordHistory: [{
        hash: String,
        changedAt: Date
      }],
      // Last password change
      lastPasswordChange: {
        type: Date
      },
      // Failed login attempts tracking
      failedLoginAttempts: {
        count: {
          type: Number,
          default: 0
        },
        lastFailedAt: {
          type: Date
        },
        lockUntil: {
          type: Date
        }
      },
      // Known devices
      knownDevices: [{
        deviceId: String,
        deviceName: String,
        lastUsed: Date,
        trusted: Boolean
      }],
      // Security questions for account recovery
      securityQuestions: [{
        question: String,
        answerHash: String,
        setAt: Date
      }],
      // Account recovery email
      recoveryEmail: {
        email: String,
        verified: {
          type: Boolean,
          default: false
        }
      },
      // Notification preferences for security events
      securityNotifications: {
        email: {
          type: Boolean,
          default: true
        },
        inApp: {
          type: Boolean,
          default: true
        },
        loginAlerts: {
          type: Boolean,
          default: true
        },
        passwordChangeAlerts: {
          type: Boolean,
          default: true
        },
        securitySettingChangeAlerts: {
          type: Boolean,
          default: true
        }
      }
    }
  },
  {
    timestamps: true,
  }
);

// Apply the uniqueValidator plugin
UserSchema.plugin(uniqueValidator, { message: '{PATH} already exists' });

// Hash password before saving
UserSchema.pre('save', async function (next) {
  // Set verification deadline on new user creation
  if (this.isNew) {
    this.verificationDeadline = new Date(Date.now() + verificationConfig.verificationWindow * 24 * 60 * 60 * 1000);
  }

  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(this.password, salt);
    
    // Store old password in history before updating
    if (this.password && this.isModified('password') && this.password !== hash) {
      if (!this.security) {
        this.security = {};
      }
      if (!this.security.passwordHistory) {
        this.security.passwordHistory = [];
      }
      
      // Limit history to last 5 passwords
      if (this.security.passwordHistory.length >= 5) {
        this.security.passwordHistory.shift();
      }
      
      if (this.password) {
        this.security.passwordHistory.push({
          hash: this.password,
          changedAt: new Date()
        });
      }
      
      this.security.lastPasswordChange = new Date();
    }
    
    this.password = hash;
    return next();
  } catch (error) {
    return next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

// Method to calculate the total verification score
UserSchema.methods.updateVerificationScore = function() {
  let score = 0;
  if (this.verificationMethods.linkedIn.verified) {
    score += verificationConfig.methodScores.linkedIn;
  }
  if (this.verificationMethods.professionalEmail.verified) {
    score += verificationConfig.methodScores.professionalEmail;
  }
  if (this.verificationMethods.governmentId.status === 'approved') {
    score += verificationConfig.methodScores.governmentId;
  }
  this.verificationScore = score;

  if (this.verificationScore >= verificationConfig.scores.full) {
    this.verificationStatus = 'verified';
  } else if (this.verificationStatus === 'unverified' && this.verificationScore > 0) {
    this.verificationStatus = 'pending';
  }
};

// Method to set verification initiation date and expiry
UserSchema.methods.calculateVerificationExpiry = function() {
  this.verificationInitiatedAt = new Date();
  // The verificationDeadline is already set on user creation, this marks the start
  // This can be used to show a countdown from when they first started a verification action
  this.verificationExpiresAt = new Date(this.verificationInitiatedAt.getTime() + verificationConfig.verificationWindow * 24 * 60 * 60 * 1000);
};

// Method to check if account is locked
UserSchema.methods.isAccountLocked = function() {
  if (!this.security?.failedLoginAttempts?.lockUntil) {
    return false;
  }
  
  return new Date() < this.security.failedLoginAttempts.lockUntil;
};

// Method to increment failed login attempts
UserSchema.methods.registerFailedLogin = function() {
  if (!this.security) {
    this.security = {};
  }
  
  if (!this.security.failedLoginAttempts) {
    this.security.failedLoginAttempts = {
      count: 0
    };
  }
  
  this.security.failedLoginAttempts.count += 1;
  this.security.failedLoginAttempts.lastFailedAt = new Date();
  
  // Lock account after 5 failed attempts
  if (this.security.failedLoginAttempts.count >= 5) {
    const lockTime = new Date();
    // Lock for 30 minutes
    lockTime.setMinutes(lockTime.getMinutes() + 30);
    this.security.failedLoginAttempts.lockUntil = lockTime;
  }
  
  return this;
};

// Method to reset failed login attempts
UserSchema.methods.resetFailedLoginAttempts = function() {
  if (this.security && this.security.failedLoginAttempts) {
    this.security.failedLoginAttempts.count = 0;
    this.security.failedLoginAttempts.lockUntil = null;
  }
  
  return this;
};

// Method to register a known device
UserSchema.methods.registerDevice = function(deviceId, deviceName) {
  if (!this.security) {
    this.security = {};
  }
  
  if (!this.security.knownDevices) {
    this.security.knownDevices = [];
  }
  
  // Check if device already exists
  const existingDevice = this.security.knownDevices.find(d => d.deviceId === deviceId);
  
  if (existingDevice) {
    existingDevice.lastUsed = new Date();
  } else {
    this.security.knownDevices.push({
      deviceId,
      deviceName: deviceName || 'Unknown Device',
      lastUsed: new Date(),
      trusted: false
    });
  }
  
  return this;
};

// Method to check if a device is trusted
UserSchema.methods.isDeviceTrusted = function(deviceId) {
  if (!this.security?.knownDevices || !deviceId) {
    return false;
  }
  
  const device = this.security.knownDevices.find(d => d.deviceId === deviceId);
  return device ? device.trusted : false;
};

// Check if verification has expired
UserSchema.methods.checkVerificationExpiry = function() {
  if (!this.verificationDeadline) return false;
  
  const now = new Date();
  const deadline = new Date(this.verificationDeadline);
  
  // If verification is already complete, it doesn't expire
  if (this.verificationStatus === 'verified') return false;
  
  // If deadline has passed and not verified, mark as expired
  if (now > deadline && this.verificationStatus !== 'verified') {
    this.verificationStatus = 'expired';
    return true;
  }
  
  return false;
};

// Format user data for client (remove sensitive information)
UserSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.refreshToken;
  
  // Remove sensitive verification data
  if (user.verificationMethods?.professionalEmail?.token) {
    delete user.verificationMethods.professionalEmail.token;
    delete user.verificationMethods.professionalEmail.tokenExpiresAt;
  }
  
  if (user.verificationMethods?.governmentId?.documentPath) {
    delete user.verificationMethods.governmentId.documentPath;
  }
  
  // Remove sensitive security data
  if (user.security) {
    delete user.security.passwordHistory;
    
    if (user.security.securityQuestions) {
      user.security.securityQuestions.forEach(q => {
        delete q.answerHash;
      });
    }
  }
  
  return user;
};

module.exports = mongoose.model('User', UserSchema); 