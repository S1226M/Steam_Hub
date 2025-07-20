import express from "express";
import {
  getUserHistory,
  getLikedVideos,
  getUserPlaylists,
  getUserDownloads,
  addToHistory,
  removeFromHistory,
  clearHistory,
  addToDownloads,
  removeFromDownloads,
  getLibrarySummary
} from "../controller/library.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// History routes
router.get("/history/:userId", getUserHistory);
router.post("/history/add", addToHistory);
router.delete("/history/:userId/:videoId", removeFromHistory);
router.delete("/history/:userId", clearHistory);

// Liked videos routes
router.get("/liked/:userId", getLikedVideos);

// Playlists routes
router.get("/playlists/:userId", getUserPlaylists);

// Downloads routes
router.get("/downloads/:userId", getUserDownloads);
router.post("/downloads/add", addToDownloads);
router.delete("/downloads/:userId/:videoId", removeFromDownloads);

// Library summary
router.get("/summary/:userId", getLibrarySummary);

export default router; 