import React, { useState, useEffect } from "react";
import axios from "axios";
import VideoPlayer from "./VideoPlayer";
import "./Explore.css";

const Explore = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [filter, setFilter] = useState("trending");

  // Mock trending videos data
  

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get("http://localhost:5000/api/videos");
        setVideos(Array.isArray(response.data) ? response.data : []);
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
    filter === "trending" 
      ? (Array.isArray(videos) ? videos.filter((video) => video.trending) : [])
      : (Array.isArray(videos) ? videos : []);

  const handleVideoClick = (video) => {
    setSelectedVideo(video);
  };

  const handleCloseVideo = () => {
    setSelectedVideo(null);
  };

  if (loading) {
    return (
      <div className="explore-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Discovering amazing content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="explore-container">
      {error && (
        <div className="error-banner">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {error}
        </div>
      )}

      <div className="explore-header">
        <h1>Explore</h1>
        <p>Discover trending videos and new content</p>
      </div>

      <div className="filter-tabs">
        <button
          className={`filter-tab ${filter === "trending" ? "active" : ""}`}
          onClick={() => setFilter("trending")}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Trending
        </button>
        <button
          className={`filter-tab ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          All Videos
        </button>
      </div>

      <div className="videos-section">
        <div className="section-header">
          <h2>{filter === "trending" ? "Trending Now" : "All Videos"}</h2>
          <p className="video-count">{filteredVideos.length} videos</p>
        </div>

        {filteredVideos.length === 0 ? (
          <div className="no-videos">
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 10L11 14L9 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
            <h3>No videos found</h3>
            <p>Try changing the filter or check back later for new content.</p>
          </div>
        ) : (
                  <div className="videos-grid">
          {Array.isArray(filteredVideos) && filteredVideos.map((vid) => (
              <div
                className="video-card"
                key={vid.id}
                onClick={() => handleVideoClick(vid)}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
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
                  {vid.trending && (
                    <span className="trending-badge">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
                          fill="currentColor"
                        />
                      </svg>
                      Trending
                    </span>
                  )}
                  {vid.premium && (
                    <span className="premium-badge">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 2L15.09 8.26L22 9L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9L8.91 8.26L12 2Z"
                          fill="currentColor"
                        />
                      </svg>
                      Premium
                    </span>
                  )}
                  <span className="length">{vid.length}</span>
                  <div className="play-overlay">
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M8 5V19L19 12L8 5Z" fill="currentColor" />
                    </svg>
                  </div>
                </div>
                <div className="info">
                  <div className="title">{vid.title}</div>
                  <div className="channel">{vid.channel}</div>
                  <div className="meta">
                    <span>{vid.views} views</span>
                    <span className="dot">•</span>
                    <span>{vid.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Video Player Modal */}
      {selectedVideo && (
        <VideoPlayer
          src={selectedVideo.videoUrl}
          poster={selectedVideo.thumbnail}
          title={selectedVideo.title}
          channel={selectedVideo.channel}
          views={selectedVideo.views}
          date={selectedVideo.date}
          onClose={handleCloseVideo}
          autoPlay={true}
        />
      )}
    </div>
  );
};

export default Explore;
