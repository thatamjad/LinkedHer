const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bugReportSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  reporter: {
    type: Schema.Types.ObjectId,
    ref: 'BetaTester',
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
      'onboarding',
      'other'
    ]
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical', 'blocker'],
    required: true
  },
  reproducibility: {
    type: String,
    enum: ['always', 'sometimes', 'rarely', 'once'],
    required: true
  },
  deviceInfo: {
    deviceType: String,
    browser: String,
    operatingSystem: String,
    screenResolution: String,
    otherDetails: String
  },
  reproductionSteps: [{
    stepNumber: Number,
    description: String
  }],
  expectedBehavior: {
    type: String
  },
  actualBehavior: {
    type: String,
    required: true
  },
  screenshots: [{
    url: String,
    description: String,
    timestamp: Date
  }],
  consoleErrors: {
    type: String
  },
  status: {
    type: String,
    enum: ['new', 'confirmed', 'in_progress', 'fixed', 'cannot_reproduce', 'wont_fix', 'duplicate'],
    default: 'new'
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  relatedTestScenario: {
    type: Schema.Types.ObjectId,
    ref: 'TestScenario'
  },
  duplicateOf: {
    type: Schema.Types.ObjectId,
    ref: 'BugReport'
  },
  comments: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    content: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  resolution: {
    fixVersion: String,
    fixDescription: String,
    resolvedDate: Date
  }
}, { timestamps: true });

// Create index for faster querying
bugReportSchema.index({ status: 1, priority: -1 });
bugReportSchema.index({ featureArea: 1 });
bugReportSchema.index({ reporter: 1 });

const BugReport = mongoose.model('BugReport', bugReportSchema);

module.exports = BugReport; 