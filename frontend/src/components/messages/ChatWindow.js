import React, { useState, useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import './ChatWindow.css';

const ChatWindow = ({
  conversation,
  messages,
  onSendMessage,
  onTypingStart,
  onTypingStop,
  typingUsers,
  currentUser,
  loading
}) => {
  const messagesEndRef = useRef(null);
  const [replyingTo, setReplyingTo] = useState(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getConversationTitle = () => {
    if (conversation.type === 'group') {
      return conversation.title || 'Group Chat';
    }
    
    const otherParticipant = conversation.participants.find(p => p._id !== currentUser?.id);
    return otherParticipant ? `${otherParticipant.firstName} ${otherParticipant.lastName}` : 'Unknown User';
  };

  const getParticipantInfo = () => {
    if (conversation.type === 'group') {
      return `${conversation.participants.length} members`;
    }
    
    const otherParticipant = conversation.participants.find(p => p._id !== currentUser?.id);
    if (otherParticipant) {
      if (otherParticipant.isOnline) {
        return 'Online';
      } else if (otherParticipant.lastSeen) {
        const lastSeen = new Date(otherParticipant.lastSeen);
        const now = new Date();
        const diff = now - lastSeen;
        
        if (diff < 60 * 1000) { // Less than 1 minute
          return 'Just now';
        } else if (diff < 60 * 60 * 1000) { // Less than 1 hour
          const minutes = Math.floor(diff / (60 * 1000));
          return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        } else if (diff < 24 * 60 * 60 * 1000) { // Less than 24 hours
          const hours = Math.floor(diff / (60 * 60 * 1000));
          return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else {
          return lastSeen.toLocaleDateString();
        }
      }
    }
    
    return 'Offline';
  };

  const handleSendMessage = (content) => {
    onSendMessage(content, replyingTo?._id);
    setReplyingTo(null);
  };

  const handleReplyToMessage = (message) => {
    setReplyingTo(message);
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };

  // Group messages by date
  const groupMessagesByDate = (messages) => {
    const groups = {};
    
    messages.forEach(message => {
      const date = new Date(message.createdAt).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    return Object.entries(groups).map(([date, msgs]) => ({
      date: new Date(date),
      messages: msgs
    }));
  };

  const formatDateHeader = (date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-header-info">
          <h3>{getConversationTitle()}</h3>
          <p className="participant-status">{getParticipantInfo()}</p>
        </div>
        <div className="chat-header-actions">
          <button className="header-action-btn" title="Call">
            <i className="fas fa-phone"></i>
          </button>
          <button className="header-action-btn" title="Video call">
            <i className="fas fa-video"></i>
          </button>
          <button className="header-action-btn" title="More options">
            <i className="fas fa-ellipsis-v"></i>
          </button>
        </div>
      </div>

      <div className="chat-messages">
        {loading ? (
          <div className="messages-loading">
            <div className="spinner"></div>
            <p>Loading messages...</p>
          </div>
        ) : (
          <>
            {messageGroups.map(({ date, messages: dayMessages }) => (
              <div key={date.toDateString()} className="message-group">
                <div className="date-header">
                  <span>{formatDateHeader(date)}</span>
                </div>
                {dayMessages.map((message, index) => {
                  const prevMessage = dayMessages[index - 1];
                  const isGrouped = prevMessage && 
                    prevMessage.sender._id === message.sender._id &&
                    (new Date(message.createdAt) - new Date(prevMessage.createdAt)) < 5 * 60 * 1000; // 5 minutes
                  
                  return (
                    <MessageBubble
                      key={message._id}
                      message={message}
                      isOwn={message.sender._id === currentUser?.id}
                      isGrouped={isGrouped}
                      onReply={() => handleReplyToMessage(message)}
                    />
                  );
                })}
              </div>
            ))}
            
            {Object.keys(typingUsers).length > 0 && (
              <TypingIndicator typingUsers={typingUsers} />
            )}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <MessageInput
        onSendMessage={handleSendMessage}
        onTypingStart={onTypingStart}
        onTypingStop={onTypingStop}
        replyingTo={replyingTo}
        onCancelReply={cancelReply}
      />
    </div>
  );
};

export default ChatWindow;
