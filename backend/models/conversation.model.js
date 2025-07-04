const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  type: {
    type: String,
    enum: ['direct', 'group'],
    default: 'direct'
  },
  title: {
    type: String,
    default: null // Only used for group conversations
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // For group conversations
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Privacy settings
  settings: {
    allowNewMembers: {
      type: Boolean,
      default: true
    },
    messageRetention: {
      type: Number,
      default: 365 // days
    }
  }
}, {
  timestamps: true
});

// Indexes for better performance
conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastActivity: -1 });
conversationSchema.index({ type: 1 });

// Validate participants
conversationSchema.pre('save', function(next) {
  if (this.type === 'direct' && this.participants.length !== 2) {
    return next(new Error('Direct conversations must have exactly 2 participants'));
  }
  if (this.type === 'group' && this.participants.length < 2) {
    return next(new Error('Group conversations must have at least 2 participants'));
  }
  next();
});

// Static method to find or create direct conversation
conversationSchema.statics.findOrCreateDirectConversation = async function(userId1, userId2) {
  // Check if conversation already exists
  let conversation = await this.findOne({
    type: 'direct',
    participants: { $all: [userId1, userId2], $size: 2 }
  }).populate('participants', 'firstName lastName email profileImage');

  if (!conversation) {
    // Create new conversation
    conversation = await this.create({
      participants: [userId1, userId2],
      type: 'direct',
      createdBy: userId1
    });
    
    // Populate the newly created conversation
    conversation = await this.findById(conversation._id)
      .populate('participants', 'firstName lastName email profileImage');
  }

  return conversation;
};

// Instance method to add participant
conversationSchema.methods.addParticipant = async function(userId) {
  if (!this.participants.includes(userId)) {
    this.participants.push(userId);
    await this.save();
  }
  return this;
};

// Instance method to remove participant
conversationSchema.methods.removeParticipant = async function(userId) {
  this.participants = this.participants.filter(id => !id.equals(userId));
  await this.save();
  return this;
};

module.exports = mongoose.model('Conversation', conversationSchema);
