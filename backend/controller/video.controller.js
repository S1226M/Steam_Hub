import fs from "fs";
import cloudinary from "../config/cloudnary.js";
import Video from "../model/video.model.js";
import mongoose from "mongoose";

// Upload Video (requires authenticated user in req.user)
export const uploadVideo = async (req, res) => {
  try {
    console.log("📤 Upload request received:", {
      hasFile: !!req.file,
      hasUser: !!req.user,
      body: req.body
    });

    if (!req.file) {
      console.log("❌ No file uploaded");
      return res.status(400).json({ error: "No video uploaded" });
    }
    
    if (!req.user || !req.user._id) {
      console.log("❌ No authenticated user");
      return res.status(401).json({ error: "Unauthorized. No user found." });
    }

    const filePath = req.file.path;
    console.log("📁 File path:", filePath);

    console.log("☁️ Uploading to Cloudinary...");
    
    // Check if Cloudinary is properly configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.log("⚠️ Cloudinary not configured, creating mock video entry");
      
      // Create a mock video entry for testing
      const video = await Video.create({
        title: req.body.title || req.file.originalname,
        description: req.body.description || "",
        videoUrl: `file://${filePath}`, // Local file path for testing
        thumbnail: `file://${filePath}.jpg`,
        duration: 0,
        public_id: `mock_${Date.now()}`,
        category: req.body.category || "General",
        owner: req.user._id,
        isPublic: req.body.isPublic !== "false",
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

    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "video",
      folder: "videos",
    });
    console.log("✅ Cloudinary upload successful:", result.public_id);

    // Cleanup temp file
    try {
      fs.unlinkSync(filePath);
      console.log("🗑️ Temp file cleaned up");
    } catch (cleanupError) {
      console.log("⚠️ Failed to cleanup temp file:", cleanupError.message);
    }

    console.log("💾 Saving video to database...");
    const video = await Video.create({
      title: req.body.title || result.original_filename,
      description: req.body.description || "",
      videoUrl: result.secure_url,
      thumbnail: result.secure_url + ".jpg",
      duration: result.duration,
      public_id: result.public_id,
      category: req.body.category || "General",
      owner: req.user._id,
      isPublic: req.body.isPublic !== "false",
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
