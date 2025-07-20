import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { webrtcAPI } from "../../utils/api";
import { io } from "socket.io-client";
import "./WebRTCLiveStream.css";

const WebRTCLiveStream = () => {
  const { user } = useAuth();
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [streamTitle, setStreamTitle] = useState("");
  const [streamDescription, setStreamDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [activeStreams, setActiveStreams] = useState([]);
  const [selectedStream, setSelectedStream] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Refs for video elements and WebRTC
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const socketRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);

  useEffect(() => {
    // Load active streams on component mount
    loadActiveStreams();

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const loadActiveStreams = async () => {
    try {
      setError("");
      const response = await webrtcAPI.getActive();
      setActiveStreams(response.data || []);
    } catch (error) {
      console.error("Error loading active streams:", error);
      // Don't show error if it's just that no streams exist
      if (error.response && error.response.status === 404) {
        setActiveStreams([]);
      } else {
        setError("Failed to load active streams. Please try again.");
      }
    }
  };

  const connectToWebRTCServer = () => {
    const socket = io("http://localhost:5000");
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to WebRTC server");
    });

    socket.on("room-joined", (data) => {
      console.log("Joined room:", data);
      if (data.role === "broadcaster") {
        startBroadcasting();
      }
    });

    socket.on("viewer-joined", (data) => {
      console.log("Viewer joined:", data.viewerId);
      setViewerCount((prev) => prev + 1);
    });

    socket.on("viewer-left", (data) => {
      console.log("Viewer left:", data.viewerId);
      setViewerCount((prev) => Math.max(0, prev - 1));
    });

    socket.on("viewer-request-stream", (data) => {
      console.log("Viewer requesting stream:", data.viewerId);
      if (isBroadcasting && localStreamRef.current) {
        sendStreamToViewer(data.viewerId);
      }
    });

    socket.on("offer", async (data) => {
      console.log("Received offer from broadcaster");
      await handleOffer(data);
    });

    socket.on("answer", async (data) => {
      console.log("Received answer from viewer");
      await handleAnswer(data);
    });

    socket.on("ice-candidate", async (data) => {
      console.log("Received ICE candidate");
      await handleIceCandidate(data);
    });

    socket.on("stream", (data) => {
      console.log("Received stream from broadcaster");
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = data.stream;
      }
    });

    socket.on("broadcaster-started-stream", () => {
      console.log("Broadcaster started streaming");
    });

    socket.on("broadcaster-stopped-stream", () => {
      console.log("Broadcaster stopped streaming");
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
    });

    socket.on("broadcaster-left", () => {
      console.log("Broadcaster left the room");
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
      setIsViewing(false);
    });

    socket.on("chat-message", (data) => {
      setChatMessages((prev) => [...prev, data]);
    });

    socket.on("error", (data) => {
      setError(data.message);
    });

    return socket;
  };

  const createStream = async () => {
    try {
      setError("");
      setSuccess("");

      if (!streamTitle.trim()) {
        setError("Please enter a stream title");
        return;
      }

      const response = await webrtcAPI.create({
        title: streamTitle,
        description: streamDescription,
        isPrivate: isPrivate,
      });

      const { roomId: newRoomId } = response.data;
      setRoomId(newRoomId);
      setSuccess("Stream room created successfully!");

      // Connect to WebRTC server
      const socket = connectToWebRTCServer();
      socket.emit("join-room", newRoomId, user._id, true);
    } catch (error) {
      console.error("Error creating stream:", error);
      setError("Failed to create stream room");
    }
  };

  const startBroadcasting = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      localStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      setIsBroadcasting(true);
      setSuccess("Broadcasting started!");

      // Notify server that stream has started
      if (socketRef.current) {
        socketRef.current.emit("stream-started", { roomId });
      }
    } catch (error) {
      console.error("Error starting broadcast:", error);
      setError(
        "Failed to start broadcasting. Please check camera permissions."
      );
    }
  };

  const stopBroadcasting = async () => {
    try {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
      }

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }

      setIsBroadcasting(false);
      setViewerCount(0);
      setSuccess("Broadcasting stopped");

      // Notify server that stream has stopped
      if (socketRef.current) {
        socketRef.current.emit("stream-stopped", { roomId });
      }
    } catch (error) {
      console.error("Error stopping broadcast:", error);
    }
  };

  const joinStream = async (stream) => {
    try {
      setError("");
      setSelectedStream(stream);
      setRoomId(stream.roomId);
      setIsViewing(true);

      // Connect to WebRTC server
      const socket = connectToWebRTCServer();
      socket.emit("join-room", stream.roomId, user._id, false);

      // Request stream from broadcaster
      socket.emit("request-stream", { roomId: stream.roomId });
    } catch (error) {
      console.error("Error joining stream:", error);
      setError("Failed to join stream");
    }
  };

  const leaveStream = () => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    setIsViewing(false);
    setSelectedStream(null);
    setRoomId("");
    setChatMessages([]);

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  };

  const sendStreamToViewer = async (viewerId) => {
    try {
      if (!localStreamRef.current) return;

      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      });

      peerConnectionRef.current = peerConnection;

      // Add local stream tracks to peer connection
      localStreamRef.current.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStreamRef.current);
      });

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socketRef.current.emit("ice-candidate", {
            candidate: event.candidate,
            targetId: viewerId,
          });
        }
      };

      // Create and send offer
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      socketRef.current.emit("offer", {
        roomId,
        offer: offer,
        targetId: viewerId,
      });
    } catch (error) {
      console.error("Error sending stream to viewer:", error);
    }
  };

  const handleOffer = async (data) => {
    try {
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      });

      peerConnectionRef.current = peerConnection;

      // Handle incoming tracks
      peerConnection.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socketRef.current.emit("ice-candidate", {
            candidate: event.candidate,
            targetId: data.from,
          });
        }
      };

      // Set remote description and create answer
      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(data.offer)
      );
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      socketRef.current.emit("answer", {
        answer: answer,
        from: data.from,
      });
    } catch (error) {
      console.error("Error handling offer:", error);
    }
  };

  const handleAnswer = async (data) => {
    try {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(
          new RTCSessionDescription(data.answer)
        );
      }
    } catch (error) {
      console.error("Error handling answer:", error);
    }
  };

  const handleIceCandidate = async (data) => {
    try {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.addIceCandidate(data.candidate);
      }
    } catch (error) {
      console.error("Error adding ICE candidate:", error);
    }
  };

  const sendChatMessage = () => {
    if (!newMessage.trim() || !socketRef.current) return;

    const messageData = {
      roomId,
      message: newMessage,
      userId: user._id,
      username: user.username,
    };

    socketRef.current.emit("chat-message", messageData);
    setNewMessage("");
  };

  return (
    <div className="webrtc-live-stream">
      <div className="stream-container">
        <div className="stream-header">
          <h2>WebRTC Live Streaming</h2>
          <p>Real-time, low-latency streaming directly in your browser</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {/* Create Stream Section */}
        {!isBroadcasting && !isViewing && (
          <div className="create-stream-section">
            <h3>Create New Stream</h3>
            <div className="form-group">
              <input
                type="text"
                placeholder="Stream Title"
                value={streamTitle}
                onChange={(e) => setStreamTitle(e.target.value)}
              />
            </div>
            <div className="form-group">
              <textarea
                placeholder="Stream Description (optional)"
                value={streamDescription}
                onChange={(e) => setStreamDescription(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                />
                Private Stream
              </label>
            </div>
            <button onClick={createStream} className="btn-primary">
              Create Stream Room
            </button>
          </div>
        )}

        {/* Broadcasting Section */}
        {isBroadcasting && (
          <div className="broadcasting-section">
            <div className="video-container">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="local-video"
              />
              <div className="stream-info">
                <h3>{streamTitle}</h3>
                <p>Viewers: {viewerCount}</p>
                <button onClick={stopBroadcasting} className="btn-danger">
                  Stop Broadcasting
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Viewing Section */}
        {isViewing && (
          <div className="viewing-section">
            <div className="video-container">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="remote-video"
              />
              <div className="stream-info">
                <h3>{selectedStream?.title}</h3>
                <p>Broadcaster: {selectedStream?.userId?.username}</p>
                <button onClick={leaveStream} className="btn-secondary">
                  Leave Stream
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Chat Section */}
        {(isBroadcasting || isViewing) && (
          <div className="chat-section">
            <div className="chat-messages">
              {chatMessages.map((msg, index) => (
                <div key={index} className="chat-message">
                  <span className="username">{msg.username}:</span>
                  <span className="message">{msg.message}</span>
                </div>
              ))}
            </div>
            <div className="chat-input">
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendChatMessage()}
              />
              <button onClick={sendChatMessage}>Send</button>
            </div>
          </div>
        )}

        {/* Active Streams Section */}
        {!isBroadcasting && !isViewing && (
          <div className="active-streams-section">
            <h3>Active Streams</h3>
            <button onClick={loadActiveStreams} className="btn-secondary">
              Refresh
            </button>
            <div className="streams-grid">
              {activeStreams.length > 0 ? (
                activeStreams.map((stream) => (
                  <div key={stream._id} className="stream-card">
                    <h4>{stream.title}</h4>
                    <p>{stream.description}</p>
                    <p>Broadcaster: {stream.userId?.username}</p>
                    <p>Viewers: {stream.viewerCount}</p>
                    <button
                      onClick={() => joinStream(stream)}
                      className="btn-primary"
                    >
                      Join Stream
                    </button>
                  </div>
                ))
              ) : (
                <div className="no-streams-message">
                  <p>No active streams available.</p>
                  <p>Be the first to start streaming!</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebRTCLiveStream;
