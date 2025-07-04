const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const messageController = require('../controllers/message.controller');
const { authenticateUser } = require('../middleware/auth.middleware');

// Apply authentication to all routes
router.use(authenticateUser);

// Validation rules
const sendMessageValidation = [
  body('conversationId').isMongoId().withMessage('Valid conversation ID is required'),
  body('content').trim().isLength({ min: 1, max: 2000 }).withMessage('Message content must be between 1 and 2000 characters'),
  body('type').optional().isIn(['text', 'image', 'file', 'audio']).withMessage('Invalid message type'),
  body('replyTo').optional().isMongoId().withMessage('Invalid reply message ID')
];

const startConversationValidation = [
  body('participantId').isMongoId().withMessage('Valid participant ID is required'),
  body('initialMessage').optional().trim().isLength({ min: 1, max: 2000 }).withMessage('Initial message must be between 1 and 2000 characters')
];

const reactionValidation = [
  body('emoji').trim().isLength({ min: 1, max: 10 }).withMessage('Emoji is required')
];

// Routes

// @route   GET /api/messages/conversations
// @desc    Get all conversations for the authenticated user
// @access  Private
router.get('/conversations', messageController.getConversations);

// @route   GET /api/messages/conversations/:conversationId
// @desc    Get messages in a specific conversation
// @access  Private
router.get('/conversations/:conversationId', messageController.getMessages);

// @route   POST /api/messages/send
// @desc    Send a new message
// @access  Private
router.post('/send', sendMessageValidation, messageController.sendMessage);

// @route   POST /api/messages/conversations/start
// @desc    Start a new conversation
// @access  Private
router.post('/conversations/start', startConversationValidation, messageController.startConversation);

// @route   GET /api/messages/users/search
// @desc    Search users to start conversations with
// @access  Private
router.get('/users/search', messageController.searchUsers);

// @route   POST /api/messages/:messageId/reaction
// @desc    Add reaction to a message
// @access  Private
router.post('/:messageId/reaction', reactionValidation, messageController.addReaction);

// @route   DELETE /api/messages/:messageId/reaction
// @desc    Remove reaction from a message
// @access  Private
router.delete('/:messageId/reaction', async (req, res) => {
  try {
    const userId = req.user.id;
    const { messageId } = req.params;

    const Message = require('../models/message.model');
    const message = await Message.findById(messageId)
      .populate('conversation', 'participants');

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Verify user is participant in conversation
    if (!message.conversation.participants.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await message.removeReaction(userId);

    res.json({
      success: true,
      data: message.reactions
    });
  } catch (error) {
    console.error('Error removing reaction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove reaction'
    });
  }
});

// @route   GET /api/messages/unread-count
// @desc    Get total unread message count for user
// @access  Private
router.get('/unread-count', messageController.getUnreadCount);

// @route   PUT /api/messages/conversations/:conversationId/read
// @desc    Mark all messages in conversation as read
// @access  Private
router.put('/conversations/:conversationId/read', messageController.markConversationAsRead);

module.exports = router;
