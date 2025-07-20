import express from "express";
import userController from "../controller/user.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = express.Router();

// Admin routes
router.get("/all", authenticateToken, userController.getAllUsers);

// Public routes
router.get("/:id", userController.getUserById);

// Protected routes
router.get("/stats", authenticateToken, userController.getUserStats);

export default router;