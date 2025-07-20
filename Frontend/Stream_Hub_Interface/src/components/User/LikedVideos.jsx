import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { likeAPI } from '../../utils/api';
import './LikedVideos.css';

export default function LikedVideos() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [likedVideos, setLikedVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadLikedVideos();
  }, [user, currentPage]);

  const loadLikedVideos = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await likeAPI.getLikedVideos(user._id);
      
      if (response.success) {
        if (currentPage === 1) {
          setLikedVideos(response.likedVideos || []);
        } else {
          setLikedVideos(prev => [...prev, ...(response.likedVideos || [])]);
        }
        
        // For now, we'll assume pagination is handled by the backend
        // You can implement proper pagination if needed
        setHasMore(false);
      } else {
        setError(response.message || 'Failed to load liked videos');
      }
    } catch (error) {
      console.error('Error loading liked videos:', error);
      setError('Failed to load liked videos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnlike = async (videoId) => {
    if (!user) return;
    
    try {
      await likeAPI.toggleLike(videoId, user._id);
      
      // Remove the video from the liked videos list
      setLikedVideos(prev => prev.filter(video => video._id !== videoId));
      
      // Show success message
      alert('Video removed from liked videos!');
    } catch (error) {
      console.error('Error unliking video:', error);
      alert('Failed to remove video from liked videos');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const handleVideoClick = (videoId) => {
    navigate(`/video/${videoId}`);
  };

  const loadMore = () => {
    if (hasMore && !isLoading) {
      setCurrentPage(prev => prev + 1);
    }
  };

  if (!user) {
    return (
      <div className="liked-videos-container">
        <div className="liked-videos-error">
          <h2>Please log in to view your liked videos</h2>
          <button onClick={() => navigate('/login')} className="login-btn">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="liked-videos-container">
      <div className="liked-videos-header">
        <h1>Liked Videos</h1>
        <div className="liked-videos-stats">
          <span>{likedVideos.length} videos</span>
        </div>
      </div>

      {error && (
        <div className="liked-videos-error">
          <p>{error}</p>
          <button onClick={loadLikedVideos} className="retry-btn">
            Try Again
          </button>
        </div>
      )}

      {isLoading && currentPage === 1 ? (
        <div className="liked-videos-loading">
          <div className="loading-spinner"></div>
          <p>Loading your liked videos...</p>
        </div>
      ) : likedVideos.length === 0 ? (
        <div className="liked-videos-empty">
          <div className="empty-icon">❤️</div>
          <h2>No liked videos yet</h2>
          <p>Videos you like will appear here</p>
          <button onClick={() => navigate('/user/home')} className="explore-btn">
            Start Exploring
          </button>
        </div>
      ) : (
        <div className="liked-videos-content">
          <div className="liked-videos-grid">
            {likedVideos.map((video) => (
              <div key={video._id} className="liked-video-card">
                <div className="video-thumbnail" onClick={() => handleVideoClick(video._id)}>
                  <img src={video.thumbnail} alt={video.title} />
                  <span className="video-duration">{formatDuration(video.duration)}</span>
                  <div className="video-overlay">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 5V19L19 12L8 5Z" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                
                <div className="video-info">
                  <h3 className="video-title" onClick={() => handleVideoClick(video._id)}>
                    {video.title}
                  </h3>
                  <p className="channel-name">
                    {video.owner?.fullname || 'Unknown Creator'}
                  </p>
                  <div className="video-stats">
                    <span>{formatNumber(video.views || 0)} views</span>
                    <span>•</span>
                    <span>{formatDate(video.createdAt)}</span>
                  </div>
                  
                  <div className="video-actions">
                    <button 
                      className="unlike-btn"
                      onClick={() => handleUnlike(video._id)}
                      title="Remove from liked videos"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20.84 4.61C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.5783 8.50903 2.9987 7.05 2.9987C5.59096 2.9987 4.19169 3.5783 3.16 4.61C2.1283 5.6417 1.5487 7.04097 1.5487 8.5C1.5487 9.95903 2.1283 11.3583 3.16 12.39L12 21.23L20.84 12.39C21.351 11.8792 21.7564 11.2728 22.0329 10.6054C22.3095 9.93789 22.4518 9.22249 22.4518 8.5C22.4518 7.77751 22.3095 7.0621 22.0329 6.39464C21.7564 5.72718 21.351 5.12075 20.84 4.61Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Unlike
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {hasMore && (
            <div className="load-more-container">
              <button 
                onClick={loadMore}
                disabled={isLoading}
                className="load-more-btn"
              >
                {isLoading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 