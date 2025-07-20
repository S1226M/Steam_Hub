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

const imageFilter = (req, file, cb) => {
  const allowed = /jpg|jpeg|png|gif|webp/;
  const extname = allowed.test(path.extname(file.originalname).toLowerCase());
  if (extname) return cb(null, true);
  cb("❌ Only image files are allowed!");
};

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'video') {
    return videoFilter(req, file, cb);
  } else if (file.fieldname === 'thumbnail') {
    return imageFilter(req, file, cb);
  }
  cb("❌ Invalid file type!");
};

const upload = multer({ storage, fileFilter });

// Single video upload (for backward compatibility)
const uploadVideo = multer({ storage, fileFilter: videoFilter });

// Multiple files upload (video + thumbnail)
const uploadVideoWithThumbnail = multer({ storage, fileFilter });

export { uploadVideo, uploadVideoWithThumbnail };
export default upload;
