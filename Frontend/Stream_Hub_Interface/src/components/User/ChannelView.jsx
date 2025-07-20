import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { userAPI, subscriptionAPI, videoAPI } from "../../utils/api";
import "./ChannelView.css";

const ChannelView = () => {
  const { channelId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("videos");
  const [videoStats, setVideoStats] = useState({
    totalViews: 0,
    totalLikes: 0,
    totalVideos: 0,
  });

  useEffect(() => {
    if (channelId) {
      loadChannelData();
      loadChannelVideos();
      checkSubscriptionStatus();
    }
  }, [channelId]);

  const loadChannelData = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getUserById(channelId);
      setChannel(response.data);
      setSubscriberCount(response.data.followers?.length || 0);
    } catch (error) {
      console.error("Error loading channel data:", error);
      setError("Failed to load channel data");
    } finally {
      setLoading(false);
    }
  };

  const loadChannelVideos = async () => {
    try {
      const response = await videoAPI.getVideosByUser(channelId);
      setVideos(response.data || []);

      // Calculate video stats
      const stats = response.data.reduce(
        (acc, video) => {
          acc.totalViews += video.views || 0;
          acc.totalLikes += video.likes?.length || 0;
          return acc;
        },
        { totalViews: 0, totalLikes: 0, totalVideos: response.data.length }
      );

      setVideoStats(stats);
    } catch (error) {
      console.error("Error loading channel videos:", error);
    }
  };

  const checkSubscriptionStatus = async () => {
    if (!user || !channelId) return;

    try {
      const response = await subscriptionAPI.checkChannelSubscription(
        user._id,
        channelId
      );
      setIsSubscribed(response.data.isSubscribed);
    } catch (error) {
      console.error("Error checking subscription status:", error);
    }
  };

  const handleSubscribe = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      if (isSubscribed) {
        // Unsubscribe
        const response = await subscriptionAPI.unsubscribeFromChannel(
          user._id,
          channelId
        );
        setIsSubscribed(false);
        setSubscriberCount(response.data.subscriberCount);
      } else {
        // Subscribe
        const response = await subscriptionAPI.subscribeToChannel(
          user._id,
          channelId
        );
        setIsSubscribed(true);
        setSubscriberCount(response.data.subscriberCount);
      }
    } catch (error) {
      console.error("Error toggling subscription:", error);
      setError("Failed to update subscription");
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  if (loading) {
    return (
      <div className="channel-view">
        {/* Channel Header Skeleton */}
        <div className="channel-header">
          <div className="channel-banner">
            <div className="channel-info">
              <div className="channel-avatar skeleton-avatar"></div>
              <div className="channel-details">
                <div className="skeleton-title"></div>
                <div className="skeleton-username"></div>
                <div className="channel-stats">
                  <div className="skeleton-stat"></div>
                  <div className="skeleton-stat"></div>
                  <div className="skeleton-stat"></div>
                </div>
              </div>
            </div>
            <div className="channel-actions">
              <div className="skeleton-button"></div>
            </div>
          </div>
        </div>

        {/* Channel Navigation Skeleton */}
        <div className="channel-nav">
          <div className="skeleton-nav-tab"></div>
          <div className="skeleton-nav-tab"></div>
          <div className="skeleton-nav-tab"></div>
        </div>

        {/* Channel Content Skeleton */}
        <div className="channel-content">
          <div className="videos-section">
            <div className="videos-header">
              <div className="skeleton-title"></div>
              <div className="skeleton-filter"></div>
            </div>
            <div className="videos-grid">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="video-card skeleton">
                  <div className="video-thumbnail skeleton-thumb"></div>
                  <div className="video-info">
                    <div className="skeleton-text"></div>
                    <div className="skeleton-text"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !channel) {
    return (
      <div className="channel-view">
        <div className="error-container">
          <h2>Channel Not Found</h2>
          <p>{error || "This channel does not exist or has been removed."}</p>
          <button
            onClick={() => navigate("/user/home")}
            className="btn-primary"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="channel-view">
      {/* Channel Header */}
      <div className="channel-header">
        <div className="channel-banner">
          <div className="channel-info">
            <div className="channel-avatar">
              <img
                src={channel.profileimage || "/default-avatar.png"}
                alt={channel.fullname}
                onError={(e) => {
                  e.target.src = "/default-avatar.png";
                }}
              />
            </div>
            <div className="channel-details">
              <h1>{channel.fullname}</h1>
              <p className="channel-username">@{channel.username}</p>
              <div className="channel-stats">
                <span>{formatNumber(subscriberCount)} subscribers</span>
                <span>{formatNumber(videoStats.totalVideos)} videos</span>
                <span>{formatNumber(videoStats.totalViews)} total views</span>
              </div>
              {channel.bio && <p className="channel-bio">{channel.bio}</p>}
            </div>
          </div>
          <div className="channel-actions">
            {user && user._id !== channelId && (
              <button
                onClick={handleSubscribe}
                className={`subscribe-btn ${isSubscribed ? "subscribed" : ""}`}
              >
                {isSubscribed ? "Subscribed" : "Subscribe"}
              </button>
            )}
            {user && user._id === channelId && (
              <button
                onClick={() => navigate("/user/settings")}
                className="btn-secondary"
              >
                Manage Channel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Channel Navigation */}
      <div className="channel-nav">
        <button
          className={`nav-tab ${activeTab === "videos" ? "active" : ""}`}
          onClick={() => setActiveTab("videos")}
        >
          Videos
        </button>
        <button
          className={`nav-tab ${activeTab === "about" ? "active" : ""}`}
          onClick={() => setActiveTab("about")}
        >
          About
        </button>
        <button
          className={`nav-tab ${activeTab === "community" ? "active" : ""}`}
          onClick={() => setActiveTab("community")}
        >
          Community
        </button>
      </div>

      {/* Channel Content */}
      <div className="channel-content">
        {activeTab === "videos" && (
          <div className="videos-section">
            <div className="videos-header">
              <h2>Videos</h2>
              <div className="videos-filter">
                <select defaultValue="newest">
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>
            </div>

            {videos.length > 0 ? (
              <div className="videos-grid">
                {videos.map((video) => (
                  <div
                    key={video._id}
                    className="video-card"
                    onClick={() => navigate(`/user/video/${video._id}`)}
                  >
                    <div className="video-thumbnail">
                      <img
                        src={video.thumbnail || "/default-thumbnail.jpg"}
                        alt={video.title}
                        onError={(e) => {
                          e.target.src = "/default-thumbnail.jpg";
                        }}
                      />
                      <div className="video-duration">
                        {video.duration
                          ? formatDuration(video.duration)
                          : "0:00"}
                      </div>
                    </div>
                    <div className="video-info">
                      <h3>{video.title}</h3>
                      <p className="video-stats">
                        {formatNumber(video.views || 0)} views •{" "}
                        {formatDate(video.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-videos">
                <p>No videos uploaded yet.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "about" && (
          <div className="about-section">
            <div className="about-content">
              <h2>About</h2>
              <div className="about-stats">
                <div className="stat-item">
                  <span className="stat-number">
                    {formatNumber(subscriberCount)}
                  </span>
                  <span className="stat-label">Subscribers</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">
                    {formatNumber(videoStats.totalVideos)}
                  </span>
                  <span className="stat-label">Videos</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">
                    {formatNumber(videoStats.totalViews)}
                  </span>
                  <span className="stat-label">Total Views</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">
                    {formatDate(channel.createdAt)}
                  </span>
                  <span className="stat-label">Joined</span>
                </div>
              </div>

              {channel.bio && (
                <div className="channel-description">
                  <h3>Description</h3>
                  <p>{channel.bio}</p>
                </div>
              )}

              <div className="channel-links">
                <h3>Links</h3>
                {channel.website && (
                  <a
                    href={channel.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="channel-link"
                  >
                    Website
                  </a>
                )}
                {channel.socialLinks &&
                  Object.keys(channel.socialLinks).length > 0 && (
                    <div className="social-links">
                      {channel.socialLinks.twitter && (
                        <a
                          href={channel.socialLinks.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Twitter
                        </a>
                      )}
                      {channel.socialLinks.instagram && (
                        <a
                          href={channel.socialLinks.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Instagram
                        </a>
                      )}
                      {channel.socialLinks.facebook && (
                        <a
                          href={channel.socialLinks.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Facebook
                        </a>
                      )}
                    </div>
                  )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "community" && (
          <div className="community-section">
            <h2>Community</h2>
            <p>Community features coming soon!</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to format video duration
const formatDuration = (seconds) => {
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

export default ChannelView;
