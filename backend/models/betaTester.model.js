const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const betaTesterSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  demographics: {
    age: { type: Number },
    location: { type: String },
    industry: { type: String },
    jobTitle: { type: String },
    experience: { type: String, enum: ['0-2 years', '3-5 years', '6-10 years', '10+ years'] },
    deviceTypes: [{ type: String }]
  },
  testingAreas: [{
    feature: { type: String },
    priority: { type: Number, default: 0 },
    assignedDate: { type: Date }
  }],
  feedbackSubmitted: [{
    scenarioId: { type: Schema.Types.ObjectId, ref: 'TestScenario' },
    completedDate: { type: Date },
    feedbackQuality: { type: String, enum: ['poor', 'average', 'good', 'excellent'] }
  }],
  bugsReported: {
    type: Number,
    default: 0
  },
  abTestGroup: {
    type: String,
    enum: ['A', 'B', 'control']
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'completed'],
    default: 'active'
  },
  onboardingCompleted: {
    type: Boolean,
    default: false
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  lastActive: {
    type: Date
  },
  engagementScore: {
    type: Number,
    default: 0
  },
  notes: {
    type: String
  }
}, { timestamps: true });

// Create index for faster querying
betaTesterSchema.index({ status: 1, engagementScore: -1 });
betaTesterSchema.index({ user: 1 }, { unique: true });

const BetaTester = mongoose.model('BetaTester', betaTesterSchema);

module.exports = BetaTester; 