import fs from "fs";
import path from "path";
import cloudinary from "../config/cloudnary.js";
import Video from "../model/video.model.js";
import mongoose from "mongoose";
import { generateSmartThumbnail, cleanupThumbnail } from "../utils/thumbnailGenerator.js";

// Upload Video (requires authenticated user in req.user)
export const uploadVideo = async (req, res) => {
  try {
    console.log("📤 Upload request received:", {
      hasFile: !!req.file,
      hasUser: !!req.user,
      body: req.body
    });

    if (!req.files || !req.files.video) {
      console.log("❌ No video file uploaded");
      return res.status(400).json({ error: "No video uploaded" });
    }
    
    if (!req.user || !req.user._id) {
      console.log("❌ No authenticated user");
      return res.status(401).json({ error: "Unauthorized. No user found." });
    }

    const videoFile = req.files.video[0];
    const filePath = videoFile.path;
    console.log("📁 File path:", filePath);

    // Generate thumbnail directory
    const thumbnailDir = path.join(process.cwd(), 'temp', 'thumbnails');
    let thumbnailPath = null;
    let videoDuration = 0;
    let customThumbnail = null;

    // Check if user uploaded a custom thumbnail
    if (req.files && req.files.thumbnail) {
      customThumbnail = req.files.thumbnail[0];
      console.log("🖼️ Custom thumbnail uploaded:", customThumbnail.originalname);
    }

    // Generate auto thumbnail only if no custom thumbnail provided
    if (!customThumbnail) {
      try {
        console.log("🖼️ Generating auto thumbnail...");
        const thumbnailResult = await generateSmartThumbnail(filePath, thumbnailDir);
        thumbnailPath = thumbnailResult.thumbnailPath;
        videoDuration = thumbnailResult.duration;
        console.log("✅ Auto thumbnail generated successfully");
      } catch (thumbnailError) {
        console.error("❌ Auto thumbnail generation failed:", thumbnailError.message);
        // Continue without thumbnail
      }
    } else {
      // Get video duration for custom thumbnail
      try {
        const ffmpeg = require('fluent-ffmpeg');
        const ffmpegStatic = require('ffmpeg-static');
        ffmpeg.setFfmpegPath(ffmpegStatic);
        
        ffmpeg.ffprobe(filePath, (err, metadata) => {
          if (!err && metadata.format) {
            videoDuration = metadata.format.duration;
            console.log(`📹 Video duration: ${videoDuration}s`);
          }
        });
      } catch (durationError) {
        console.error("❌ Error getting video duration:", durationError.message);
      }
    }

    console.log("☁️ Uploading to Cloudinary...");
    
    // Check if Cloudinary is properly configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.log("⚠️ Cloudinary not configured, creating mock video entry");
      
      // Create a mock video entry for testing
      const video = await Video.create({
        title: req.body.title || videoFile.originalname,
        description: req.body.description || "",
        videoUrl: `file://${filePath}`, // Local file path for testing
        thumbnail: thumbnailPath ? `file://${thumbnailPath}` : `file://${filePath}.jpg`,
        duration: videoDuration,
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

    // Upload video to Cloudinary
    const videoResult = await cloudinary.uploader.upload(filePath, {
      resource_type: "video",
      folder: "videos",
    });
    console.log("✅ Video uploaded to Cloudinary:", videoResult.public_id);

    // Upload thumbnail to Cloudinary
    let thumbnailUrl = null;
    
    if (customThumbnail) {
      // Upload custom thumbnail
      try {
        const thumbnailResult = await cloudinary.uploader.upload(customThumbnail.path, {
          folder: "thumbnails",
          transformation: [
            { width: 320, height: 180, crop: "fill" }
          ]
        });
        thumbnailUrl = thumbnailResult.secure_url;
        console.log("✅ Custom thumbnail uploaded to Cloudinary:", thumbnailResult.public_id);
        
        // Clean up local custom thumbnail file
        try {
          fs.unlinkSync(customThumbnail.path);
          console.log("🗑️ Custom thumbnail file cleaned up");
        } catch (cleanupError) {
          console.log("⚠️ Failed to cleanup custom thumbnail file:", cleanupError.message);
        }
      } catch (thumbnailUploadError) {
        console.error("❌ Custom thumbnail upload failed:", thumbnailUploadError.message);
        // Use video URL as fallback
        thumbnailUrl = videoResult.secure_url + ".jpg";
      }
    } else if (thumbnailPath) {
      // Upload auto-generated thumbnail
      try {
        const thumbnailResult = await cloudinary.uploader.upload(thumbnailPath, {
          folder: "thumbnails",
          transformation: [
            { width: 320, height: 180, crop: "fill" }
          ]
        });
        thumbnailUrl = thumbnailResult.secure_url;
        console.log("✅ Auto thumbnail uploaded to Cloudinary:", thumbnailResult.public_id);
        
        // Clean up local thumbnail file
        await cleanupThumbnail(thumbnailPath);
      } catch (thumbnailUploadError) {
        console.error("❌ Auto thumbnail upload failed:", thumbnailUploadError.message);
        // Use video URL as fallback
        thumbnailUrl = videoResult.secure_url + ".jpg";
      }
    } else {
      // Fallback to video URL
      thumbnailUrl = videoResult.secure_url + ".jpg";
    }

    // Cleanup temp video file
    try {
      fs.unlinkSync(filePath);
      console.log("🗑️ Temp video file cleaned up");
    } catch (cleanupError) {
      console.log("⚠️ Failed to cleanup temp video file:", cleanupError.message);
    }

    console.log("💾 Saving video to database...");
    const video = await Video.create({
      title: req.body.title || videoFile.originalname,
      description: req.body.description || "",
      videoUrl: videoResult.secure_url,
      thumbnail: thumbnailUrl,
      duration: videoDuration || videoResult.duration,
      public_id: videoResult.public_id,
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

    // Note: View count is now handled by the watch log system
    // Views are only incremented when a user logs a view via /api/watchlogs/log/:videoId

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
