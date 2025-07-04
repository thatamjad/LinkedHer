const mongoose = require('mongoose');

const ProfessionalPostSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: { 
    type: String, 
    required: true,
    maxlength: 3000
  },
  imageUrl: { 
    type: String 
  },
  postType: {
    type: String,
    enum: ['TEXT', 'IMAGE'],
    default: 'TEXT'
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: { 
      type: String, 
      required: true,
      maxlength: 500
    },
    createdAt: { 
      type: Date, 
      default: Date.now 
    }
  }],
  visibility: {
    type: String,
    enum: ['PUBLIC', 'CONNECTIONS'],
    default: 'PUBLIC'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true 
});

// Virtual for like count
ProfessionalPostSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for comment count
ProfessionalPostSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Ensure virtual fields are serialized
ProfessionalPostSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('ProfessionalPost', ProfessionalPostSchema);
