import React, { useState, useEffect } from "react";
import axios from "axios";
import VideoPlayer from "./VideoPlayer";
import "./Subscriptions.css";

const Subscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);

  // Mock subscriptions data


  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(
          "http://localhost:5000/api/subscriptions"
        );
        setSubscriptions(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error("Subscriptions fetch failed:", err);
        setError("Could not load subscriptions from server.");
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, []);

  const handleVideoClick = (video) => {
    setSelectedVideo(video);
  };

  const handleCloseVideo = () => {
    setSelectedVideo(null);
  };

  const handleUnsubscribe = (channelId) => {
    setSubscriptions((prev) =>
      Array.isArray(prev) ? prev.map((sub) =>
        sub.id === channelId ? { ...sub, isSubscribed: false } : sub
      ) : []
    );
  };

  const handleSubscribe = (channelId) => {
    setSubscriptions((prev) =>
      Array.isArray(prev) ? prev.map((sub) =>
        sub.id === channelId ? { ...sub, isSubscribed: true } : sub
      ) : []
    );
  };

  if (loading) {
    return (
      <div className="subscriptions-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your subscriptions...</p>
        </div>
      </div>
    );
  }

  const subscribedChannels = Array.isArray(subscriptions) 
    ? subscriptions.filter((sub) => sub.isSubscribed) 
    : [];

  return (
    <div className="subscriptions-container">
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

      <div className="subscriptions-header">
        <h1>Subscriptions</h1>
        <p>Latest videos from channels you follow</p>
      </div>

      {subscribedChannels.length === 0 ? (
        <div className="no-subscriptions">
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M16 4H18C19.1046 4 20 4.89543 20 6V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V6C4 4.89543 4.89543 4 6 4H8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M15 2H9C8.44772 2 8 2.44772 8 3V5C8 5.55228 8.44772 6 9 6H15C15.5523 6 16 5.55228 16 5V3C16 2.44772 15.5523 2 15 2Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <h3>No subscriptions yet</h3>
          <p>Subscribe to channels to see their latest videos here</p>
          <button className="explore-btn">Explore Channels</button>
        </div>
      ) : (
        <div className="subscriptions-content">
          {Array.isArray(subscribedChannels) && subscribedChannels.map((channel) => (
            <div key={channel.id} className="channel-section">
              <div className="channel-header">
                <div className="channel-info">
                  <img
                    src={channel.channelAvatar}
                    alt={channel.channelName}
                    className="channel-avatar"
                    onError={(e) => {
                      e.target.src = "https://picsum.photos/60/60?random=999";
                    }}
                  />
                  <div className="channel-details">
                    <h3>{channel.channelName}</h3>
                    <p>{channel.subscribers} subscribers</p>
                  </div>
                </div>
                <button
                  className={`subscribe-btn ${
                    channel.isSubscribed ? "subscribed" : ""
                  }`}
                  onClick={() =>
                    channel.isSubscribed
                      ? handleUnsubscribe(channel.id)
                      : handleSubscribe(channel.id)
                  }
                >
                  {channel.isSubscribed ? "Subscribed" : "Subscribe"}
                </button>
              </div>

              <div className="channel-videos">
                {Array.isArray(channel.videos) && channel.videos.map((video) => (
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
                          e.target.src =
                            "https://picsum.photos/320/180?random=999";
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
                      <div className="meta">
                        <span>{video.views} views</span>
                        <span className="dot">•</span>
                        <span>{video.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

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

export default Subscriptions;
