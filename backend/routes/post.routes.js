const express = require('express');
const router = express.Router();

const { 
  createPost, 
  getPosts, 
  getPostById,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  savePost,
  unsavePost,
  getUserPosts
} = require('../controllers/post.controller');

const { authenticateUser } = require('../middleware/auth.middleware');
const { isVerified } = require('../middleware/verification');

// @route   POST /api/posts
// @desc    Create a post
// @access  Private + Verified
router.post('/', authenticateUser, isVerified, createPost);

// @route   GET /api/posts
// @desc    Get all posts (feed)
// @access  Private
router.get('/', authenticateUser, getPosts);

// @route   GET /api/posts/:id
// @desc    Get post by ID
// @access  Private
router.get('/:id', authenticateUser, getPostById);

// @route   PUT /api/posts/:id
// @desc    Update a post
// @access  Private + Verified
router.put('/:id', authenticateUser, isVerified, updatePost);

// @route   DELETE /api/posts/:id
// @desc    Delete a post
// @access  Private
router.delete('/:id', authenticateUser, deletePost);

// @route   PUT /api/posts/:id/like
// @desc    Like a post
// @access  Private
router.put('/:id/like', authenticateUser, likePost);

// @route   PUT /api/posts/:id/unlike
// @desc    Unlike a post
// @access  Private
router.put('/:id/unlike', authenticateUser, unlikePost);

// @route   PUT /api/posts/:id/save
// @desc    Save a post
// @access  Private
router.put('/:id/save', authenticateUser, savePost);

// @route   PUT /api/posts/:id/unsave
// @desc    Unsave a post
// @access  Private
router.put('/:id/unsave', authenticateUser, unsavePost);

// @route   GET /api/posts/user/:userId
// @desc    Get posts by user ID
// @access  Private
router.get('/user/:userId', authenticateUser, getUserPosts);

// @route   GET /api/posts/me
// @desc    Get current user's posts
// @access  Private
router.get('/me', authenticateUser, getUserPosts);

module.exports = router;