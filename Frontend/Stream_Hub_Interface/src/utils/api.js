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
  getVideosByUser: (userId) => makeRequest(`/videos/user/${userId}`),
  uploadVideo: (formData, endpoint = '/upload') => {
    const token = localStorage.getItem('token');
    return fetch(`${API_BASE_URL}/videos${endpoint}`, {
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
  getProfile: () => makeRequest('/auth/profile'),
  updateProfile: (userData) => makeRequest('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(userData),
  }),
  changePassword: (passwords) => makeRequest('/auth/change-password', {
    method: 'PUT',
    body: JSON.stringify(passwords),
  }),
  getUserStats: () => makeRequest('/users/stats'),
  getUserById: (id) => makeRequest(`/users/${id}`),
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

// Live Stream API
export const liveStreamAPI = {
  create: (data) => makeRequest('/livestream/create', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getUserStreams: () => makeRequest('/livestream/user/me'),
  getStream: (streamId) => makeRequest(`/livestream/${streamId}`),
  stopStream: (streamId) => makeRequest(`/livestream/${streamId}/stop`, {
    method: 'POST',
  }),
  deleteStream: (streamId) => makeRequest(`/livestream/${streamId}`, {
    method: 'DELETE',
  }),
  getActiveStreams: () => makeRequest('/livestream/active/all'),
};

// Library API
export const libraryAPI = {
  // History
  getUserHistory: (userId, page = 1, limit = 20) => 
    makeRequest(`/videos/history/${userId}?page=${page}&limit=${limit}`),
  
  addToHistory: (userId, videoId, watchDuration = 0, completed = false) => 
    makeRequest('/library/history/add', {
      method: 'POST',
      body: JSON.stringify({ userId, videoId, watchDuration, completed }),
    }),
  
  removeFromHistory: (userId, videoId) => 
    makeRequest(`/library/history/${userId}/${videoId}`, {
      method: 'DELETE',
    }),
  
  clearHistory: (userId) => 
    makeRequest(`/library/history/${userId}`, {
      method: 'DELETE',
    }),
  
  // Liked Videos
  getLikedVideos: (userId, page = 1, limit = 20) => 
    makeRequest(`/videos/liked/${userId}?page=${page}&limit=${limit}`),
  
  // Playlists
  getUserPlaylists: (userId, page = 1, limit = 20) => 
    makeRequest(`/library/playlists/${userId}?page=${page}&limit=${limit}`),
  
  // Downloads
  getUserDownloads: (userId, page = 1, limit = 20) => 
    makeRequest(`/videos/downloads/${userId}?page=${page}&limit=${limit}`),
  
  addToDownloads: (userId, videoId, quality = "720p") => 
    makeRequest('/library/downloads/add', {
      method: 'POST',
      body: JSON.stringify({ userId, videoId, quality }),
    }),
  
  removeFromDownloads: (userId, videoId) => 
    makeRequest(`/library/downloads/${userId}/${videoId}`, {
      method: 'DELETE',
    }),
  
  // Library Summary
  getLibrarySummary: (userId) => 
    makeRequest(`/library/summary/${userId}`),
};

// WebRTC Live Stream API
export const webrtcAPI = {
  create: (data) => makeRequest('/webrtc/create', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getAll: (page = 1, limit = 10, status = 'all') => 
    makeRequest(`/webrtc/all?page=${page}&limit=${limit}&status=${status}`),
  getActive: () => makeRequest('/webrtc/active'),
  getUserStreams: (userId) => makeRequest(`/webrtc/user/${userId}`),
  getStream: (streamId) => makeRequest(`/webrtc/${streamId}`),
  startStream: (streamId) => makeRequest(`/webrtc/${streamId}/start`, {
    method: 'POST',
  }),
  stopStream: (streamId) => makeRequest(`/webrtc/${streamId}/stop`, {
    method: 'POST',
  }),
  deleteStream: (streamId) => makeRequest(`/webrtc/${streamId}`, {
    method: 'DELETE',
  }),
};

export { makeRequest };

export default {
  videoAPI,
  likeAPI,
  commentAPI,
  userAPI,
  authAPI,
  subscriptionAPI,
  liveStreamAPI,
  webrtcAPI,
}; 