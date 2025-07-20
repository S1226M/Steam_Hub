import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { libraryAPI } from "../../utils/api";
import "./History.css";

const History = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [filter, setFilter] = useState("all"); // all, today, week, month

  useEffect(() => {
    if (user?._id) {
      fetchHistory();
    }
  }, [user, pagination.page, filter]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await libraryAPI.getUserHistory(
        user._id,
        pagination.page,
        pagination.limit
      );

      if (response.success) {
        let filteredData = response.data || [];

        // Apply date filters
        if (filter !== "all") {
          const now = new Date();
          const filterDate = new Date();

          switch (filter) {
            case "today":
              filterDate.setHours(0, 0, 0, 0);
              break;
            case "week":
              filterDate.setDate(now.getDate() - 7);
              break;
            case "month":
              filterDate.setMonth(now.getMonth() - 1);
              break;
            default:
              break;
          }

          filteredData = filteredData.filter((item) => {
            const watchedAt = new Date(item.watchedAt);
            return watchedAt >= filterDate;
          });
        }

        setHistory(filteredData);
        setPagination((prev) => ({
          ...prev,
          total: response.pagination.total,
          pages: response.pagination.pages,
        }));
      } else {
        setError("Failed to load history");
        setHistory([]);
      }
    } catch (err) {
      console.error("History fetch failed:", err);
      setError("Could not load watch history from server.");
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoClick = (video) => {
    const videoId = video._id || video.video?._id;
    if (videoId) {
      navigate(`/user/video/${videoId}`);
    }
  };

  const handleRemoveFromHistory = async (videoId) => {
    try {
      await libraryAPI.removeFromHistory(user._id, videoId);
      setHistory((prev) =>
        prev.filter((item) => (item._id || item.video?._id) !== videoId)
      );
      // Update pagination
      setPagination((prev) => ({
        ...prev,
        total: prev.total - 1,
      }));
    } catch (err) {
      console.error("Failed to remove from history:", err);
    }
  };

  const handleClearHistory = async () => {
    if (
      window.confirm(
        "Are you sure you want to clear all watch history? This action cannot be undone."
      )
    ) {
      try {
        await libraryAPI.clearHistory(user._id);
        setHistory([]);
        setPagination((prev) => ({
          ...prev,
          total: 0,
          pages: 0,
        }));
      } catch (err) {
        console.error("Failed to clear history:", err);
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else if (diffInDays === 1) {
      return "Yesterday";
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
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

  const getFilterCount = () => {
    if (filter === "all") return pagination.total;

    const now = new Date();
    const filterDate = new Date();

    switch (filter) {
      case "today":
        filterDate.setHours(0, 0, 0, 0);
        break;
      case "week":
        filterDate.setDate(now.getDate() - 7);
        break;
      case "month":
        filterDate.setMonth(now.getMonth() - 1);
        break;
      default:
        return pagination.total;
    }

    return history.filter((item) => {
      const watchedAt = new Date(item.watchedAt);
      return watchedAt >= filterDate;
    }).length;
  };

  if (loading) {
    return (
      <div className="history-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your watch history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="history-container">
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

      <div className="history-header">
        <div className="header-content">
          <h1>Watch History</h1>
          <p>Videos you've watched recently</p>
        </div>
        <div className="history-stats">
          <div className="stat-item">
            <span className="count">{getFilterCount()}</span>
            <span className="label">Videos</span>
          </div>
        </div>
      </div>

      <div className="history-controls">
        <div className="filter-tabs">
          <button
            className={`filter-tab ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All Time
          </button>
          <button
            className={`filter-tab ${filter === "today" ? "active" : ""}`}
            onClick={() => setFilter("today")}
          >
            Today
          </button>
          <button
            className={`filter-tab ${filter === "week" ? "active" : ""}`}
            onClick={() => setFilter("week")}
          >
            This Week
          </button>
          <button
            className={`filter-tab ${filter === "month" ? "active" : ""}`}
            onClick={() => setFilter("month")}
          >
            This Month
          </button>
        </div>

        {history.length > 0 && (
          <button className="clear-history-btn" onClick={handleClearHistory}>
            Clear all history
          </button>
        )}
      </div>

      <div className="history-content">
        {history.length === 0 ? (
          <div className="empty-state">
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M13 3C8.03 3 4 7.03 4 12H1L4.89 15.89L4.96 16.03L9 12H6C6 8.13 9.13 5 13 5C16.87 5 20 8.13 20 12C20 15.87 16.87 19 13 19C11.07 19 9.32 18.21 8.06 16.94L6.64 18.36C8.27 19.99 10.51 21 13 21C17.97 21 22 16.97 22 12C22 7.03 17.97 3 13 3ZM12 8V13L16.28 15.54L17 14.33L13.5 12.25V8H12Z"
                fill="currentColor"
              />
            </svg>
            <h3>No watch history yet</h3>
            <p>Videos you watch will appear here</p>
            <button
              className="explore-btn"
              onClick={() => navigate("/user/home")}
            >
              Explore Videos
            </button>
          </div>
        ) : (
          <div className="history-grid">
            {history.map((item) => {
              const video = item.video || item;
              const videoId = video._id || item._id;

              return (
                <div
                  className="history-card"
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
                  <div className="video-thumbnail">
                    <img
                      src={video.thumbnail || getStaticThumbnail(videoId)}
                      alt={video.title}
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = getStaticThumbnail(videoId);
                      }}
                    />
                    <span className="video-duration">
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
                  </div>

                  <div className="video-info">
                    <h3 className="video-title">{video.title}</h3>
                    <p className="video-channel">
                      {video.owner?.fullname || video.channel || "Unknown"}
                    </p>
                    <div className="video-meta">
                      <span>{formatNumber(video.views || 0)} views</span>
                      <span className="dot">•</span>
                      <span>{formatDate(item.watchedAt)}</span>
                      {item.watchDuration && (
                        <>
                          <span className="dot">•</span>
                          <span>
                            Watched {formatDuration(item.watchDuration)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
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
    </div>
  );
};

export default History;
