const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const savedJobSearchSchema = new Schema({
  // Can be linked to either a user or anonymous persona
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  anonymousPersonaId: {
    type: Schema.Types.ObjectId,
    ref: 'AnonymousPersona'
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  filters: {
    keywords: String,
    location: String,
    employmentTypes: [String],
    salaryMin: Number,
    salaryMax: Number,
    skills: [String],
    womenFriendlyScore: Number,
    womenFriendlyFactors: {
      parentalLeave: Boolean,
      flexibleHours: Boolean,
      remoteWork: Boolean,
      equalPayPledge: Boolean,
      diversityInitiatives: Boolean,
      femaleLeadership: Boolean
    },
    categories: [String],
    datePosted: String // "last24Hours", "last7Days", "last30Days", etc.
  },
  lastSearched: {
    type: Date,
    default: Date.now
  },
  isDefaultSearch: {
    type: Boolean,
    default: false
  },
  notificationsEnabled: {
    type: Boolean,
    default: false
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
savedJobSearchSchema.pre('validate', function(next) {
  if (!this.userId && !this.anonymousPersonaId) {
    next(new Error('Either userId or anonymousPersonaId must be provided'));
  } else {
    next();
  }
});

// Create compound index to prevent duplicate saved searches for the same user/persona
savedJobSearchSchema.index({ userId: 1, name: 1 }, { unique: true, partialFilterExpression: { userId: { $exists: true } } });
savedJobSearchSchema.index({ anonymousPersonaId: 1, name: 1 }, { unique: true, partialFilterExpression: { anonymousPersonaId: { $exists: true } } });

const SavedJobSearch = mongoose.model('SavedJobSearch', savedJobSearchSchema);

module.exports = SavedJobSearch; 