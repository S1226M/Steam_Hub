import express from "express";
import upload from "../middleware/multer.middleware.js";
import { uploadVideo, deleteVideo } from "../controller/video.controller.js";

const router = express.Router();

router.post("/upload", upload.single("video"), uploadVideo);
router.delete("/delete/:public_id", deleteVideo);

export default router;
