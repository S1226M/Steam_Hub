import mongoose from "mongoose";
import Video from "./model/video.model.js";
import User from "./model/user.model.js";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

const testVideos = async () => {
  try {
    console.log("\n🔍 Testing Video Database...\n");
    
    // Get all videos
    const allVideos = await Video.find({});
    console.log(`📊 Total videos in database: ${allVideos.length}`);
    
    if (allVideos.length === 0) {
      console.log("❌ No videos found in database!");
      return;
    }
    
    // Show details of each video
    allVideos.forEach((video, index) => {
      console.log(`\n🎥 Video ${index + 1}:`);
      console.log(`   ID: ${video._id}`);
      console.log(`   Title: ${video.title}`);
      console.log(`   isPublic: ${video.isPublic}`);
      console.log(`   Owner: ${video.owner}`);
      console.log(`   Views: ${video.views}`);
      console.log(`   Created: ${video.createdAt}`);
    });
    
    // Get public videos only
    const publicVideos = await Video.find({ isPublic: true });
    console.log(`\n✅ Public videos: ${publicVideos.length}`);
    
    // Get videos with populated owner
    const videosWithOwner = await Video.find({ isPublic: true })
      .populate('owner', 'fullname username profileimage')
      .sort({ createdAt: -1 });
    
    console.log(`\n📺 Videos that will show in frontend: ${videosWithOwner.length}`);
    videosWithOwner.forEach((video, index) => {
      console.log(`\n   ${index + 1}. ${video.title}`);
      console.log(`      Owner: ${video.owner?.fullname || 'Unknown'}`);
      console.log(`      Views: ${video.views}`);
    });
    
  } catch (error) {
    console.error("❌ Test error:", error);
  }
};

const runTest = async () => {
  await connectDB();
  await testVideos();
  mongoose.connection.close();
  console.log("\n✅ Test completed");
};

runTest(); 