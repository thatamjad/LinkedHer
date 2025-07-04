const mongoose = require('mongoose');

const skillGapSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  industry: {
    type: String,
    required: true
  },
  currentSkills: [{
    name: String,
    proficiency: {
      type: Number,
      min: 1,
      max: 5
    }
  }],
  targetRole: {
    title: String,
    level: String
  },
  requiredSkills: [{
    name: String,
    importance: {
      type: Number,
      min: 1,
      max: 5
    },
    gap: {
      type: Number,
      min: 0,
      max: 5,
      default: 5
    }
  }],
  recommendations: [{
    skill: String,
    resources: [{
      title: String,
      url: String,
      type: {
        type: String,
        enum: ['course', 'book', 'article', 'video', 'workshop', 'mentor']
      },
      estimatedTimeHours: Number
    }],
    priority: {
      type: Number,
      min: 1,
      max: 10
    }
  }],
  progressTracking: [{
    skill: String,
    startingLevel: Number,
    currentLevel: Number,
    targetLevel: Number,
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  }],
  analysisDate: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const SkillGap = mongoose.model('SkillGap', skillGapSchema);

module.exports = SkillGap; 