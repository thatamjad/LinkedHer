const mongoose = require('mongoose');

// Schema for anonymous comments to avoid identity linkage
const AnonymousCommentSchema = new mongoose.Schema(
  {
    // References the anonymous persona, not the real user
    personaId: {
      type: String,
      required: true,
      index: true,
    },
    // The comment content
    content: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    // Optional - disappearing comments
    disappearsAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Main anonymous post schema
const AnonymousPostSchema = new mongoose.Schema(
  {
    // References the anonymous persona, not the real user
    personaId: {
      type: String,
      required: true,
      index: true,
    },
    // The content of the post
    content: {
      type: String,
      required: function() {
        // Content is required unless it's an image or video post
        return this.mediaUrls.length === 0;
      },
      maxlength: 5000,
    },
    // Media files (images, videos) - will be stripped of metadata
    mediaUrls: [{
      type: String,
      default: [],
    }],
    // The type of post
    postType: {
      type: String,
      enum: ['text', 'image', 'video', 'mixed'],
      default: 'text',
    },
    // For disappearing posts
    disappearsAt: {
      type: Date,
    },
    // Privacy settings for the post
    privacySettings: {
      // If true, the post doesn't appear in general feed, only direct access
      isHidden: {
        type: Boolean,
        default: false,
      },
    },
    // Engagement metrics
    engagement: {
      // Array of persona IDs who liked this post (not user IDs)
      likes: [{
        type: String,
      }],
      // Comments on this post (using the anonymous comment schema)
      comments: [AnonymousCommentSchema],
      // Counter for views
      views: {
        type: Number,
        default: 0,
      },
    },
    // Cryptographic integrity information
    integrity: {
      // Hash of the content for integrity verification
      contentHash: {
        type: String,
      },
      // Signature using the poster's cryptographic identity
      signature: {
        type: String,
      },
    },
    // Flags for moderation
    moderation: {
      isReported: {
        type: Boolean,
        default: false,
      },
      reportCount: {
        type: Number,
        default: 0,
      },
      isFlagged: {
        type: Boolean,
        default: false,
      },
      isRemoved: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to set the post type based on content
AnonymousPostSchema.pre('save', function(next) {
  // Determine post type based on content and media
  if (this.mediaUrls.length > 0) {
    // Check if any media URLs are videos
    const hasVideos = this.mediaUrls.some(url => {
      const extension = url.split('.').pop().toLowerCase();
      return ['mp4', 'webm', 'mov', 'avi'].includes(extension);
    });
    
    // Set post type based on media content
    if (hasVideos) {
      this.postType = this.content ? 'mixed' : 'video';
    } else {
      this.postType = this.content ? 'mixed' : 'image';
    }
  } else {
    this.postType = 'text';
  }
  
  next();
});

// Instance method to add a like from an anonymous persona
AnonymousPostSchema.methods.toggleLike = async function(personaId) {
  const likeIndex = this.engagement.likes.indexOf(personaId);
  
  if (likeIndex > -1) {
    // Unlike if already liked
    this.engagement.likes.splice(likeIndex, 1);
    return { action: 'unliked' };
  } else {
    // Like if not already liked
    this.engagement.likes.push(personaId);
    return { action: 'liked' };
  }
};

// Instance method to add a comment from an anonymous persona
AnonymousPostSchema.methods.addComment = async function(personaId, content, lifespan = 0) {
  const comment = {
    personaId,
    content,
  };
  
  // Set comment expiry if a lifespan is provided
  if (lifespan > 0) {
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + lifespan);
    comment.disappearsAt = expiryDate;
  }
  
  this.engagement.comments.push(comment);
  return this.engagement.comments[this.engagement.comments.length - 1];
};

// Sanitize the response to remove sensitive data
AnonymousPostSchema.methods.toJSON = function() {
  const post = this.toObject();
  
  // Remove integrity information for public view
  delete post.integrity;
  
  // Remove internal moderation data
  if (!post.moderation.isRemoved) {
    delete post.moderation;
  }
  
  return post;
};

module.exports = mongoose.model('AnonymousPost', AnonymousPostSchema); 