const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MentorProfileSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  specializations: [{
    type: String,
    required: true
  }],
  expertise: [{
    name: {
      type: String,
      required: true
    },
    yearsExperience: {
      type: Number,
      required: true
    },
    proficiencyLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'intermediate'
    }
  }],
  biography: {
    type: String,
    required: true,
    maxlength: 1000
  },
  mentorshipStyle: {
    type: String,
    enum: ['directive', 'non_directive', 'situational', 'transformational', 'developmental'],
    default: 'situational'
  },
  availability: {
    maxMentees: {
      type: Number,
      default: 3
    },
    currentMentees: {
      type: Number,
      default: 0
    },
    schedule: [{
      day: {
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        required: true
      },
      startTime: {
        type: String,
        required: true
      },
      endTime: {
        type: String,
        required: true
      }
    }],
    timeZone: {
      type: String,
      default: 'UTC'
    }
  },
  preferredMenteeLevel: [{
    type: String,
    enum: ['entry_level', 'mid_level', 'senior_level', 'executive', 'any'],
    default: 'any'
  }],
  industries: [{
    type: String
  }],
  languages: [{
    name: {
      type: String,
      required: true
    },
    proficiency: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'native'],
      default: 'intermediate'
    }
  }],
  rating: {
    average: {
      type: Number,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  testimonials: [{
    mentee: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    content: {
      type: String,
      required: true
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

// Update rating when testimonials are added
MentorProfileSchema.pre('save', function(next) {
  if (this.testimonials && this.testimonials.length > 0) {
    const total = this.testimonials.reduce((sum, testimonial) => sum + testimonial.rating, 0);
    this.rating.average = total / this.testimonials.length;
    this.rating.count = this.testimonials.length;
  }
  next();
});

module.exports = mongoose.model('MentorProfile', MentorProfileSchema); 