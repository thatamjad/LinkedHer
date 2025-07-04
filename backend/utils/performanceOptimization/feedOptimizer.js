/**
 * AuraConnect Feed Performance Optimization Module
 * 
 * This module implements optimizations for feed rendering and loading
 * to improve performance and user experience.
 */

const mongoose = require('mongoose');
const redis = require('redis');
const { promisify } = require('util');
const dotenv = require('dotenv');

dotenv.config();

// Initialize Redis client for caching
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// Promisify Redis commands
const getAsync = promisify(redisClient.get).bind(redisClient);
const setAsync = promisify(redisClient.set).bind(redisClient);
const delAsync = promisify(redisClient.del).bind(redisClient);

// Cache TTL in seconds
const CACHE_TTL = {
  FEED: 300, // 5 minutes for feed caching
  USER: 600, // 10 minutes for user profile caching
  POST: 900  // 15 minutes for individual post caching
};

/**
 * Feed optimization service with caching, pagination, and selective loading
 */
class FeedOptimizer {
  /**
   * Get optimized feed for a user with caching
   * @param {string} userId - User ID requesting the feed
   * @param {Object} options - Feed options (page, limit, filters)
   * @returns {Array} - Feed posts with optimized data
   */
  static async getOptimizedFeed(userId, options = {}) {
    const {
      page = 1,
      limit = 10,
      filters = {},
      forceRefresh = false
    } = options;
    
    const cacheKey = `feed:${userId}:${page}:${limit}:${JSON.stringify(filters)}`;
    
    // Try to get from cache first unless force refresh is requested
    if (!forceRefresh) {
      const cachedFeed = await getAsync(cacheKey);
      if (cachedFeed) {
        console.log('Feed cache hit');
        return JSON.parse(cachedFeed);
      }
    }
    
    console.log('Feed cache miss, fetching from database');
    
    // Fetch feed from database with pagination and optimization
    const feed = await this._fetchFeedFromDatabase(userId, page, limit, filters);
    
    // Cache the result
    await setAsync(cacheKey, JSON.stringify(feed), 'EX', CACHE_TTL.FEED);
    
    return feed;
  }
  
  /**
   * Fetch feed data from database with optimizations
   * @private
   */
  static async _fetchFeedFromDatabase(userId, page, limit, filters) {
    const skip = (page - 1) * limit;
    
    // Get Post model from mongoose - assume it's already defined elsewhere
    const Post = mongoose.model('Post');
    const User = mongoose.model('User');
    
    // Get user's following list for feed personalization
    const user = await User.findById(userId).select('following preferences blockedUsers');
    
    // Build query based on user's network and preferences
    const query = {
      // Don't show posts from blocked users
      author: { $nin: user.blockedUsers },
      
      // Apply additional filters
      ...(filters.postType && { postType: filters.postType }),
      ...(filters.tags && { tags: { $in: filters.tags } }),
      
      // Default to show posts from followed users and public posts
      $or: [
        { author: { $in: user.following } },
        { visibility: 'public' }
      ]
    };
    
    // Projection to limit fields for better performance
    const projection = {
      content: 1,
      author: 1,
      createdAt: 1,
      mediaUrls: 1,
      likes: { $size: '$likes' }, // Count likes instead of returning full array
      comments: { $size: '$comments' }, // Count comments instead of returning full array
      tags: 1,
      postType: 1
    };
    
    // Fetch posts with optimized query
    const posts = await Post.find(query)
      .select(projection)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'author',
        select: 'name profilePicture professionalTitle'
      })
      .lean();
    
    // Further optimize response by transforming data
    return posts.map(post => this._optimizePostForFeed(post, userId));
  }
  
  /**
   * Optimize post data for feed display
   * @private
   */
  static _optimizePostForFeed(post, viewerId) {
    // Convert MongoDB ObjectIds to strings for JSON and add user-specific data
    return {
      id: post._id.toString(),
      content: post.content,
      createdAt: post.createdAt,
      
      // For media, only send URLs, not full objects
      mediaUrls: post.mediaUrls ? post.mediaUrls.map(m => typeof m === 'string' ? m : m.url) : [],
      
      // Author basic info
      author: {
        id: post.author._id.toString(),
        name: post.author.name,
        profilePicture: post.author.profilePicture,
        professionalTitle: post.author.professionalTitle
      },
      
      // Engagement metrics
      engagement: {
        likeCount: post.likes || 0,
        commentCount: post.comments || 0,
        // Add viewer-specific engagement status if needed
      },
      
      tags: post.tags || [],
      postType: post.postType
    };
  }
  
  /**
   * Invalidate cache when data changes
   * @param {string} userId - User ID whose feed needs refresh
   */
  static async invalidateUserFeed(userId) {
    // Delete all cached feed pages for this user
    // This uses Redis pattern matching to find all related keys
    const pattern = `feed:${userId}:*`;
    
    // Get matching keys and delete them
    redisClient.keys(pattern, (err, keys) => {
      if (err) return console.error('Cache invalidation error:', err);
      
      if (keys.length) {
        redisClient.del(keys, (err) => {
          if (err) return console.error('Cache deletion error:', err);
          console.log(`Invalidated ${keys.length} feed cache entries for user ${userId}`);
        });
      }
    });
  }
  
  /**
   * Invalidate cache when a post changes
   * @param {string} postId - Post ID that was updated/deleted
   */
  static async invalidatePostCache(postId) {
    // For post updates, we need broader invalidation
    // since we don't know which users have this in their feed
    const Post = mongoose.model('Post');
    
    try {
      const post = await Post.findById(postId).select('author');
      
      if (post) {
        // At minimum invalidate the author's feed
        await this.invalidateUserFeed(post.author.toString());
        
        // For popular posts, consider more sophisticated cache invalidation
      }
    } catch (error) {
      console.error('Post cache invalidation error:', error);
    }
  }
  
  /**
   * Monitor database performance and feed rendering metrics
   */
  static monitorPerformance() {
    // Implementation for monitoring query performance
    // This would integrate with application monitoring systems
    console.log('Feed performance monitoring enabled');
    
    // Return statistics about database and cache performance
    return {
      cacheHitRate: 0.85, // Example metrics
      avgQueryTime: 45, // ms
      avgRenderTime: 120 // ms
    };
  }
}

module.exports = FeedOptimizer; 