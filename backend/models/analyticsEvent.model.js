const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const analyticsEventSchema = new Schema({
  eventType: {
    type: String,
    required: true,
    index: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  betaTester: {
    type: Schema.Types.ObjectId,
    ref: 'BetaTester'
  },
  anonymousId: {
    type: String,
    index: true
  },
  sessionId: {
    type: String,
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  featureArea: {
    type: String,
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
      'betaTesting',
      'other'
    ],
    index: true
  },
  data: {
    type: Schema.Types.Mixed
  },
  deviceInfo: {
    deviceType: String,
    browser: String,
    operatingSystem: String,
    screenResolution: String
  },
  location: {
    page: String,
    component: String,
    referrer: String
  },
  abTestInfo: {
    testId: {
      type: Schema.Types.ObjectId,
      ref: 'ABTest'
    },
    variantName: String
  },
  performanceMetrics: {
    loadTime: Number,
    responseTime: Number,
    renderTime: Number
  },
  userExperienceMetrics: {
    interactionTime: Number,
    scrollDepth: Number,
    clickCount: Number
  },
  testScenario: {
    type: Schema.Types.ObjectId,
    ref: 'TestScenario'
  }
}, { 
  timestamps: true,
  // Use timeseries for efficient storage and querying of time-based data
  timeseries: {
    timeField: 'timestamp',
    metaField: 'featureArea',
    granularity: 'minutes'
  }
});

// Create compound indexes for common queries
analyticsEventSchema.index({ featureArea: 1, eventType: 1, timestamp: -1 });
analyticsEventSchema.index({ 'abTestInfo.testId': 1, 'abTestInfo.variantName': 1 });
analyticsEventSchema.index({ betaTester: 1, timestamp: -1 });

const AnalyticsEvent = mongoose.model('AnalyticsEvent', analyticsEventSchema);

module.exports = AnalyticsEvent; 