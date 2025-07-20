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

// Mock data for demonstration with unique video thumbnails
const mockVideos = [
  {
    id: 1,
    title: "Amazing Tech Review: Latest Smartphone 2024",
    channel: "TechReviews Pro",
    views: "2.1M",
    date: "2 days ago",
    length: "12:34",
    thumbnail:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=320&h=180&fit=crop&crop=center",
    videoUrl:
      "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    premium: false,
    category: "Tech Reviews",
  },
  {
    id: 2,
    title: "Cooking Masterclass: Italian Pasta Secrets",
    channel: "Chef's Kitchen",
    views: "890K",
    date: "1 week ago",
    length: "18:45",
    thumbnail:
      "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=320&h=180&fit=crop&crop=center",
    videoUrl:
      "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4",
    premium: true,
    category: "Cooking",
  },
  {
    id: 3,
    title: "Epic Gaming Moments: Battle Royale Highlights",
    channel: "GamingZone",
    views: "5.2M",
    date: "3 days ago",
    length: "25:12",
    thumbnail:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=320&h=180&fit=crop&crop=center",
    videoUrl:
      "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4",
    premium: false,
    category: "Gaming",
  },
  {
    id: 4,
    title: "Travel Vlog: Exploring Hidden Beaches in Bali",
    channel: "Wanderlust",
    views: "1.4M",
    date: "5 days ago",
    length: "32:18",
    thumbnail:
      "https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=320&h=180&fit=crop&crop=center",
    videoUrl:
      "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    premium: false,
    category: "Travel",
  },
  {
    id: 5,
    title: "Workout Routine: Full Body HIIT Training",
    channel: "FitLife",
    views: "756K",
    date: "1 day ago",
    length: "28:33",
    thumbnail:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=320&h=180&fit=crop&crop=center",
    videoUrl:
      "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4",
    premium: false,
    category: "Fitness",
  },
  {
    id: 6,
    title: "Comedy Skit: Office Life is Crazy!",
    channel: "Laugh Factory",
    views: "3.8M",
    date: "4 days ago",
    length: "8:45",
    thumbnail:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=320&h=180&fit=crop&crop=center",
    videoUrl:
      "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4",
    premium: false,
    category: "Comedy",
  },
  {
    id: 7,
    title: "Music Production: Behind the Scenes Studio Session",
    channel: "MusicWorld",
    views: "1.2M",
    date: "6 hours ago",
    length: "15:20",
    thumbnail:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=320&h=180&fit=crop&crop=center",
    videoUrl:
      "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_3mb.mp4",
    premium: true,
    category: "Music",
  },
  {
    id: 8,
    title: "Educational: Learn JavaScript in 30 Minutes",
    channel: "CodeAcademy",
    views: "890K",
    date: "1 day ago",
    length: "30:15",
    thumbnail:
      "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=320&h=180&fit=crop&crop=center",
    videoUrl:
      "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_4mb.mp4",
    premium: false,
    category: "Education",
  },
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

        // Try to fetch from API first
        const videosData = await videoAPI.getAllVideos();

        if (videosData && videosData.length > 0) {
          setVideos(videosData);
        } else {
          // Fallback to mock data if API returns empty
          setVideos(mockVideos);
        }
      } catch (err) {
        console.error("Video fetch failed:", err);
        // Use mock data as fallback
        setVideos(mockVideos);
        setError("Could not load videos from server. Showing demo content.");
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const filteredVideos =
    selected === "All"
      ? videos
      : videos.filter((vid) => vid.category === selected);

  const handleCategoryClick = (category) => {
    setSelected(category);
    // Smooth scroll to videos section on mobile
    if (window.innerWidth < 768) {
      const videosSection = document.querySelector(".videos-grid");
      if (videosSection) {
        videosSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const handleVideoClick = (video) => {
    navigate(`/video/${video._id || video.id}`);
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
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

      <div className="categories-container">
        <div className="categories">
          {categories.map((cat) => (
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
          <h2>
            {selected === "All" ? "Recommended Videos" : `${selected} Videos`}
          </h2>
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
            <p>
              Try selecting a different category or check back later for new
              content.
            </p>
          </div>
        ) : (
          <div className="videos-grid">
            {filteredVideos.map((vid) => (
              <div
                className="video-card"
                key={vid._id || vid.id}
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
                      // Use a default video thumbnail based on category
                      const categoryThumbnails = {
                        "Tech Reviews":
                          "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=320&h=180&fit=crop&crop=center",
                        Cooking:
                          "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=320&h=180&fit=crop&crop=center",
                        Gaming:
                          "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=320&h=180&fit=crop&crop=center",
                        Travel:
                          "https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=320&h=180&fit=crop&crop=center",
                        Fitness:
                          "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=320&h=180&fit=crop&crop=center",
                        Music:
                          "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=320&h=180&fit=crop&crop=center",
                        Education:
                          "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=320&h=180&fit=crop&crop=center",
                        Comedy:
                          "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=320&h=180&fit=crop&crop=center",
                        News: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=320&h=180&fit=crop&crop=center",
                        Sports:
                          "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=320&h=180&fit=crop&crop=center",
                      };
                      e.target.src =
                        categoryThumbnails[vid.category] ||
                        categoryThumbnails["Tech Reviews"];
                    }}
                  />
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
                  <span className="length">
                    {vid.duration ? formatDuration(vid.duration) : vid.length}
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
                </div>
                <div className="info">
                  <div className="title">{vid.title}</div>
                  <div className="channel">
                    {vid.owner?.fullname || vid.channel || "Unknown"}
                  </div>
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
