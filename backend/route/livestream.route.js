import express from "express";
import {
  createLiveStream,
  getUserLiveStreams,
  getLiveStream,
  stopLiveStream,
  deleteLiveStream,
  streamWebhook,
  recordingWebhook,
  getActiveLiveStreams,
} from "../controller/livestream.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = express.Router();

// Create a new live stream (requires authentication)
router.post("/create", authenticateToken, createLiveStream);

// Get all live streams for a specific user
router.get("/user/:userId", authenticateToken, getUserLiveStreams);

// Get current user's live streams
router.get("/user/me", authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const liveStreams = await LiveStream.find({ userId: userId })
      .sort({ createdAt: -1 })
      .populate("userId", "username email");

    res.status(200).json({
      success: true,
      data: liveStreams,
    });
  } catch (error) {
    console.error("Get user live streams error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get live streams",
      error: error.message,
    });
  }
});

// Get a specific live stream
router.get("/:streamId", getLiveStream);

// Stop a live stream (requires authentication)
router.post("/:streamId/stop", authenticateToken, stopLiveStream);

// Delete a live stream (requires authentication)
router.delete("/:streamId", authenticateToken, deleteLiveStream);

// Get all active live streams
router.get("/active/all", getActiveLiveStreams);

// Webhook endpoints (no authentication required)
router.post("/webhook/stream", streamWebhook);
router.post("/webhook/recording", recordingWebhook);

export default router; 