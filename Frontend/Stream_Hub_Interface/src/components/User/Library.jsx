import React, { useState, useEffect } from "react";
import axios from "axios";
import VideoPlayer from "./VideoPlayer";
import "./Library.css";

const Library = () => {
  const [activeTab, setActiveTab] = useState("history");
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);

  // Mock library data
  const mockLibraryData = {
    history: [
      {
        id: 1,
        title: "Amazing Tech Review: Latest Smartphone 2024",
        channel: "TechReviews Pro",
        views: "2.1M",
        date: "2 days ago",
        length: "12:34",
        thumbnail: "https://picsum.photos/320/180?random=1",
        videoUrl:
          "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        watchedAt: "2024-01-15T10:30:00Z",
      },
      {
        id: 2,
        title: "Cooking Masterclass: Italian Pasta Secrets",
        channel: "Chef's Kitchen",
        views: "890K",
        date: "1 week ago",
        length: "18:45",
        thumbnail: "https://picsum.photos/320/180?random=2",
        videoUrl:
          "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4",
        watchedAt: "2024-01-14T15:20:00Z",
      },
      {
        id: 3,
        title: "Epic Gaming Moments: Battle Royale Highlights",
        channel: "GamingZone",
        views: "5.2M",
        date: "3 days ago",
        length: "25:12",
        thumbnail: "https://picsum.photos/320/180?random=3",
        videoUrl:
          "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4",
        watchedAt: "2024-01-13T20:15:00Z",
      },
    ],
    liked: [
      {
        id: 4,
        title: "Travel Vlog: Exploring Hidden Beaches in Bali",
        channel: "Wanderlust",
        views: "1.4M",
        date: "5 days ago",
        length: "32:18",
        thumbnail: "https://picsum.photos/320/180?random=4",
        videoUrl:
          "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        likedAt: "2024-01-12T14:45:00Z",
      },
      {
        id: 5,
        title: "Workout Routine: Full Body HIIT Training",
        channel: "FitLife",
        views: "756K",
        date: "1 day ago",
        length: "28:33",
        thumbnail: "https://picsum.photos/320/180?random=5",
        videoUrl:
          "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4",
        likedAt: "2024-01-11T09:30:00Z",
      },
    ],
    playlists: [
      {
        id: 1,
        name: "My Tech Playlist",
        description: "Best tech reviews and tutorials",
        videoCount: 12,
        thumbnail: "https://picsum.photos/320/180?random=10",
        lastUpdated: "2 days ago",
      },
      {
        id: 2,
        name: "Workout Motivation",
        description: "High-energy workout videos",
        videoCount: 8,
        thumbnail: "https://picsum.photos/320/180?random=11",
        lastUpdated: "1 week ago",
      },
      {
        id: 3,
        name: "Cooking Inspiration",
        description: "Delicious recipes to try",
        videoCount: 15,
        thumbnail: "https://picsum.photos/320/180?random=12",
        lastUpdated: "3 days ago",
      },
    ],
  };

  useEffect(() => {
    const fetchLibraryData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try to fetch from API first
        const response = await axios.get("http://localhost:5000/api/library");

        if (response.data) {
          setVideos(response.data[activeTab] || []);
        } else {
          // Fallback to mock data
          setVideos(mockLibraryData[activeTab] || []);
        }
      } catch (err) {
        console.error("Library fetch failed:", err);
        setVideos(mockLibraryData[activeTab] || []);
        setError(
          "Could not load library data from server. Showing demo content."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchLibraryData();
  }, [activeTab]);

  const handleVideoClick = (video) => {
    setSelectedVideo(video);
  };

  const handleCloseVideo = () => {
    setSelectedVideo(null);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <div className="library-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="library-container">
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

      <div className="library-header">
        <h1>Library</h1>
        <p>Your personal collection of videos and playlists</p>
      </div>

      <div className="library-tabs">
        <button
          className={`library-tab ${activeTab === "history" ? "active" : ""}`}
          onClick={() => handleTabChange("history")}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 8V12L15 15"
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
          Watch History
        </button>
        <button
          className={`library-tab ${activeTab === "liked" ? "active" : ""}`}
          onClick={() => handleTabChange("liked")}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20.84 4.61C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.5783 8.50903 2.9987 7.05 2.9987C5.59096 2.9987 4.19169 3.5783 3.16 4.61C2.1283 5.6417 1.5487 7.04097 1.5487 8.5C1.5487 9.95903 2.1283 11.3583 3.16 12.39L12 21.23L20.84 12.39C21.351 11.8792 21.7564 11.2728 22.0329 10.6054C22.3095 9.93789 22.4518 9.22249 22.4518 8.5C22.4518 7.77751 22.3095 7.0621 22.0329 6.39464C21.7564 5.72718 21.351 5.12075 20.84 4.61Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Liked Videos
        </button>
        <button
          className={`library-tab ${activeTab === "playlists" ? "active" : ""}`}
          onClick={() => handleTabChange("playlists")}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9 11H15M9 15H15M9 7H15M5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Playlists
        </button>
      </div>

      <div className="library-content">
        {activeTab === "playlists" ? (
          <div className="playlists-grid">
            {videos.map((playlist) => (
              <div key={playlist.id} className="playlist-card">
                <div className="playlist-thumb">
                  <img
                    src={playlist.thumbnail}
                    alt={playlist.name}
                    onError={(e) => {
                      e.target.src = "https://picsum.photos/320/180?random=999";
                    }}
                  />
                  <div className="playlist-overlay">
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
                <div className="playlist-info">
                  <h3>{playlist.name}</h3>
                  <p>{playlist.description}</p>
                  <div className="playlist-meta">
                    <span>{playlist.videoCount} videos</span>
                    <span className="dot">•</span>
                    <span>{playlist.lastUpdated}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="videos-grid">
            {videos.map((video) => (
              <div
                className="video-card"
                key={video.id}
                onClick={() => handleVideoClick(video)}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleVideoClick(video);
                  }
                }}
              >
                <div className="thumb-wrap">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = "https://picsum.photos/320/180?random=999";
                    }}
                  />
                  <span className="length">{video.length}</span>
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
                  <div className="title">{video.title}</div>
                  <div className="channel">{video.channel}</div>
                  <div className="meta">
                    <span>{video.views} views</span>
                    <span className="dot">•</span>
                    <span>
                      {activeTab === "history"
                        ? formatDate(video.watchedAt)
                        : formatDate(video.likedAt)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {videos.length === 0 && (
          <div className="empty-state">
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
            <h3>No {activeTab} yet</h3>
            <p>Your {activeTab} will appear here</p>
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

export default Library;
