import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./db/connection.js";

import userRoutes from "./route/user.route.js";
import likeRoutes from "./route/like.route.js";
// Add additional routes here as you create them
// import videoRoutes from "./route/video.route.js";
// import playlistRoutes from "./route/playlist.route.js";
// import commentRoutes from "./route/comment.route.js";

dotenv.config();

const app = express();
app.use(express.json());

// Connect MongoDB
connectDB();

// Routes
app.use("/api/users", userRoutes);
app.use("/api/likes", likeRoutes);
// app.use("/api/videos", videoRoutes);
// app.use("/api/playlists", playlistRoutes);
// app.use("/api/comments", commentRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
