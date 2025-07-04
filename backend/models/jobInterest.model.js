const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const jobInterestSchema = new Schema({
  // Can be linked to either a user or anonymous persona
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  anonymousPersonaId: {
    type: Schema.Types.ObjectId,
    ref: 'AnonymousPersona'
  },
  jobId: {
    type: Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  interestType: {
    type: String,
    enum: ['saved', 'viewed', 'applied', 'shared'],
    required: true
  },
  viewed: {
    count: {
      type: Number,
      default: 1
    },
    lastViewed: {
      type: Date,
      default: Date.now
    }
  },
  saved: {
    isSaved: {
      type: Boolean,
      default: false
    },
    savedAt: Date
  },
  applied: {
    hasApplied: {
      type: Boolean,
      default: false
    },
    appliedAt: Date,
    applicationMethod: {
      type: String,
      enum: ['direct', 'external', 'email']
    },
    notes: String
  },
  shared: {
    count: {
      type: Number,
      default: 0
    },
    lastShared: Date,
    platforms: [String] // e.g., 'email', 'twitter', 'facebook'
  },
  metadata: {
    deviceType: String,
    browser: String,
    sessionDuration: Number // in seconds
  },
  // Anonymized data for analytics while preserving privacy
  anonymousData: {
    skillsMatch: Number, // percentage match with the job
    experienceLevel: String,
    industryInterest: String,
    locationPreference: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Ensure either userId or anonymousPersonaId is provided
jobInterestSchema.pre('validate', function(next) {
  if (!this.userId && !this.anonymousPersonaId) {
    next(new Error('Either userId or anonymousPersonaId must be provided'));
  } else {
    next();
  }
});

// Create compound index to prevent duplicate entries and for efficient queries
jobInterestSchema.index({ userId: 1, jobId: 1 }, { unique: true, partialFilterExpression: { userId: { $exists: true } } });
jobInterestSchema.index({ anonymousPersonaId: 1, jobId: 1 }, { unique: true, partialFilterExpression: { anonymousPersonaId: { $exists: true } } });

const JobInterest = mongoose.model('JobInterest', jobInterestSchema);

module.exports = JobInterest; 