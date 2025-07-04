import React from 'react';
import './ConversationList.css';

const ConversationList = ({ 
  conversations, 
  selectedConversation, 
  onSelectConversation, 
  unreadCounts, 
  currentUserId 
}) => {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 24 * 60 * 60 * 1000) { // Less than 24 hours
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diff < 7 * 24 * 60 * 60 * 1000) { // Less than 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getConversationTitle = (conversation) => {
    if (conversation.type === 'group') {
      return conversation.title || 'Group Chat';
    }
    
    // For direct conversations, show the other participant's name
    const otherParticipant = conversation.participants.find(p => p._id !== currentUserId);
    return otherParticipant ? `${otherParticipant.firstName} ${otherParticipant.lastName}` : 'Unknown User';
  };

  const getConversationAvatar = (conversation) => {
    if (conversation.type === 'group') {
      return (
        <div className="group-avatar">
          <i className="fas fa-users"></i>
        </div>
      );
    }
    
    const otherParticipant = conversation.participants.find(p => p._id !== currentUserId);
    return (
      <div className="user-avatar">
        {otherParticipant?.profileImage ? (
          <img src={otherParticipant.profileImage} alt="" />
        ) : (
          <div className="avatar-initials">
            {otherParticipant ? 
              `${otherParticipant.firstName?.[0] || ''}${otherParticipant.lastName?.[0] || ''}`.toUpperCase() :
              '?'
            }
          </div>
        )}
        {otherParticipant?.isOnline && <div className="online-indicator"></div>}
      </div>
    );
  };

  const getLastMessagePreview = (conversation) => {
    if (!conversation.lastMessage) {
      return 'No messages yet';
    }

    const message = conversation.lastMessage;
    const senderName = message.sender?._id === currentUserId ? 'You' : message.sender?.firstName || 'Someone';
    
    let preview = '';
    
    switch (message.content?.type) {
      case 'text':
        preview = message.content.text;
        break;
      case 'image':
        preview = '📷 Photo';
        break;
      case 'file':
        preview = '📎 File';
        break;
      case 'audio':
        preview = '🎵 Audio message';
        break;
      default:
        preview = 'Message';
    }

    return `${senderName}: ${preview}`;
  };

  if (!conversations.length) {
    return (
      <div className="conversation-list empty">
        <div className="empty-state">
          <i className="fas fa-comments fa-2x"></i>
          <p>No conversations yet</p>
          <small>Start a new conversation to get started</small>
        </div>
      </div>
    );
  }

  return (
    <div className="conversation-list">
      {conversations.map((conversation) => (
        <div
          key={conversation._id}
          className={`conversation-item ${
            selectedConversation?._id === conversation._id ? 'selected' : ''
          }`}
          onClick={() => onSelectConversation(conversation)}
        >
          <div className="conversation-avatar">
            {getConversationAvatar(conversation)}
          </div>
          
          <div className="conversation-info">
            <div className="conversation-header">
              <h4 className="conversation-title">
                {getConversationTitle(conversation)}
              </h4>
              <span className="conversation-time">
                {conversation.lastActivity && formatTime(conversation.lastActivity)}
              </span>
            </div>
            
            <div className="conversation-preview">
              <p className="last-message">
                {getLastMessagePreview(conversation)}
              </p>
              {unreadCounts[conversation._id] > 0 && (
                <div className="unread-badge">
                  {unreadCounts[conversation._id]}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ConversationList;
