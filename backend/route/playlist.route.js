import express from "express";
import {
  createPlaylist,
  getUserPlaylists,
  getPlaylist,
  updatePlaylist,
  deletePlaylist,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  reorderPlaylistVideos,
  getPublicPlaylists,
  searchPlaylists,
  duplicatePlaylist,
  getPlaylistStats,
  checkVideoInPlaylist
} from "../controller/playlist.controller.js";

const router = express.Router();

// ✅ CREATE PLAYLIST
// POST /api/playlists
router.post("/", createPlaylist);

// ✅ GET ALL PLAYLISTS FOR A USER
// GET /api/playlists/user/:userId?page=1&limit=10&includePrivate=false
router.get("/user/:userId", getUserPlaylists);

// ✅ GET PUBLIC PLAYLISTS
// GET /api/playlists/public?page=1&limit=10&sort=recent
router.get("/public", getPublicPlaylists);

// ✅ SEARCH PLAYLISTS
// GET /api/playlists/search?q=search_term&userId=user_id&isPublic=true&page=1&limit=10
router.get("/search", searchPlaylists);

// ✅ GET SINGLE PLAYLIST
// GET /api/playlists/:playlistId?userId=user_id
router.get("/:playlistId", getPlaylist);

// ✅ UPDATE PLAYLIST
// PUT /api/playlists/:playlistId
router.put("/:playlistId", updatePlaylist);

// ✅ DELETE PLAYLIST
// DELETE /api/playlists/:playlistId
router.delete("/:playlistId", deletePlaylist);

// ✅ DUPLICATE PLAYLIST
// POST /api/playlists/:playlistId/duplicate
router.post("/:playlistId/duplicate", duplicatePlaylist);

// ✅ GET PLAYLIST STATISTICS
// GET /api/playlists/:playlistId/stats
router.get("/:playlistId/stats", getPlaylistStats);

// ✅ ADD VIDEO TO PLAYLIST
// POST /api/playlists/:playlistId/videos
router.post("/:playlistId/videos", addVideoToPlaylist);

// ✅ REMOVE VIDEO FROM PLAYLIST
// DELETE /api/playlists/:playlistId/videos/:videoId
router.delete("/:playlistId/videos/:videoId", removeVideoFromPlaylist);

// ✅ CHECK IF VIDEO IS IN PLAYLIST
// GET /api/playlists/:playlistId/videos/:videoId/check
router.get("/:playlistId/videos/:videoId/check", checkVideoInPlaylist);

// ✅ REORDER VIDEOS IN PLAYLIST
// PUT /api/playlists/:playlistId/reorder
router.put("/:playlistId/reorder", reorderPlaylistVideos);

export default router;
