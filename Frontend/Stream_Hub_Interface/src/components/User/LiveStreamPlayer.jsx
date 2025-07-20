import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import "./LiveStreamPlayer.css";

export default function LiveStreamPlayer({
  streamUrl,
  title,
  description,
  onError,
}) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!streamUrl) return;

    const video = videoRef.current;
    if (!video) return;

    // Check if HLS is supported
    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });

      hlsRef.current = hls;

      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log("HLS manifest loaded");
        setIsLoading(false);
        video
          .play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch((err) => {
            console.error("Auto-play failed:", err);
            setError("Auto-play failed. Click play to start.");
          });
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error("HLS error:", data);
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setError("Network error. Stream may be offline.");
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              setError("Media error. Trying to recover...");
              hls.recoverMediaError();
              break;
            default:
              setError("Stream error occurred.");
              break;
          }
        }
      });

      return () => {
        if (hls) {
          hls.destroy();
        }
      };
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Native HLS support (Safari)
      video.src = streamUrl;
      video.addEventListener("loadedmetadata", () => {
        setIsLoading(false);
        video
          .play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch((err) => {
            console.error("Auto-play failed:", err);
            setError("Auto-play failed. Click play to start.");
          });
      });
    } else {
      setError("HLS is not supported in this browser.");
    }
  }, [streamUrl]);

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setError(null);
        })
        .catch((err) => {
          console.error("Play failed:", err);
          setError("Failed to play stream.");
        });
    }
  };

  const handlePause = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleReload = () => {
    setError(null);
    setIsLoading(true);
    if (hlsRef.current) {
      hlsRef.current.destroy();
    }
    // Re-trigger useEffect
    const currentUrl = streamUrl;
    if (currentUrl) {
      setTimeout(() => {
        // Force re-render
        window.location.reload();
      }, 100);
    }
  };

  return (
    <div className="live-stream-player">
      <div className="player-header">
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>

      <div className="video-container">
        <video
          ref={videoRef}
          controls
          autoPlay
          muted
          playsInline
          className="video-player"
        >
          Your browser does not support the video tag.
        </video>

        {isLoading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <p>Loading stream...</p>
          </div>
        )}

        {error && (
          <div className="error-overlay">
            <div className="error-content">
              <p>{error}</p>
              <button onClick={handleReload} className="reload-btn">
                Reload Stream
              </button>
            </div>
          </div>
        )}

        <div className="player-controls">
          {!isPlaying && !error && (
            <button onClick={handlePlay} className="play-btn">
              ▶️ Play Stream
            </button>
          )}
          {isPlaying && (
            <button onClick={handlePause} className="pause-btn">
              ⏸️ Pause
            </button>
          )}
        </div>
      </div>

      <div className="stream-info">
        <h3>Stream Information</h3>
        <div className="info-grid">
          <div className="info-item">
            <label>Stream URL:</label>
            <span>{streamUrl}</span>
          </div>
          <div className="info-item">
            <label>Status:</label>
            <span className={isPlaying ? "status-live" : "status-offline"}>
              {isPlaying ? "🔴 LIVE" : "⚫ OFFLINE"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
