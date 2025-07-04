const express = require('express');
const router = express.Router();

const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} = require('../controllers/notification.controller');

const { authenticateUser } = require('../middleware/auth.middleware');

// @route   GET /api/notifications
// @desc    Get user's notifications
// @access  Private
router.get('/', authenticateUser, getNotifications);

// @route   PUT /api/notifications/:id
// @desc    Mark notification as read
// @access  Private
router.put('/:id', authenticateUser, markAsRead);

// @route   PUT /api/notifications
// @desc    Mark all notifications as read
// @access  Private
router.put('/', authenticateUser, markAllAsRead);

// @route   DELETE /api/notifications/:id
// @desc    Delete notification
// @access  Private
router.delete('/:id', authenticateUser, deleteNotification);

module.exports = router; 