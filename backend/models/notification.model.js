const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'like_post', 
      'comment_post', 
      'reply_comment', 
      'mention', 
      'save_post', 
      'share_post', 
      'profile_view', 
      'connection_request', 
      'connection_accepted',
      'skill_endorsement'
    ],
    required: true
  },
  reference: {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post'
    },
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment'
    },
    profile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profile'
    }
  },
  content: {
    title: {
      type: String,
      required: true
    },
    body: {
      type: String
    },
    image: {
      type: String
    }
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  relevance: {
    type: Number,
    default: 1
  }
}, { timestamps: true });

// Create indexes for efficient notification retrieval
NotificationSchema.index({ recipient: 1, createdAt: -1 });
NotificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema); 