const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const jobSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  requirements: [String],
  responsibilities: [String],
  salary: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'USD'
    },
    isDisplayed: {
      type: Boolean,
      default: false
    }
  },
  employmentType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Temporary', 'Internship', 'Remote'],
    required: true
  },
  jobSource: {
    type: String,
    required: true
  },
  sourceUrl: {
    type: String,
    required: true
  },
  externalId: {
    type: String
  },
  applicationUrl: String,
  logoUrl: String,
  datePosted: {
    type: Date,
    default: Date.now
  },
  deadline: Date,
  womenFriendlyScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  womenFriendlyFactors: {
    parentalLeave: Boolean,
    flexibleHours: Boolean,
    remoteWork: Boolean,
    equalPayPledge: Boolean,
    diversityInitiatives: Boolean,
    femaleLeadership: Boolean,
    inclusiveLanguage: {
      type: Boolean,
      default: false
    }
  },
  skills: [String],
  category: {
    type: String,
    required: true
  },
  views: {
    type: Number,
    default: 0
  },
  applications: {
    type: Number,
    default: 0
  },
  saves: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
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
}, {
  timestamps: true
});

// Create text indexes for search
jobSchema.index({ 
  title: 'text', 
  company: 'text', 
  description: 'text',
  skills: 'text'
});

// Add method to increment view count
jobSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Add method to increment application count
jobSchema.methods.incrementApplications = function() {
  this.applications += 1;
  return this.save();
};

const Job = mongoose.model('Job', jobSchema);

module.exports = Job; 