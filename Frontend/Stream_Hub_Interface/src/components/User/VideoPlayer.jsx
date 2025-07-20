import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  videoAPI,
  likeAPI,
  commentAPI,
  subscriptionAPI,
  libraryAPI,
} from "../../utils/api";
import "./VideoPlayer.css";

const VideoPlayer = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const { user, getAuthHeaders } = useAuth();

  console.log("VideoPlayer Debug:", {
    videoId,
    user: !!user,
    userData: user,
  });

  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showComments, setShowComments] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadVideoData();

    // Cleanup function to decrease view count when component unmounts
    return () => {
      // Decrease view count when user navigates away
      if (video && video.views > 0) {
        decreaseViewCount();
      }
    };
  }, [videoId]);

  const decreaseViewCount = async () => {
    try {
      // Call API to decrease view count
      await fetch(
        `${
          process.env.REACT_APP_API_URL || "http://localhost:5000"
        }/api/videos/${videoId}/decrease-view`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
        }
      );
    } catch (error) {
      console.error("Error decreasing view count:", error);
    }
  };

  const loadVideoData = async () => {
    try {
      setIsLoading(true);
      setError("");

      // Load video details
      const videoData = await videoAPI.getVideoById(videoId);
      console.log("Video data received:", videoData);
      console.log("Video owner data:", videoData.owner);
      console.log("Followers array:", videoData.owner?.followers);
      setVideo(videoData);
      setLikeCount(videoData.likesCount || 0);

      // Add video to watch history
      if (user && user._id) {
        try {
          await libraryAPI.addToHistory(user._id, videoId, 0, false);
        } catch (error) {
          console.log("Failed to add to history:", error);
        }
      }

      // Load comments
      try {
        const commentsResponse = await commentAPI.getComments(videoId);
        if (commentsResponse.success) {
          setComments(commentsResponse.data.comments || []);
        } else {
          setComments([]);
        }
      } catch (error) {
        console.log("Comments API not available, using empty array");
        setComments([]);
      }

      // Load recommendations
      const recommendationsData = await videoAPI.getAllVideos();
      setRecommendations(
        recommendationsData.filter((v) => v._id !== videoId).slice(0, 10)
      );

      // Check if user liked the video
      if (user) {
        try {
          const likedResponse = await likeAPI.getLikedVideos(user._id);
          if (likedResponse.likedVideos) {
            setIsLiked(
              likedResponse.likedVideos.some((v) => v._id === videoId)
            );
          }
        } catch (error) {
          console.log("Like API not available");
        }

        // Check if user is subscribed to the channel
        try {
          const channelId = videoData.owner?._id;
          if (channelId) {
            const subscriptionResponse =
              await subscriptionAPI.checkChannelSubscription(
                user._id,
                channelId
              );
            if (subscriptionResponse.success) {
              setIsSubscribed(subscriptionResponse.data.subscribed);
            }
          }
        } catch (error) {
          console.log("Subscription check API not available");
        }
      }
    } catch (error) {
      setError("Failed to load video");
      console.error("Error loading video:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      await likeAPI.toggleLike(videoId, user._id);

      // Update local state
      setIsLiked(!isLiked);
      setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));

      // Show success message
      setMessage({
        type: "success",
        text: isLiked ? "Video unliked" : "Video liked!",
      });
      setTimeout(() => setMessage(null), 2000);
    } catch (error) {
      console.error("Error toggling like:", error);
      setMessage({ type: "error", text: "Failed to update like" });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }

    if (!commentText.trim()) return;

    console.log("Adding comment:", {
      videoId,
      userId: user._id,
      content: commentText,
      user: user,
    });

    try {
      const response = await commentAPI.addComment(
        videoId,
        user._id,
        commentText
      );

      console.log("Comment response:", response);

      if (response.success) {
        // Add the new comment to the list
        const newComment = {
          _id: response.data._id,
          content: commentText,
          user: user,
          createdAt: new Date().toISOString(),
          likes: [],
        };

        setComments((prev) => [newComment, ...prev]);
        setCommentText("");

        // Show success message
        setMessage({
          type: "success",
          text: "Comment added successfully!",
        });
        setTimeout(() => setMessage(null), 2000);
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      setMessage({ type: "error", text: "Failed to add comment" });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: video?.title || "Check out this video!",
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      setMessage({
        type: "success",
        text: "Link copied to clipboard!",
      });
      setTimeout(() => setMessage(null), 2000);
    }
  };

  const handleSubscribe = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      const channelId = video.owner?._id;
      if (!channelId) return;

      await subscriptionAPI.toggleSubscription(user._id, channelId);

      // Update local state
      setIsSubscribed(!isSubscribed);

      // Show success message
      setMessage({
        type: "success",
        text: isSubscribed ? "Unsubscribed" : "Subscribed successfully!",
      });
      setTimeout(() => setMessage(null), 2000);
    } catch (error) {
      console.error("Error toggling subscription:", error);
      setMessage({ type: "error", text: "Failed to update subscription" });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleCommentLike = async (commentId) => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      // Toggle comment like
      const response = await commentAPI.toggleCommentLike(commentId, user._id);

      if (response.success) {
        // Update comments list
        setComments((prev) =>
          prev.map((comment) =>
            comment._id === commentId
              ? {
                  ...comment,
                  likes: response.data.likes,
                }
              : comment
          )
        );
      }
    } catch (error) {
      console.error("Error toggling comment like:", error);
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

  if (isLoading) {
    return (
      <div className="video-player-container">
        <div className="video-player-main">
          <div className="video-player-section">
            <div className="video-player-wrapper">
              <div className="skeleton-video"></div>
            </div>
            <div className="video-info">
              <div className="skeleton-title"></div>
              <div className="skeleton-stats"></div>
            </div>
          </div>

          <div className="video-recommendations">
            <div className="skeleton-recommendations-title"></div>
            <div className="recommendations-list">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="recommendation-item skeleton">
                  <div className="recommendation-thumbnail skeleton-thumb"></div>
                  <div className="recommendation-info">
                    <div className="skeleton-text"></div>
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

  if (error || !video) {
    return (
      <div className="video-player-error">
        <h2>Video not found</h2>
        <p>{error || "This video may have been removed or is private."}</p>
        <button onClick={() => navigate("/login")} className="back-btn">
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="video-player-container">
      {/* Message Display */}
      {message && (
        <div className={`message ${message.type}`}>{message.text}</div>
      )}

      <div className="video-player-main">
        {/* Video Player */}
        <div className="video-player-section">
          <div className="video-player-wrapper">
            <video
              className="video-player"
              controls
              poster={video.thumbnail}
              src={video.videoUrl}
            >
              Your browser does not support the video tag.
            </video>
          </div>

          {/* Video Info */}
          <div className="video-info">
            <h1 className="video-title">{video.title}</h1>

            <div className="video-stats">
              <div className="video-meta">
                <span className="view-count">
                  {formatNumber(video.views || 0)} views
                </span>
                <span className="upload-date">
                  {formatDate(video.createdAt)}
                </span>
              </div>

              <div className="video-actions">
                <button
                  className={`action-btn like-btn ${isLiked ? "liked" : ""}`}
                  onClick={handleLike}
                >
                  <svg
                    width="20"
                    height="20"
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
                  {formatNumber(likeCount)}
                </button>

                <button className="action-btn dislike-btn">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3.16 19.39C3.6708 19.901 4.2772 20.3064 4.9446 20.5829C5.6121 20.8595 6.3275 21.0018 7.05 21.0018C7.7725 21.0018 8.4879 20.8595 9.1554 20.5829C9.8228 20.3064 10.4292 19.901 10.94 19.39L12 18.33L13.06 19.39C14.0917 20.4217 15.491 21.0013 16.95 21.0013C18.409 21.0013 19.8083 20.4217 20.84 19.39C21.8717 18.3583 22.4513 16.959 22.4513 15.5C22.4513 14.041 21.8717 12.6417 20.84 11.61L12 2.77L3.16 11.61C2.649 12.1208 2.2436 12.7272 1.9671 13.3946C1.6905 14.0621 1.5482 14.7775 1.5482 15.5C1.5482 16.2225 1.6905 16.9379 1.9671 17.6054C2.2436 18.2728 2.649 18.8792 3.16 19.39Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                <button
                  className="action-btn"
                  onClick={() => setShowComments(!showComments)}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {formatNumber(comments.length)}
                </button>

                <button className="action-btn" onClick={handleShare}>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4 12V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M16 6L12 2L8 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 2V15"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Share
                </button>
              </div>
            </div>
          </div>

          {/* Channel Info */}
          <div className="channel-info">
            <div
              className="channel-avatar"
              onClick={() => navigate(`/user/channel/${video.owner?._id}`)}
            >
              {video.owner?.profileimage ? (
                <img
                  src={video.owner.profileimage}
                  alt={video.owner.fullname}
                />
              ) : (
                <span>{video.owner?.fullname?.charAt(0) || "C"}</span>
              )}
            </div>
            <div
              className="channel-details"
              onClick={() => navigate(`/user/channel/${video.owner?._id}`)}
            >
              <h3 className="channel-name">
                {video.owner?.fullname || "Unknown Creator"}
              </h3>
              <p className="subscriber-count">
                {formatNumber(video.owner?.followers?.length || 0)} subscribers
              </p>
            </div>
            <button
              className={`subscribe-btn ${isSubscribed ? "subscribed" : ""}`}
              onClick={handleSubscribe}
            >
              {isSubscribed ? "Subscribed" : "Subscribe"}
            </button>
          </div>

          {/* Video Description */}
          <div className="video-description">
            <div className="description-text">
              <p>{video.description || "No description available."}</p>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="comments-section">
            <h3 className="comments-title">Comments ({comments.length})</h3>

            {/* Add Comment */}
            <div className="add-comment">
              <div className="comment-avatar">
                {user?.profileimage ? (
                  <img src={user.profileimage} alt={user.fullname} />
                ) : (
                  <span>{user?.fullname?.charAt(0) || "U"}</span>
                )}
              </div>
              <form onSubmit={handleComment} className="comment-form">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="comment-input"
                />
                <button
                  type="submit"
                  className="comment-submit"
                  disabled={!commentText.trim()}
                >
                  Comment
                </button>
              </form>
            </div>

            {/* Comments List */}
            <div className="comments-list">
              {comments.map((comment) => (
                <div key={comment._id} className="comment-item">
                  <div className="comment-avatar">
                    {comment.user?.profileimage ? (
                      <img
                        src={comment.user.profileimage}
                        alt={comment.user.fullname}
                      />
                    ) : (
                      <span>{comment.user?.fullname?.charAt(0) || "U"}</span>
                    )}
                  </div>
                  <div className="comment-content">
                    <div className="comment-header">
                      <span className="comment-author">
                        {comment.user?.fullname || "Anonymous"}
                      </span>
                      <span className="comment-date">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="comment-text">
                      {comment.content || comment.comment}
                    </p>
                    <div className="comment-actions">
                      <button
                        className="comment-like-btn"
                        onClick={() => handleCommentLike(comment._id)}
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
                        {formatNumber(comment.likes?.length || 0)}
                      </button>
                      <button className="comment-reply-btn">Reply</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recommendations Sidebar */}
      <div className="video-recommendations">
        <h3 className="recommendations-title">Recommended</h3>
        <div className="recommendations-list">
          {recommendations.map((recVideo) => (
            <div
              key={recVideo._id}
              className="recommendation-item"
              onClick={() => navigate(`/user/video/${recVideo._id}`)}
            >
              <div className="recommendation-thumbnail">
                <img
                  src={recVideo.thumbnail || getStaticThumbnail(recVideo._id)}
                  alt={recVideo.title}
                  onError={(e) => {
                    e.target.src = getStaticThumbnail(recVideo._id);
                  }}
                />
                <span className="video-duration">
                  {formatDuration(recVideo.duration)}
                </span>
              </div>
              <div className="recommendation-info">
                <h4 className="recommendation-title">{recVideo.title}</h4>
                <p className="recommendation-channel">
                  {recVideo.owner?.fullname || "Unknown"}
                </p>
                <p className="recommendation-stats">
                  {formatNumber(recVideo.views || 0)} views •{" "}
                  {formatDate(recVideo.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
