const Comment = require('../models/comment.model');
const Post = require('../models/post.model');
const { handleAsync } = require('../utils/errorHandler');

// Create a comment
exports.createComment = handleAsync(async (req, res) => {
  const { content, media, parentComment, mentions } = req.body;
  const postId = req.params.postId;
  
  // Validate content
  if (!content || !content.text) {
    return res.status(400).json({
      success: false,
      error: 'Comment text is required'
    });
  }
  
  // Check if post exists
  const post = await Post.findById(postId);
  if (!post) {
    return res.status(404).json({
      success: false,
      error: 'Post not found'
    });
  }
  
  // If this is a reply, check if parent comment exists
  if (parentComment) {
    const parentCommentDoc = await Comment.findById(parentComment);
    if (!parentCommentDoc) {
      return res.status(404).json({
        success: false,
        error: 'Parent comment not found'
      });
    }
    
    // Increment reply count on parent comment
    await Comment.findByIdAndUpdate(
      parentComment,
      { $inc: { 'engagement.replies.count': 1 } }
    );
  }
  
  // Create comment
  const comment = await Comment.create({
    post: postId,
    user: req.user.id,
    content,
    media,
    parentComment,
    mentions
  });
  
  // Populate user data
  const populatedComment = await Comment.findById(comment._id)
    .populate('user', 'firstName lastName profileImage verificationStatus');
  
  // Update post comment count
  await Post.findByIdAndUpdate(
    postId,
    { $inc: { 'engagement.comments.count': 1 } }
  );
  
  return res.status(201).json({
    success: true,
    data: populatedComment
  });
});

// Get comments for a post
exports.getComments = handleAsync(async (req, res) => {
  const postId = req.params.postId;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  
  // Get top-level comments (no parent)
  const comments = await Comment.find({ 
    post: postId, 
    parentComment: null,
    isDeleted: false
  })
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(limit)
    .populate('user', 'firstName lastName profileImage verificationStatus');
  
  const total = await Comment.countDocuments({ 
    post: postId, 
    parentComment: null,
    isDeleted: false
  });
  
  return res.status(200).json({
    success: true,
    count: comments.length,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data: comments
  });
});

// Get replies for a comment
exports.getReplies = handleAsync(async (req, res) => {
  const commentId = req.params.commentId;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  
  // Check if parent comment exists
  const parentComment = await Comment.findById(commentId);
  if (!parentComment) {
    return res.status(404).json({
      success: false,
      error: 'Comment not found'
    });
  }
  
  // Get replies
  const replies = await Comment.find({ 
    parentComment: commentId,
    isDeleted: false
  })
    .sort({ createdAt: 1 })
    .skip(startIndex)
    .limit(limit)
    .populate('user', 'firstName lastName profileImage verificationStatus');
  
  const total = await Comment.countDocuments({ 
    parentComment: commentId,
    isDeleted: false
  });
  
  return res.status(200).json({
    success: true,
    count: replies.length,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data: replies
  });
});

// Update a comment
exports.updateComment = handleAsync(async (req, res) => {
  const commentId = req.params.commentId;
  const { content, media, mentions } = req.body;
  
  let comment = await Comment.findById(commentId);
  
  if (!comment) {
    return res.status(404).json({
      success: false,
      error: 'Comment not found'
    });
  }
  
  // Check if user owns the comment
  if (comment.user.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      error: 'You are not authorized to update this comment'
    });
  }
  
  // Save current version to edit history
  const editHistoryEntry = {
    content: comment.content,
    editedAt: new Date()
  };
  
  // Update comment
  comment = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: {
        content,
        media,
        mentions,
        isEdited: true
      },
      $push: { editHistory: editHistoryEntry }
    },
    { new: true }
  ).populate('user', 'firstName lastName profileImage verificationStatus');
  
  return res.status(200).json({
    success: true,
    data: comment
  });
});

// Delete a comment (soft delete)
exports.deleteComment = handleAsync(async (req, res) => {
  const commentId = req.params.commentId;
  
  const comment = await Comment.findById(commentId);
  
  if (!comment) {
    return res.status(404).json({
      success: false,
      error: 'Comment not found'
    });
  }
  
  // Check if user owns the comment
  if (comment.user.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      error: 'You are not authorized to delete this comment'
    });
  }
  
  // Soft delete the comment
  comment.isDeleted = true;
  comment.content.text = '[This comment has been deleted]';
  comment.content.formatting = {};
  comment.media = [];
  comment.mentions = [];
  
  await comment.save();
  
  // If this is a top-level comment, update post comment count
  if (!comment.parentComment) {
    await Post.findByIdAndUpdate(
      comment.post,
      { $inc: { 'engagement.comments.count': -1 } }
    );
  } else {
    // If this is a reply, update parent comment reply count
    await Comment.findByIdAndUpdate(
      comment.parentComment,
      { $inc: { 'engagement.replies.count': -1 } }
    );
  }
  
  return res.status(200).json({
    success: true,
    data: {}
  });
});

// Like a comment
exports.likeComment = handleAsync(async (req, res) => {
  const commentId = req.params.commentId;
  
  const comment = await Comment.findById(commentId);
  
  if (!comment) {
    return res.status(404).json({
      success: false,
      error: 'Comment not found'
    });
  }
  
  // Check if comment has already been liked by this user
  if (comment.engagement.likes.users.includes(req.user.id)) {
    return res.status(400).json({
      success: false,
      error: 'Comment already liked'
    });
  }
  
  // Add user to likes array and increment count
  comment.engagement.likes.users.push(req.user.id);
  comment.engagement.likes.count = comment.engagement.likes.users.length;
  
  await comment.save();
  
  return res.status(200).json({
    success: true,
    data: comment.engagement.likes
  });
});

// Unlike a comment
exports.unlikeComment = handleAsync(async (req, res) => {
  const commentId = req.params.commentId;
  
  const comment = await Comment.findById(commentId);
  
  if (!comment) {
    return res.status(404).json({
      success: false,
      error: 'Comment not found'
    });
  }
  
  // Check if comment has been liked by this user
  if (!comment.engagement.likes.users.includes(req.user.id)) {
    return res.status(400).json({
      success: false,
      error: 'Comment has not been liked yet'
    });
  }
  
  // Remove user from likes array and decrement count
  comment.engagement.likes.users = comment.engagement.likes.users.filter(
    userId => userId.toString() !== req.user.id
  );
  comment.engagement.likes.count = comment.engagement.likes.users.length;
  
  await comment.save();
  
  return res.status(200).json({
    success: true,
    data: comment.engagement.likes
  });
}); 