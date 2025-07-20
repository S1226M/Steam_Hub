import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { watchLogAPI } from '../../utils/api';
import './History.css';

export default function History() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [watchHistory, setWatchHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadWatchHistory();
  }, [user, currentPage]);

  const loadWatchHistory = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await watchLogAPI.getWatchHistory(currentPage, 20);
      
      if (response.success) {
        if (currentPage === 1) {
          setWatchHistory(response.data.watchHistory);
        } else {
          setWatchHistory(prev => [...prev, ...response.data.watchHistory]);
        }
        
        setPagination(response.data.pagination);
        setHasMore(response.data.pagination.currentPage < response.data.pagination.totalPages);
      } else {
        setError(response.message || 'Failed to load watch history');
      }
    } catch (error) {
      console.error('Error loading watch history:', error);
      setError('Failed to load watch history');
    } finally {
      setIsLoading(false);
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

  const clearHistory = async () => {
    // This would require a new API endpoint to clear history
    // For now, we'll just show a message
    alert('Clear history functionality will be implemented soon!');
  };

  if (!user) {
    return (
      <div className="history-container">
        <div className="history-error">
          <h2>Please log in to view your watch history</h2>
          <button onClick={() => navigate('/login')} className="login-btn">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="history-container">
      <div className="history-header">
        <h1>Watch History</h1>
        <div className="history-actions">
          <button 
            className="clear-history-btn"
            onClick={clearHistory}
            disabled={watchHistory.length === 0}
          >
            Clear History
          </button>
        </div>
      </div>

      {error && (
        <div className="history-error">
          <p>{error}</p>
          <button onClick={loadWatchHistory} className="retry-btn">
            Try Again
          </button>
        </div>
      )}

      {isLoading && currentPage === 1 ? (
        <div className="history-loading">
          <div className="loading-spinner"></div>
          <p>Loading your watch history...</p>
        </div>
      ) : watchHistory.length === 0 ? (
        <div className="history-empty">
          <div className="empty-icon">📺</div>
          <h2>No watch history yet</h2>
          <p>Videos you watch will appear here</p>
          <button onClick={() => navigate('/user/home')} className="explore-btn">
            Start Watching
          </button>
        </div>
      ) : (
        <div className="history-content">
          <div className="history-list">
            {watchHistory.map((log) => (
              <div 
                key={log._id} 
                className="history-item"
                onClick={() => handleVideoClick(log.videoId._id)}
              >
                <div className="history-thumbnail">
                  <img 
                    src={log.videoId.thumbnail} 
                    alt={log.videoId.title} 
                  />
                  <span className="video-duration">
                    {formatDuration(log.videoId.duration)}
                  </span>
                  {log.completed && (
                    <div className="completed-badge">✓</div>
                  )}
                </div>
                
                <div className="history-info">
                  <h3 className="video-title">{log.videoId.title}</h3>
                  <p className="channel-name">
                    {log.videoId.owner?.fullname || 'Unknown Creator'}
                  </p>
                  <div className="video-stats">
                    <span>{formatNumber(log.videoId.views || 0)} views</span>
                    <span>•</span>
                    <span>{formatDate(log.videoId.createdAt)}</span>
                  </div>
                  <div className="watch-info">
                    <span className="watch-date">
                      Watched {formatDate(log.watchedAt)}
                    </span>
                    {log.watchDuration > 0 && (
                      <span className="watch-duration">
                        • Watched {formatDuration(log.watchDuration)}
                      </span>
                    )}
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

          {pagination && (
            <div className="history-pagination">
              <p>
                Showing {watchHistory.length} of {pagination.totalItems} videos
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 