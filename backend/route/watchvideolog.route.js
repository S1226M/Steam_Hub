import express from "express";
import { 
  logVideoView, 
  getUserWatchHistory, 
  getVideoViewStats, 
  markVideoCompleted 
} from "../controller/watchvideolog.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Log a video view (one per user per video per day)
router.post("/log/:videoId", logVideoView);

// Get user's watch history
router.get("/history", getUserWatchHistory);

// Get video view statistics (for video owners)
router.get("/stats/:videoId", getVideoViewStats);

// Mark video as completed
router.put("/complete/:videoId", markVideoCompleted);

export default router; 