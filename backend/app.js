import express from "express";
import cors from "cors"; // ✅ Import cors first
import dotenv from "dotenv";
import { connectDB } from "./db/connection.js";

// ✅ Import routes
import authRoutes from "./route/auth.route.js";
import videoRoutes from "./route/video.route.js";
import userRoutes from "./route/user.route.js";
import likeRoutes from "./route/like.route.js";
import playlistRoutes from "./route/playlist.route.js";
import commentRoutes from "./route/comment.route.js";
import subscriptionRoutes from "./route/subscription.route.js";
import adminRoutes from "./route/admin.route.js";

// ✅ Initialize dotenv
dotenv.config();

// ✅ Initialize app BEFORE using it
const app = express();

// ✅ Use middlewares
app.use(cors());              // Must come after app is defined
app.use(express.json());     // Body parser

// ✅ Connect DB
connectDB();

// ✅ API routes
app.use("/api/auth", authRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/users", userRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/playlists", playlistRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/admins", adminRoutes);

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
