const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SupportGroupSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['career_development', 'workplace_challenges', 'work_life_balance', 
           'leadership', 'discrimination', 'harassment', 'mental_health', 
           'entrepreneurship', 'negotiation', 'other']
  },
  isModerated: {
    type: Boolean,
    default: true
  },
  moderators: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  members: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  rules: [{
    title: String,
    description: String
  }],
  isPrivate: {
    type: Boolean,
    default: false
  },
  joinRequests: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    requestedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    }
  }],
  topics: [{
    type: String,
    trim: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  bannerImage: {
    type: String
  },
  colorScheme: {
    primary: String,
    secondary: String
  },
  resourceLinks: [{
    title: String,
    url: String,
    description: String
  }]
});

SupportGroupSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('SupportGroup', SupportGroupSchema); 