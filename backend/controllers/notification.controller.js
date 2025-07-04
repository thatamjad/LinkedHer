const Notification = require('../models/notification.model');
const { handleAsync } = require('../utils/errorHandler');

// Create a notification
exports.createNotification = handleAsync(async (req, res) => {
  const { recipient, type, reference, content } = req.body;
  
  // Don't create self-notifications
  if (recipient === req.user.id) {
    return res.status(200).json({
      success: true,
      data: null
    });
  }
  
  const notification = await Notification.create({
    recipient,
    sender: req.user.id,
    type,
    reference,
    content
  });
  
  // Emit socket event with the io instance (will be set up in socket middleware)
  if (req.io) {
    req.io.to(`user_${recipient}`).emit('new_notification', notification);
  }
  
  return res.status(201).json({
    success: true,
    data: notification
  });
});

// Get user's notifications
exports.getNotifications = handleAsync(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const startIndex = (page - 1) * limit;
  
  const notifications = await Notification.find({ recipient: req.user.id })
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(limit)
    .populate('sender', 'firstName lastName profileImage')
    .populate('reference.post')
    .populate('reference.comment')
    .populate('reference.profile');
  
  const total = await Notification.countDocuments({ recipient: req.user.id });
  const unreadCount = await Notification.countDocuments({ 
    recipient: req.user.id,
    isRead: false
  });
  
  return res.status(200).json({
    success: true,
    count: notifications.length,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    unreadCount,
    data: notifications
  });
});

// Mark a notification as read
exports.markAsRead = handleAsync(async (req, res) => {
  const notificationId = req.params.id;
  
  const notification = await Notification.findById(notificationId);
  
  if (!notification) {
    return res.status(404).json({
      success: false,
      error: 'Notification not found'
    });
  }
  
  // Check if user owns the notification
  if (notification.recipient.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      error: 'You are not authorized to access this notification'
    });
  }
  
  notification.isRead = true;
  notification.readAt = new Date();
  await notification.save();
  
  return res.status(200).json({
    success: true,
    data: notification
  });
});

// Mark all notifications as read
exports.markAllAsRead = handleAsync(async (req, res) => {
  await Notification.updateMany(
    { 
      recipient: req.user.id,
      isRead: false
    },
    {
      $set: { 
        isRead: true,
        readAt: new Date()
      }
    }
  );
  
  return res.status(200).json({
    success: true,
    message: 'All notifications marked as read'
  });
});

// Delete a notification
exports.deleteNotification = handleAsync(async (req, res) => {
  const notificationId = req.params.id;
  
  const notification = await Notification.findById(notificationId);
  
  if (!notification) {
    return res.status(404).json({
      success: false,
      error: 'Notification not found'
    });
  }
  
  // Check if user owns the notification
  if (notification.recipient.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      error: 'You are not authorized to delete this notification'
    });
  }
  
  await notification.remove();
  
  return res.status(200).json({
    success: true,
    data: {}
  });
}); 