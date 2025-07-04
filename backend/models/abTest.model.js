const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const abTestSchema = new Schema({
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
      'onboarding',
      'ui',
      'other'
    ]
  },
  variants: [{
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    screenshot: String,
    implementation: {
      type: String, // can store component name, route, or feature flag name
      required: true
    },
    isControl: {
      type: Boolean,
      default: false
    }
  }],
  participantDistribution: {
    type: String,
    enum: ['equal', 'weighted'],
    default: 'equal'
  },
  weightDistribution: [{
    variantName: String,
    percentage: Number // 0-100
  }],
  metrics: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    type: {
      type: String,
      enum: ['conversion', 'engagement', 'retention', 'satisfaction', 'time', 'custom'],
      required: true
    },
    goal: {
      type: String,
      enum: ['increase', 'decrease'],
      required: true
    },
    significanceThreshold: {
      type: Number,
      default: 0.05 // p-value
    },
    dataSource: {
      type: String, // can be an event name, API endpoint, etc.
      required: true
    }
  }],
  results: [{
    variantName: String,
    metricName: String,
    value: Number,
    sampleSize: Number,
    confidenceInterval: {
      lower: Number,
      upper: Number
    },
    pValue: Number,
    isWinner: Boolean
  }],
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['draft', 'running', 'paused', 'completed', 'analyzed'],
    default: 'draft'
  },
  targetAudience: {
    type: String,
    enum: ['all', 'new_users', 'existing_users', 'beta_testers'],
    default: 'beta_testers'
  },
  minimumSampleSize: {
    type: Number,
    default: 100
  },
  notes: String,
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  conclusion: {
    winningVariant: String,
    summary: String,
    nextSteps: String,
    implementationDate: Date
  }
}, { timestamps: true });

// Create index for faster querying
abTestSchema.index({ status: 1 });
abTestSchema.index({ featureArea: 1 });

const ABTest = mongoose.model('ABTest', abTestSchema);

module.exports = ABTest; 