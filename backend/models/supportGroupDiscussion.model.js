const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SupportGroupDiscussionSchema = new Schema({
  group: {
    type: Schema.Types.ObjectId,
    ref: 'SupportGroup',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  anonymousPersona: {
    type: Schema.Types.ObjectId,
    ref: 'AnonymousPersona'
  },
  attachments: [{
    type: String, // URL to stored attachment
    contentType: String
  }],
  tags: [{
    type: String,
    trim: true
  }],
  reactions: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    type: {
      type: String,
      enum: ['support', 'thanks', 'insightful', 'relatable', 'helpful']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  replies: [{
    content: {
      type: String,
      required: true
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    isAnonymous: {
      type: Boolean,
      default: false
    },
    anonymousPersona: {
      type: Schema.Types.ObjectId,
      ref: 'AnonymousPersona'
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    reactions: [{
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      type: {
        type: String,
        enum: ['support', 'thanks', 'insightful', 'relatable', 'helpful']
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    isEdited: {
      type: Boolean,
      default: false
    },
    isModeratorFlagged: {
      type: Boolean,
      default: false
    }
  }],
  isModeratorFlagged: {
    type: Boolean,
    default: false
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

SupportGroupDiscussionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('SupportGroupDiscussion', SupportGroupDiscussionSchema); 