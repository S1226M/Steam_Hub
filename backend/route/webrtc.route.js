import express from "express";
import {
  createWebRTCLiveStream,
  getWebRTCLiveStreams,
  getUserWebRTCLiveStreams,
  getWebRTCLiveStream,
  startWebRTCLiveStream,
  stopWebRTCLiveStream,
  deleteWebRTCLiveStream,
  getActiveWebRTCLiveStreams,
} from "../controller/webrtc.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = express.Router();

// Create a new WebRTC live stream room (requires authentication)
router.post("/create", authenticateToken, createWebRTCLiveStream);

// Get all WebRTC live streams (public)
router.get("/all", getWebRTCLiveStreams);

// Get all active WebRTC live streams (public)
router.get("/active", getActiveWebRTCLiveStreams);

// Get user's WebRTC live streams (requires authentication)
router.get("/user/:userId", authenticateToken, getUserWebRTCLiveStreams);

// Get current user's WebRTC live streams (requires authentication)
router.get("/user/me", authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const liveStreams = await LiveStream.find({ 
      userId: userId, 
      type: "webrtc" 
    })
      .sort({ createdAt: -1 })
      .populate("userId", "username email avatar");

    res.status(200).json({
      success: true,
      data: liveStreams,
    });
  } catch (error) {
    console.error("Get user WebRTC live streams error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get WebRTC live streams",
      error: error.message,
    });
  }
});

// Get a specific WebRTC live stream (public)
router.get("/:streamId", getWebRTCLiveStream);

// Start a WebRTC live stream (requires authentication)
router.post("/:streamId/start", authenticateToken, startWebRTCLiveStream);

// Stop a WebRTC live stream (requires authentication)
router.post("/:streamId/stop", authenticateToken, stopWebRTCLiveStream);

// Delete a WebRTC live stream (requires authentication)
router.delete("/:streamId", authenticateToken, deleteWebRTCLiveStream);

export default router; 