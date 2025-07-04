const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    text: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      enum: ['text', 'image', 'file', 'audio', 'system'],
      default: 'text'
    },
    // For file/image messages
    attachments: [{
      url: String,
      name: String,
      size: Number,
      mimeType: String
    }]
  },
  // Message status
  status: {
    type: String,
    enum: ['sending', 'sent', 'delivered', 'read', 'failed'],
    default: 'sent'
  },
  // Read receipts
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Reply/threading
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },
  // Message reactions
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    emoji: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Edit history
  edited: {
    isEdited: {
      type: Boolean,
      default: false
    },
    editedAt: Date,
    originalContent: String
  },
  // Soft delete
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for better performance
messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ 'readBy.user': 1 });
messageSchema.index({ replyTo: 1 });

// Pre-save middleware to update conversation lastActivity
messageSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const Conversation = mongoose.model('Conversation');
      await Conversation.findByIdAndUpdate(this.conversation, {
        lastMessage: this._id,
        lastActivity: new Date()
      });
    } catch (error) {
      console.error('Error updating conversation:', error);
    }
  }
  next();
});

// Instance method to mark as read by user
messageSchema.methods.markAsRead = async function(userId) {
  // Check if already read by this user
  const alreadyRead = this.readBy.some(read => read.user.equals(userId));
  
  if (!alreadyRead) {
    this.readBy.push({
      user: userId,
      readAt: new Date()
    });
    await this.save();
  }
  
  return this;
};

// Instance method to add reaction
messageSchema.methods.addReaction = async function(userId, emoji) {
  // Remove existing reaction from this user
  this.reactions = this.reactions.filter(reaction => !reaction.user.equals(userId));
  
  // Add new reaction
  this.reactions.push({
    user: userId,
    emoji: emoji
  });
  
  await this.save();
  return this;
};

// Instance method to remove reaction
messageSchema.methods.removeReaction = async function(userId) {
  this.reactions = this.reactions.filter(reaction => !reaction.user.equals(userId));
  await this.save();
  return this;
};

// Static method to get unread count for user
messageSchema.statics.getUnreadCount = async function(userId, conversationId = null) {
  const query = {
    sender: { $ne: userId },
    'readBy.user': { $ne: userId },
    isDeleted: false
  };
  
  if (conversationId) {
    query.conversation = conversationId;
  }
  
  return await this.countDocuments(query);
};

module.exports = mongoose.model('Message', messageSchema);
