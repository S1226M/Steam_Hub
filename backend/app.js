import express from "express";
import cors from "cors"; // ✅ Import cors first
import dotenv from "dotenv";
import { createServer } from "http";
import { connectDB } from "./db/connection.js";
import nms from "./media-server.js";
import WebRTCServer from "./webrtc-server.js";

// ✅ Import routes
import authRoutes from "./route/auth.route.js";
import videoRoutes from "./route/video.route.js";
import userRoutes from "./route/user.route.js";
import likeRoutes from "./route/like.route.js";
import playlistRoutes from "./route/playlist.route.js";
import commentRoutes from "./route/comment.route.js";
import subscriptionRoutes from "./route/subscription.route.js";
import adminRoutes from "./route/admin.route.js";
import liveStreamRoutes from "./route/livestream.route.js";
import webrtcRoutes from "./route/webrtc.route.js";
import libraryRoutes from "./route/library.route.js";

// ✅ Initialize dotenv
dotenv.config();

// ✅ Initialize app BEFORE using it
const app = express();

// ✅ Create HTTP server for WebRTC
const server = createServer(app);

// ✅ Use middlewares
app.use(cors());              // Must come after app is defined
app.use(express.json({ limit: '10mb' }));     // Body parser with increased limit
app.use(express.urlencoded({ limit: '10mb', extended: true })); // URL-encoded parser

// ✅ Connect DB
connectDB();

// ✅ Test endpoint
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend server is running! 🚀" });
});

// ✅ API routes
app.use("/api/auth", authRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/users", userRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/playlists", playlistRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/livestream", liveStreamRoutes);
app.use("/api/webrtc", webrtcRoutes);
app.use("/api/library", libraryRoutes);

// ✅ Initialize WebRTC server
const webrtcServer = new WebRTCServer(server);

// ✅ Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📺 Media server running on RTMP port 1935 and HTTP port 8000`);
  console.log(`🔌 WebRTC server running on port ${PORT}`);
});

// Start NodeMediaServer
nms.run();
