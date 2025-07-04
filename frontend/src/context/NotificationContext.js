import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import io from 'socket.io-client';

// Create context
const NotificationContext = createContext();

// Custom hook to use notification context
export const useNotification = () => {
  return useContext(NotificationContext);
};

// Provider component
export const NotificationProvider = ({ children }) => {
  const { authAxios, currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalNotifications: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize socket connection
  useEffect(() => {
    if (currentUser) {
      const token = localStorage.getItem('token');
      const socketUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      const newSocket = io(socketUrl, {
        withCredentials: true,
        auth: {
          token
        }
      });
      
      setSocket(newSocket);
      
      // Listen for new notifications
      newSocket.on('new_notification', (notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
      });
      
      return () => {
        newSocket.disconnect();
      };
    }
  }, [currentUser]);

  // Get user's notifications
  const getNotifications = useCallback(async (page = 1, limit = 20) => {
    try {
      setLoading(true);
      const response = await authAxios.get(`/notifications?page=${page}&limit=${limit}`);
      
      setNotifications(response.data.data);
      setUnreadCount(response.data.unreadCount);
      setPagination({
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages,
        totalNotifications: response.data.count
      });
      
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load notifications');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [authAxios]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      const response = await authAxios.put(`/notifications/${notificationId}`);
      
      // Update notification in state
      setNotifications(prev => prev.map(notification => {
        if (notification._id === notificationId) {
          return response.data.data;
        }
        return notification;
      }));
      
      // Update unread count
      if (response.data.data.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to mark notification as read');
      throw err;
    }
  }, [authAxios]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      setLoading(true);
      await authAxios.put('/notifications');
      
      // Update all notifications in state
      setNotifications(prev => prev.map(notification => ({
        ...notification,
        isRead: true,
        readAt: new Date()
      })));
      
      setUnreadCount(0);
      
      return true;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to mark all notifications as read');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [authAxios]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await authAxios.delete(`/notifications/${notificationId}`);
      
      // Remove notification from state
      setNotifications(prev => prev.filter(notification => notification._id !== notificationId));
      
      // Update unread count if the notification was unread
      const notification = notifications.find(n => n._id === notificationId);
      if (notification && !notification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      return true;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete notification');
      throw err;
    }
  }, [authAxios, notifications]);

  // Context value
  const value = {
    notifications,
    unreadCount,
    pagination,
    loading,
    error,
    setError,
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext; 