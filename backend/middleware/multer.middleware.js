// backend/middleware/multer.js
import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure temp folder exists
const tempPath = "temp/";
if (!fs.existsSync(tempPath)) {
  fs.mkdirSync(tempPath);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, tempPath),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});

const videoFilter = (req, file, cb) => {
  const allowed = /mp4|mov|avi|mkv/;
  const extname = allowed.test(path.extname(file.originalname).toLowerCase());
  if (extname) return cb(null, true);
  cb("❌ Only video files are allowed!");
};

const upload = multer({ storage, fileFilter: videoFilter });

export default upload;
