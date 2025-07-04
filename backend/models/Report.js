const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    // Common fields
    reportType: {
      type: String,
      required: true,
      enum: ['harassment', 'hate_speech', 'misinformation', 'inappropriate_content', 'impersonation', 'other']
    },
    contentType: {
      type: String,
      required: true,
      enum: ['post', 'comment', 'profile', 'message']
    },
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    description: {
      type: String,
      required: true,
      maxlength: 1000
    },
    status: {
      type: String,
      enum: ['pending', 'under_review', 'resolved', 'dismissed'],
      default: 'pending'
    },
    evidence: {
      screenshots: [String],
      links: [String],
      additionalInfo: String
    },
    
    // Professional report fields
    reporterUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: function() { return !this.isAnonymous; }
    },
    reportedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: function() { return !this.isAnonymous; }
    },
    
    // Anonymous report fields
    isAnonymous: {
      type: Boolean,
      default: false
    },
    reporterPersonaHash: {
      type: String,
      required: function() { return this.isAnonymous; }
    },
    reportedContentHash: {
      type: String,
      required: function() { return this.isAnonymous; }
    },
    evidenceHash: String,
    
    // Moderation fields
    moderatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    moderationNotes: String,
    resolutionAction: {
      type: String,
      enum: ['warning', 'content_removal', 'temporary_ban', 'permanent_ban', 'none'],
    },
    resolutionDate: Date,
    
    // AI moderation fields
    aiModerated: {
      type: Boolean,
      default: false
    },
    aiConfidenceScore: {
      type: Number,
      min: 0,
      max: 1
    },
    aiCategories: [String],
    
    // Severity score (calculated field)
    severityScore: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

// Index for efficient queries
reportSchema.index({ status: 1, createdAt: 1 });
reportSchema.index({ reporterUserId: 1 }, { sparse: true });
reportSchema.index({ reportedUserId: 1 }, { sparse: true });
reportSchema.index({ reporterPersonaHash: 1 }, { sparse: true });

// Pre-save hook to calculate severity score based on report type and AI analysis
reportSchema.pre('save', function(next) {
  // Calculate severity score based on report type and other factors
  // This is a placeholder implementation
  const baseScore = {
    'harassment': 0.7,
    'hate_speech': 0.9,
    'misinformation': 0.6,
    'inappropriate_content': 0.5,
    'impersonation': 0.8,
    'other': 0.4
  }[this.reportType] || 0.4;
  
  // If AI has analyzed it, incorporate that score
  if (this.aiConfidenceScore) {
    this.severityScore = (baseScore + this.aiConfidenceScore) / 2;
  } else {
    this.severityScore = baseScore;
  }
  
  next();
});

const Report = mongoose.model('Report', reportSchema);

module.exports = Report; 