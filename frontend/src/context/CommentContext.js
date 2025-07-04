import React, { createContext, useState, useContext, useCallback } from 'react';
import { useAuth } from './AuthContext';

// Create context
const CommentContext = createContext();

// Custom hook to use comment context
export const useComment = () => {
  return useContext(CommentContext);
};

// Provider component
export const CommentProvider = ({ children }) => {
  const { authAxios } = useAuth();
  const [comments, setComments] = useState([]);
  const [replies, setReplies] = useState({});
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalComments: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get comments for a post
  const getComments = useCallback(async (postId, page = 1, limit = 10) => {
    try {
      setLoading(true);
      const response = await authAxios.get(`/posts/${postId}/comments?page=${page}&limit=${limit}`);
      
      setComments(response.data.data);
      setPagination({
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages,
        totalComments: response.data.count
      });
      
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load comments');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [authAxios]);

  // Get replies for a comment
  const getReplies = useCallback(async (postId, commentId, page = 1, limit = 10) => {
    try {
      setLoading(true);
      const response = await authAxios.get(
        `/posts/${postId}/comments/${commentId}/replies?page=${page}&limit=${limit}`
      );
      
      setReplies(prev => ({
        ...prev,
        [commentId]: response.data.data
      }));
      
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load replies');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [authAxios]);

  // Create comment
  const createComment = useCallback(async (postId, commentData) => {
    try {
      setLoading(true);
      const response = await authAxios.post(`/posts/${postId}/comments`, commentData);
      
      // If this is a top-level comment
      if (!commentData.parentComment) {
        setComments(prev => [response.data.data, ...prev]);
      } else {
        // If this is a reply
        const parentCommentId = commentData.parentComment;
        
        setReplies(prev => {
          const currentReplies = prev[parentCommentId] || [];
          return {
            ...prev,
            [parentCommentId]: [response.data.data, ...currentReplies]
          };
        });
      }
      
      setError(null);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create comment');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [authAxios]);

  // Update comment
  const updateComment = useCallback(async (postId, commentId, commentData) => {
    try {
      setLoading(true);
      const response = await authAxios.put(`/posts/${postId}/comments/${commentId}`, commentData);
      
      // Find if it's a top-level comment or a reply
      const isTopLevel = comments.some(comment => comment._id === commentId);
      
      if (isTopLevel) {
        setComments(prev => prev.map(comment => 
          comment._id === commentId ? response.data.data : comment
        ));
      } else {
        // It's a reply
        Object.keys(replies).forEach(parentId => {
          if (replies[parentId].some(reply => reply._id === commentId)) {
            setReplies(prev => ({
              ...prev,
              [parentId]: prev[parentId].map(reply => 
                reply._id === commentId ? response.data.data : reply
              )
            }));
          }
        });
      }
      
      setError(null);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update comment');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [authAxios, comments, replies]);

  // Delete comment
  const deleteComment = useCallback(async (postId, commentId) => {
    try {
      setLoading(true);
      await authAxios.delete(`/posts/${postId}/comments/${commentId}`);
      
      // Find if it's a top-level comment or a reply
      const isTopLevel = comments.some(comment => comment._id === commentId);
      
      if (isTopLevel) {
        setComments(prev => prev.filter(comment => comment._id !== commentId));
      } else {
        // It's a reply
        Object.keys(replies).forEach(parentId => {
          if (replies[parentId].some(reply => reply._id === commentId)) {
            setReplies(prev => ({
              ...prev,
              [parentId]: prev[parentId].filter(reply => reply._id !== commentId)
            }));
          }
        });
      }
      
      setError(null);
      return true;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete comment');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [authAxios, comments, replies]);

  // Like comment
  const likeComment = useCallback(async (postId, commentId) => {
    try {
      const response = await authAxios.put(`/posts/${postId}/comments/${commentId}/like`);
      
      // Find if it's a top-level comment or a reply
      const isTopLevel = comments.some(comment => comment._id === commentId);
      
      if (isTopLevel) {
        setComments(prev => prev.map(comment => {
          if (comment._id === commentId) {
            return {
              ...comment,
              engagement: {
                ...comment.engagement,
                likes: response.data.data
              }
            };
          }
          return comment;
        }));
      } else {
        // It's a reply
        Object.keys(replies).forEach(parentId => {
          if (replies[parentId].some(reply => reply._id === commentId)) {
            setReplies(prev => ({
              ...prev,
              [parentId]: prev[parentId].map(reply => {
                if (reply._id === commentId) {
                  return {
                    ...reply,
                    engagement: {
                      ...reply.engagement,
                      likes: response.data.data
                    }
                  };
                }
                return reply;
              })
            }));
          }
        });
      }
      
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to like comment');
      throw err;
    }
  }, [authAxios, comments, replies]);

  // Unlike comment
  const unlikeComment = useCallback(async (postId, commentId) => {
    try {
      const response = await authAxios.put(`/posts/${postId}/comments/${commentId}/unlike`);
      
      // Find if it's a top-level comment or a reply
      const isTopLevel = comments.some(comment => comment._id === commentId);
      
      if (isTopLevel) {
        setComments(prev => prev.map(comment => {
          if (comment._id === commentId) {
            return {
              ...comment,
              engagement: {
                ...comment.engagement,
                likes: response.data.data
              }
            };
          }
          return comment;
        }));
      } else {
        // It's a reply
        Object.keys(replies).forEach(parentId => {
          if (replies[parentId].some(reply => reply._id === commentId)) {
            setReplies(prev => ({
              ...prev,
              [parentId]: prev[parentId].map(reply => {
                if (reply._id === commentId) {
                  return {
                    ...reply,
                    engagement: {
                      ...reply.engagement,
                      likes: response.data.data
                    }
                  };
                }
                return reply;
              })
            }));
          }
        });
      }
      
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to unlike comment');
      throw err;
    }
  }, [authAxios, comments, replies]);

  // Context value
  const value = {
    comments,
    replies,
    pagination,
    loading,
    error,
    setError,
    getComments,
    getReplies,
    createComment,
    updateComment,
    deleteComment,
    likeComment,
    unlikeComment
  };

  return (
    <CommentContext.Provider value={value}>
      {children}
    </CommentContext.Provider>
  );
};

export default CommentContext; 