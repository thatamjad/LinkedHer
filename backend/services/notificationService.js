const Notification = require('../models/notification.model');

/**
 * Creates and sends a notification.
 * @param {object} io - The Socket.IO instance.
 * @param {string} recipient - The ID of the user receiving the notification.
 * @param {string} sender - The ID of the user who triggered the notification.
 * @param {string} type - The type of notification (e.g., 'like_post').
 * @param {object} reference - An object containing references to related documents (e.g., { post: postId }).
 * @param {object} content - An object containing the notification title and body.
 */
const sendNotification = async ({ io, recipient, sender, type, reference, content }) => {
  try {
    // 1. Don't send notification if the recipient and sender are the same
    if (recipient.toString() === sender.toString()) {
      return;
    }

    // 2. Create the notification in the database
    const notification = await Notification.create({
      recipient,
      sender,
      type,
      reference,
      content,
    });

    // 3. Populate sender info for the real-time event
    const populatedNotification = await Notification.findById(notification._id)
      .populate('sender', 'firstName lastName profileImage');

    // 4. Emit a real-time event to the recipient's room
    if (io) {
      io.to(`user_${recipient}`).emit('new_notification', populatedNotification);
    }
    
    return populatedNotification;
  } catch (error) {
    console.error('Error sending notification:', error);
    // Depending on requirements, you might want to throw the error
    // or handle it gracefully without crashing the triggering action.
  }
};

module.exports = {
  sendNotification,
}; 