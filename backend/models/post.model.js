const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    text: {
      type: String,
      trim: true,
      maxlength: [5000, 'Post cannot exceed 5000 characters']
    },
    formatting: {
      type: Object,
      default: {}
    }
  },
  media: [{
    type: {
      type: String,
      enum: ['image', 'video', 'document'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    thumbnail: {
      type: String
    },
    altText: {
      type: String,
      trim: true
    },
    size: {
      type: Number
    },
    dimensions: {
      width: Number,
      height: Number
    }
  }],
  visibility: {
    type: String,
    enum: ['public', 'connections', 'private'],
    default: 'public'
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
    comments: {
      count: {
        type: Number,
        default: 0
      }
    },
    saves: {
      count: {
        type: Number,
        default: 0
      },
      users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }]
    },
    shares: {
      count: {
        type: Number,
        default: 0
      }
    }
  },
  tags: [{
    type: String,
    trim: true
  }],
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
    media: [{
      type: String,
      url: String,
      thumbnail: String,
      altText: String
    }],
    editedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

// Create an index for efficient feed querying
PostSchema.index({ user: 1, createdAt: -1 });
PostSchema.index({ visibility: 1, createdAt: -1 });

module.exports = mongoose.model('Post', PostSchema); 