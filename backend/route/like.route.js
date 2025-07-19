import express from "express";
import { toggleVideoLike, getLikedVideos } from "../controller/like.controller.js";
// import { isAuthenticated } from "../middlewares/authMiddleware.js"; // assumed

const router = express.Router();

// POST or DELETE toggle like/unlike
router.post("/toggle/:videoId", isAuthenticated, toggleVideoLike);

// GET all liked videos by current user
router.get("/", isAuthenticated, getLikedVideos);

export default router;
