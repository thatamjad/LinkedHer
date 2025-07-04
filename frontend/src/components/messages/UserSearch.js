import React, { useState, useEffect } from 'react';
import messageAPI from '../../services/messageAPI';
import './UserSearch.css';

const UserSearch = ({ onSelectUser, onClose }) => {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [initialMessage, setInitialMessage] = useState('');

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim().length >= 2) {
        searchUsers(query.trim());
      } else {
        setUsers([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const searchUsers = async (searchQuery) => {
    try {
      setLoading(true);
      const response = await messageAPI.searchUsers(searchQuery);
      
      if (response.success) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error('Error searching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
  };

  const handleStartConversation = () => {
    if (selectedUser) {
      onSelectUser(selectedUser._id, initialMessage.trim() || null);
    }
  };

  const handleClose = () => {
    setQuery('');
    setUsers([]);
    setSelectedUser(null);
    setInitialMessage('');
    onClose();
  };

  return (
    <div className="user-search-overlay">
      <div className="user-search-modal">
        <div className="modal-header">
          <h3>Start New Conversation</h3>
          <button className="close-btn" onClick={handleClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="modal-content">
          {!selectedUser ? (
            <>
              <div className="search-section">
                <div className="search-input-container">
                  <i className="fas fa-search"></i>
                  <input
                    type="text"
                    placeholder="Search for users by name or email..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="search-input"
                    autoFocus
                  />
                </div>
              </div>

              <div className="search-results">
                {loading && (
                  <div className="loading">
                    <div className="spinner"></div>
                    <p>Searching...</p>
                  </div>
                )}

                {!loading && query.trim().length >= 2 && users.length === 0 && (
                  <div className="no-results">
                    <i className="fas fa-user-slash"></i>
                    <p>No users found</p>
                    <small>Try searching with a different name or email</small>
                  </div>
                )}

                {users.map(user => (
                  <div
                    key={user._id}
                    className="user-result"
                    onClick={() => handleUserSelect(user)}
                  >
                    <div className="user-avatar">
                      {user.profileImage ? (
                        <img src={user.profileImage} alt="" />
                      ) : (
                        <div className="avatar-initials">
                          {`${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()}
                        </div>
                      )}
                      {user.isOnline && <div className="online-indicator"></div>}
                    </div>
                    
                    <div className="user-info">
                      <h4>{user.firstName} {user.lastName}</h4>
                      <p className="user-email">{user.email}</p>
                      {user.profile?.headline && (
                        <p className="user-headline">{user.profile.headline}</p>
                      )}
                    </div>
                    
                    <div className="select-indicator">
                      <i className="fas fa-arrow-right"></i>
                    </div>
                  </div>
                ))}

                {query.trim().length < 2 && (
                  <div className="search-hint">
                    <i className="fas fa-info-circle"></i>
                    <p>Type at least 2 characters to search for users</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="compose-message">
              <div className="selected-user">
                <div className="user-avatar">
                  {selectedUser.profileImage ? (
                    <img src={selectedUser.profileImage} alt="" />
                  ) : (
                    <div className="avatar-initials">
                      {`${selectedUser.firstName?.[0] || ''}${selectedUser.lastName?.[0] || ''}`.toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="user-info">
                  <h4>{selectedUser.firstName} {selectedUser.lastName}</h4>
                  <p>{selectedUser.email}</p>
                </div>
                <button 
                  className="change-user-btn"
                  onClick={() => setSelectedUser(null)}
                  title="Choose different user"
                >
                  <i className="fas fa-edit"></i>
                </button>
              </div>

              <div className="message-compose">
                <label htmlFor="initial-message">Initial Message (optional)</label>
                <textarea
                  id="initial-message"
                  placeholder="Type your first message..."
                  value={initialMessage}
                  onChange={(e) => setInitialMessage(e.target.value)}
                  rows={4}
                  maxLength={2000}
                />
                <div className="character-count">
                  {initialMessage.length}/2000
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="cancel-btn" onClick={handleClose}>
            Cancel
          </button>
          {selectedUser && (
            <button 
              className="start-conversation-btn"
              onClick={handleStartConversation}
            >
              Start Conversation
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserSearch;
