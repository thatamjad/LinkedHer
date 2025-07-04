const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    text: {
      type: String,
      required: [true, 'Comment content is required'],
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters']
    },
    formatting: {
      type: Object,
      default: {}
    }
  },
  media: [{
    type: {
      type: String,
      enum: ['image', 'gif'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    altText: {
      type: String,
      trim: true
    }
  }],
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  },
  engagement: {
    likes: {
      count: {
        type: Number,
        default: 0
      },
      users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }]
    },
    replies: {
      count: {
        type: Number,
        default: 0
      }
    }
  },
  mentions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    startIndex: Number,
    endIndex: Number
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  editHistory: [{
    content: {
      text: String,
      formatting: Object
    },
    editedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isDeleted: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Create indexes for efficient comment retrieval
CommentSchema.index({ post: 1, createdAt: -1 });
CommentSchema.index({ parentComment: 1, createdAt: 1 });

module.exports = mongoose.model('Comment', CommentSchema); 