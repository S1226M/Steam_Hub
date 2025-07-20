const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to make authenticated requests
const makeRequest = async (endpoint, options = {}) => {
  // Get token from localStorage since we can't use hooks in utility functions
  const token = localStorage.getItem('token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Video API
export const videoAPI = {
  getAllVideos: () => makeRequest('/videos'),
  getVideoById: (id) => makeRequest(`/videos/${id}`),
  uploadVideo: (formData) => {
    const token = localStorage.getItem('token');
    return fetch(`${API_BASE_URL}/videos/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(errorData => {
          throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
        });
      }
      return response.json();
    })
    .catch(error => {
      console.error('Upload error:', error);
      throw error;
    });
  },
};

// Like API
export const likeAPI = {
  toggleLike: (videoId, userId) => makeRequest(`/likes/toggle/${videoId}`, {
    method: 'POST',
    body: JSON.stringify({ userId }),
  }),
  
  getLikedVideos: (userId) => makeRequest(`/likes?userId=${userId}`),
  
  // Check if user liked a specific video
  checkIfLiked: async (videoId, userId) => {
    try {
      const response = await likeAPI.getLikedVideos(userId);
      return response.likedVideos.some(video => video._id === videoId);
    } catch (error) {
      console.error('Error checking like status:', error);
      return false;
    }
  },
};

// Comment API
export const commentAPI = {
  // Get comments for a video
  getComments: (videoId, page = 1, limit = 10, sort = 'newest') => 
    makeRequest(`/comments/video/${videoId}?page=${page}&limit=${limit}&sort=${sort}`),
  
  // Add a new comment
  addComment: (videoId, userId, content, parentCommentId = null) => 
    makeRequest('/comments', {
      method: 'POST',
      body: JSON.stringify({
        videoId,
        userId,
        content,
        parentCommentId,
      }),
    }),
  
  // Update a comment
  updateComment: (commentId, userId, content) => 
    makeRequest(`/comments/${commentId}`, {
      method: 'PUT',
      body: JSON.stringify({
        userId,
        content,
      }),
    }),
  
  // Delete a comment
  deleteComment: (commentId, userId) => 
    makeRequest(`/comments/${commentId}`, {
      method: 'DELETE',
      body: JSON.stringify({ userId }),
    }),
  
  // Like/unlike a comment
  toggleCommentLike: (commentId, userId) => 
    makeRequest(`/comments/${commentId}/like`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }),
  
  // Get replies to a comment
  getReplies: (commentId, page = 1, limit = 10) => 
    makeRequest(`/comments/${commentId}/replies?page=${page}&limit=${limit}`),
};

// User API
export const userAPI = {
  getProfile: () => makeRequest('/users/profile'),
  updateProfile: (userId, formData) => {
    const token = localStorage.getItem('token');
    return fetch(`${API_BASE_URL}/users/${userId}/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(errorData => {
          throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
        });
      }
      return response.json();
    })
    .catch(error => {
      console.error('Profile update error:', error);
      throw error;
    });
  },
  changePassword: (passwords) => makeRequest('/users/change-password', {
    method: 'PUT',
    body: JSON.stringify(passwords),
  }),
};

// Channel Subscription API (YouTube-like)
export const subscriptionAPI = {
  // Subscribe to a channel
  subscribeToChannel: (userId, channelId) => 
    makeRequest('/subscriptions/channel/subscribe', {
      method: 'POST',
      body: JSON.stringify({ userId, channelId }),
    }),
  
  // Unsubscribe from a channel
  unsubscribeFromChannel: (userId, channelId) => 
    makeRequest('/subscriptions/channel/unsubscribe', {
      method: 'POST',
      body: JSON.stringify({ userId, channelId }),
    }),
  
  // Get channel subscribers count
  getChannelSubscribers: (channelId) => 
    makeRequest(`/subscriptions/channel/${channelId}/subscribers`),
  
  // Get user's subscribed channels
  getUserSubscriptions: (userId) => 
    makeRequest(`/subscriptions/user/${userId}/channels`),
  
  // Check if user is subscribed to a channel
  checkChannelSubscription: (userId, channelId) => 
    makeRequest(`/subscriptions/channel/${channelId}/check/${userId}`),
};

// Auth API
export const authAPI = {
  login: (credentials) => makeRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  
  signup: (userData) => makeRequest('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  
  logout: () => makeRequest('/auth/logout', {
    method: 'POST',
  }),
};

// Watch Video Log API (One User Per View)
export const watchLogAPI = {
  // Log a video view (one per user per video per day)
  logVideoView: (videoId, watchData = {}) => 
    makeRequest(`/watchlogs/log/${videoId}`, {
      method: 'POST',
      body: JSON.stringify(watchData),
    }),
  
  // Get user's watch history
  getWatchHistory: (page = 1, limit = 20) => 
    makeRequest(`/watchlogs/history?page=${page}&limit=${limit}`),
  
  // Get video view statistics (for video owners)
  getVideoStats: (videoId) => 
    makeRequest(`/watchlogs/stats/${videoId}`),
  
  // Mark video as completed
  markVideoCompleted: (videoId) => 
    makeRequest(`/watchlogs/complete/${videoId}`, {
      method: 'PUT',
    }),
};

export default {
  videoAPI,
  likeAPI,
  commentAPI,
  userAPI,
  authAPI,
  subscriptionAPI,
  watchLogAPI,
}; 