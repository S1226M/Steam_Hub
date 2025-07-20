import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "./Search.css";

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Mock video data - replace with actual API call
  const mockVideos = [
    {
      id: 1,
      title: "React Tutorial for Beginners",
      description: "Learn React from scratch with this comprehensive tutorial",
      thumbnail:
        "https://via.placeholder.com/320x180/667eea/ffffff?text=React+Tutorial",
      duration: "45:30",
      views: "125K",
      uploadDate: "2 days ago",
      channel: "TechMaster",
      category: "programming",
    },
    {
      id: 2,
      title: "JavaScript ES6 Features",
      description: "Explore the latest JavaScript features and syntax",
      thumbnail:
        "https://via.placeholder.com/320x180/f093fb/ffffff?text=JavaScript+ES6",
      duration: "32:15",
      views: "89K",
      uploadDate: "1 week ago",
      channel: "CodeAcademy",
      category: "programming",
    },
    {
      id: 3,
      title: "CSS Grid Layout Complete Guide",
      description: "Master CSS Grid with practical examples",
      thumbnail:
        "https://via.placeholder.com/320x180/4facfe/ffffff?text=CSS+Grid",
      duration: "28:45",
      views: "67K",
      uploadDate: "3 days ago",
      channel: "WebDev Pro",
      category: "design",
    },
    {
      id: 4,
      title: "Node.js Backend Development",
      description: "Build scalable backend applications with Node.js",
      thumbnail:
        "https://via.placeholder.com/320x180/43e97b/ffffff?text=Node.js",
      duration: "1:15:20",
      views: "234K",
      uploadDate: "5 days ago",
      channel: "Backend Master",
      category: "programming",
    },
    {
      id: 5,
      title: "UI/UX Design Principles",
      description: "Learn the fundamentals of good design",
      thumbnail:
        "https://via.placeholder.com/320x180/fa709a/ffffff?text=UI+UX+Design",
      duration: "52:10",
      views: "156K",
      uploadDate: "1 week ago",
      channel: "Design Studio",
      category: "design",
    },
    {
      id: 6,
      title: "Python Data Science",
      description: "Introduction to data science with Python",
      thumbnail:
        "https://via.placeholder.com/320x180/ffecd2/000000?text=Python+Data",
      duration: "1:08:30",
      views: "198K",
      uploadDate: "4 days ago",
      channel: "Data Science Pro",
      category: "data-science",
    },
    {
      id: 7,
      title: "Mobile App Development",
      description: "Build mobile apps with React Native",
      thumbnail:
        "https://via.placeholder.com/320x180/a8edea/000000?text=Mobile+App",
      duration: "1:25:15",
      views: "112K",
      uploadDate: "6 days ago",
      channel: "Mobile Dev",
      category: "mobile",
    },
    {
      id: 8,
      title: "Machine Learning Basics",
      description: "Get started with machine learning algorithms",
      thumbnail:
        "https://via.placeholder.com/320x180/ff9a9e/ffffff?text=Machine+Learning",
      duration: "1:42:00",
      views: "89K",
      uploadDate: "2 weeks ago",
      channel: "AI Academy",
      category: "data-science",
    },
  ];

  const categories = [
    { id: "all", name: "All Categories" },
    { id: "programming", name: "Programming" },
    { id: "design", name: "Design" },
    { id: "data-science", name: "Data Science" },
    { id: "mobile", name: "Mobile Development" },
  ];

  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery.trim() === "") {
        setSearchResults([]);
        return;
      }

      setIsLoading(true);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      const filteredVideos = mockVideos.filter((video) => {
        const matchesQuery =
          video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          video.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          video.channel.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory =
          selectedCategory === "all" || video.category === selectedCategory;

        return matchesQuery && matchesCategory;
      });

      setSearchResults(filteredVideos);
      setIsLoading(false);
    };

    const debounceTimer = setTimeout(performSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, selectedCategory]);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Update URL parameters
    if (query.trim()) {
      setSearchParams({ q: query });
    } else {
      setSearchParams({});
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchParams({});
  };

  const handleVideoClick = (videoId) => {
    console.log("Playing video:", videoId);
    navigate(`/user/video/${videoId}`);
  };

  const formatDuration = (duration) => {
    return duration;
  };

  const formatViews = (views) => {
    return views;
  };

  return (
    <div className="search-page">
      <div className="search-header">
        <h1>Search Videos</h1>
        <p>Find the content you're looking for</p>
      </div>

      <div className="search-container">
        <div className="search-input-container">
          <div className="search-input-wrapper">
            <svg
              className="search-icon"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder="Search for videos, channels, or topics..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
            {searchQuery && (
              <button className="clear-search" onClick={handleClearSearch}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M18 6L6 18M6 6L18 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="filters-container">
          <div className="category-filters">
            {categories.map((category) => (
              <button
                key={category.id}
                className={`category-btn ${
                  selectedCategory === category.id ? "active" : ""
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        <div className="search-results">
          {isLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Searching...</p>
            </div>
          ) : searchQuery ? (
            <>
              <div className="results-header">
                <h2>
                  {searchResults.length} result
                  {searchResults.length !== 1 ? "s" : ""} for "{searchQuery}"
                </h2>
              </div>

              {searchResults.length > 0 ? (
                <div className="videos-grid">
                  {searchResults.map((video) => (
                    <div
                      key={video.id}
                      className="video-card"
                      onClick={() => handleVideoClick(video.id)}
                    >
                      <div className="video-thumbnail">
                        <img src={video.thumbnail} alt={video.title} />
                        <div className="video-duration">
                          {formatDuration(video.duration)}
                        </div>
                      </div>
                      <div className="video-info">
                        <h3 className="video-title">{video.title}</h3>
                        <p className="video-description">{video.description}</p>
                        <div className="video-meta">
                          <span className="channel-name">{video.channel}</span>
                          <span className="video-views">
                            {formatViews(video.views)} views
                          </span>
                          <span className="upload-date">
                            {video.uploadDate}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-results">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <h3>No results found</h3>
                  <p>Try adjusting your search terms or filters</p>
                </div>
              )}
            </>
          ) : (
            <div className="search-suggestions">
              <h2>Popular Searches</h2>
              <div className="suggestions-grid">
                {mockVideos.slice(0, 6).map((video) => (
                  <div
                    key={video.id}
                    className="suggestion-card"
                    onClick={() => setSearchQuery(video.title)}
                  >
                    <img src={video.thumbnail} alt={video.title} />
                    <div className="suggestion-info">
                      <h4>{video.title}</h4>
                      <p>{video.channel}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;
