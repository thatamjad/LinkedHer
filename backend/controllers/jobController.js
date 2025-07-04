const Job = require('../models/job.model');
const JobInterest = require('../models/jobInterest.model');
const SavedJobSearch = require('../models/savedJobSearch.model');
const jobRecommender = require('../utils/jobRecommender');
const logger = require('../utils/logger');

// Get jobs with filters
exports.getJobs = async (req, res) => {
  try {
    const {
      keywords,
      location,
      employmentTypes,
      salaryMin,
      salaryMax,
      skills,
      womenFriendlyScore,
      womenFriendlyFactors,
      categories,
      datePosted,
      page = 1,
      limit = 10,
      sortBy = 'datePosted',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = { isActive: true };

    // Add text search if keywords provided
    if (keywords) {
      query.$text = { $search: keywords };
    }

    // Location filter
    if (location) {
      query.location = { $regex: new RegExp(location, 'i') };
    }

    // Employment types filter
    if (employmentTypes && employmentTypes.length) {
      query.employmentType = { $in: employmentTypes.split(',') };
    }

    // Salary range filter
    if (salaryMin || salaryMax) {
      query.salary = {};
      if (salaryMin) query.salary.min = { $gte: parseInt(salaryMin) };
      if (salaryMax) query.salary.max = { $lte: parseInt(salaryMax) };
    }

    // Skills filter
    if (skills && skills.length) {
      const skillsArray = skills.split(',');
      query.skills = { $in: skillsArray };
    }

    // Women-friendly score filter
    if (womenFriendlyScore) {
      query.womenFriendlyScore = { $gte: parseInt(womenFriendlyScore) };
    }

    // Women-friendly factors filter
    if (womenFriendlyFactors && womenFriendlyFactors.length) {
      const factors = womenFriendlyFactors.split(',');
      factors.forEach(factor => {
        query[`womenFriendlyFactors.${factor}`] = true;
      });
    }

    // Categories filter
    if (categories && categories.length) {
      query.category = { $in: categories.split(',') };
    }

    // Date posted filter
    if (datePosted) {
      const date = new Date();
      
      switch (datePosted) {
        case 'last24Hours':
          date.setDate(date.getDate() - 1);
          break;
        case 'last7Days':
          date.setDate(date.getDate() - 7);
          break;
        case 'last30Days':
          date.setDate(date.getDate() - 30);
          break;
        default:
          // No date filter
          break;
      }
      
      if (datePosted !== 'all') {
        query.datePosted = { $gte: date };
      }
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Determine sort order
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Add relevance score if text search is used
    if (keywords) {
      sortOptions.score = { $meta: 'textScore' };
    }

    // Execute query with pagination
    const jobs = await Job.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    // Get total count for pagination
    const totalJobs = await Job.countDocuments(query);
    
    // Add viewed event if user is logged in
    if (req.user && req.user.id) {
      jobs.forEach(async (job) => {
        try {
          // Record view in JobInterest
          let jobInterest = await JobInterest.findOne({
            userId: req.user.id,
            jobId: job._id
          });
          
          if (jobInterest) {
            // Update existing record
            jobInterest.viewed.count += 1;
            jobInterest.viewed.lastViewed = new Date();
            await jobInterest.save();
          } else {
            // Create new record
            jobInterest = new JobInterest({
              userId: req.user.id,
              jobId: job._id,
              interestType: 'viewed'
            });
            await jobInterest.save();
          }
          
          // Increment view count on job
          await job.incrementViews();
        } catch (error) {
          logger.error(`Error recording job view: ${error.message}`);
        }
      });
    } else if (req.anonymousPersona && req.anonymousPersona.id) {
      // Similar logic for anonymous personas
      jobs.forEach(async (job) => {
        try {
          let jobInterest = await JobInterest.findOne({
            anonymousPersonaId: req.anonymousPersona.id,
            jobId: job._id
          });
          
          if (jobInterest) {
            jobInterest.viewed.count += 1;
            jobInterest.viewed.lastViewed = new Date();
            await jobInterest.save();
          } else {
            jobInterest = new JobInterest({
              anonymousPersonaId: req.anonymousPersona.id,
              jobId: job._id,
              interestType: 'viewed'
            });
            await jobInterest.save();
          }
          
          await job.incrementViews();
        } catch (error) {
          logger.error(`Error recording anonymous job view: ${error.message}`);
        }
      });
    }

    res.status(200).json({
      success: true,
      count: jobs.length,
      total: totalJobs,
      totalPages: Math.ceil(totalJobs / parseInt(limit)),
      currentPage: parseInt(page),
      jobs
    });
  } catch (error) {
    logger.error(`Error in getJobs: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error retrieving jobs',
      error: error.message
    });
  }
};

// Get single job
exports.getJob = async (req, res) => {
  try {
    const { id } = req.params;
    
    const job = await Job.findById(id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }
    
    // Record view
    if (req.user && req.user.id) {
      // User is logged in - record interest
      let jobInterest = await JobInterest.findOne({
        userId: req.user.id,
        jobId: job._id
      });
      
      if (jobInterest) {
        // Update existing record
        jobInterest.viewed.count += 1;
        jobInterest.viewed.lastViewed = new Date();
        await jobInterest.save();
      } else {
        // Create new record
        jobInterest = new JobInterest({
          userId: req.user.id,
          jobId: job._id,
          interestType: 'viewed'
        });
        await jobInterest.save();
      }
      
      // Increment view count
      await job.incrementViews();
    } else if (req.anonymousPersona && req.anonymousPersona.id) {
      // Anonymous user - record interest
      let jobInterest = await JobInterest.findOne({
        anonymousPersonaId: req.anonymousPersona.id,
        jobId: job._id
      });
      
      if (jobInterest) {
        jobInterest.viewed.count += 1;
        jobInterest.viewed.lastViewed = new Date();
        await jobInterest.save();
      } else {
        jobInterest = new JobInterest({
          anonymousPersonaId: req.anonymousPersona.id,
          jobId: job._id,
          interestType: 'viewed'
        });
        await jobInterest.save();
      }
      
      await job.incrementViews();
    }
    
    res.status(200).json({
      success: true,
      job
    });
  } catch (error) {
    logger.error(`Error in getJob: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error retrieving job',
      error: error.message
    });
  }
};

// Save job
exports.saveJob = async (req, res) => {
  try {
    const { id } = req.params;
    
    const job = await Job.findById(id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }
    
    // Save job
    if (req.user && req.user.id) {
      // User is logged in
      let jobInterest = await JobInterest.findOne({
        userId: req.user.id,
        jobId: job._id
      });
      
      if (jobInterest) {
        // Update existing record
        jobInterest.saved.isSaved = true;
        jobInterest.saved.savedAt = new Date();
        jobInterest.interestType = 'saved';
        await jobInterest.save();
      } else {
        // Create new record
        jobInterest = new JobInterest({
          userId: req.user.id,
          jobId: job._id,
          interestType: 'saved',
          saved: {
            isSaved: true,
            savedAt: new Date()
          }
        });
        await jobInterest.save();
      }
    } else if (req.anonymousPersona && req.anonymousPersona.id) {
      // Anonymous user
      let jobInterest = await JobInterest.findOne({
        anonymousPersonaId: req.anonymousPersona.id,
        jobId: job._id
      });
      
      if (jobInterest) {
        jobInterest.saved.isSaved = true;
        jobInterest.saved.savedAt = new Date();
        jobInterest.interestType = 'saved';
        await jobInterest.save();
      } else {
        jobInterest = new JobInterest({
          anonymousPersonaId: req.anonymousPersona.id,
          jobId: job._id,
          interestType: 'saved',
          saved: {
            isSaved: true,
            savedAt: new Date()
          }
        });
        await jobInterest.save();
      }
    } else {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Job saved successfully'
    });
  } catch (error) {
    logger.error(`Error in saveJob: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error saving job',
      error: error.message
    });
  }
};

// Unsave job
exports.unsaveJob = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if job exists
    const job = await Job.findById(id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }
    
    // Unsave job
    if (req.user && req.user.id) {
      // User is logged in
      const jobInterest = await JobInterest.findOne({
        userId: req.user.id,
        jobId: job._id
      });
      
      if (jobInterest) {
        jobInterest.saved.isSaved = false;
        await jobInterest.save();
      }
    } else if (req.anonymousPersona && req.anonymousPersona.id) {
      // Anonymous user
      const jobInterest = await JobInterest.findOne({
        anonymousPersonaId: req.anonymousPersona.id,
        jobId: job._id
      });
      
      if (jobInterest) {
        jobInterest.saved.isSaved = false;
        await jobInterest.save();
      }
    } else {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Job unsaved successfully'
    });
  } catch (error) {
    logger.error(`Error in unsaveJob: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error unsaving job',
      error: error.message
    });
  }
};

// Apply for job
exports.applyForJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { applicationMethod, notes } = req.body;
    
    // Check if job exists
    const job = await Job.findById(id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }
    
    // Record application
    if (req.user && req.user.id) {
      // User is logged in
      let jobInterest = await JobInterest.findOne({
        userId: req.user.id,
        jobId: job._id
      });
      
      if (jobInterest) {
        // Update existing record
        jobInterest.applied.hasApplied = true;
        jobInterest.applied.appliedAt = new Date();
        jobInterest.applied.applicationMethod = applicationMethod;
        jobInterest.applied.notes = notes;
        jobInterest.interestType = 'applied';
        await jobInterest.save();
      } else {
        // Create new record
        jobInterest = new JobInterest({
          userId: req.user.id,
          jobId: job._id,
          interestType: 'applied',
          applied: {
            hasApplied: true,
            appliedAt: new Date(),
            applicationMethod,
            notes
          }
        });
        await jobInterest.save();
      }
    } else if (req.anonymousPersona && req.anonymousPersona.id) {
      // Anonymous user
      let jobInterest = await JobInterest.findOne({
        anonymousPersonaId: req.anonymousPersona.id,
        jobId: job._id
      });
      
      if (jobInterest) {
        jobInterest.applied.hasApplied = true;
        jobInterest.applied.appliedAt = new Date();
        jobInterest.applied.applicationMethod = applicationMethod;
        jobInterest.applied.notes = notes;
        jobInterest.interestType = 'applied';
        await jobInterest.save();
      } else {
        jobInterest = new JobInterest({
          anonymousPersonaId: req.anonymousPersona.id,
          jobId: job._id,
          interestType: 'applied',
          applied: {
            hasApplied: true,
            appliedAt: new Date(),
            applicationMethod,
            notes
          }
        });
        await jobInterest.save();
      }
    } else {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    // Increment application count
    await job.incrementApplications();
    
    res.status(200).json({
      success: true,
      message: 'Job application recorded successfully'
    });
  } catch (error) {
    logger.error(`Error in applyForJob: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error recording job application',
      error: error.message
    });
  }
};

// Get recommended jobs
exports.getRecommendedJobs = async (req, res) => {
  try {
    const { limit = 10, minWomenFriendlyScore = 0, includeWomenFriendlyFactors } = req.query;
    
    const options = {
      limit: parseInt(limit),
      minWomenFriendlyScore: parseInt(minWomenFriendlyScore),
      includeWomenFriendlyFactors: includeWomenFriendlyFactors ? includeWomenFriendlyFactors.split(',') : []
    };
    
    let recommendations = [];
    
    if (req.user && req.user.id) {
      // User is logged in
      recommendations = await jobRecommender.getRecommendationsForUser(req.user.id, options);
    } else if (req.anonymousPersona && req.anonymousPersona.id) {
      // Anonymous user
      recommendations = await jobRecommender.getRecommendationsForAnonymous(req.anonymousPersona.id, options);
    } else {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    res.status(200).json({
      success: true,
      count: recommendations.length,
      recommendations
    });
  } catch (error) {
    logger.error(`Error in getRecommendedJobs: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error getting job recommendations',
      error: error.message
    });
  }
};

// Save search
exports.saveSearch = async (req, res) => {
  try {
    const { name, filters, notificationsEnabled } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Search name is required'
      });
    }
    
    // Create saved search
    let savedSearch;
    
    if (req.user && req.user.id) {
      // User is logged in
      savedSearch = new SavedJobSearch({
        userId: req.user.id,
        name,
        filters,
        notificationsEnabled: notificationsEnabled || false
      });
    } else if (req.anonymousPersona && req.anonymousPersona.id) {
      // Anonymous user
      savedSearch = new SavedJobSearch({
        anonymousPersonaId: req.anonymousPersona.id,
        name,
        filters,
        notificationsEnabled: notificationsEnabled || false
      });
    } else {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    await savedSearch.save();
    
    res.status(201).json({
      success: true,
      message: 'Search saved successfully',
      savedSearch
    });
  } catch (error) {
    logger.error(`Error in saveSearch: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error saving search',
      error: error.message
    });
  }
};

// Get saved searches
exports.getSavedSearches = async (req, res) => {
  try {
    let savedSearches = [];
    
    if (req.user && req.user.id) {
      // User is logged in
      savedSearches = await SavedJobSearch.find({ userId: req.user.id });
    } else if (req.anonymousPersona && req.anonymousPersona.id) {
      // Anonymous user
      savedSearches = await SavedJobSearch.find({ anonymousPersonaId: req.anonymousPersona.id });
    } else {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    res.status(200).json({
      success: true,
      count: savedSearches.length,
      savedSearches
    });
  } catch (error) {
    logger.error(`Error in getSavedSearches: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error getting saved searches',
      error: error.message
    });
  }
};

// Delete saved search
exports.deleteSavedSearch = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find saved search
    const savedSearch = await SavedJobSearch.findById(id);
    
    if (!savedSearch) {
      return res.status(404).json({
        success: false,
        message: 'Saved search not found'
      });
    }
    
    // Check ownership
    if (
      (req.user && req.user.id && savedSearch.userId && savedSearch.userId.toString() !== req.user.id) ||
      (req.anonymousPersona && req.anonymousPersona.id && savedSearch.anonymousPersonaId && 
       savedSearch.anonymousPersonaId.toString() !== req.anonymousPersona.id)
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this saved search'
      });
    }
    
    await savedSearch.remove();
    
    res.status(200).json({
      success: true,
      message: 'Saved search deleted successfully'
    });
  } catch (error) {
    logger.error(`Error in deleteSavedSearch: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error deleting saved search',
      error: error.message
    });
  }
};

// Get saved jobs
exports.getSavedJobs = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    let jobInterests = [];
    
    if (req.user && req.user.id) {
      // User is logged in
      jobInterests = await JobInterest.find({
        userId: req.user.id,
        'saved.isSaved': true
      })
        .sort({ 'saved.savedAt': -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('jobId');
    } else if (req.anonymousPersona && req.anonymousPersona.id) {
      // Anonymous user
      jobInterests = await JobInterest.find({
        anonymousPersonaId: req.anonymousPersona.id,
        'saved.isSaved': true
      })
        .sort({ 'saved.savedAt': -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('jobId');
    } else {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    // Format response
    const savedJobs = jobInterests.map(interest => ({
      interest,
      job: interest.jobId
    }));
    
    // Get total count for pagination
    let totalCount = 0;
    
    if (req.user && req.user.id) {
      totalCount = await JobInterest.countDocuments({
        userId: req.user.id,
        'saved.isSaved': true
      });
    } else if (req.anonymousPersona && req.anonymousPersona.id) {
      totalCount = await JobInterest.countDocuments({
        anonymousPersonaId: req.anonymousPersona.id,
        'saved.isSaved': true
      });
    }
    
    res.status(200).json({
      success: true,
      count: savedJobs.length,
      total: totalCount,
      totalPages: Math.ceil(totalCount / parseInt(limit)),
      currentPage: parseInt(page),
      savedJobs
    });
  } catch (error) {
    logger.error(`Error in getSavedJobs: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error getting saved jobs',
      error: error.message
    });
  }
};

// Get applied jobs
exports.getAppliedJobs = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    let jobInterests = [];
    
    if (req.user && req.user.id) {
      // User is logged in
      jobInterests = await JobInterest.find({
        userId: req.user.id,
        'applied.hasApplied': true
      })
        .sort({ 'applied.appliedAt': -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('jobId');
    } else if (req.anonymousPersona && req.anonymousPersona.id) {
      // Anonymous user
      jobInterests = await JobInterest.find({
        anonymousPersonaId: req.anonymousPersona.id,
        'applied.hasApplied': true
      })
        .sort({ 'applied.appliedAt': -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('jobId');
    } else {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    // Format response
    const appliedJobs = jobInterests.map(interest => ({
      interest,
      job: interest.jobId
    }));
    
    // Get total count for pagination
    let totalCount = 0;
    
    if (req.user && req.user.id) {
      totalCount = await JobInterest.countDocuments({
        userId: req.user.id,
        'applied.hasApplied': true
      });
    } else if (req.anonymousPersona && req.anonymousPersona.id) {
      totalCount = await JobInterest.countDocuments({
        anonymousPersonaId: req.anonymousPersona.id,
        'applied.hasApplied': true
      });
    }
    
    res.status(200).json({
      success: true,
      count: appliedJobs.length,
      total: totalCount,
      totalPages: Math.ceil(totalCount / parseInt(limit)),
      currentPage: parseInt(page),
      appliedJobs
    });
  } catch (error) {
    logger.error(`Error in getAppliedJobs: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error getting applied jobs',
      error: error.message
    });
  }
};

// Share job
exports.shareJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { platform } = req.body;
    
    // Check if job exists
    const job = await Job.findById(id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }
    
    // Record share
    if (req.user && req.user.id) {
      // User is logged in
      let jobInterest = await JobInterest.findOne({
        userId: req.user.id,
        jobId: job._id
      });
      
      if (jobInterest) {
        // Update existing record
        jobInterest.shared.count += 1;
        jobInterest.shared.lastShared = new Date();
        if (!jobInterest.shared.platforms) {
          jobInterest.shared.platforms = [];
        }
        if (platform && !jobInterest.shared.platforms.includes(platform)) {
          jobInterest.shared.platforms.push(platform);
        }
        jobInterest.interestType = 'shared';
        await jobInterest.save();
      } else {
        // Create new record
        jobInterest = new JobInterest({
          userId: req.user.id,
          jobId: job._id,
          interestType: 'shared',
          shared: {
            count: 1,
            lastShared: new Date(),
            platforms: platform ? [platform] : []
          }
        });
        await jobInterest.save();
      }
    } else if (req.anonymousPersona && req.anonymousPersona.id) {
      // Anonymous user
      let jobInterest = await JobInterest.findOne({
        anonymousPersonaId: req.anonymousPersona.id,
        jobId: job._id
      });
      
      if (jobInterest) {
        jobInterest.shared.count += 1;
        jobInterest.shared.lastShared = new Date();
        if (!jobInterest.shared.platforms) {
          jobInterest.shared.platforms = [];
        }
        if (platform && !jobInterest.shared.platforms.includes(platform)) {
          jobInterest.shared.platforms.push(platform);
        }
        jobInterest.interestType = 'shared';
        await jobInterest.save();
      } else {
        jobInterest = new JobInterest({
          anonymousPersonaId: req.anonymousPersona.id,
          jobId: job._id,
          interestType: 'shared',
          shared: {
            count: 1,
            lastShared: new Date(),
            platforms: platform ? [platform] : []
          }
        });
        await jobInterest.save();
      }
    } else {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Job share recorded successfully'
    });
  } catch (error) {
    logger.error(`Error in shareJob: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error recording job share',
      error: error.message
    });
  }
}; 