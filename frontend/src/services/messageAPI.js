import apiClient from './apiClient';

const messageAPI = {
  // Get all conversations
  getConversations: async (page = 1, limit = 20) => {
    try {
      const response = await apiClient.get(`/messages/conversations?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  },

  // Get messages in a conversation
  getMessages: async (conversationId, page = 1, limit = 50) => {
    try {
      const response = await apiClient.get(`/messages/conversations/${conversationId}?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  },

  // Send a message
  sendMessage: async (conversationId, content, type = 'text', replyTo = null) => {
    try {
      const response = await apiClient.post('/messages/send', {
        conversationId,
        content,
        type,
        replyTo
      });
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Start a new conversation
  startConversation: async (participantId, initialMessage = null) => {
    try {
      const response = await apiClient.post('/messages/conversations/start', {
        participantId,
        initialMessage
      });
      return response.data;
    } catch (error) {
      console.error('Error starting conversation:', error);
      throw error;
    }
  },

  // Search users
  searchUsers: async (query, page = 1, limit = 10) => {
    try {
      const response = await apiClient.get(`/messages/users/search?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  },

  // Add reaction to message
  addReaction: async (messageId, emoji) => {
    try {
      const response = await apiClient.post(`/messages/${messageId}/reaction`, {
        emoji
      });
      return response.data;
    } catch (error) {
      console.error('Error adding reaction:', error);
      throw error;
    }
  },

  // Remove reaction from message
  removeReaction: async (messageId) => {
    try {
      const response = await apiClient.delete(`/messages/${messageId}/reaction`);
      return response.data;
    } catch (error) {
      console.error('Error removing reaction:', error);
      throw error;
    }
  },

  // Get unread message count
  getUnreadCount: async () => {
    try {
      const response = await apiClient.get('/messages/unread-count');
      return response.data;
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  },

  // Mark conversation as read
  markConversationAsRead: async (conversationId) => {
    try {
      const response = await apiClient.put(`/messages/conversations/${conversationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking conversation as read:', error);
      throw error;
    }
  }
};

export default messageAPI;
