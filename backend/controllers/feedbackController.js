/**
 * Feedback Controller for AuraConnect
 * 
 * Handles collection and management of user feedback across the platform.
 * Implements advanced analysis and categorization of feedback.
 */

const Feedback = require('../models/Feedback');
const User = require('../models/user.model');
const { sendFeedbackNotification } = require('../utils/notifications');

/**
 * Submit new feedback
 * @route POST /api/feedback
 * @access Public (with rate limiting)
 */
exports.submitFeedback = async (req, res) => {
  try {
    const { userId, rating, type, message, email, source, metadata } = req.body;
    
    // Validate required fields
    if (!rating || !message || !type) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide rating, feedback type, and message' 
      });
    }
    
    // If userId provided, verify user exists
    let userName = 'Anonymous';
    
    if (userId) {
      const user = await User.findById(userId).select('name email');
      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'User not found'
        });
      }
      userName = user.name;
    }
    
    // Perform sentiment analysis on feedback (simplified implementation)
    const sentiment = analyzeSentiment(message);
    
    // Create new feedback record
    const feedback = await Feedback.create({
      user: userId || null,
      email: userId ? undefined : email, // Only store email if not logged in
      rating,
      type,
      message,
      sentiment,
      source,
      metadata,
      urgency: calculateUrgency(rating, sentiment, type),
      categories: extractCategories(message)
    });
    
    // For critical feedback or bugs, send notification to team
    if (feedback.urgency >= 8) {
      await sendFeedbackNotification(feedback, userName);
    }
    
    return res.status(201).json({
      success: true,
      data: { 
        id: feedback._id,
        received: true
      }
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return res.status(500).json({
      success: false,
      message: 'Error submitting feedback'
    });
  }
};

/**
 * Get all feedback with pagination and filters
 * @route GET /api/feedback
 * @access Private (Admin)
 */
exports.getAllFeedback = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, minRating, maxRating, startDate, endDate, sortBy = 'createdAt', sortOrder = -1 } = req.query;
    
    // Build query object for filtering
    const query = {};
    
    if (type) query.type = type;
    if (minRating) query.rating = { $gte: parseInt(minRating) };
    if (maxRating) {
      query.rating = query.rating || {};
      query.rating.$lte = parseInt(maxRating);
    }
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    // Execute query with pagination
    const feedback = await Feedback.find(query)
      .sort({ [sortBy]: sortOrder })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .populate('user', 'name avatar')
      .lean();
    
    // Get total count for pagination
    const total = await Feedback.countDocuments(query);
    
    return res.status(200).json({
      success: true,
      count: feedback.length,
      total,
      data: feedback,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error getting feedback:', error);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving feedback'
    });
  }
};

/**
 * Get feedback summary statistics
 * @route GET /api/feedback/stats
 * @access Private (Admin)
 */
exports.getFeedbackStats = async (req, res) => {
  try {
    // Get overall average rating
    const averageRating = await Feedback.aggregate([
      { $group: { _id: null, average: { $avg: '$rating' } } }
    ]);
    
    // Get ratings by type
    const ratingsByType = await Feedback.aggregate([
      { $group: { _id: '$type', average: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    
    // Get feedback volume over time
    const volumeOverTime = await Feedback.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          averageRating: { $avg: '$rating' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Get sentiment distribution
    const sentimentDistribution = await Feedback.aggregate([
      {
        $group: {
          _id: '$sentiment',
          count: { $sum: 1 },
          percentage: { $sum: 1 }
        }
      }
    ]);
    
    // Calculate sentiment percentages
    const totalFeedback = await Feedback.countDocuments();
    sentimentDistribution.forEach(item => {
      item.percentage = (item.count / totalFeedback) * 100;
    });
    
    return res.status(200).json({
      success: true,
      data: {
        totalFeedback,
        averageRating: averageRating.length ? averageRating[0].average : 0,
        ratingsByType,
        volumeOverTime,
        sentimentDistribution
      }
    });
  } catch (error) {
    console.error('Error getting feedback stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving feedback statistics'
    });
  }
};

/**
 * Update feedback status or response
 * @route PATCH /api/feedback/:id
 * @access Private (Admin)
 */
exports.updateFeedback = async (req, res) => {
  try {
    const { status, adminResponse, categories, isResolved } = req.body;
    
    const feedback = await Feedback.findById(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }
    
    // Update fields if provided
    if (status) feedback.status = status;
    if (adminResponse) {
      feedback.adminResponse = adminResponse;
      feedback.respondedAt = Date.now();
    }
    if (categories) feedback.categories = categories;
    if (typeof isResolved === 'boolean') feedback.isResolved = isResolved;
    
    await feedback.save();
    
    return res.status(200).json({
      success: true,
      data: feedback
    });
  } catch (error) {
    console.error('Error updating feedback:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating feedback'
    });
  }
};

/**
 * Delete feedback
 * @route DELETE /api/feedback/:id
 * @access Private (Admin)
 */
exports.deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }
    
    await feedback.remove();
    
    return res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting feedback'
    });
  }
};

/**
 * Simple sentiment analysis function
 * In production, this would use a more sophisticated NLP approach or external API
 */
const analyzeSentiment = (text) => {
  const positiveWords = [
    'good', 'great', 'excellent', 'amazing', 'awesome', 
    'love', 'like', 'helpful', 'useful', 'intuitive',
    'easy', 'wonderful', 'fantastic', 'impressive', 'best',
    'simple', 'beautiful', 'perfect', 'outstanding'
  ];
  
  const negativeWords = [
    'bad', 'terrible', 'awful', 'horrible', 'poor',
    'hate', 'dislike', 'difficult', 'confusing', 'hard',
    'complicated', 'frustrating', 'broken', 'annoying', 'worst',
    'useless', 'problem', 'issue', 'bug', 'error', 'crash'
  ];
  
  const lowercaseText = text.toLowerCase();
  let positiveCount = 0;
  let negativeCount = 0;
  
  positiveWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = lowercaseText.match(regex);
    if (matches) positiveCount += matches.length;
  });
  
  negativeWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = lowercaseText.match(regex);
    if (matches) negativeCount += matches.length;
  });
  
  if (positiveCount > negativeCount * 2) return 'positive';
  if (negativeCount > positiveCount * 2) return 'negative';
  if (positiveCount === 0 && negativeCount === 0) return 'neutral';
  
  return Math.abs(positiveCount - negativeCount) <= 2 ? 'mixed' : 
         (positiveCount > negativeCount ? 'somewhat_positive' : 'somewhat_negative');
};

/**
 * Calculate urgency score for feedback
 * Higher score = more urgent
 */
const calculateUrgency = (rating, sentiment, type) => {
  let urgency = 5; // Base urgency
  
  // Adjust based on rating (1-5)
  if (rating <= 2) urgency += 3;
  else if (rating >= 4) urgency -= 2;
  
  // Adjust based on sentiment
  if (sentiment === 'negative') urgency += 3;
  else if (sentiment === 'somewhat_negative') urgency += 2;
  else if (sentiment === 'positive') urgency -= 2;
  
  // Adjust based on feedback type
  if (type === 'bug') urgency += 3;
  else if (type === 'feature') urgency -= 1;
  
  // Ensure urgency is within 1-10 range
  return Math.min(Math.max(urgency, 1), 10);
};

/**
 * Extract categories from feedback text
 * Uses simple keyword matching
 */
const extractCategories = (text) => {
  const categories = [];
  const lowercaseText = text.toLowerCase();
  
  // Define category keywords
  const categoryKeywords = {
    'ui': ['layout', 'design', 'interface', 'button', 'screen', 'color', 'ui', 'theme'],
    'performance': ['slow', 'fast', 'speed', 'performance', 'loading', 'response', 'lag'],
    'features': ['feature', 'functionality', 'option', 'ability', 'capability'],
    'usability': ['easy', 'difficult', 'intuitive', 'confusing', 'user-friendly', 'usability'],
    'authentication': ['login', 'signup', 'register', 'password', 'account', 'authentication'],
    'content': ['post', 'image', 'video', 'text', 'content', 'message'],
    'profile': ['profile', 'avatar', 'photo', 'information', 'bio', 'personal'],
    'anonymous': ['anonymous', 'privacy', 'hidden', 'secret'],
    'connections': ['friend', 'follow', 'connection', 'contact', 'network']
  };
  
  // Check each category
  Object.entries(categoryKeywords).forEach(([category, keywords]) => {
    for (const keyword of keywords) {
      if (lowercaseText.includes(keyword)) {
        categories.push(category);
        break; // Once category is added, no need to check more keywords
      }
    }
  });
  
  return categories.length ? categories : ['general'];
};

module.exports = exports; 