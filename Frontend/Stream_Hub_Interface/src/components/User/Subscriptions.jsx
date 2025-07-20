import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { subscriptionAPI, videoAPI } from "../../utils/api";
import VideoPlayer from "./VideoPlayer";
import "./Subscriptions.css";

const Subscriptions = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);

  // Mock subscriptions data with realistic thumbnails
  const mockSubscriptions = [
    {
      id: 1,
      channelName: "TechReviews Pro",
      channelAvatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face",
      subscribers: "2.1M",
      isSubscribed: true,
      videos: [
        {
          id: 101,
          title: "Latest Smartphone Review 2024",
          views: "450K",
          date: "1 day ago",
          length: "15:30",
          thumbnail:
            "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=320&h=180&fit=crop",
          videoUrl:
            "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        },
        {
          id: 102,
          title: "AI Technology Trends",
          views: "320K",
          date: "3 days ago",
          length: "22:15",
          thumbnail:
            "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=320&h=180&fit=crop",
          videoUrl:
            "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4",
        },
      ],
    },
    {
      id: 2,
      channelName: "Chef's Kitchen",
      channelAvatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face",
      subscribers: "890K",
      isSubscribed: true,
      videos: [
        {
          id: 201,
          title: "Italian Pasta Masterclass",
          views: "180K",
          date: "2 days ago",
          length: "18:45",
          thumbnail:
            "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=320&h=180&fit=crop",
          videoUrl:
            "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        },
      ],
    },
    {
      id: 3,
      channelName: "GamingZone",
      channelAvatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face",
      subscribers: "5.2M",
      isSubscribed: true,
      videos: [
        {
          id: 301,
          title: "Epic Gaming Highlights",
          views: "1.2M",
          date: "5 hours ago",
          length: "25:12",
          thumbnail:
            "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=320&h=180&fit=crop",
          videoUrl:
            "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4",
        },
        {
          id: 302,
          title: "New Game Release Review",
          views: "890K",
          date: "1 day ago",
          length: "32:45",
          thumbnail:
            "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=320&h=180&fit=crop",
          videoUrl:
            "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4",
        },
      ],
    },
  ];

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!user || !user._id) {
          setError("Please login to view your subscriptions");
          setLoading(false);
          return;
        }

        // Fetch user's subscribed channels from API
        const response = await subscriptionAPI.getUserSubscriptions(user._id);

        if (response.success && response.data.subscribedChannels) {
          // Transform the data to match our component structure
          const transformedSubscriptions = response.data.subscribedChannels.map(
            (channel) => ({
              id: channel._id,
              channelName: channel.fullname || channel.username,
              channelAvatar:
                channel.profileimage ||
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face",
              subscribers: "0", // This would need to be fetched separately
              isSubscribed: true,
              videos: [], // This would need to be fetched separately
              channelData: channel, // Keep original data
            })
          );

          setSubscriptions(transformedSubscriptions);

          // Fetch videos for each subscribed channel
          await fetchVideosForChannels(transformedSubscriptions);
        } else {
          setSubscriptions([]);
        }
      } catch (err) {
        console.error("Subscriptions fetch failed:", err);
        setError("Could not load subscriptions from server. Please try again.");
        setSubscriptions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, [user]);

  // Function to fetch videos for subscribed channels
  const fetchVideosForChannels = async (channels) => {
    try {
      const updatedChannels = await Promise.all(
        channels.map(async (channel) => {
          try {
            // Fetch videos for this channel
            const videosResponse = await videoAPI.getAllVideos();
            const channelVideos =
              videosResponse.videos?.filter(
                (video) => video.userId === channel.id
              ) || [];

            // Transform videos to match our structure
            const transformedVideos = channelVideos
              .slice(0, 5)
              .map((video) => ({
                id: video._id,
                title: video.title,
                views: video.views || "0",
                date: new Date(video.createdAt).toLocaleDateString(),
                length: video.duration || "10:00",
                thumbnail:
                  video.thumbnail ||
                  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=320&h=180&fit=crop",
                videoUrl: video.videoUrl,
              }));

            return {
              ...channel,
              videos: transformedVideos,
            };
          } catch (err) {
            console.error(
              `Failed to fetch videos for channel ${channel.id}:`,
              err
            );
            return channel;
          }
        })
      );

      setSubscriptions(updatedChannels);
    } catch (err) {
      console.error("Failed to fetch videos for channels:", err);
    }
  };

  const handleVideoClick = (video) => {
    setSelectedVideo(video);
  };

  const handleCloseVideo = () => {
    setSelectedVideo(null);
  };

  const handleUnsubscribe = async (channelId) => {
    try {
      if (!user || !user._id) {
        setError("Please login to manage subscriptions");
        return;
      }

      const response = await subscriptionAPI.unsubscribeFromChannel(
        user._id,
        channelId
      );

      if (response.success) {
        // Remove the channel from subscriptions
        setSubscriptions((prev) => prev.filter((sub) => sub.id !== channelId));
      } else {
        setError("Failed to unsubscribe from channel");
      }
    } catch (err) {
      console.error("Unsubscribe failed:", err);
      setError("Failed to unsubscribe from channel");
    }
  };

  const handleSubscribe = async (channelId) => {
    try {
      if (!user || !user._id) {
        setError("Please login to manage subscriptions");
        return;
      }

      const response = await subscriptionAPI.subscribeToChannel(
        user._id,
        channelId
      );

      if (response.success) {
        // Add the channel to subscriptions (you might need to fetch channel details)
        // For now, we'll just show a success message
        setError(null);
      } else {
        setError("Failed to subscribe to channel");
      }
    } catch (err) {
      console.error("Subscribe failed:", err);
      setError("Failed to subscribe to channel");
    }
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

  const subscribedChannels = subscriptions.filter((sub) => sub.isSubscribed);

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
          <div className="subscription-actions">
            <button className="explore-btn" onClick={() => navigate("/")}>
              Explore Channels
            </button>
            <button
              className="refresh-btn"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </button>
          </div>
        </div>
      ) : (
        <div className="subscriptions-content">
          {subscribedChannels.map((channel) => (
            <div key={channel.id} className="channel-section">
              <div className="channel-header">
                <div className="channel-info">
                  <img
                    src={channel.channelAvatar}
                    alt={channel.channelName}
                    className="channel-avatar"
                    onError={(e) => {
                      e.target.src =
                        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face";
                    }}
                  />
                  <div className="channel-details">
                    <h3>{channel.channelName}</h3>
                    <p>{channel.subscribers} subscribers</p>
                  </div>
                </div>
                <div className="channel-actions">
                  <button
                    className="view-channel-btn"
                    onClick={() => navigate(`/channel/${channel.id}`)}
                  >
                    View Channel
                  </button>
                  <button
                    className={`subscribe-btn ${
                      channel.isSubscribed ? "subscribed" : ""
                    }`}
                    onClick={() => handleUnsubscribe(channel.id)}
                  >
                    {channel.isSubscribed ? "Unsubscribe" : "Subscribe"}
                  </button>
                </div>
              </div>

              <div className="channel-videos">
                {channel.videos.map((video) => (
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
                          // Use unique fallback based on video ID
                          const fallbackThumbnails = [
                            "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=320&h=180&fit=crop&crop=center",
                            "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=320&h=180&fit=crop&crop=center",
                            "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=320&h=180&fit=crop&crop=center",
                            "https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=320&h=180&fit=crop&crop=center",
                            "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=320&h=180&fit=crop&crop=center",
                          ];
                          e.target.src =
                            fallbackThumbnails[
                              video.id % fallbackThumbnails.length
                            ];
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
