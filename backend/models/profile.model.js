const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date
  },
  current: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    trim: true
  },
  visibility: {
    type: String,
    enum: ['public', 'connections', 'private'],
    default: 'public'
  }
}, { timestamps: true });

const educationSchema = new mongoose.Schema({
  institution: {
    type: String,
    required: [true, 'Institution name is required'],
    trim: true
  },
  degree: {
    type: String,
    required: [true, 'Degree is required'],
    trim: true
  },
  fieldOfStudy: {
    type: String,
    trim: true
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date
  },
  current: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    trim: true
  },
  visibility: {
    type: String,
    enum: ['public', 'connections', 'private'],
    default: 'public'
  }
}, { timestamps: true });

const ProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  headline: {
    type: String,
    trim: true,
    maxlength: [100, 'Headline cannot exceed 100 characters']
  },
  skills: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    endorsements: {
      type: Number,
      default: 0
    },
    visibility: {
      type: String,
      enum: ['public', 'connections', 'private'],
      default: 'public'
    }
  }],
  experience: [experienceSchema],
  education: [educationSchema],
  certifications: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    issuingOrganization: {
      type: String,
      required: true,
      trim: true
    },
    issueDate: {
      type: Date
    },
    expirationDate: {
      type: Date
    },
    credentialURL: {
      type: String,
      trim: true
    },
    visibility: {
      type: String,
      enum: ['public', 'connections', 'private'],
      default: 'public'
    }
  }],
  languages: [{
    language: {
      type: String,
      required: true,
      trim: true
    },
    proficiency: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Native/Bilingual'],
      default: 'Intermediate'
    },
    visibility: {
      type: String,
      enum: ['public', 'connections', 'private'],
      default: 'public'
    }
  }],
  websites: [{
    title: {
      type: String,
      trim: true
    },
    url: {
      type: String,
      trim: true
    },
    visibility: {
      type: String,
      enum: ['public', 'connections', 'private'],
      default: 'public'
    }
  }],
  privacySettings: {
    profileVisibility: {
      type: String,
      enum: ['public', 'connections', 'private'],
      default: 'public'
    },
    sectionVisibility: {
      headline: {
        type: String,
        enum: ['public', 'connections', 'private'],
        default: 'public'
      },
      experience: {
        type: String,
        enum: ['public', 'connections', 'private'],
        default: 'public'
      },
      education: {
        type: String,
        enum: ['public', 'connections', 'private'],
        default: 'public'
      },
      skills: {
        type: String,
        enum: ['public', 'connections', 'private'],
        default: 'public'
      },
      certifications: {
        type: String,
        enum: ['public', 'connections', 'private'],
        default: 'public'
      },
      languages: {
        type: String,
        enum: ['public', 'connections', 'private'],
        default: 'public'
      }
    },
    connectionsVisibility: {
      type: String,
      enum: ['public', 'connections', 'private'],
      default: 'connections'
    },
    searchDiscovery: {
      includeInSearch: {
        type: Boolean,
        default: true
      },
      allowProfileIndexing: {
        type: Boolean,
        default: true
      }
    },
    activityVisibility: {
      posts: {
        type: String,
        enum: ['public', 'connections', 'private'],
        default: 'public'
      },
      comments: {
        type: String,
        enum: ['public', 'connections', 'private'],
        default: 'public'
      },
      likes: {
        type: String,
        enum: ['public', 'connections', 'private'],
        default: 'connections'
      }
    }
  }
}, { timestamps: true });

ProfileSchema.methods.isSectionVisibleTo = function(sectionName, viewerRelation) {
  const sectionVisibility = this.privacySettings?.sectionVisibility?.[sectionName] || 'public';
  
  switch (sectionVisibility) {
    case 'private':
      return false;
    case 'connections':
      return viewerRelation === 'self' || viewerRelation === 'connection';
    case 'public':
    default:
      return true;
  }
};

ProfileSchema.methods.getVisibleProfileFor = function(viewerRelation) {
  if (viewerRelation === 'self') {
    return this;
  }
  
  const profile = this.toObject();
  
  const sections = ['experience', 'education', 'skills', 'certifications', 'languages', 'websites'];
  
  sections.forEach(section => {
    if (!this.isSectionVisibleTo(section, viewerRelation)) {
      profile[section] = [];
    } else if (Array.isArray(profile[section])) {
      profile[section] = profile[section].filter(item => {
        if (!item.visibility) return true;
        if (item.visibility === 'public') return true;
        if (item.visibility === 'connections' && viewerRelation === 'connection') return true;
        return false;
      });
    }
  });
  
  if (!this.isSectionVisibleTo('headline', viewerRelation)) {
    profile.headline = '';
  }
  
  return profile;
};

module.exports = mongoose.model('Profile', ProfileSchema); 