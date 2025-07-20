import fs from "fs";
import cloudinary from "../config/cloudnary.js";
import Video from "../model/video.model.js";
import Like from "../model/like.model.js";
import WatchVideoLog from "../model/watchvideolog.model.js";
import Download from "../model/download.model.js";
import mongoose from "mongoose";

// Upload Video (requires authenticated user in req.user)
export const uploadVideo = async (req, res) => {
  try {
    console.log("📤 Upload request received:", {
      hasFile: !!req.file,
      hasFiles: !!req.files,
      hasUser: !!req.user,
      body: req.body
    });

    // Handle both single file and multiple files upload
    const videoFile = req.file || (req.files && req.files.video ? req.files.video[0] : null);
    const thumbnailFile = req.files && req.files.thumbnail ? req.files.thumbnail[0] : null;

    if (!videoFile) {
      console.log("❌ No video file uploaded");
      return res.status(400).json({ error: "No video uploaded" });
    }
    
    if (!req.user || !req.user._id) {
      console.log("❌ No authenticated user");
      return res.status(401).json({ error: "Unauthorized. No user found." });
    }

    const videoFilePath = videoFile.path;
    console.log("📁 Video file path:", videoFilePath);

    console.log("☁️ Uploading to Cloudinary...");
    
    // Check if Cloudinary is properly configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.log("⚠️ Cloudinary not configured, creating mock video entry");
      
      // Create a mock video entry for testing
      const video = await Video.create({
        title: req.body.title || videoFile.originalname,
        description: req.body.description || "",
        videoUrl: `file://${videoFilePath}`, // Local file path for testing
        thumbnail: thumbnailFile ? `file://${thumbnailFile.path}` : `file://${videoFilePath}.jpg`,
        duration: 0,
        public_id: `mock_${Date.now()}`,
        category: req.body.category || "General",
        owner: req.user._id,
        isPublic: req.body.isPrivate !== "true", // Convert isPrivate to isPublic
        isPremium: req.body.isPremium === "true",
      });

      console.log("✅ Mock video saved to database:", video._id);
      res.status(201).json({ 
        success: true,
        message: "🎥 Video uploaded successfully (mock mode)", 
        video 
      });
      return;
    }

    // Upload video to Cloudinary
    const videoResult = await cloudinary.uploader.upload(videoFilePath, {
      resource_type: "video",
      folder: "videos",
    });
    console.log("✅ Video upload to Cloudinary successful:", videoResult.public_id);

    // Handle thumbnail upload (static images only)
    let thumbnailUrl = videoResult.secure_url + ".jpg"; // Default thumbnail
    if (thumbnailFile) {
      try {
        const thumbnailResult = await cloudinary.uploader.upload(thumbnailFile.path, {
          folder: "thumbnails",
          transformation: [
            { width: 320, height: 180, crop: "fill", quality: "auto" }
          ]
        });
        thumbnailUrl = thumbnailResult.secure_url;
        console.log("✅ Custom thumbnail upload successful:", thumbnailResult.public_id);
        
        // Cleanup thumbnail temp file
        try {
          fs.unlinkSync(thumbnailFile.path);
          console.log("🗑️ Thumbnail temp file cleaned up");
        } catch (cleanupError) {
          console.log("⚠️ Failed to cleanup thumbnail temp file:", cleanupError.message);
        }
      } catch (thumbnailError) {
        console.log("⚠️ Custom thumbnail upload failed:", thumbnailError.message);
        // Use default thumbnail URL
        thumbnailUrl = videoResult.secure_url + ".jpg";
      }
    }

    // Cleanup video temp file
    try {
      fs.unlinkSync(videoFilePath);
      console.log("🗑️ Video temp file cleaned up");
    } catch (cleanupError) {
      console.log("⚠️ Failed to cleanup video temp file:", cleanupError.message);
    }

    console.log("💾 Saving video to database...");
    const video = await Video.create({
      title: req.body.title || videoResult.original_filename,
      description: req.body.description || "",
      videoUrl: videoResult.secure_url,
      thumbnail: thumbnailUrl,
      duration: videoResult.duration,
      public_id: videoResult.public_id,
      category: req.body.category || "General",
      owner: req.user._id,
      isPublic: req.body.isPrivate !== "true", // Convert isPrivate to isPublic
      isPremium: req.body.isPremium === "true",
    });

    console.log("✅ Video saved to database:", video._id);
    res.status(201).json({ 
      success: true,
      message: "🎥 Video uploaded successfully", 
      video 
    });
  } catch (err) {
    console.error("❌ Upload error:", err.message);
    console.error("❌ Error stack:", err.stack);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};

// Fetch all
export const getAllVideos = async (req, res) => {
  try {
    const { all } = req.query;
    
    // If 'all' parameter is provided, get all videos (including private)
    const filter = all === 'true' ? {} : { isPublic: true };
    
    const videos = await Video.find(filter)
      .populate('owner', 'fullname username profileimage followers')
      .sort({ createdAt: -1 });
    
    // Add default owner info for videos without owner
    const videosWithDefaultOwner = videos.map(video => {
      if (!video.owner) {
        return {
          ...video.toObject(),
          owner: {
            _id: null,
            fullname: 'Unknown Creator',
            username: 'unknown',
            profileimage: null,
            followers: []
          }
        };
      }
      return video;
    });
    
    console.log(`📊 Found ${videosWithDefaultOwner.length} videos (filter: ${JSON.stringify(filter)})`);
    res.json(videosWithDefaultOwner);
  } catch (err) {
    console.error("❌ Fetch error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// Fetch by ID
export const getVideoById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid video ID" });
    }

    const video = await Video.findById(id)
      .populate('owner', 'fullname username profileimage followers')
      .lean();

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    if (!video.isPublic) {
      return res.status(403).json({ message: "Video is private" });
    }

    // Increment view count
    await Video.findByIdAndUpdate(id, { $inc: { views: 1 } });

    res.json(video);
  } catch (err) {
    console.error("❌ Fetch by ID error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// Decrease view count
export const decreaseViewCount = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid video ID" });
    }

    const video = await Video.findById(id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    // Decrease view count (minimum 0)
    const newViewCount = Math.max(0, (video.views || 0) - 1);
    await Video.findByIdAndUpdate(id, { views: newViewCount });

    console.log(`📉 Decreased view count for video ${id}: ${video.views} → ${newViewCount}`);
    res.json({ 
      success: true, 
      message: "View count decreased",
      newViewCount 
    });
  } catch (err) {
    console.error("❌ Decrease view count error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// Fetch videos by user
export const getVideosByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const videos = await Video.find({ 
      owner: userId,
      isPublic: true 
    })
      .populate('owner', 'fullname username profileimage followers')
      .sort({ createdAt: -1 })
      .lean();

    console.log(`📊 Found ${videos.length} videos for user ${userId}`);
    res.json({ data: videos });
  } catch (err) {
    console.error("❌ Fetch videos by user error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// Delete
export const deleteVideo = async (req, res) => {
  try {
    const { public_id } = req.params;

    await cloudinary.uploader.destroy(public_id, { resource_type: "video" });
    await Video.findOneAndDelete({ public_id });

    res.json({ message: "🗑️ Video deleted" });
  } catch (err) {
    console.error("❌ Delete error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// Get user's liked videos
export const getLikedVideos = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;

    const likes = await Like.find({ likeBy: userId })
      .populate({
        path: 'video',
        populate: {
          path: 'owner',
          select: 'fullname username profileimage'
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Like.countDocuments({ likeBy: userId });

    res.json({
      success: true,
      data: likes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching liked videos:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch liked videos"
    });
  }
};

// Get user's watch history
export const getWatchHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;

    const history = await WatchVideoLog.find({ user: userId })
      .populate({
        path: 'video',
        populate: {
          path: 'owner',
          select: 'fullname username profileimage'
        }
      })
      .sort({ watchedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await WatchVideoLog.countDocuments({ user: userId });

    res.json({
      success: true,
      data: history,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching watch history:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch watch history"
    });
  }
};

// Get user's downloads
export const getDownloads = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;

    const downloads = await Download.find({ user: userId })
      .populate({
        path: 'video',
        populate: {
          path: 'owner',
          select: 'fullname username profileimage'
        }
      })
      .sort({ downloadedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Download.countDocuments({ user: userId });

    res.json({
      success: true,
      data: downloads,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching downloads:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch downloads"
    });
  }
};
