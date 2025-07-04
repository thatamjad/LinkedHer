import React, { createContext, useState, useContext, useCallback } from 'react';
import { useAuth } from './AuthContext';

// Create context
const PostContext = createContext();

// Custom hook to use post context
export const usePost = () => {
  return useContext(PostContext);
};

// Provider component
export const PostProvider = ({ children }) => {
  const { authAxios } = useAuth();
  const [posts, setPosts] = useState([]);
  const [currentPost, setCurrentPost] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalPosts: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get posts (feed)
  const getPosts = useCallback(async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const response = await authAxios.get(`/posts?page=${page}&limit=${limit}`);
      
      setPosts(response.data.data);
      setPagination({
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages,
        totalPosts: response.data.count
      });
      
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load posts');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [authAxios]);

  // Get post by ID
  const getPostById = useCallback(async (postId) => {
    try {
      setLoading(true);
      const response = await authAxios.get(`/posts/${postId}`);
      setCurrentPost(response.data.data);
      setError(null);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load post');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [authAxios]);

  // Create post
  const createPost = useCallback(async (postData) => {
    try {
      setLoading(true);
      const response = await authAxios.post('/posts', postData);
      
      // Add new post to the beginning of the posts array
      setPosts(prev => [response.data.data, ...prev]);
      
      setError(null);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create post');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [authAxios]);

  // Update post
  const updatePost = useCallback(async (postId, postData) => {
    try {
      setLoading(true);
      const response = await authAxios.put(`/posts/${postId}`, postData);
      
      // Update post in the posts array
      setPosts(prev => prev.map(post => 
        post._id === postId ? response.data.data : post
      ));
      
      if (currentPost && currentPost._id === postId) {
        setCurrentPost(response.data.data);
      }
      
      setError(null);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update post');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [authAxios, currentPost]);

  // Delete post
  const deletePost = useCallback(async (postId) => {
    try {
      setLoading(true);
      await authAxios.delete(`/posts/${postId}`);
      
      // Remove post from the posts array
      setPosts(prev => prev.filter(post => post._id !== postId));
      
      if (currentPost && currentPost._id === postId) {
        setCurrentPost(null);
      }
      
      setError(null);
      return true;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete post');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [authAxios, currentPost]);

  // Like post
  const likePost = useCallback(async (postId) => {
    try {
      const response = await authAxios.put(`/posts/${postId}/like`);
      
      // Update post likes in the posts array
      setPosts(prev => prev.map(post => {
        if (post._id === postId) {
          return {
            ...post,
            engagement: {
              ...post.engagement,
              likes: response.data.data
            }
          };
        }
        return post;
      }));
      
      if (currentPost && currentPost._id === postId) {
        setCurrentPost(prev => ({
          ...prev,
          engagement: {
            ...prev.engagement,
            likes: response.data.data
          }
        }));
      }
      
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to like post');
      throw err;
    }
  }, [authAxios, currentPost]);

  // Unlike post
  const unlikePost = useCallback(async (postId) => {
    try {
      const response = await authAxios.put(`/posts/${postId}/unlike`);
      
      // Update post likes in the posts array
      setPosts(prev => prev.map(post => {
        if (post._id === postId) {
          return {
            ...post,
            engagement: {
              ...post.engagement,
              likes: response.data.data
            }
          };
        }
        return post;
      }));
      
      if (currentPost && currentPost._id === postId) {
        setCurrentPost(prev => ({
          ...prev,
          engagement: {
            ...prev.engagement,
            likes: response.data.data
          }
        }));
      }
      
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to unlike post');
      throw err;
    }
  }, [authAxios, currentPost]);

  // Save post
  const savePost = useCallback(async (postId) => {
    try {
      const response = await authAxios.put(`/posts/${postId}/save`);
      
      // Update post saves in the posts array
      setPosts(prev => prev.map(post => {
        if (post._id === postId) {
          return {
            ...post,
            engagement: {
              ...post.engagement,
              saves: response.data.data
            }
          };
        }
        return post;
      }));
      
      if (currentPost && currentPost._id === postId) {
        setCurrentPost(prev => ({
          ...prev,
          engagement: {
            ...prev.engagement,
            saves: response.data.data
          }
        }));
      }
      
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save post');
      throw err;
    }
  }, [authAxios, currentPost]);

  // Unsave post
  const unsavePost = useCallback(async (postId) => {
    try {
      const response = await authAxios.put(`/posts/${postId}/unsave`);
      
      // Update post saves in the posts array
      setPosts(prev => prev.map(post => {
        if (post._id === postId) {
          return {
            ...post,
            engagement: {
              ...post.engagement,
              saves: response.data.data
            }
          };
        }
        return post;
      }));
      
      if (currentPost && currentPost._id === postId) {
        setCurrentPost(prev => ({
          ...prev,
          engagement: {
            ...prev.engagement,
            saves: response.data.data
          }
        }));
      }
      
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to unsave post');
      throw err;
    }
  }, [authAxios, currentPost]);

  // Get user's posts
  const getUserPosts = useCallback(async (userId, page = 1, limit = 10) => {
    try {
      setLoading(true);
      const endpoint = userId ? `/posts/user/${userId}` : '/posts/me';
      const response = await authAxios.get(`${endpoint}?page=${page}&limit=${limit}`);
      
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load user posts');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [authAxios]);

  // Context value
  const value = {
    posts,
    currentPost,
    pagination,
    loading,
    error,
    setError,
    getPosts,
    getPostById,
    createPost,
    updatePost,
    deletePost,
    likePost,
    unlikePost,
    savePost,
    unsavePost,
    getUserPosts
  };

  return (
    <PostContext.Provider value={value}>
      {children}
    </PostContext.Provider>
  );
};

export default PostContext; 