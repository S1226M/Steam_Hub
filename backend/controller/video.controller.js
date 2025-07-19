import fs from "fs";
import { v2 as cloudinary } from "cloudinary";
import Video from "../model/video.model.js";
import mongoose from "mongoose";

// Upload Video (requires authenticated user in req.user)
export const uploadVideo = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No video uploaded" });
    if (!req.user || !req.user._id) return res.status(401).json({ error: "Unauthorized. No user found." });

    const filePath = req.file.path;

    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "video",
      folder: "videos",
    });

    fs.unlinkSync(filePath); // Cleanup temp file

    const video = await Video.create({
      title: req.body.title || result.original_filename,
      description: req.body.description || "",
      videoUrl: result.secure_url,
      thumbnail: result.secure_url + ".jpg",
      duration: result.duration,
      public_id: result.public_id,
      category: req.body.category || "General",
      owner: req.user._id, // ✅ set authenticated user as owner
      isPublic: req.body.isPublic !== "false",
      isPremium: req.body.isPremium === "true",
    });

    res.status(201).json({ message: "🎥 Video uploaded", video });
  } catch (err) {
    console.error("❌ Upload error:", err.message);
    res.status(500).json({ error: err.message });
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
