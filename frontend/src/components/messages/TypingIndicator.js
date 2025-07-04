import React from 'react';
import './TypingIndicator.css';

const TypingIndicator = ({ typingUsers }) => {
  const typingUserIds = Object.keys(typingUsers);
  
  if (typingUserIds.length === 0) return null;

  return (
    <div className="typing-indicator">
      <div className="typing-avatar">
        <div className="avatar-placeholder">
          <i className="fas fa-user"></i>
        </div>
      </div>
      <div className="typing-content">
        <div className="typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <div className="typing-text">
          {typingUserIds.length === 1 ? 'Someone is typing...' : 'Multiple people are typing...'}
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
