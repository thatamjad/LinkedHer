const natural = require('natural');
const TfIdf = natural.TfIdf;
const stemmer = natural.PorterStemmer;
const Job = require('../models/job.model');
const Profile = require('../models/profile.model');
const AnonymousPersona = require('../models/anonymousPersona.model');
const logger = require('./logger');
const JobInterest = require('../models/jobInterest.model');
const SavedJobSearch = require('../models/savedJobSearch.model');
const User = require('../models/user.model');

class JobRecommender {
  constructor() {
    // Initialize TF-IDF for content-based recommendations
    this.tfidf = new TfIdf();
    
    // How often to update the TF-IDF model (in milliseconds)
    this.updateInterval = 12 * 60 * 60 * 1000; // 12 hours
    
    // Store last update time
    this.lastUpdate = 0;
    
    // Weights for different aspects of matching
    this.weights = {
      skills: 0.4,
      title: 0.25,
      description: 0.15,
      womenFriendly: 0.2
    };
  }

  // Initialize the recommender system
  async initialize() {
    try {
      logger.info('Initializing job recommender system');
      
      // Perform initial update of the TF-IDF model
      await this.updateModel();
      
      // Schedule periodic updates
      setInterval(() => this.updateModel(), this.updateInterval);
      
      logger.info('Job recommender system initialized successfully');
    } catch (error) {
      logger.error(`Error initializing job recommender: ${error.message}`);
      throw error;
    }
  }

  // Update the TF-IDF model with current jobs
  async updateModel() {
    try {
      const now = Date.now();
      
      // If last update was less than 1 hour ago, skip
      if (now - this.lastUpdate < 60 * 60 * 1000) {
        return;
      }
      
      logger.info('Updating job recommendation model');
      
      // Reset TF-IDF
      this.tfidf = new TfIdf();
      
      // Get all active jobs
      const jobs = await Job.find({ isActive: true }).limit(10000);
      
      if (jobs.length === 0) {
        logger.warn('No active jobs found for recommendation model');
        return;
      }
      
      // Add each job to the TF-IDF model
      jobs.forEach((job, index) => {
        // Combine relevant fields for the document
        const jobDocument = [
          job.title,
          job.description,
          ...(job.requirements || []),
          ...(job.responsibilities || []),
          ...(job.skills || []),
          job.company,
          job.category
        ].join(' ');
        
        // Add document to TF-IDF with job ID as reference
        this.tfidf.addDocument(this.preprocessText(jobDocument), job._id.toString());
      });
      
      this.lastUpdate = now;
      logger.info(`Updated job recommendation model with ${jobs.length} jobs`);
    } catch (error) {
      logger.error(`Error updating job recommendation model: ${error.message}`);
    }
  }

  // Preprocess text for better matching
  preprocessText(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/gi, ' ') // Remove punctuation
      .split(/\s+/)
      .map(word => stemmer.stem(word)) // Stem words
      .join(' ');
  }

  // Get job recommendations for a user profile
  async getRecommendationsForUser(userId, options = {}) {
    try {
      // Default options
      const defaultOptions = {
        limit: 10,
        minWomenFriendlyScore: 0,
        includeApplied: false,
        includeWomenFriendlyFactors: []
      };
      
      const settings = { ...defaultOptions, ...options };
      
      // Get user profile
      const profile = await Profile.findOne({ userId }).populate('skills');
      
      if (!profile) {
        logger.warn(`No profile found for user ${userId}`);
        return [];
      }
      
      return this.getRecommendations(profile, null, settings);
    } catch (error) {
      logger.error(`Error getting job recommendations for user ${userId}: ${error.message}`);
      return [];
    }
  }

  // Get job recommendations for an anonymous persona
  async getRecommendationsForAnonymous(personaId, options = {}) {
    try {
      // Default options
      const defaultOptions = {
        limit: 10,
        minWomenFriendlyScore: 0,
        includeApplied: false,
        includeWomenFriendlyFactors: []
      };
      
      const settings = { ...defaultOptions, ...options };
      
      // Get anonymous persona
      const persona = await AnonymousPersona.findById(personaId);
      
      if (!persona) {
        logger.warn(`No anonymous persona found with ID ${personaId}`);
        return [];
      }
      
      return this.getRecommendations(null, persona, settings);
    } catch (error) {
      logger.error(`Error getting job recommendations for anonymous persona ${personaId}: ${error.message}`);
      return [];
    }
  }

  // Core recommendation logic
  async getRecommendations(profile, persona, options) {
    try {
      // Ensure TF-IDF model is updated
      if (Date.now() - this.lastUpdate > 60 * 60 * 1000) {
        await this.updateModel();
      }
      
      // Create a query document based on profile or persona
      let queryDocument = '';
      let skills = [];
      let appliedJobIds = [];
      
      if (profile) {
        // Use professional profile
        queryDocument = [
          profile.headline || '',
          profile.summary || '',
          ...(profile.skills || []).map(s => s.name),
          ...(profile.experience || []).map(e => `${e.title} ${e.company} ${e.description}`),
          ...(profile.education || []).map(e => `${e.degree} ${e.fieldOfStudy}`)
        ].join(' ');
        
        skills = (profile.skills || []).map(s => s.name.toLowerCase());
        
        // Get jobs user has already applied to
        if (!options.includeApplied) {
          const jobInterests = await JobInterest.find({
            userId: profile.userId,
            'applied.hasApplied': true
          });
          
          appliedJobIds = jobInterests.map(ji => ji.jobId.toString());
        }
      } else if (persona) {
        // Use anonymous persona
        queryDocument = [
          persona.interests.join(' '),
          persona.skills.join(' '),
          persona.experience || ''
        ].join(' ');
        
        skills = persona.skills.map(s => s.toLowerCase());
        
        // Get jobs persona has already applied to
        if (!options.includeApplied) {
          const jobInterests = await JobInterest.find({
            anonymousPersonaId: persona._id,
            'applied.hasApplied': true
          });
          
          appliedJobIds = jobInterests.map(ji => ji.jobId.toString());
        }
      } else {
        logger.error('No profile or persona provided for recommendations');
        return [];
      }
      
      // Process the query document
      const processedQuery = this.preprocessText(queryDocument);
      
      // Find similar jobs using TF-IDF
      const similarityScores = {};
      this.tfidf.tfidfs(processedQuery, (i, measure, docRef) => {
        similarityScores[docRef] = measure;
      });
      
      // Get all candidate jobs
      const jobIdScores = Object.entries(similarityScores)
        .filter(([jobId]) => !appliedJobIds.includes(jobId))
        .sort((a, b) => b[1] - a[1])
        .slice(0, options.limit * 3) // Get more candidates for filtering
        .map(([jobId, score]) => ({ jobId, score }));
      
      if (jobIdScores.length === 0) {
        return [];
      }
      
      // Get full job details for candidates
      const jobIds = jobIdScores.map(item => item.jobId);
      const jobs = await Job.find({
        _id: { $in: jobIds },
        isActive: true,
        womenFriendlyScore: { $gte: options.minWomenFriendlyScore }
      });
      
      // Filter by women-friendly factors if specified
      let filteredJobs = jobs;
      if (options.includeWomenFriendlyFactors && options.includeWomenFriendlyFactors.length > 0) {
        filteredJobs = jobs.filter(job => {
          return options.includeWomenFriendlyFactors.every(factor => 
            job.womenFriendlyFactors && job.womenFriendlyFactors[factor]
          );
        });
      }
      
      // Calculate final scores incorporating multiple factors
      const recommendations = filteredJobs.map(job => {
        // Get the TF-IDF similarity score
        const tfidfScore = similarityScores[job._id.toString()] || 0;
        
        // Calculate skill match score
        const jobSkills = (job.skills || []).map(s => s.toLowerCase());
        const matchingSkills = skills.filter(skill => jobSkills.includes(skill));
        const skillScore = skills.length > 0 ? matchingSkills.length / skills.length : 0;
        
        // Calculate women-friendly score (normalized to 0-1)
        const womenFriendlyScore = job.womenFriendlyScore / 100;
        
        // Calculate composite score
        const compositeScore = 
          (tfidfScore * this.weights.description) +
          (skillScore * this.weights.skills) +
          (womenFriendlyScore * this.weights.womenFriendly);
        
        return {
          job,
          score: compositeScore,
          skillMatch: matchingSkills.length > 0 ? Math.round((matchingSkills.length / jobSkills.length) * 100) : 0,
          matchingSkills
        };
      });
      
      // Sort by composite score and return top N
      return recommendations
        .sort((a, b) => b.score - a.score)
        .slice(0, options.limit);
    } catch (error) {
      logger.error(`Error in recommendation algorithm: ${error.message}`);
      return [];
    }
  }

  /**
   * Get personalized job recommendations for a user
   * @param {string} userId - The user's ID
   * @param {number} limit - Maximum number of recommendations to return
   * @returns {Promise<Array>} - Array of recommended job objects
   */
  async getRecommendations(userId, limit = 10) {
    try {
      logger.info(`Generating job recommendations for user ${userId}`);
      
      // Get user profile data
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      // Get user's job interests (views, saves, applications)
      const jobInterests = await JobInterest.find({ userId });
      
      // Get user's saved searches
      const savedSearches = await SavedJobSearch.find({ userId });
      
      // Extract user skills from profile
      const userSkills = user.skills || [];
      
      // Extract job categories from previous interests
      const interestedJobIds = jobInterests.map(interest => interest.jobId);
      const interestedJobs = await Job.find({ _id: { $in: interestedJobIds } });
      
      // Extract industries and skills from jobs user has shown interest in
      const interestedCategories = [...new Set(interestedJobs.map(job => job.category))];
      const interestedSkills = [...new Set(interestedJobs.flatMap(job => job.skills || []))];
      
      // Build search query based on user interests
      const query = { isActive: true };
      
      // Exclude jobs user has already applied to
      const appliedJobIds = jobInterests
        .filter(interest => interest.applied.isApplied)
        .map(interest => interest.jobId);
        
      if (appliedJobIds.length > 0) {
        query._id = { $nin: appliedJobIds };
      }
      
      // Prioritize matching skills and categories
      const skillsToMatch = [...userSkills, ...interestedSkills].filter(Boolean);
      const categoriesToMatch = interestedCategories.filter(Boolean);
      
      // Build score boosters from saved searches
      const searchKeywords = savedSearches
        .map(search => search.keywords)
        .filter(Boolean)
        .join(' ');
      
      // Add text search if we have keywords from profile or saved searches
      const textSearchTerms = [
        ...userSkills,
        ...skillsToMatch.slice(0, 5),
        searchKeywords
      ].filter(Boolean).join(' ');
      
      if (textSearchTerms) {
        query.$text = { $search: textSearchTerms };
      }
      
      // Prioritize women-friendly jobs
      const womenFriendlySort = { womenFriendlyScore: -1 };
      
      // Add category filter if we have interested categories
      if (categoriesToMatch.length > 0) {
        query.category = { $in: categoriesToMatch };
      }
      
      // Conduct search with scoring
      const recommendations = await Job.find(query)
        .sort(textSearchTerms ? { score: { $meta: 'textScore' }, ...womenFriendlySort } : womenFriendlySort)
        .limit(limit * 2); // Get more than needed to allow for filtering
      
      // If we don't have enough results, do a broader search
      if (recommendations.length < limit) {
        // Remove category constraint and just focus on skills
        delete query.category;
        
        const additionalRecommendations = await Job.find(query)
          .sort(textSearchTerms ? { score: { $meta: 'textScore' }, ...womenFriendlySort } : womenFriendlySort)
          .limit(limit * 2);
          
        // Combine results, removing duplicates
        const existingIds = new Set(recommendations.map(job => job._id.toString()));
        additionalRecommendations.forEach(job => {
          if (!existingIds.has(job._id.toString())) {
            recommendations.push(job);
            existingIds.add(job._id.toString());
          }
        });
      }
      
      // Apply final scoring and personalization
      const scoredRecommendations = this.applyPersonalizedScoring(recommendations, {
        userSkills,
        interestedCategories,
        interestedSkills,
        searchKeywords,
        savedLocations: savedSearches.map(search => search.location).filter(Boolean)
      });
      
      // Sort by final score and take the top results
      return scoredRecommendations
        .sort((a, b) => b.recommendationScore - a.recommendationScore)
        .slice(0, limit)
        .map(item => item.job);
    } catch (error) {
      logger.error(`Error generating job recommendations: ${error.message}`);
      // Fall back to default recommendations if personalization fails
      return this.getDefaultRecommendations(limit);
    }
  }
  
  /**
   * Apply personalized scoring to job recommendations
   * @param {Array} jobs - Array of job objects
   * @param {Object} userData - User data for personalization
   * @returns {Array} - Array of job objects with recommendation scores
   */
  applyPersonalizedScoring(jobs, userData) {
    return jobs.map(job => {
      let score = 50; // Base score
      
      // Boost for women-friendly score
      score += (job.womenFriendlyScore / 10);
      
      // Boost for skill matches
      const jobSkills = job.skills || [];
      const skillMatchCount = jobSkills.filter(skill => 
        userData.userSkills.includes(skill) || userData.interestedSkills.includes(skill)
      ).length;
      
      if (skillMatchCount > 0) {
        score += Math.min(20, skillMatchCount * 5);
      }
      
      // Boost for category matches
      if (userData.interestedCategories.includes(job.category)) {
        score += 15;
      }
      
      // Boost for location matches
      if (job.location && userData.savedLocations.some(location => 
        job.location.toLowerCase().includes(location.toLowerCase())
      )) {
        score += 10;
      }
      
      // Boost for freshness - newer jobs get higher scores
      const daysSincePosted = (new Date() - new Date(job.datePosted)) / (1000 * 60 * 60 * 24);
      if (daysSincePosted < 3) {
        score += 10;
      } else if (daysSincePosted < 7) {
        score += 5;
      }
      
      return {
        job,
        recommendationScore: score
      };
    });
  }
  
  /**
   * Get default recommendations when personalization is not possible
   * @param {number} limit - Maximum number of recommendations to return
   * @returns {Promise<Array>} - Array of recommended job objects
   */
  async getDefaultRecommendations(limit = 10) {
    try {
      // Default to recently posted, women-friendly jobs
      return await Job.find({ isActive: true })
        .sort({ womenFriendlyScore: -1, datePosted: -1 })
        .limit(limit);
    } catch (error) {
      logger.error(`Error getting default recommendations: ${error.message}`);
      return [];
    }
  }
  
  /**
   * Get job recommendations for anonymous users
   * @param {Object} filters - Filter criteria
   * @param {number} limit - Maximum number of recommendations to return
   * @returns {Promise<Array>} - Array of recommended job objects
   */
  async getAnonymousRecommendations(filters = {}, limit = 10) {
    try {
      const query = { isActive: true };
      
      // Apply any filters from the user
      if (filters.categories && filters.categories.length) {
        query.category = { $in: filters.categories };
      }
      
      if (filters.skills && filters.skills.length) {
        query.skills = { $in: filters.skills };
      }
      
      if (filters.location) {
        query.location = { $regex: new RegExp(filters.location, 'i') };
      }
      
      if (filters.womenFriendlyMinScore) {
        query.womenFriendlyScore = { $gte: parseInt(filters.womenFriendlyMinScore) };
      }
      
      // Prioritize women-friendly jobs for anonymous users too
      return await Job.find(query)
        .sort({ womenFriendlyScore: -1, datePosted: -1 })
        .limit(limit);
    } catch (error) {
      logger.error(`Error getting anonymous recommendations: ${error.message}`);
      return [];
    }
  }
}

module.exports = new JobRecommender(); 