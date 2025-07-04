const Post = require('../models/post.model');
const User = require('../models/user.model');
const { handleAsync } = require('../utils/errorHandler');
const { sendNotification } = require('../services/notificationService');

// Create a new post
exports.createPost = handleAsync(async (req, res) => {
  const { content, media, visibility, tags, mentions } = req.body;
  
  // Validate required fields
  if (!content || (!content.text && (!media || media.length === 0))) {
    return res.status(400).json({
      success: false,
      error: 'Post must contain text or media'
    });
  }
  
  // Create post
  const post = await Post.create({
    user: req.user.id,
    content,
    media,
    visibility,
    tags,
    mentions
  });
  
  // Populate user data for the response
  const populatedPost = await Post.findById(post._id)
    .populate('user', 'firstName lastName profileImage verificationStatus');
  
  return res.status(201).json({
    success: true,
    data: populatedPost
  });
});

// Get all posts (feed)
exports.getPosts = handleAsync(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  
  const posts = await Post.find({ visibility: 'public' })
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(limit)
    .populate('user', 'firstName lastName profileImage verificationStatus');
  
  const total = await Post.countDocuments({ visibility: 'public' });
  
  return res.status(200).json({
    success: true,
    count: posts.length,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data: posts
  });
});

// Get post by ID
exports.getPostById = handleAsync(async (req, res) => {
  const post = await Post.findById(req.params.id)
    .populate('user', 'firstName lastName profileImage verificationStatus');
  
  if (!post) {
    return res.status(404).json({
      success: false,
      error: 'Post not found'
    });
  }
  
  // Check if post is private and not owned by requester
  if (post.visibility === 'private' && post.user._id.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      error: 'You do not have permission to view this post'
    });
  }
  
  return res.status(200).json({
    success: true,
    data: post
  });
});

// Update post
exports.updatePost = handleAsync(async (req, res) => {
  let post = await Post.findById(req.params.id);
  
  if (!post) {
    return res.status(404).json({
      success: false,
      error: 'Post not found'
    });
  }
  
  // Check if user owns the post
  if (post.user.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      error: 'You are not authorized to update this post'
    });
  }
  
  // Save current version to edit history
  const editHistoryEntry = {
    content: post.content,
    media: post.media,
    editedAt: new Date()
  };
  
  // Update post with new data
  const { content, media, visibility, tags, mentions } = req.body;
  
  post = await Post.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        content,
        media,
        visibility,
        tags,
        mentions,
        isEdited: true
      },
      $push: { editHistory: editHistoryEntry }
    },
    { new: true }
  ).populate('user', 'firstName lastName profileImage verificationStatus');
  
  return res.status(200).json({
    success: true,
    data: post
  });
});

// Delete post
exports.deletePost = handleAsync(async (req, res) => {
  const post = await Post.findById(req.params.id);
  
  if (!post) {
    return res.status(404).json({
      success: false,
      error: 'Post not found'
    });
  }
  
  // Check if user owns the post
  if (post.user.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      error: 'You are not authorized to delete this post'
    });
  }
  
  await post.remove();
  
  return res.status(200).json({
    success: true,
    data: {}
  });
});

// Like a post
exports.likePost = handleAsync(async (req, res) => {
  const post = await Post.findById(req.params.id);
  
  if (!post) {
    return res.status(404).json({
      success: false,
      error: 'Post not found'
    });
  }
  
  // Check if post has already been liked by this user
  if (post.engagement.likes.users.includes(req.user.id)) {
    return res.status(400).json({
      success: false,
      error: 'Post already liked'
    });
  }
  
  // Add user to likes array and increment count
  post.engagement.likes.users.push(req.user.id);
  post.engagement.likes.count = post.engagement.likes.users.length;
  
  await post.save();
  
  // Send notification to the post author
  await sendNotification({
    io: req.io,
    recipient: post.user,
    sender: req.user.id,
    type: 'like_post',
    reference: { post: post._id },
    content: {
      title: `${req.user.firstName} ${req.user.lastName} liked your post.`
    }
  });
  
  return res.status(200).json({
    success: true,
    data: post.engagement.likes
  });
});

// Unlike a post
exports.unlikePost = handleAsync(async (req, res) => {
  const post = await Post.findById(req.params.id);
  
  if (!post) {
    return res.status(404).json({
      success: false,
      error: 'Post not found'
    });
  }
  
  // Check if post has been liked by this user
  if (!post.engagement.likes.users.includes(req.user.id)) {
    return res.status(400).json({
      success: false,
      error: 'Post has not been liked yet'
    });
  }
  
  // Remove user from likes array and decrement count
  post.engagement.likes.users = post.engagement.likes.users.filter(
    userId => userId.toString() !== req.user.id
  );
  post.engagement.likes.count = post.engagement.likes.users.length;
  
  await post.save();
  
  return res.status(200).json({
    success: true,
    data: post.engagement.likes
  });
});

// Save a post
exports.savePost = handleAsync(async (req, res) => {
  const post = await Post.findById(req.params.id);
  
  if (!post) {
    return res.status(404).json({
      success: false,
      error: 'Post not found'
    });
  }
  
  // Check if post has already been saved by this user
  if (post.engagement.saves.users.includes(req.user.id)) {
    return res.status(400).json({
      success: false,
      error: 'Post already saved'
    });
  }
  
  // Add user to saves array and increment count
  post.engagement.saves.users.push(req.user.id);
  post.engagement.saves.count = post.engagement.saves.users.length;
  
  await post.save();
  
  return res.status(200).json({
    success: true,
    data: post.engagement.saves
  });
});

// Unsave a post
exports.unsavePost = handleAsync(async (req, res) => {
  const post = await Post.findById(req.params.id);
  
  if (!post) {
    return res.status(404).json({
      success: false,
      error: 'Post not found'
    });
  }
  
  // Check if post has been saved by this user
  if (!post.engagement.saves.users.includes(req.user.id)) {
    return res.status(400).json({
      success: false,
      error: 'Post has not been saved yet'
    });
  }
  
  // Remove user from saves array and decrement count
  post.engagement.saves.users = post.engagement.saves.users.filter(
    userId => userId.toString() !== req.user.id
  );
  post.engagement.saves.count = post.engagement.saves.users.length;
  
  await post.save();
  
  return res.status(200).json({
    success: true,
    data: post.engagement.saves
  });
});

// Get user's posts
exports.getUserPosts = handleAsync(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  
  const userId = req.params.userId || req.user.id;
  
  // If requesting another user's posts, only get public ones
  const query = userId !== req.user.id
    ? { user: userId, visibility: 'public' }
    : { user: userId };
  
  const posts = await Post.find(query)
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(limit)
    .populate('user', 'firstName lastName profileImage verificationStatus');
  
  const total = await Post.countDocuments(query);
  
  return res.status(200).json({
    success: true,
    count: posts.length,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data: posts
  });
}); 