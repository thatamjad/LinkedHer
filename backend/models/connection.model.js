const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'blocked'],
    default: 'pending'
  },
  message: {
    type: String,
    maxlength: 500,
    trim: true
  },
  connectionDate: {
    type: Date,
    default: null
  },
  mutualConnections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  metadata: {
    connectionSource: {
      type: String,
      enum: ['search', 'suggestion', 'mutual_friend', 'group', 'event', 'direct'],
      default: 'direct'
    },
    industry: String,
    location: String,
    commonInterests: [String]
  }
}, {
  timestamps: true
});

// Indexes for better query performance
connectionSchema.index({ requester: 1, recipient: 1 }, { unique: true });
connectionSchema.index({ recipient: 1, status: 1 });
connectionSchema.index({ requester: 1, status: 1 });
connectionSchema.index({ connectionDate: -1 });

// Virtual for checking if connection is mutual
connectionSchema.virtual('isMutual').get(function() {
  return this.status === 'accepted';
});

// Instance methods
connectionSchema.methods.accept = function() {
  this.status = 'accepted';
  this.connectionDate = new Date();
  return this.save();
};

connectionSchema.methods.reject = function() {
  this.status = 'rejected';
  return this.save();
};

connectionSchema.methods.block = function() {
  this.status = 'blocked';
  return this.save();
};

// Static methods
connectionSchema.statics.findConnectionBetween = function(userId1, userId2) {
  return this.findOne({
    $or: [
      { requester: userId1, recipient: userId2 },
      { requester: userId2, recipient: userId1 }
    ]
  });
};

connectionSchema.statics.getAcceptedConnections = function(userId) {
  return this.find({
    $and: [
      {
        $or: [
          { requester: userId },
          { recipient: userId }
        ]
      },
      { status: 'accepted' }
    ]
  }).populate('requester recipient', 'firstName lastName email profilePicture');
};

connectionSchema.statics.getPendingRequests = function(userId) {
  return this.find({
    recipient: userId,
    status: 'pending'
  }).populate('requester', 'firstName lastName email profilePicture');
};

connectionSchema.statics.getSentRequests = function(userId) {
  return this.find({
    requester: userId,
    status: 'pending'
  }).populate('recipient', 'firstName lastName email profilePicture');
};

// Pre-save middleware
connectionSchema.pre('save', function(next) {
  // Prevent self-connections
  if (this.requester.toString() === this.recipient.toString()) {
    const error = new Error('Users cannot connect to themselves');
    error.statusCode = 400;
    return next(error);
  }
  next();
});

// Export the model
module.exports = mongoose.model('Connection', connectionSchema);
