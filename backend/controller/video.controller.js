import fs from "fs";
import cloudinary from "../config/cloudnary.js";
import Video from "../model/video.model.js";
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
      .populate('owner', 'fullname username profileimage subscribers')
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
            subscribers: 0
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
      .populate('owner', 'fullname username profileimage subscribers')
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
