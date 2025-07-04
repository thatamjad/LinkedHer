import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import messageAPI from '../services/messageAPI';
import socketService from '../services/socketService';
import ConversationList from '../components/messages/ConversationList';
import ChatWindow from '../components/messages/ChatWindow';
import UserSearch from '../components/messages/UserSearch';
import './Messages.css';

const Messages = () => {
  const { user, token } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({});
  const socketInitialized = useRef(false);

  // Initialize socket connection
  useEffect(() => {
    if (token && !socketInitialized.current) {
      socketService.connect(token);
      socketInitialized.current = true;

      // Listen for new messages
      socketService.onNewMessage(handleNewMessage);

      // Listen for typing indicators
      socketService.onUserTyping(handleUserTyping);
      socketService.onUserStoppedTyping(handleUserStoppedTyping);
    }

    return () => {
      if (socketInitialized.current) {
        socketService.offNewMessage();
        socketService.disconnect();
        socketInitialized.current = false;
      }
    };
  }, [token]);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Load messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation._id);
      socketService.joinConversation(selectedConversation._id);
      
      // Mark conversation as read
      messageAPI.markConversationAsRead(selectedConversation._id)
        .then(() => {
          setUnreadCounts(prev => ({
            ...prev,
            [selectedConversation._id]: 0
          }));
        })
        .catch(console.error);
    }

    return () => {
      if (selectedConversation) {
        socketService.leaveConversation(selectedConversation._id);
      }
    };
  }, [selectedConversation]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await messageAPI.getConversations();
      
      if (response.success) {
        setConversations(response.data.conversations);
        
        // Set unread counts
        const counts = {};
        response.data.conversations.forEach(conv => {
          counts[conv._id] = conv.unreadCount || 0;
        });
        setUnreadCounts(counts);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      setMessagesLoading(true);
      const response = await messageAPI.getMessages(conversationId);
      
      if (response.success) {
        setMessages(response.data.messages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleNewMessage = ({ message, conversationId }) => {
    // Update messages if this is the selected conversation
    if (selectedConversation && selectedConversation._id === conversationId) {
      setMessages(prev => [...prev, message]);
      
      // Mark as read immediately if conversation is open
      messageAPI.markConversationAsRead(conversationId);
    } else {
      // Update unread count
      setUnreadCounts(prev => ({
        ...prev,
        [conversationId]: (prev[conversationId] || 0) + 1
      }));
    }

    // Update conversation list with new last message
    setConversations(prev => 
      prev.map(conv => 
        conv._id === conversationId 
          ? { ...conv, lastMessage: message, lastActivity: new Date() }
          : conv
      ).sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity))
    );
  };

  const handleUserTyping = ({ userId, conversationId }) => {
    if (selectedConversation && selectedConversation._id === conversationId) {
      setTypingUsers(prev => ({
        ...prev,
        [conversationId]: { ...prev[conversationId], [userId]: true }
      }));
    }
  };

  const handleUserStoppedTyping = ({ userId, conversationId }) => {
    if (selectedConversation && selectedConversation._id === conversationId) {
      setTypingUsers(prev => {
        const updated = { ...prev };
        if (updated[conversationId]) {
          delete updated[conversationId][userId];
          if (Object.keys(updated[conversationId]).length === 0) {
            delete updated[conversationId];
          }
        }
        return updated;
      });
    }
  };

  const handleSendMessage = async (content, replyTo = null) => {
    if (!selectedConversation || !content.trim()) return;

    try {
      const response = await messageAPI.sendMessage(
        selectedConversation._id, 
        content.trim(), 
        'text', 
        replyTo
      );
      
      if (response.success) {
        setMessages(prev => [...prev, response.data]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleStartConversation = async (participantId, initialMessage = null) => {
    try {
      const response = await messageAPI.startConversation(participantId, initialMessage);
      
      if (response.success) {
        await loadConversations();
        setSelectedConversation(response.data.conversation);
        setShowUserSearch(false);
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  const handleTypingStart = () => {
    if (selectedConversation) {
      socketService.startTyping(selectedConversation._id);
    }
  };

  const handleTypingStop = () => {
    if (selectedConversation) {
      socketService.stopTyping(selectedConversation._id);
    }
  };

  if (loading) {
    return (
      <div className="messages-loading">
        <div className="spinner"></div>
        <p>Loading conversations...</p>
      </div>
    );
  }

  return (
    <div className="messages-container">
      <div className="messages-header">
        <h1>Messages</h1>
        <button 
          className="new-message-btn"
          onClick={() => setShowUserSearch(true)}
        >
          <i className="fas fa-plus"></i>
          New Message
        </button>
      </div>

      <div className="messages-content">
        <div className="conversations-sidebar">
          <ConversationList
            conversations={conversations}
            selectedConversation={selectedConversation}
            onSelectConversation={setSelectedConversation}
            unreadCounts={unreadCounts}
            currentUserId={user?.id}
          />
        </div>

        <div className="chat-main">
          {selectedConversation ? (
            <ChatWindow
              conversation={selectedConversation}
              messages={messages}
              onSendMessage={handleSendMessage}
              onTypingStart={handleTypingStart}
              onTypingStop={handleTypingStop}
              typingUsers={typingUsers[selectedConversation._id] || {}}
              currentUser={user}
              loading={messagesLoading}
            />
          ) : (
            <div className="no-conversation-selected">
              <div className="no-conversation-content">
                <i className="fas fa-comments fa-3x"></i>
                <h3>Select a conversation</h3>
                <p>Choose from your existing conversations, or start a new one</p>
                <button 
                  className="start-conversation-btn"
                  onClick={() => setShowUserSearch(true)}
                >
                  Start New Conversation
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showUserSearch && (
        <UserSearch
          onSelectUser={handleStartConversation}
          onClose={() => setShowUserSearch(false)}
        />
      )}
    </div>
  );
};

export default Messages;
