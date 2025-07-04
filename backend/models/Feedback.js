/**
 * Feedback Model
 * Stores user feedback and analytics data
 */
const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  email: {
    type: String,
    validate: {
      validator: function(v) {
        return this.user ? true : /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: props => 'Please provide a valid email address if not logged in'
    }
  },
  rating: {
    type: Number,
    required: [true, 'Please provide a rating'],
    min: 1,
    max: 5
  },
  type: {
    type: String,
    required: [true, 'Please provide feedback type'],
    enum: ['general', 'bug', 'feature', 'content', 'ux']
  },
  message: {
    type: String,
    required: [true, 'Please provide feedback message'],
    trim: true
  },
  sentiment: {
    type: String,
    enum: ['positive', 'somewhat_positive', 'neutral', 'mixed', 'somewhat_negative', 'negative'],
    default: 'neutral'
  },
  source: {
    type: String,
    default: 'unknown'
  },
  metadata: {
    type: Object,
    default: {}
  },
  categories: {
    type: [String],
    default: ['general']
  },
  urgency: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  status: {
    type: String,
    enum: ['new', 'under_review', 'planned', 'in_progress', 'completed', 'declined'],
    default: 'new'
  },
  isResolved: {
    type: Boolean,
    default: false
  },
  adminResponse: {
    type: String,
    default: ''
  },
  respondedAt: {
    type: Date,
    default: null
  },
  responseTime: {
    type: Number,
    default: null
  }
}, {
  timestamps: true
});

// Calculate response time when admin responds
FeedbackSchema.pre('save', function(next) {
  if (this.adminResponse && this.respondedAt && !this.responseTime) {
    this.responseTime = (this.respondedAt - this.createdAt) / (1000 * 60 * 60); // Hours
  }
  next();
});

// Create indexes for efficient querying
FeedbackSchema.index({ createdAt: -1 });
FeedbackSchema.index({ user: 1, createdAt: -1 });
FeedbackSchema.index({ type: 1, createdAt: -1 });
FeedbackSchema.index({ rating: 1 });
FeedbackSchema.index({ urgency: -1 });
FeedbackSchema.index({ status: 1 });
FeedbackSchema.index({ sentiment: 1 });

module.exports = mongoose.model('Feedback', FeedbackSchema); 