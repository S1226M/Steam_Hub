import express from "express";
import userController from "../controller/user.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
import multer from "multer";

const router = express.Router();

// Configure multer for profile image uploads
const profileImageUpload = multer({
  dest: 'temp/',
  fileFilter: (req, file, cb) => {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

router.get("/all", userController.getAllUsers);
router.get("/:id", userController.getUserById);

// Profile update route (requires authentication)
router.put("/:userId/profile", authenticateToken, profileImageUpload.single('profileimage'), userController.updateProfile);

export default router;