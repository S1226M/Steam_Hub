import express from "express";
import { toggleVideoLike, getLikedVideos } from "../controller/like.controller.js";
// import { isAuthenticated } from "../middlewares/authMiddleware.js"; // <-- Uncomment this line

const router = express.Router();

// POST or DELETE toggle like/unlike
router.post("/toggle/:videoId",  toggleVideoLike);

// GET all liked videos by current user
router.get("/",  getLikedVideos);

export default router;
