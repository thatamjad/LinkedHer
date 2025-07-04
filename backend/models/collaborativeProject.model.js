const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CollaborativeProjectSchema = new Schema({
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
    enum: ['startup', 'social_enterprise', 'nonprofit', 'research', 
           'technology', 'creative', 'community_initiative', 'other']
  },
  founder: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      required: true,
      enum: ['co_founder', 'team_member', 'advisor', 'investor', 'mentor']
    },
    skills: [{
      type: String
    }],
    joinedAt: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    },
    permissions: {
      canEdit: {
        type: Boolean,
        default: false
      },
      canInvite: {
        type: Boolean,
        default: false
      },
      canManageResources: {
        type: Boolean,
        default: false
      }
    }
  }],
  skillsNeeded: [{
    skill: String,
    description: String,
    isFilled: {
      type: Boolean,
      default: false
    }
  }],
  stage: {
    type: String,
    enum: ['idea', 'concept', 'prototype', 'validation', 'scaling', 'established'],
    default: 'idea'
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'on_hold', 'seeking_members', 'seeking_funding'],
    default: 'active'
  },
  tags: [{
    type: String,
    trim: true
  }],
  isPrivate: {
    type: Boolean,
    default: false
  },
  applicationProcess: {
    isOpen: {
      type: Boolean,
      default: true
    },
    questions: [{
      question: String,
      isRequired: Boolean
    }]
  },
  applications: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    appliedFor: {
      type: String
    },
    answers: [{
      question: String,
      answer: String
    }],
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'waitlisted'],
      default: 'pending'
    },
    appliedAt: {
      type: Date,
      default: Date.now
    }
  }],
  resources: [{
    title: String,
    description: String,
    url: String,
    type: {
      type: String,
      enum: ['document', 'image', 'video', 'link', 'file']
    },
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  milestones: [{
    title: String,
    description: String,
    dueDate: Date,
    isCompleted: {
      type: Boolean,
      default: false
    },
    completedAt: Date
  }],
  meetings: [{
    title: String,
    description: String,
    date: Date,
    duration: Number, // minutes
    location: {
      type: String,
      enum: ['in_person', 'video_call', 'phone_call'],
      default: 'video_call'
    },
    meetingLink: String,
    attendees: [{
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      status: {
        type: String,
        enum: ['attending', 'tentative', 'not_attending'],
        default: 'tentative'
      }
    }]
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

CollaborativeProjectSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('CollaborativeProject', CollaborativeProjectSchema); 