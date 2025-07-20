import express from "express";
import {
  uploadVideo,
  getAllVideos,
  getVideoById,
  deleteVideo,
} from "../controller/video.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { uploadVideoWithThumbnail } from "../middleware/multer.middleware.js";

const router = express.Router();

router.post("/upload", authenticateToken, uploadVideoWithThumbnail.fields([
  { name: 'video', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), uploadVideo);
router.get("/", getAllVideos);
router.get("/:id", getVideoById);
router.delete("/delete/:public_id", deleteVideo);

export default router;
