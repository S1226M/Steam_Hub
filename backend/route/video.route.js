import express from "express";
import multer from "multer";
import {
  uploadVideo,
  getAllVideos,
  deleteVideo,
} from "../controller/video.controller.js";

const router = express.Router();
const upload = multer({ dest: "temp/" });

router.post("/upload", upload.single("video"), uploadVideo);
router.get("/", getAllVideos);
router.delete("/delete/:public_id", deleteVideo);

export default router;
