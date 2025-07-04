const Message = require('../models/message.model');
const Conversation = require('../models/conversation.model');
const User = require('../models/user.model');
const { validationResult } = require('express-validator');

const messageController = {
  // Get all conversations for a user
  getConversations: async (req, res) => {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 20 } = req.query;

      const conversations = await Conversation.find({
        participants: userId,
        isActive: true
      })
      .populate('participants', 'firstName lastName email profileImage isOnline lastSeen')
      .populate({
        path: 'lastMessage',
        populate: {
          path: 'sender',
          select: 'firstName lastName'
        }
      })
      .sort({ lastActivity: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

      // Get unread counts for each conversation
      const conversationsWithUnread = await Promise.all(
        conversations.map(async (conv) => {
          const unreadCount = await Message.getUnreadCount(userId, conv._id);
          return {
            ...conv.toObject(),
            unreadCount
          };
        })
      );

      res.json({
        success: true,
        data: {
          conversations: conversationsWithUnread,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: await Conversation.countDocuments({
              participants: userId,
              isActive: true
            })
          }
        }
      });
    } catch (error) {
      console.error('Error fetching conversations:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch conversations'
      });
    }
  },

  // Get messages in a conversation
  getMessages: async (req, res) => {
    try {
      const userId = req.user.id;
      const { conversationId } = req.params;
      const { page = 1, limit = 50 } = req.query;

      // Verify user is participant in conversation
      const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: userId
      });

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: 'Conversation not found or access denied'
        });
      }

      const messages = await Message.find({
        conversation: conversationId,
        isDeleted: false
      })
      .populate('sender', 'firstName lastName profileImage')
      .populate('replyTo', 'content.text sender')
      .populate('readBy.user', 'firstName lastName')
      .populate('reactions.user', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

      // Mark messages as read
      const unreadMessages = messages.filter(msg => 
        !msg.sender._id.equals(userId) && 
        !msg.readBy.some(read => read.user._id.equals(userId))
      );

      await Promise.all(
        unreadMessages.map(msg => msg.markAsRead(userId))
      );

      res.json({
        success: true,
        data: {
          messages: messages.reverse(), // Reverse to get chronological order
          conversation,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: await Message.countDocuments({
              conversation: conversationId,
              isDeleted: false
            })
          }
        }
      });
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch messages'
      });
    }
  },

  // Send a new message
  sendMessage: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const userId = req.user.id;
      const { conversationId, content, type = 'text', replyTo } = req.body;

      // Verify user is participant in conversation
      const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: userId
      });

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: 'Conversation not found or access denied'
        });
      }

      // Create message
      const message = new Message({
        conversation: conversationId,
        sender: userId,
        content: {
          text: content,
          type: type
        },
        replyTo: replyTo || null
      });

      await message.save();

      // Populate message for response
      await message.populate('sender', 'firstName lastName profileImage');
      if (replyTo) {
        await message.populate('replyTo', 'content.text sender');
      }

      // Emit real-time message to conversation participants
      const io = req.app.get('io');
      if (io) {
        conversation.participants.forEach(participantId => {
          if (!participantId.equals(userId)) {
            io.to(`user_${participantId}`).emit('new_message', {
              message,
              conversationId
            });
          }
        });
      }

      res.status(201).json({
        success: true,
        data: message
      });
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send message'
      });
    }
  },

  // Start a new conversation
  startConversation: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const userId = req.user.id;
      const { participantId, initialMessage } = req.body;

      // Verify the other user exists
      const participant = await User.findById(participantId);
      if (!participant) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Create or find existing conversation
      const conversation = await Conversation.findOrCreateDirectConversation(userId, participantId);

      // Send initial message if provided
      let message = null;
      if (initialMessage) {
        message = new Message({
          conversation: conversation._id,
          sender: userId,
          content: {
            text: initialMessage,
            type: 'text'
          }
        });
        await message.save();
        await message.populate('sender', 'firstName lastName profileImage');
      }

      res.status(201).json({
        success: true,
        data: {
          conversation,
          message
        }
      });
    } catch (error) {
      console.error('Error starting conversation:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to start conversation'
      });
    }
  },

  // Search users to start conversations
  searchUsers: async (req, res) => {
    try {
      const userId = req.user.id;
      const { query, page = 1, limit = 10 } = req.query;

      if (!query || query.length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Search query must be at least 2 characters'
        });
      }

      const users = await User.find({
        _id: { $ne: userId },
        $or: [
          { firstName: { $regex: query, $options: 'i' } },
          { lastName: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } },
          { 'profile.headline': { $regex: query, $options: 'i' } }
        ]
      })
      .select('firstName lastName email profileImage profile.headline isOnline')
      .limit(limit * 1)
      .skip((page - 1) * limit);

      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      console.error('Error searching users:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search users'
      });
    }
  },

  // Add reaction to message
  addReaction: async (req, res) => {
    try {
      const userId = req.user.id;
      const { messageId } = req.params;
      const { emoji } = req.body;

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

      await message.addReaction(userId, emoji);

      res.json({
        success: true,
        data: message.reactions
      });
    } catch (error) {
      console.error('Error adding reaction:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add reaction'
      });
    }
  },

  // Get unread message count
  getUnreadCount: async (req, res) => {
    try {
      const userId = req.user.id;
      const unreadCount = await Message.getUnreadCount(userId);

      res.json({
        success: true,
        data: { unreadCount }
      });
    } catch (error) {
      console.error('Error getting unread count:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get unread count'
      });
    }
  },

  // Mark conversation as read
  markConversationAsRead: async (req, res) => {
    try {
      const userId = req.user.id;
      const { conversationId } = req.params;

      // Verify user is participant
      const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: userId
      });

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: 'Conversation not found'
        });
      }

      // Mark all unread messages as read
      const unreadMessages = await Message.find({
        conversation: conversationId,
        sender: { $ne: userId },
        'readBy.user': { $ne: userId },
        isDeleted: false
      });

      await Promise.all(
        unreadMessages.map(msg => msg.markAsRead(userId))
      );

      res.json({
        success: true,
        message: 'Conversation marked as read'
      });
    } catch (error) {
      console.error('Error marking conversation as read:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark conversation as read'
      });
    }
  }
};

module.exports = messageController;
