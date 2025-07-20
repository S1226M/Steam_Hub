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

// Configure multer with file size limits and file filtering
const upload = multer({
  dest: "temp/",
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check if it's a video file
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed!'), false);
    }
  }
});

// Configure multer for thumbnail uploads
const thumbnailUpload = multer({
  dest: "temp/",
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for thumbnails
  },
  fileFilter: (req, file, cb) => {
    // Check if it's an image file
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for thumbnails!'), false);
    }
  }
});

// Error handling middleware for multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ 
        error: 'File too large. Video files must be under 100MB and thumbnails under 5MB.' 
      });
    }
    return res.status(400).json({ error: error.message });
  } else if (error) {
    return res.status(400).json({ error: error.message });
  }
  next();
};

router.post("/upload", authenticateToken, upload.single("video"), handleMulterError, uploadVideo);
router.post("/upload-with-thumbnail", authenticateToken, upload.fields([
  { name: 'video', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), handleMulterError, uploadVideo);
router.get("/", getAllVideos);
router.get("/:id", getVideoById);
router.delete("/delete/:public_id", deleteVideo);

export default router;
