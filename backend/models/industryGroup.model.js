const mongoose = require('mongoose');

const industryGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  industry: {
    type: String,
    required: true
  },
  imageUrl: String,
  coverImage: String,
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['admin', 'moderator', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }],
  resources: [{
    title: String,
    description: String,
    url: String,
    type: {
      type: String,
      enum: ['article', 'video', 'document', 'tool', 'event', 'job', 'other']
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    upvotes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    tags: [String]
  }],
  events: [{
    title: String,
    description: String,
    date: Date,
    location: {
      virtual: Boolean,
      platform: String,
      link: String,
      address: String
    },
    attendees: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      status: {
        type: String,
        enum: ['going', 'interested', 'not_going'],
        default: 'interested'
      }
    }],
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  guidelines: {
    type: String,
    default: 'Be respectful and supportive of other members. Share resources that can help women in this industry grow professionally.'
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const IndustryGroup = mongoose.model('IndustryGroup', industryGroupSchema);

module.exports = IndustryGroup; 