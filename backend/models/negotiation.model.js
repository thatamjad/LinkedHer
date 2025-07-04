const mongoose = require('mongoose');

const negotiationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  scenarioType: {
    type: String,
    enum: ['salary_negotiation', 'promotion_discussion', 'benefits_negotiation', 'flexible_work', 'project_assignment'],
    required: true
  },
  industry: String,
  roleLevel: String,
  currentStats: {
    salary: Number,
    title: String,
    benefits: [String],
    workArrangement: String
  },
  targetStats: {
    salary: Number,
    title: String,
    benefits: [String],
    workArrangement: String
  },
  marketData: {
    averageSalary: Number,
    salaryRange: {
      min: Number,
      max: Number
    },
    commonBenefits: [String],
    industryTrends: [String]
  },
  simulationSessions: [{
    date: Date,
    duration: Number, // in minutes
    successMetrics: {
      confidenceLevel: {
        type: Number,
        min: 1,
        max: 10
      },
      preparednessScore: {
        type: Number,
        min: 1,
        max: 10
      },
      achievedTargets: {
        type: Number,
        min: 0,
        max: 100
      }
    },
    feedback: {
      strengths: [String],
      improvementAreas: [String],
      strategySuggestions: [String]
    },
    transcript: String,
    aiResponseModel: String
  }],
  resources: [{
    title: String,
    type: {
      type: String,
      enum: ['article', 'video', 'template', 'script', 'workshop']
    },
    url: String,
    description: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const Negotiation = mongoose.model('Negotiation', negotiationSchema);

module.exports = Negotiation; 