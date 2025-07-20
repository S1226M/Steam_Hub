import mongoose from "mongoose";
import Like from "../model/like.model.js";
import WatchVideoLog from "../model/watchvideolog.model.js";
import Download from "../model/download.model.js";
import Video from "../model/video.model.js";
import User from "../model/user.model.js";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

const seedLibraryData = async () => {
  try {
    console.log("🌱 Seeding library data...");

    // Get a user and some videos
    const user = await User.findOne();
    const videos = await Video.find().limit(10);

    if (!user) {
      console.log("❌ No user found. Please create a user first.");
      return;
    }

    if (videos.length === 0) {
      console.log("❌ No videos found. Please upload some videos first.");
      return;
    }

    console.log(`👤 Using user: ${user.fullname} (${user._id})`);
    console.log(`📹 Found ${videos.length} videos`);

    // Clear existing data
    await Like.deleteMany({ likeBy: user._id });
    await WatchVideoLog.deleteMany({ user: user._id });
    await Download.deleteMany({ user: user._id });

    // Add likes
    const likePromises = videos.slice(0, 5).map((video, index) => {
      return Like.create({
        video: video._id,
        likeBy: user._id,
        createdAt: new Date(Date.now() - index * 24 * 60 * 60 * 1000) // Different dates
      });
    });

    // Add watch history
    const historyPromises = videos.slice(0, 8).map((video, index) => {
      return WatchVideoLog.create({
        user: user._id,
        video: video._id,
        watchedAt: new Date(Date.now() - index * 12 * 60 * 60 * 1000), // Different times
        watchDuration: Math.floor(Math.random() * 300) + 60, // 1-6 minutes
        completed: Math.random() > 0.3, // 70% completion rate
        platform: "web"
      });
    });

    // Add downloads
    const downloadPromises = videos.slice(0, 3).map((video, index) => {
      return Download.create({
        user: user._id,
        video: video._id,
        downloadedAt: new Date(Date.now() - index * 48 * 60 * 60 * 1000), // Different days
        downloadStatus: "completed",
        quality: ["360p", "720p", "1080p"][Math.floor(Math.random() * 3)],
        fileSize: Math.floor(Math.random() * 100000000) + 10000000, // 10-110 MB
        platform: "web"
      });
    });

    // Execute all promises
    await Promise.all([...likePromises, ...historyPromises, ...downloadPromises]);

    // Get counts
    const likeCount = await Like.countDocuments({ likeBy: user._id });
    const historyCount = await WatchVideoLog.countDocuments({ user: user._id });
    const downloadCount = await Download.countDocuments({ user: user._id });

    console.log("✅ Library data seeded successfully!");
    console.log(`❤️  Likes: ${likeCount}`);
    console.log(`📺 History: ${historyCount}`);
    console.log(`⬇️  Downloads: ${downloadCount}`);

  } catch (error) {
    console.error("❌ Error seeding library data:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
};

// Run the seeding
connectDB().then(seedLibraryData); 