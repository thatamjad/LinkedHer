import React, { useState } from 'react';
import messageAPI from '../../services/messageAPI';
import './MessageBubble.css';

const MessageBubble = ({ message, isOwn, isGrouped, onReply }) => {
  const [showActions, setShowActions] = useState(false);

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleReaction = async (emoji) => {
    try {
      await messageAPI.addReaction(message._id, emoji);
      // The UI will be updated via real-time events
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const renderMessageContent = () => {
    switch (message.content?.type) {
      case 'text':
        return (
          <div className="message-text">
            {message.replyTo && (
              <div className="reply-reference">
                <div className="reply-line"></div>
                <div className="reply-content">
                  <span className="reply-author">{message.replyTo.sender?.firstName}</span>
                  <span className="reply-text">{message.replyTo.content?.text}</span>
                </div>
              </div>
            )}
            <p>{message.content.text}</p>
          </div>
        );
      
      case 'image':
        return (
          <div className="message-image">
            {message.content.attachments?.map((attachment, index) => (
              <img key={index} src={attachment.url} alt="" />
            ))}
            {message.content.text && <p>{message.content.text}</p>}
          </div>
        );
      
      case 'file':
        return (
          <div className="message-file">
            {message.content.attachments?.map((attachment, index) => (
              <div key={index} className="file-attachment">
                <i className="fas fa-file"></i>
                <div className="file-info">
                  <span className="file-name">{attachment.name}</span>
                  <span className="file-size">{(attachment.size / 1024).toFixed(1)} KB</span>
                </div>
                <a href={attachment.url} download={attachment.name} className="download-btn">
                  <i className="fas fa-download"></i>
                </a>
              </div>
            ))}
            {message.content.text && <p>{message.content.text}</p>}
          </div>
        );
      
      case 'system':
        return (
          <div className="system-message">
            <p>{message.content.text}</p>
          </div>
        );
      
      default:
        return <p>{message.content?.text || 'Unknown message type'}</p>;
    }
  };

  const renderReactions = () => {
    if (!message.reactions?.length) return null;

    const reactionGroups = {};
    message.reactions.forEach(reaction => {
      if (!reactionGroups[reaction.emoji]) {
        reactionGroups[reaction.emoji] = [];
      }
      reactionGroups[reaction.emoji].push(reaction.user);
    });

    return (
      <div className="message-reactions">
        {Object.entries(reactionGroups).map(([emoji, users]) => (
          <div key={emoji} className="reaction-group">
            <span className="reaction-emoji">{emoji}</span>
            <span className="reaction-count">{users.length}</span>
          </div>
        ))}
      </div>
    );
  };

  if (message.content?.type === 'system') {
    return (
      <div className="system-message-container">
        {renderMessageContent()}
      </div>
    );
  }

  return (
    <div 
      className={`message-bubble ${isOwn ? 'own' : 'other'} ${isGrouped ? 'grouped' : ''}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {!isOwn && !isGrouped && (
        <div className="message-avatar">
          {message.sender?.profileImage ? (
            <img src={message.sender.profileImage} alt="" />
          ) : (
            <div className="avatar-initials">
              {`${message.sender?.firstName?.[0] || ''}${message.sender?.lastName?.[0] || ''}`.toUpperCase()}
            </div>
          )}
        </div>
      )}
      
      <div className="message-content">
        {!isOwn && !isGrouped && (
          <div className="message-sender">
            {message.sender?.firstName} {message.sender?.lastName}
          </div>
        )}
        
        <div className="message-body">
          {renderMessageContent()}
          
          <div className="message-meta">
            <span className="message-time">{formatTime(message.createdAt)}</span>
            {message.edited?.isEdited && (
              <span className="edited-indicator" title={`Edited ${formatTime(message.edited.editedAt)}`}>
                edited
              </span>
            )}
            {isOwn && (
              <div className="read-status">
                {message.readBy?.length > 1 && (
                  <i className="fas fa-check-double read" title="Read"></i>
                )}
              </div>
            )}
          </div>
        </div>
        
        {renderReactions()}
        
        {showActions && (
          <div className={`message-actions ${isOwn ? 'own' : 'other'}`}>
            <button 
              className="action-btn" 
              onClick={() => handleReaction('👍')}
              title="Like"
            >
              👍
            </button>
            <button 
              className="action-btn" 
              onClick={() => handleReaction('❤️')}
              title="Love"
            >
              ❤️
            </button>
            <button 
              className="action-btn" 
              onClick={() => handleReaction('😂')}
              title="Laugh"
            >
              😂
            </button>
            <button 
              className="action-btn" 
              onClick={onReply}
              title="Reply"
            >
              <i className="fas fa-reply"></i>
            </button>
            <button 
              className="action-btn" 
              title="More"
            >
              <i className="fas fa-ellipsis-h"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
