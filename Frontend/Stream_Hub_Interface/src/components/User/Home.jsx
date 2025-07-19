import React, { useState, useEffect } from "react";
import "./Home.css";
import axios from "axios";

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

export default function Home() {
  const [selected, setSelected] = useState("All");
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/videos")
      .then((res) => console.log(res))
      //   setVideos(res.data)
      .catch((err) => console.error("Video fetch failed:", err));
  }, []);

  const filteredVideos =
    selected === "All"
      ? videos
      : videos.filter((vid) => vid.category === selected);

  return (
    <div className="home-container">
      <div className="categories">
        {categories.map((cat) => (
          <button
            key={cat}
            className={cat === selected ? "active" : ""}
            onClick={() => setSelected(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="videos-grid">
        {filteredVideos.map((vid, idx) => (
          <div className="video-card" key={idx}>
            <div className="thumb-wrap">
              <img src={vid.thumbnail} alt={vid.title} />
              {vid.premium && <span className="premium">Premium</span>}
              <span className="length">{vid.length}</span>
            </div>
            <div className="info">
              <div className="title">{vid.title}</div>
              <div className="channel">{vid.channel}</div>
              <div className="meta">
                <span>{vid.views} views</span>
                <span>&bull;</span>
                <span>{vid.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
