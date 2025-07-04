const express = require('express');
const router = express.Router({ mergeParams: true });

const {
  createComment,
  getComments,
  getReplies,
  updateComment,
  deleteComment,
  likeComment,
  unlikeComment
} = require('../controllers/comment.controller');

const { authenticateUser } = require('../middleware/auth.middleware');
const { isVerified } = require('../middleware/verification');

// @route   POST /api/posts/:postId/comments
// @desc    Create a comment
// @access  Private + Verified
router.post('/', authenticateUser, isVerified, createComment);

// @route   GET /api/posts/:postId/comments
// @desc    Get all comments for a post
// @access  Private
router.get('/', authenticateUser, getComments);

// @route   GET /api/posts/:postId/comments/:commentId/replies
// @desc    Get replies for a comment
// @access  Private
router.get('/:commentId/replies', authenticateUser, getReplies);

// @route   PUT /api/posts/:postId/comments/:commentId
// @desc    Update a comment
// @access  Private + Verified
router.put('/:commentId', authenticateUser, isVerified, updateComment);

// @route   DELETE /api/posts/:postId/comments/:commentId
// @desc    Delete a comment
// @access  Private
router.delete('/:commentId', authenticateUser, deleteComment);

// @route   PUT /api/posts/:postId/comments/:commentId/like
// @desc    Like a comment
// @access  Private
router.put('/:commentId/like', authenticateUser, likeComment);

// @route   PUT /api/posts/:postId/comments/:commentId/unlike
// @desc    Unlike a comment
// @access  Private
router.put('/:commentId/unlike', authenticateUser, unlikeComment);

module.exports = router; 