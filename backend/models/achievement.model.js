const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AchievementSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
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
    enum: ['career', 'education', 'project', 'personal', 'community', 'other'],
    required: true
  },
  achievedAt: {
    type: Date,
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedBy: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: {
      type: Date,
      default: Date.now
    },
    relationship: String
  }],
  privacy: {
    type: String,
    enum: ['public', 'connections', 'private'],
    default: 'public'
  },
  mediaUrls: [{
    type: String
  }],
  skills: [{
    type: String,
    trim: true
  }],
  location: String,
  organization: String,
  celebrationCount: {
    type: Number,
    default: 0
  },
  celebrations: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    content: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    isEdited: {
      type: Boolean,
      default: false
    }
  }],
  isHighlighted: {
    type: Boolean,
    default: false
  },
  isSharedOnFeed: {
    type: Boolean,
    default: false
  },
  relatedProjects: [{
    type: Schema.Types.ObjectId,
    ref: 'CollaborativeProject'
  }],
  relatedMentors: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

AchievementSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Achievement', AchievementSchema); 