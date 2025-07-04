import React, { useState, useRef, useEffect } from 'react';
import './MessageInput.css';

const MessageInput = ({ 
  onSendMessage, 
  onTypingStart, 
  onTypingStop, 
  replyingTo, 
  onCancelReply 
}) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    // Auto-focus the input
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  useEffect(() => {
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [message]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setMessage(value);

    // Handle typing indicators
    if (value.trim() && !isTyping) {
      setIsTyping(true);
      onTypingStart();
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        onTypingStop();
      }
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Allow new line with Shift+Enter
        return;
      } else {
        // Send message with Enter
        e.preventDefault();
        handleSendMessage();
      }
    }
  };

  const handleSendMessage = () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    onSendMessage(trimmedMessage);
    setMessage('');
    
    // Stop typing indicator
    if (isTyping) {
      setIsTyping(false);
      onTypingStop();
    }
    
    // Clear timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleEmojiClick = (emoji) => {
    setMessage(prev => prev + emoji);
    textareaRef.current?.focus();
  };

  const commonEmojis = ['😊', '😂', '❤️', '👍', '👎', '😢', '😮', '😡'];

  return (
    <div className="message-input-container">
      {replyingTo && (
        <div className="reply-preview">
          <div className="reply-content">
            <div className="reply-to">
              <i className="fas fa-reply"></i>
              <span>Replying to {replyingTo.sender?.firstName}</span>
            </div>
            <div className="reply-message">
              {replyingTo.content?.text || 'Message'}
            </div>
          </div>
          <button className="cancel-reply" onClick={onCancelReply}>
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}
      
      <div className="message-input">
        <div className="input-actions-left">
          <button className="input-action-btn" title="Attach file">
            <i className="fas fa-paperclip"></i>
          </button>
          <button className="input-action-btn" title="Add photo">
            <i className="fas fa-image"></i>
          </button>
        </div>

        <div className="input-field-container">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="message-textarea"
            rows={1}
            maxLength={2000}
          />
          
          <div className="emoji-picker">
            <button className="emoji-trigger" title="Add emoji">
              <i className="fas fa-smile"></i>
            </button>
            <div className="emoji-menu">
              {commonEmojis.map(emoji => (
                <button
                  key={emoji}
                  className="emoji-btn"
                  onClick={() => handleEmojiClick(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="input-actions-right">
          <button 
            className={`send-btn ${message.trim() ? 'active' : ''}`}
            onClick={handleSendMessage}
            disabled={!message.trim()}
            title="Send message"
          >
            <i className="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
      
      <div className="input-footer">
        <span className="character-count">
          {message.length}/2000
        </span>
        <span className="input-hint">
          Press Enter to send, Shift+Enter for new line
        </span>
      </div>
    </div>
  );
};

export default MessageInput;
