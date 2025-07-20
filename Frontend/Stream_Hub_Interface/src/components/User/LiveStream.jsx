import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { liveStreamAPI } from "../../utils/api";
import LiveStreamPlayer from "./LiveStreamPlayer";
import "./LiveStream.css";

export default function LiveStream() {
  const { user } = useAuth();
  const [isLive, setIsLive] = useState(false);
  const [streamKey, setStreamKey] = useState("");
  const [streamUrl, setStreamUrl] = useState("");
  const [hlsUrl, setHlsUrl] = useState("");
  const [viewerCount, setViewerCount] = useState(0);
  const [streamTitle, setStreamTitle] = useState("");
  const [streamDescription, setStreamDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPlayer, setShowPlayer] = useState(false);
  const videoRef = useRef(null);

  const startStream = async () => {
    if (!streamTitle.trim()) {
      setError("Please enter a stream title");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Create live stream using backend API
      const response = await liveStreamAPI.create({
        title: streamTitle,
        description: streamDescription,
      });

      if (response.success) {
        setStreamKey(response.data.streamKey);
        setStreamUrl(response.data.streamUrl);
        setHlsUrl(response.data.hlsUrl);
        setIsLive(true);
        console.log("Stream created:", response.data);
      } else {
        throw new Error(response.message || "Failed to create stream");
      }
    } catch (err) {
      console.error("Stream creation error:", err);
      setError("Failed to start stream: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const stopStream = async () => {
    setIsLoading(true);

    try {
      // Stop the live stream
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/live/stop`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${btoa(`${CLOUDINARY_API_KEY}:`)}`,
          },
          body: JSON.stringify({
            stream_key: streamKey,
          }),
        }
      );

      if (response.ok) {
        setIsLive(false);
        setStreamKey("");
        setStreamUrl("");
        setViewerCount(0);
      }
    } catch (err) {
      console.error("Stop stream error:", err);
      setError("Failed to stop stream: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const copyStreamKey = () => {
    navigator.clipboard.writeText(streamKey);
    alert("Stream key copied to clipboard!");
  };

  const copyStreamUrl = () => {
    navigator.clipboard.writeText(streamUrl);
    alert("Stream URL copied to clipboard!");
  };

  return (
    <div className="live-stream-container">
      <div className="stream-header">
        <h2>Live Streaming</h2>
        <p>Start broadcasting live to your audience</p>
      </div>

      {!isLive ? (
        <div className="stream-setup">
          <div className="form-group">
            <label htmlFor="streamTitle">Stream Title *</label>
            <input
              type="text"
              id="streamTitle"
              value={streamTitle}
              onChange={(e) => setStreamTitle(e.target.value)}
              placeholder="Enter your stream title"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="streamDescription">Description</label>
            <textarea
              id="streamDescription"
              value={streamDescription}
              onChange={(e) => setStreamDescription(e.target.value)}
              placeholder="Describe your stream"
              rows="3"
              disabled={isLoading}
            />
          </div>

          <div className="stream-info">
            <h3>How to Stream:</h3>
            <ol>
              <li>Click "Start Stream" to create your broadcast</li>
              <li>Copy the Stream Key and URL provided</li>
              <li>
                Use streaming software like OBS Studio, Streamlabs, or XSplit
              </li>
              <li>
                Configure your streaming software with the provided credentials
              </li>
              <li>Start broadcasting from your streaming software</li>
            </ol>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            className="start-stream-btn"
            onClick={startStream}
            disabled={isLoading || !streamTitle.trim()}
          >
            {isLoading ? "Creating Stream..." : "Start Stream"}
          </button>
        </div>
      ) : (
        <div className="stream-active">
          <div className="stream-status">
            <div className="status-indicator live">
              <span className="pulse"></span>
              LIVE
            </div>
            <span className="viewer-count">{viewerCount} viewers</span>
          </div>

          <div className="stream-details">
            <h3>{streamTitle}</h3>
            {streamDescription && <p>{streamDescription}</p>}
          </div>

          <div className="stream-credentials">
            <div className="credential-group">
              <label>Stream Key:</label>
              <div className="credential-display">
                <input
                  type="text"
                  value={streamKey}
                  readOnly
                  className="credential-input"
                />
                <button onClick={copyStreamKey} className="copy-btn">
                  Copy
                </button>
              </div>
            </div>

            <div className="credential-group">
              <label>Stream URL:</label>
              <div className="credential-display">
                <input
                  type="text"
                  value={streamUrl}
                  readOnly
                  className="credential-input"
                />
                <button onClick={copyStreamUrl} className="copy-btn">
                  Copy
                </button>
              </div>
            </div>
          </div>

          <div className="stream-software">
            <h4>Recommended Streaming Software:</h4>
            <div className="software-list">
              <a
                href="https://obsproject.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                OBS Studio (Free)
              </a>
              <a
                href="https://streamlabs.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Streamlabs OBS (Free)
              </a>
              <a
                href="https://www.xsplit.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                XSplit Broadcaster
              </a>
            </div>
          </div>

          <div className="stream-actions">
            <button
              className="watch-stream-btn"
              onClick={() => setShowPlayer(true)}
            >
              📺 Watch Stream
            </button>
            <button
              className="stop-stream-btn"
              onClick={stopStream}
              disabled={isLoading}
            >
              {isLoading ? "Stopping..." : "Stop Stream"}
            </button>
          </div>
        </div>
      )}

      {/* Live Stream Player Modal */}
      {showPlayer && hlsUrl && (
        <div className="player-modal-overlay" onClick={() => setShowPlayer(false)}>
          <div className="player-modal" onClick={(e) => e.stopPropagation()}>
            <div className="player-modal-header">
              <h2>Live Stream Player</h2>
              <button
                className="close-btn"
                onClick={() => setShowPlayer(false)}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18 6L6 18M6 6L18 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
            <LiveStreamPlayer
              streamUrl={hlsUrl}
              title={streamTitle}
              description={streamDescription}
            />
          </div>
        </div>
      )}
    </div>
  );
}
