const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MentalHealthResourceSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['counseling', 'crisis_support', 'stress_management', 
           'burnout_prevention', 'anxiety', 'depression', 'work_life_balance', 
           'workplace_trauma', 'general_wellness', 'meditation', 'other']
  },
  resourceType: {
    type: String,
    required: true,
    enum: ['article', 'video', 'podcast', 'guide', 'app', 'service', 
           'hotline', 'community', 'expert', 'interactive_tool']
  },
  url: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String
  },
  tags: [{
    type: String,
    trim: true
  }],
  isAnonymousAccessible: {
    type: Boolean,
    default: true
  },
  contactInfo: {
    phone: String,
    email: String,
    hours: String
  },
  costType: {
    type: String,
    enum: ['free', 'freemium', 'paid', 'insurance', 'variable'],
    default: 'free'
  },
  averageRating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  reviews: [{
    user: {
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
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    comment: String,
    helpfulCount: {
      type: Number,
      default: 0
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  location: {
    country: String,
    region: String,
    isGlobal: {
      type: Boolean,
      default: true
    }
  },
  addedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

MentalHealthResourceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('MentalHealthResource', MentalHealthResourceSchema); 