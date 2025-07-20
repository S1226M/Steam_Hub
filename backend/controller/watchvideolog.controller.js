import WatchVideoLog from "../model/watchvideolog.model.js";
import Video from "../model/video.model.js";
import mongoose from "mongoose";

// Log a video view (one per user per video per day)
export const logVideoView = async (req, res) => {
  try {
    const { videoId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "User must be authenticated to log video views" 
      });
    }

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid video ID" 
      });
    }

    // Check if video exists
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ 
        success: false, 
        message: "Video not found" 
      });
    }

    // Check if user already viewed this video today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingLog = await WatchVideoLog.findOne({
      userId,
      videoId,
      watchedAt: {
        $gte: today,
        $lt: tomorrow
      }
    });

    if (existingLog) {
      // Update existing log with new watch duration or completion status
      const { watchDuration = 0, completed = false } = req.body;
      
      const updatedLog = await WatchVideoLog.findByIdAndUpdate(
        existingLog._id,
        {
          watchDuration: Math.max(existingLog.watchDuration, watchDuration),
          completed: existingLog.completed || completed,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        },
        { new: true }
      );

      return res.json({
        success: true,
        message: "Video view log updated",
        log: updatedLog,
        isNewView: false
      });
    }

    // Create new view log
    const { watchDuration = 0, completed = false } = req.body;
    
    const newLog = await WatchVideoLog.create({
      userId,
      videoId,
      watchDuration,
      completed,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Increment video view count only for new views
    await Video.findByIdAndUpdate(videoId, { $inc: { views: 1 } });

    res.status(201).json({
      success: true,
      message: "Video view logged successfully",
      log: newLog,
      isNewView: true
    });

  } catch (error) {
    console.error("Error logging video view:", error);
    res.status(500).json({
      success: false,
      message: "Failed to log video view",
      error: error.message
    });
  }
};

// Get user's watch history
export const getUserWatchHistory = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { page = 1, limit = 20 } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User must be authenticated"
      });
    }

    const skip = (page - 1) * limit;

    const watchHistory = await WatchVideoLog.find({ userId })
      .populate('videoId', 'title thumbnail duration views createdAt owner')
      .populate('videoId.owner', 'fullname username profileimage')
      .sort({ watchedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await WatchVideoLog.countDocuments({ userId });

    res.json({
      success: true,
      data: {
        watchHistory,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error("Error fetching watch history:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch watch history",
      error: error.message
    });
  }
};

// Get video view statistics
export const getVideoViewStats = async (req, res) => {
  try {
    const { videoId } = req.params;
    const userId = req.user?._id;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid video ID"
      });
    }

    // Check if user is the video owner
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found"
      });
    }

    if (video.owner.toString() !== userId?.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only video owner can view statistics"
      });
    }

    // Get view statistics
    const totalViews = await WatchVideoLog.countDocuments({ videoId });
    const uniqueViewers = await WatchVideoLog.distinct('userId', { videoId });
    const completedViews = await WatchVideoLog.countDocuments({ 
      videoId, 
      completed: true 
    });

    // Get recent views (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentViews = await WatchVideoLog.countDocuments({
      videoId,
      watchedAt: { $gte: sevenDaysAgo }
    });

    res.json({
      success: true,
      data: {
        totalViews,
        uniqueViewers: uniqueViewers.length,
        completedViews,
        recentViews,
        completionRate: totalViews > 0 ? (completedViews / totalViews * 100).toFixed(2) : 0
      }
    });

  } catch (error) {
    console.error("Error fetching video stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch video statistics",
      error: error.message
    });
  }
};

// Mark video as completed
export const markVideoCompleted = async (req, res) => {
  try {
    const { videoId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User must be authenticated"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid video ID"
      });
    }

    // Find and update the most recent watch log for this user and video
    const updatedLog = await WatchVideoLog.findOneAndUpdate(
      { userId, videoId },
      { completed: true },
      { new: true, sort: { watchedAt: -1 } }
    );

    if (!updatedLog) {
      return res.status(404).json({
        success: false,
        message: "No watch log found for this video"
      });
    }

    res.json({
      success: true,
      message: "Video marked as completed",
      log: updatedLog
    });

  } catch (error) {
    console.error("Error marking video completed:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark video as completed",
      error: error.message
    });
  }
}; 