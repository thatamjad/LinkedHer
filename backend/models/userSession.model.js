const mongoose = require('mongoose');

const UserSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    ipAddress: {
      type: String,
      required: true
    },
    userAgent: {
      type: String,
      required: true
    },
    device: {
      type: String
    },
    browser: {
      type: String
    },
    os: {
      type: String
    },
    location: {
      country: String,
      region: String,
      city: String,
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: '2dsphere'
      }
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'revoked', 'suspicious'],
      default: 'active'
    },
    lastActivity: {
      type: Date,
      default: Date.now
    },
    expiresAt: {
      type: Date,
      required: true
    },
    isMobile: {
      type: Boolean,
      default: false
    },
    isAnonymousMode: {
      type: Boolean,
      default: false
    },
    riskScore: {
      type: Number,
      default: 0 // 0-100, higher means more suspicious
    },
    anomalyDetected: {
      type: Boolean,
      default: false
    },
    anomalyReasons: [{
      type: String,
      enum: [
        'unusual_location', 
        'unusual_device', 
        'rapid_location_change', 
        'unusual_activity_pattern',
        'multiple_failed_attempts',
        'unusual_time',
        'sensitive_data_access'
      ]
    }]
  },
  { timestamps: true }
);

// Method to update session activity
UserSessionSchema.methods.updateActivity = function() {
  this.lastActivity = new Date();
  return this;
};

// Method to mark session as suspicious
UserSessionSchema.methods.markSuspicious = function(reason) {
  this.status = 'suspicious';
  
  if (reason && !this.anomalyReasons.includes(reason)) {
    this.anomalyReasons.push(reason);
    this.anomalyDetected = true;
  }
  
  return this;
};

// Static method to find active sessions for a user
UserSessionSchema.statics.getActiveSessions = function(userId) {
  return this.find({
    userId,
    status: 'active',
    expiresAt: { $gt: new Date() }
  }).sort({ createdAt: -1 });
};

// Expire old sessions
UserSessionSchema.pre('save', function(next) {
  if (this.expiresAt < new Date()) {
    this.status = 'expired';
  }
  next();
});

module.exports = mongoose.model('UserSession', UserSessionSchema); 