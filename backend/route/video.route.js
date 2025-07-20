import express from "express";
import multer from "multer";
import {
  uploadVideo,
  getAllVideos,
  getVideoById,
  deleteVideo,
} from "../controller/video.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = express.Router();
const upload = multer({ dest: "temp/" });

router.post("/upload", authenticateToken, upload.single("video"), uploadVideo);
router.get("/", getAllVideos);
router.get("/:id", getVideoById);
router.delete("/delete/:public_id", deleteVideo);

export default router;
