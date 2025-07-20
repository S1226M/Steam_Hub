import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { libraryAPI } from "../../utils/api";
import VideoPlayer from "./VideoPlayer";
import "./Library.css";

const Library = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("history");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [summary, setSummary] = useState({
    history: 0,
    liked: 0,
    playlists: 0,
    downloads: 0,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    if (user?._id) {
      fetchLibraryData();
      fetchLibrarySummary();
    }
  }, [user, activeTab, pagination.page]);

  const fetchLibraryData = async () => {
    try {
      setLoading(true);
      setError(null);

      let response;
      switch (activeTab) {
        case "history":
          response = await libraryAPI.getUserHistory(
            user._id,
            pagination.page,
            pagination.limit
          );
          break;
        case "liked":
          response = await libraryAPI.getLikedVideos(
            user._id,
            pagination.page,
            pagination.limit
          );
          break;
        case "playlists":
          response = await libraryAPI.getUserPlaylists(
            user._id,
            pagination.page,
            pagination.limit
          );
          break;
        case "downloads":
          response = await libraryAPI.getUserDownloads(
            user._id,
            pagination.page,
            pagination.limit
          );
          break;
        default:
          response = await libraryAPI.getUserHistory(
            user._id,
            pagination.page,
            pagination.limit
          );
      }

      if (response.success) {
        setData(response.data || []);
        setPagination((prev) => ({
          ...prev,
          total: response.pagination.total,
          pages: response.pagination.pages,
        }));
      } else {
        setError("Failed to load data");
        setData([]);
      }
    } catch (err) {
      console.error("Library fetch failed:", err);
      setError("Could not load library data from server.");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLibrarySummary = async () => {
    try {
      const response = await libraryAPI.getLibrarySummary(user._id);
      if (response.success) {
        setSummary(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch library summary:", err);
    }
  };

  const handleVideoClick = (video) => {
    const videoId = video._id || video.video?._id || video.id;
    if (videoId) {
      navigate(`/user/video/${videoId}`);
    }
  };

  const handleCloseVideo = () => {
    setSelectedVideo(null);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleRemoveFromHistory = async (videoId) => {
    try {
      await libraryAPI.removeFromHistory(user._id, videoId);
      setData((prev) =>
        prev.filter((item) => (item._id || item.video?._id) !== videoId)
      );
      fetchLibrarySummary(); // Update counts
    } catch (err) {
      console.error("Failed to remove from history:", err);
    }
  };

  const handleRemoveFromDownloads = async (videoId) => {
    try {
      await libraryAPI.removeFromDownloads(user._id, videoId);
      setData((prev) =>
        prev.filter((item) => (item._id || item.video?._id) !== videoId)
      );
      fetchLibrarySummary(); // Update counts
    } catch (err) {
      console.error("Failed to remove from downloads:", err);
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm("Are you sure you want to clear all watch history?")) {
      try {
        await libraryAPI.clearHistory(user._id);
        setData([]);
        fetchLibrarySummary();
      } catch (err) {
        console.error("Failed to clear history:", err);
      }
    }
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

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "0:00";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const getStaticThumbnail = (videoId) => {
    // Array of high-quality static thumbnail images
    const staticThumbnails = [
      "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=320&h=180&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=320&h=180&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=320&h=180&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=320&h=180&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=320&h=180&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=320&h=180&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=320&h=180&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=320&h=180&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=320&h=180&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=320&h=180&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=320&h=180&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=320&h=180&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=320&h=180&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=320&h=180&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=320&h=180&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=320&h=180&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=320&h=180&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=320&h=180&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=320&h=180&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=320&h=180&fit=crop&crop=center",
    ];

    // Use videoId to consistently select the same thumbnail for the same video
    const index =
      Math.abs(
        videoId.split("").reduce((a, b) => {
          a = (a << 5) - a + b.charCodeAt(0);
          return a & a;
        }, 0)
      ) % staticThumbnails.length;

    return staticThumbnails[index];
  };

  const renderVideoCard = (item) => {
    const video = item.video || item;
    const videoId = video._id || item._id;

    return (
      <div
        className="video-card"
        key={videoId}
        onClick={() => handleVideoClick(item)}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleVideoClick(item);
          }
        }}
      >
        <div className="thumb-wrap">
          <img
            src={video.thumbnail || getStaticThumbnail(videoId)}
            alt={video.title}
            loading="lazy"
            onError={(e) => {
              e.target.src = getStaticThumbnail(videoId);
            }}
          />
          <span className="length">
            {video.duration ? formatDuration(video.duration) : "0:00"}
          </span>
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
          {activeTab === "history" && (
            <button
              className="remove-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveFromHistory(videoId);
              }}
              title="Remove from history"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
                  fill="currentColor"
                />
              </svg>
            </button>
          )}
          {activeTab === "downloads" && (
            <button
              className="remove-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveFromDownloads(videoId);
              }}
              title="Remove from downloads"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
                  fill="currentColor"
                />
              </svg>
            </button>
          )}
        </div>
        <div className="info">
          <div className="title">{video.title}</div>
          <div className="channel">
            {video.owner?.fullname || video.channel || "Unknown"}
          </div>
          <div className="meta">
            <span>{formatNumber(video.views || 0)} views</span>
            <span className="dot">•</span>
            <span>
              {formatDate(
                item.watchedAt ||
                  item.likedAt ||
                  item.downloadedAt ||
                  video.createdAt
              )}
            </span>
            {activeTab === "downloads" && item.quality && (
              <>
                <span className="dot">•</span>
                <span>{item.quality}</span>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderPlaylistCard = (playlist) => {
    return (
      <div
        className="playlist-card"
        key={playlist._id}
        onClick={() => navigate(`/user/playlist/${playlist._id}`)}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            navigate(`/user/playlist/${playlist._id}`);
          }
        }}
      >
        <div className="playlist-thumb">
          <img
            src={
              playlist.videos[0]?.thumbnail || getStaticThumbnail(playlist._id)
            }
            alt={playlist.name}
            loading="lazy"
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
          <div className="playlist-count">
            <span>{playlist.videoCount} videos</span>
          </div>
        </div>
        <div className="playlist-info">
          <h3>{playlist.name}</h3>
          <p>{playlist.description}</p>
          <div className="playlist-meta">
            <span>{formatDate(playlist.updatedAt)}</span>
            <span className="dot">•</span>
            <span>{playlist.isPublic ? "Public" : "Private"}</span>
          </div>
        </div>
      </div>
    );
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
        <div className="header-content">
          <h1>Library</h1>
          <p>Your personal collection of videos and playlists</p>
        </div>
        <div className="library-summary">
          <div className="summary-item">
            <span className="count">{summary.history}</span>
            <span className="label">History</span>
          </div>
          <div className="summary-item">
            <span className="count">{summary.liked}</span>
            <span className="label">Liked</span>
          </div>
          <div className="summary-item">
            <span className="count">{summary.playlists}</span>
            <span className="label">Playlists</span>
          </div>
          <div className="summary-item">
            <span className="count">{summary.downloads}</span>
            <span className="label">Downloads</span>
          </div>
        </div>
      </div>

      <div className="library-tabs">
        <button
          className={`library-tab ${activeTab === "history" ? "active" : ""}`}
          onClick={() => handleTabChange("history")}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M13 3C8.03 3 4 7.03 4 12H1L4.89 15.89L4.96 16.03L9 12H6C6 8.13 9.13 5 13 5C16.87 5 20 8.13 20 12C20 15.87 16.87 19 13 19C11.07 19 9.32 18.21 8.06 16.94L6.64 18.36C8.27 19.99 10.51 21 13 21C17.97 21 22 16.97 22 12C22 7.03 17.97 3 13 3ZM12 8V13L16.28 15.54L17 14.33L13.5 12.25V8H12Z"
              fill="currentColor"
            />
          </svg>
          History
        </button>
        <button
          className={`library-tab ${activeTab === "liked" ? "active" : ""}`}
          onClick={() => handleTabChange("liked")}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              fill="currentColor"
            />
          </svg>
          Liked Videos
        </button>
        <button
          className={`library-tab ${activeTab === "playlists" ? "active" : ""}`}
          onClick={() => handleTabChange("playlists")}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"
              fill="currentColor"
            />
          </svg>
          Playlists
        </button>
        <button
          className={`library-tab ${activeTab === "downloads" ? "active" : ""}`}
          onClick={() => handleTabChange("downloads")}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"
              fill="currentColor"
            />
          </svg>
          Downloads
        </button>
      </div>

      <div className="library-content">
        {activeTab === "history" && data.length > 0 && (
          <div className="history-actions">
            <button className="clear-history-btn" onClick={handleClearHistory}>
              Clear all history
            </button>
          </div>
        )}

        {data.length === 0 ? (
          <div className="empty-state">
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                fill="currentColor"
              />
            </svg>
            <h3>No {activeTab} yet</h3>
            <p>
              {activeTab === "history" && "Your watch history will appear here"}
              {activeTab === "liked" && "Videos you like will appear here"}
              {activeTab === "playlists" && "Your playlists will appear here"}
              {activeTab === "downloads" &&
                "Your downloaded videos will appear here"}
            </p>
            <button
              className="explore-btn"
              onClick={() => navigate("/user/home")}
            >
              Explore Videos
            </button>
          </div>
        ) : (
          <div
            className={
              activeTab === "playlists" ? "playlists-grid" : "videos-grid"
            }
          >
            {activeTab === "playlists"
              ? data.map(renderPlaylistCard)
              : data.map(renderVideoCard)}
          </div>
        )}

        {pagination.pages > 1 && (
          <div className="pagination">
            <button
              className="pagination-btn"
              disabled={pagination.page === 1}
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
              }
            >
              Previous
            </button>
            <span className="pagination-info">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              className="pagination-btn"
              disabled={pagination.page === pagination.pages}
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
              }
            >
              Next
            </button>
          </div>
        )}
      </div>

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
