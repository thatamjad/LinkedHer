const AnonymousPost = require('../models/anonymousPost.model');
const AnonymousPersona = require('../models/anonymousPersona.model');
const cryptoUtils = require('../utils/cryptoUtils');
const path = require('path');
const fs = require('fs').promises;

/**
 * Controller for anonymous posts
 * Implements features for private, unlinkable content creation
 */

// Create a new anonymous post
const createPost = async (req, res) => {
  try {
    // Ensure we're in anonymous mode and have a persona
    if (!req.anonymousMode || !req.anonymousPersona) {
      return res.status(400).json({
        success: false,
        message: 'This endpoint is only available in anonymous mode'
      });
    }

    const { content, mediaUrls = [], lifespan = 0 } = req.body;
    const { personaId } = req.anonymousPersona;

    // Basic validation
    if (!content && (!mediaUrls || mediaUrls.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Post must contain either text content or media'
      });
    }

    // Create post object
    const post = new AnonymousPost({
      personaId,
      content,
      mediaUrls: [],
      // Other fields will be set by pre-save hooks or defaults
    });

    // Process media URLs if present
    if (mediaUrls && mediaUrls.length > 0) {
      // In a real implementation, we would process the uploaded files here
      // and strip metadata using the cryptoUtils.stripMetadata function
      
      // For now, we'll simulate the process by just adding the URLs
      post.mediaUrls = mediaUrls;
    }

    // Set expiry date if lifespan is provided
    if (lifespan > 0) {
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + lifespan);
      post.disappearsAt = expiryDate;
    }

    // Generate content hash for integrity verification
    post.integrity = {
      contentHash: cryptoUtils.hashContent(content)
      // In a real implementation, we would also add a signature here
      // using the user's private key from their client
    };

    await post.save();

    return res.status(201).json({
      success: true,
      message: 'Anonymous post created successfully',
      post: post.toJSON()
    });
  } catch (error) {
    console.error('Create anonymous post error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create anonymous post'
    });
  }
};

// Get anonymous posts for the anonymous feed
const getAnonymousFeed = async (req, res) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get posts that aren't hidden and haven't expired
    const query = {
      'privacySettings.isHidden': false,
      $or: [
        { disappearsAt: { $exists: false } },
        { disappearsAt: { $gt: new Date() } }
      ],
      'moderation.isRemoved': false
    };

    // Execute query with pagination
    const posts = await AnonymousPost.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await AnonymousPost.countDocuments(query);

    // Enhance posts with persona details
    const enhancedPosts = await Promise.all(posts.map(async (post) => {
      const persona = await AnonymousPersona.findOne({ personaId: post.personaId });
      
      // Convert to JSON to apply toJSON transformations
      const postObj = post.toJSON();
      
      // Add persona details if found
      if (persona) {
        postObj.persona = {
          personaId: persona.personaId,
          displayName: persona.displayName,
          avatarUrl: persona.avatarUrl
        };
      }
      
      return postObj;
    }));

    return res.json({
      success: true,
      posts: enhancedPosts,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get anonymous feed error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve anonymous posts'
    });
  }
};

// Get a specific anonymous post by ID
const getPostById = async (req, res) => {
  try {
    const { postId } = req.params;

    // Find post
    const post = await AnonymousPost.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if post has expired
    if (post.disappearsAt && post.disappearsAt < new Date()) {
      return res.status(404).json({
        success: false,
        message: 'This post has expired and is no longer available'
      });
    }

    // Check if post has been removed by moderation
    if (post.moderation.isRemoved) {
      return res.status(403).json({
        success: false,
        message: 'This post has been removed due to violation of community guidelines'
      });
    }

    // Get persona details
    const persona = await AnonymousPersona.findOne({ personaId: post.personaId });

    // Convert to JSON to apply toJSON transformations
    const postObj = post.toJSON();

    // Add persona details if found
    if (persona) {
      postObj.persona = {
        personaId: persona.personaId,
        displayName: persona.displayName,
        avatarUrl: persona.avatarUrl
      };
    }

    // Increment view count
    post.engagement.views += 1;
    await post.save();

    return res.json({
      success: true,
      post: postObj
    });
  } catch (error) {
    console.error('Get post error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve post'
    });
  }
};

// Like or unlike an anonymous post
const toggleLike = async (req, res) => {
  try {
    // Ensure we're in anonymous mode and have a persona
    if (!req.anonymousMode || !req.anonymousPersona) {
      return res.status(400).json({
        success: false,
        message: 'This endpoint is only available in anonymous mode'
      });
    }

    const { postId } = req.params;
    const { personaId } = req.anonymousPersona;

    // Find post
    const post = await AnonymousPost.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if post has expired
    if (post.disappearsAt && post.disappearsAt < new Date()) {
      return res.status(404).json({
        success: false,
        message: 'This post has expired and is no longer available'
      });
    }

    // Toggle like
    const result = await post.toggleLike(personaId);
    await post.save();

    return res.json({
      success: true,
      message: result.action === 'liked' ? 'Post liked' : 'Post unliked',
      likes: post.engagement.likes.length
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to toggle like'
    });
  }
};

// Add a comment to an anonymous post
const addComment = async (req, res) => {
  try {
    // Ensure we're in anonymous mode and have a persona
    if (!req.anonymousMode || !req.anonymousPersona) {
      return res.status(400).json({
        success: false,
        message: 'This endpoint is only available in anonymous mode'
      });
    }

    const { postId } = req.params;
    const { content, lifespan = 0 } = req.body;
    const { personaId } = req.anonymousPersona;

    // Validate input
    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
    }

    // Find post
    const post = await AnonymousPost.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if post has expired
    if (post.disappearsAt && post.disappearsAt < new Date()) {
      return res.status(404).json({
        success: false,
        message: 'This post has expired and is no longer available'
      });
    }

    // Add comment
    const comment = await post.addComment(personaId, content, lifespan);
    await post.save();

    // Get persona details for the comment
    const persona = await AnonymousPersona.findOne({ personaId });

    return res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comment: {
        ...comment.toObject(),
        persona: persona ? {
          personaId: persona.personaId,
          displayName: persona.displayName,
          avatarUrl: persona.avatarUrl
        } : null
      }
    });
  } catch (error) {
    console.error('Add comment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add comment'
    });
  }
};

// Delete an anonymous post (only the author can delete)
const deletePost = async (req, res) => {
  try {
    // Ensure we're in anonymous mode and have a persona
    if (!req.anonymousMode || !req.anonymousPersona) {
      return res.status(400).json({
        success: false,
        message: 'This endpoint is only available in anonymous mode'
      });
    }

    const { postId } = req.params;
    const { personaId } = req.anonymousPersona;

    // Find post and check ownership
    const post = await AnonymousPost.findOne({
      _id: postId,
      personaId
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found or you do not have permission to delete it'
      });
    }

    // Delete the post
    await post.delete();

    return res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete post'
    });
  }
};

// Upload media with metadata stripping for anonymous posts
const uploadMedia = async (req, res) => {
  try {
    // Ensure we're in anonymous mode and have a persona
    if (!req.anonymousMode || !req.anonymousPersona) {
      return res.status(400).json({
        success: false,
        message: 'This endpoint is only available in anonymous mode'
      });
    }

    // In a real implementation, we'd handle file upload here
    // For now, simulate the process

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Process the file (strip metadata)
    const processedFilePath = await cryptoUtils.stripMetadata(req.file.path);

    // Generate a random file name to prevent tracking
    const fileExt = path.extname(req.file.originalname);
    const randomFileName = `${crypto.randomBytes(16).toString('hex')}${fileExt}`;
    
    // In a real implementation, we'd move the file to a permanent location
    // For now, simulate the process
    const mediaUrl = `/uploads/anonymous/${randomFileName}`;

    return res.status(201).json({
      success: true,
      message: 'Media uploaded successfully',
      mediaUrl,
      type: req.file.mimetype.startsWith('image/') ? 'image' : 'video'
    });
  } catch (error) {
    console.error('Upload media error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload media'
    });
  }
};

module.exports = {
  createPost,
  getAnonymousFeed,
  getPostById,
  toggleLike,
  addComment,
  deletePost,
  uploadMedia
}; 