import WatchVideoLog from "../model/watchvideolog.model.js";
import Like from "../model/like.model.js";
import Playlist from "../model/playlist.model.js";
import Download from "../model/download.model.js";
import Video from "../model/video.model.js";
import User from "../model/user.model.js";

// Get user's watch history
export const getUserHistory = async (req, res) => {
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

    // Format the response
    const formattedHistory = history.map(log => ({
      _id: log._id,
      video: log.video,
      watchedAt: log.watchedAt,
      watchDuration: log.watchDuration,
      completed: log.completed,
      platform: log.platform
    }));

    res.json({
      success: true,
      data: formattedHistory,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching user history:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch watch history"
    });
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

    // Format the response
    const formattedLikes = likes.map(like => ({
      _id: like._id,
      video: like.video,
      likedAt: like.createdAt
    }));

    res.json({
      success: true,
      data: formattedLikes,
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

// Get user's playlists
export const getUserPlaylists = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;

    const playlists = await Playlist.find({ user: userId })
      .populate({
        path: 'videos',
        select: 'title thumbnail duration views createdAt',
        populate: {
          path: 'owner',
          select: 'fullname username'
        }
      })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Playlist.countDocuments({ user: userId });

    // Format the response
    const formattedPlaylists = playlists.map(playlist => ({
      _id: playlist._id,
      name: playlist.name,
      description: playlist.description,
      isPublic: playlist.isPublic,
      videoCount: playlist.videos.length,
      videos: playlist.videos.slice(0, 4), // Show first 4 videos as preview
      createdAt: playlist.createdAt,
      updatedAt: playlist.updatedAt
    }));

    res.json({
      success: true,
      data: formattedPlaylists,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching user playlists:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch playlists"
    });
  }
};

// Get user's downloads
export const getUserDownloads = async (req, res) => {
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

    // Format the response
    const formattedDownloads = downloads.map(download => ({
      _id: download._id,
      video: download.video,
      downloadedAt: download.downloadedAt,
      downloadStatus: download.downloadStatus,
      fileSize: download.fileSize,
      quality: download.quality,
      platform: download.platform
    }));

    res.json({
      success: true,
      data: formattedDownloads,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching user downloads:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch downloads"
    });
  }
};

// Add video to watch history
export const addToHistory = async (req, res) => {
  try {
    const { userId, videoId } = req.body;
    const { watchDuration = 0, completed = false, platform = "web" } = req.body;

    // Update existing log or create new one
    const existingLog = await WatchVideoLog.findOne({ user: userId, video: videoId });
    
    if (existingLog) {
      // Update existing log
      existingLog.watchedAt = new Date();
      existingLog.watchDuration = Math.max(existingLog.watchDuration, watchDuration);
      existingLog.completed = existingLog.completed || completed;
      existingLog.platform = platform;
      await existingLog.save();
    } else {
      // Create new log
      await WatchVideoLog.create({
        user: userId,
        video: videoId,
        watchDuration,
        completed,
        platform,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });
    }

    res.json({
      success: true,
      message: "Video added to history"
    });
  } catch (error) {
    console.error("Error adding to history:", error);
    res.status(500).json({
      success: false,
      error: "Failed to add video to history"
    });
  }
};

// Remove video from history
export const removeFromHistory = async (req, res) => {
  try {
    const { userId, videoId } = req.params;

    await WatchVideoLog.findOneAndDelete({ user: userId, video: videoId });

    res.json({
      success: true,
      message: "Video removed from history"
    });
  } catch (error) {
    console.error("Error removing from history:", error);
    res.status(500).json({
      success: false,
      error: "Failed to remove video from history"
    });
  }
};

// Clear all history
export const clearHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    await WatchVideoLog.deleteMany({ user: userId });

    res.json({
      success: true,
      message: "History cleared successfully"
    });
  } catch (error) {
    console.error("Error clearing history:", error);
    res.status(500).json({
      success: false,
      error: "Failed to clear history"
    });
  }
};

// Add video to downloads
export const addToDownloads = async (req, res) => {
  try {
    const { userId, videoId } = req.body;
    const { quality = "720p", platform = "web" } = req.body;

    // Check if already downloaded
    const existingDownload = await Download.findOne({ user: userId, video: videoId });
    
    if (existingDownload) {
      return res.status(400).json({
        success: false,
        error: "Video already in downloads"
      });
    }

    // Create new download record
    const download = await Download.create({
      user: userId,
      video: videoId,
      quality,
      platform,
      downloadStatus: "pending",
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: "Video added to downloads",
      download
    });
  } catch (error) {
    console.error("Error adding to downloads:", error);
    res.status(500).json({
      success: false,
      error: "Failed to add video to downloads"
    });
  }
};

// Remove video from downloads
export const removeFromDownloads = async (req, res) => {
  try {
    const { userId, videoId } = req.params;

    await Download.findOneAndDelete({ user: userId, video: videoId });

    res.json({
      success: true,
      message: "Video removed from downloads"
    });
  } catch (error) {
    console.error("Error removing from downloads:", error);
    res.status(500).json({
      success: false,
      error: "Failed to remove video from downloads"
    });
  }
};

// Get library summary (counts)
export const getLibrarySummary = async (req, res) => {
  try {
    const { userId } = req.params;

    const [historyCount, likedCount, playlistCount, downloadCount] = await Promise.all([
      WatchVideoLog.countDocuments({ user: userId }),
      Like.countDocuments({ likeBy: userId }),
      Playlist.countDocuments({ user: userId }),
      Download.countDocuments({ user: userId })
    ]);

    res.json({
      success: true,
      data: {
        history: historyCount,
        liked: likedCount,
        playlists: playlistCount,
        downloads: downloadCount
      }
    });
  } catch (error) {
    console.error("Error fetching library summary:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch library summary"
    });
  }
}; 