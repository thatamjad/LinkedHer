const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MentorshipSchema = new Schema({
  mentor: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mentee: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'rejected', 'cancelled'],
    default: 'pending'
  },
  compatibilityScore: {
    type: Number,
    default: 0
  },
  focusAreas: [{
    type: String,
    required: true,
    enum: [
      'career_advancement', 
      'leadership', 
      'technical_skills', 
      'work_life_balance', 
      'networking',
      'communication',
      'negotiation',
      'industry_specific',
      'entrepreneurship',
      'personal_development'
    ]
  }],
  goals: [{
    description: {
      type: String,
      required: true
    },
    isCompleted: {
      type: Boolean,
      default: false
    },
    completedAt: Date
  }],
  notes: [{
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  meetings: [{
    scheduledFor: {
      type: Date,
      required: true
    },
    duration: {
      type: Number, // in minutes
      default: 30
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
      default: 'scheduled'
    },
    notes: String,
    meetingLink: String
  }],
  feedback: {
    mentorRating: {
      type: Number,
      min: 1,
      max: 5
    },
    menteeRating: {
      type: Number,
      min: 1,
      max: 5
    },
    mentorFeedback: String,
    menteeFeedback: String
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: Date,
  communications: {
    preferredMethod: {
      type: String,
      enum: ['email', 'chat', 'video', 'in_person'],
      default: 'video'
    },
    frequency: {
      type: String,
      enum: ['weekly', 'biweekly', 'monthly', 'as_needed'],
      default: 'biweekly'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Ensure a user can't mentor themselves
MentorshipSchema.pre('validate', function(next) {
  if (this.mentor.toString() === this.mentee.toString()) {
    this.invalidate('mentor', 'A user cannot mentor themselves');
  }
  next();
});

// Create index for faster lookups
MentorshipSchema.index({ mentor: 1, mentee: 1 }, { unique: true });

module.exports = mongoose.model('Mentorship', MentorshipSchema); 