import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./db/connection.js";

// ✅ Import only video route
import videoRoutes from "./route/video.route.js";

// ❌ Commented out other unused routes for now
// import userRoutes from "./route/user.route.js";
// import likeRoutes from "./route/like.route.js";
// import playlistRoutes from "./route/playlist.route.js";
// import commentRoutes from "./route/comment.route.js";

dotenv.config();

const app = express();
app.use(express.json());

// ✅ Connect MongoDB
connectDB();

// ✅ Video Routes Only
app.use("/api/videos", videoRoutes);

// ❌ Commented: User, Like, Playlist, Comment APIs
// app.use("/api/users", userRoutes);
// app.use("/api/likes", likeRoutes);
// app.use("/api/playlists", playlistRoutes);
// app.use("/api/comments", commentRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('🚀 Server running on port ${PORT}'));