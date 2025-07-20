import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import { videoAPI } from "../../utils/api";

const categories = [
  "All",
  "Music",
  "Gaming",
  "Movies",
  "Tech Reviews",
  "Cooking",
  "Travel",
  "Fitness",
  "Education",
  "Comedy",
  "News",
  "Sports",
];



export default function Home() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState("All");
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const videosData = await videoAPI.getAllVideos();
        setVideos(Array.isArray(videosData) ? videosData : []);
      } catch (err) {
        console.error("Video fetch failed:", err);
        setError("Could not load videos from server.");
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const filteredVideos =
    selected === "All"
      ? (Array.isArray(videos) ? videos : [])
      : (Array.isArray(videos) ? videos.filter((vid) => vid.category === selected) : []);

  const handleCategoryClick = (category) => {
    setSelected(category);
    // Smooth scroll to videos section on mobile
    if (window.innerWidth < 768) {
      const videosSection = document.querySelector('.videos-grid');
      if (videosSection) {
        videosSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleVideoClick = (video) => {
    navigate(`/video/${video._id}`);
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
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
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="home-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading amazing videos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-container">
      {error && (
        <div className="error-banner">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {error}
        </div>
      )}

      <div className="categories-container">
        <div className="categories">
          {Array.isArray(categories) && categories.map((cat) => (
            <button
              key={cat}
              className={`category-btn ${cat === selected ? "active" : ""}`}
              onClick={() => handleCategoryClick(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="videos-section">
        <div className="section-header">
          <h2>{selected === "All" ? "Recommended Videos" : `${selected} Videos`}</h2>
          <p className="video-count">{filteredVideos.length} videos</p>
        </div>

        {filteredVideos.length === 0 ? (
          <div className="no-videos">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 10L11 14L9 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <h3>No videos found</h3>
            <p>Try selecting a different category or check back later for new content.</p>
          </div>
        ) : (
                  <div className="videos-grid">
          {Array.isArray(filteredVideos) && filteredVideos.map((vid) => (
              <div 
                className="video-card" 
                key={vid._id || vid.id}
                onClick={() => handleVideoClick(vid)}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleVideoClick(vid);
                  }
                }}
              >
                <div className="thumb-wrap">
                  <img 
                    src={vid.thumbnail} 
                    alt={vid.title}
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = "https://picsum.photos/320/180?random=999";
                    }}
                  />
                  {vid.premium && (
                    <span className="premium-badge">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L15.09 8.26L22 9L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9L8.91 8.26L12 2Z" fill="currentColor"/>
                      </svg>
                      Premium
                    </span>
                  )}
                  <span className="length">{vid.duration ? formatDuration(vid.duration) : vid.length}</span>
                  <div className="play-overlay">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 5V19L19 12L8 5Z" fill="currentColor"/>
                    </svg>
                  </div>
                </div>
                <div className="info">
                  <div className="title">{vid.title}</div>
                  <div className="channel">{vid.owner?.fullname || vid.channel || 'Unknown'}</div>
                  <div className="meta">
                    <span>{formatNumber(vid.views || 0)} views</span>
                    <span className="dot">•</span>
                    <span>{formatDate(vid.createdAt) || vid.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
