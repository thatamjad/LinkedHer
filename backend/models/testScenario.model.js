const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const testScenarioSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  featureArea: {
    type: String,
    required: true,
    enum: [
      'professionalMode', 
      'anonymousMode', 
      'verification', 
      'jobBoard', 
      'mentorship', 
      'supportGroups',
      'skillGap',
      'negotiation',
      'security',
      'modeSwitch',
      'reporting',
      'onboarding'
    ]
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  steps: [{
    stepNumber: Number,
    description: String,
    expectedOutcome: String,
    screenshot: String
  }],
  expectedDuration: {
    type: Number, // in minutes
    default: 15
  },
  metrics: [{
    name: String,
    description: String,
    target: Schema.Types.Mixed
  }],
  feedbackQuestions: [{
    question: String,
    type: {
      type: String,
      enum: ['rating', 'text', 'multiChoice', 'checkbox']
    },
    options: [String], // For multiChoice and checkbox types
    required: Boolean
  }],
  completionCriteria: {
    type: String,
    default: 'All steps completed'
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'completed', 'archived'],
    default: 'draft'
  },
  assignedTesters: [{
    type: Schema.Types.ObjectId,
    ref: 'BetaTester'
  }],
  completionStats: {
    assigned: { type: Number, default: 0 },
    started: { type: Number, default: 0 },
    completed: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    averageCompletionTime: { type: Number, default: 0 }
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

// Create index for faster querying
testScenarioSchema.index({ featureArea: 1, status: 1 });
testScenarioSchema.index({ priority: 1 });

const TestScenario = mongoose.model('TestScenario', testScenarioSchema);

module.exports = TestScenario; 