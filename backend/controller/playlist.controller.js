import Playlist from "../model/playlist.model.js";
import Video from "../model/video.model.js";
import User from "../model/user.model.js";

// ✅ CREATE PLAYLIST
export const createPlaylist = async (req, res) => {
  try {
    const { name, userId, description = "", isPublic = true } = req.body;

    // Validation
    if (!name || !userId) {
      return res.status(400).json({
        success: false,
        message: "Name and userId are required"
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check if playlist name already exists for this user
    const existingPlaylist = await Playlist.findOne({
      name: name.trim(),
      user: userId
    });

    if (existingPlaylist) {
      return res.status(400).json({
        success: false,
        message: "A playlist with this name already exists"
      });
    }

    // Create playlist
    const playlist = await Playlist.create({
      name: name.trim(),
      user: userId,
      description: description.trim(),
      isPublic: isPublic
    });

    await playlist.populate('user', 'username email avatar');

    res.status(201).json({
      success: true,
      message: "Playlist created successfully",
      data: playlist
    });

  } catch (error) {
    console.error("Create Playlist Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// ✅ GET ALL PLAYLISTS FOR A USER
export const getUserPlaylists = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, includePrivate = false } = req.query;

    // Build query
    const query = { user: userId };
    if (!includePrivate) {
      query.isPublic = true;
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Get playlists
    const playlists = await Playlist.find(query)
      .populate('user', 'username email avatar')
      .populate('videos', 'title thumbnail duration views')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const totalPlaylists = await Playlist.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        playlists,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalPlaylists / limit),
          totalPlaylists,
          hasNextPage: skip + playlists.length < totalPlaylists,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error("Get User Playlists Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// ✅ GET SINGLE PLAYLIST
export const getPlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { userId } = req.query; // For checking access permissions

    const playlist = await Playlist.findById(playlistId)
      .populate('user', 'username email avatar')
      .populate('videos', 'title description thumbnail duration views likesCount createdAt');

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found"
      });
    }

    // Check if user can access private playlist
    if (!playlist.isPublic && playlist.user._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied. This playlist is private"
      });
    }

    res.status(200).json({
      success: true,
      data: playlist
    });

  } catch (error) {
    console.error("Get Playlist Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// ✅ UPDATE PLAYLIST
export const updatePlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { userId, name, description, isPublic } = req.body;

    // Find playlist
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found"
      });
    }

    // Check ownership
    if (playlist.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own playlists"
      });
    }

    // Check if new name conflicts with existing playlist
    if (name && name.trim() !== playlist.name) {
      const existingPlaylist = await Playlist.findOne({
        name: name.trim(),
        user: userId,
        _id: { $ne: playlistId }
      });

      if (existingPlaylist) {
        return res.status(400).json({
          success: false,
          message: "A playlist with this name already exists"
        });
      }
    }

    // Update playlist
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (isPublic !== undefined) updateData.isPublic = isPublic;

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
      playlistId,
      updateData,
      { new: true, runValidators: true }
    ).populate('user', 'username email avatar');

    res.status(200).json({
      success: true,
      message: "Playlist updated successfully",
      data: updatedPlaylist
    });

  } catch (error) {
    console.error("Update Playlist Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// ✅ DELETE PLAYLIST
export const deletePlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { userId } = req.body;

    // Find playlist
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found"
      });
    }

    // Check ownership
    if (playlist.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own playlists"
      });
    }

    // Delete playlist
    await Playlist.findByIdAndDelete(playlistId);

    res.status(200).json({
      success: true,
      message: "Playlist deleted successfully"
    });

  } catch (error) {
    console.error("Delete Playlist Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// ✅ ADD VIDEO TO PLAYLIST
export const addVideoToPlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { videoId, userId } = req.body;

    // Validation
    if (!videoId || !userId) {
      return res.status(400).json({
        success: false,
        message: "videoId and userId are required"
      });
    }

    // Find playlist
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found"
      });
    }

    // Check ownership
    if (playlist.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only modify your own playlists"
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

    // Check if video is already in playlist
    if (playlist.videos.includes(videoId)) {
      return res.status(400).json({
        success: false,
        message: "Video is already in this playlist"
      });
    }

    // Add video to playlist
    await Playlist.findByIdAndUpdate(
      playlistId,
      { $push: { videos: videoId } }
    );

    res.status(200).json({
      success: true,
      message: "Video added to playlist successfully"
    });

  } catch (error) {
    console.error("Add Video to Playlist Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// ✅ REMOVE VIDEO FROM PLAYLIST
export const removeVideoFromPlaylist = async (req, res) => {
  try {
    const { playlistId, videoId } = req.params;
    const { userId } = req.body;

    // Find playlist
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found"
      });
    }

    // Check ownership
    if (playlist.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only modify your own playlists"
      });
    }

    // Check if video is in playlist
    if (!playlist.videos.includes(videoId)) {
      return res.status(400).json({
        success: false,
        message: "Video is not in this playlist"
      });
    }

    // Remove video from playlist
    await Playlist.findByIdAndUpdate(
      playlistId,
      { $pull: { videos: videoId } }
    );

    res.status(200).json({
      success: true,
      message: "Video removed from playlist successfully"
    });

  } catch (error) {
    console.error("Remove Video from Playlist Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// ✅ REORDER VIDEOS IN PLAYLIST
export const reorderPlaylistVideos = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { userId, videoOrder } = req.body; // videoOrder is array of video IDs in new order

    // Validation
    if (!videoOrder || !Array.isArray(videoOrder)) {
      return res.status(400).json({
        success: false,
        message: "videoOrder array is required"
      });
    }

    // Find playlist
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found"
      });
    }

    // Check ownership
    if (playlist.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only modify your own playlists"
      });
    }

    // Validate that all videos in new order exist in playlist
    const playlistVideoIds = playlist.videos.map(v => v.toString());
    const isValidOrder = videoOrder.every(videoId => 
      playlistVideoIds.includes(videoId)
    );

    if (!isValidOrder) {
      return res.status(400).json({
        success: false,
        message: "Invalid video order. All videos must exist in playlist"
      });
    }

    // Update playlist with new video order
    await Playlist.findByIdAndUpdate(
      playlistId,
      { videos: videoOrder }
    );

    res.status(200).json({
      success: true,
      message: "Playlist order updated successfully"
    });

  } catch (error) {
    console.error("Reorder Playlist Videos Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// ✅ GET PUBLIC PLAYLISTS
export const getPublicPlaylists = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'recent' } = req.query;

    // Build sort options
    let sortOptions = {};
    switch (sort) {
      case 'popular':
        sortOptions = { 'videos.length': -1, updatedAt: -1 };
        break;
      case 'name':
        sortOptions = { name: 1 };
        break;
      default: // recent
        sortOptions = { updatedAt: -1 };
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Get public playlists
    const playlists = await Playlist.find({ isPublic: true })
      .populate('user', 'username email avatar')
      .populate('videos', 'title thumbnail duration')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const totalPlaylists = await Playlist.countDocuments({ isPublic: true });

    res.status(200).json({
      success: true,
      data: {
        playlists,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalPlaylists / limit),
          totalPlaylists,
          hasNextPage: skip + playlists.length < totalPlaylists,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error("Get Public Playlists Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// ✅ SEARCH PLAYLISTS
export const searchPlaylists = async (req, res) => {
  try {
    const { q, userId, isPublic } = req.query;
    const { page = 1, limit = 10 } = req.query;

    // Build search query
    const searchQuery = {};
    
    if (q) {
      searchQuery.name = { $regex: q, $options: 'i' };
    }
    
    if (userId) {
      searchQuery.user = userId;
    }
    
    if (isPublic !== undefined) {
      searchQuery.isPublic = isPublic === 'true';
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Search playlists
    const playlists = await Playlist.find(searchQuery)
      .populate('user', 'username email avatar')
      .populate('videos', 'title thumbnail duration')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const totalPlaylists = await Playlist.countDocuments(searchQuery);

    res.status(200).json({
      success: true,
      data: {
        playlists,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalPlaylists / limit),
          totalPlaylists,
          hasNextPage: skip + playlists.length < totalPlaylists,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error("Search Playlists Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// ✅ DUPLICATE PLAYLIST
export const duplicatePlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { userId, newName } = req.body;

    // Find original playlist
    const originalPlaylist = await Playlist.findById(playlistId);
    if (!originalPlaylist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found"
      });
    }

    // Check if original playlist is public or user owns it
    if (!originalPlaylist.isPublic && originalPlaylist.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Cannot duplicate private playlist"
      });
    }

    // Check if new name conflicts
    const existingPlaylist = await Playlist.findOne({
      name: newName.trim(),
      user: userId
    });

    if (existingPlaylist) {
      return res.status(400).json({
        success: false,
        message: "A playlist with this name already exists"
      });
    }

    // Create duplicate playlist
    const duplicatedPlaylist = await Playlist.create({
      name: newName.trim(),
      user: userId,
      description: `${originalPlaylist.description} (Copied from ${originalPlaylist.name})`,
      videos: originalPlaylist.videos,
      isPublic: false // Default to private when duplicating
    });

    await duplicatedPlaylist.populate('user', 'username email avatar');
    await duplicatedPlaylist.populate('videos', 'title thumbnail duration');

    res.status(201).json({
      success: true,
      message: "Playlist duplicated successfully",
      data: duplicatedPlaylist
    });

  } catch (error) {
    console.error("Duplicate Playlist Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// ✅ GET PLAYLIST STATISTICS
export const getPlaylistStats = async (req, res) => {
  try {
    const { playlistId } = req.params;

    const playlist = await Playlist.findById(playlistId)
      .populate('videos', 'duration views likesCount');

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found"
      });
    }

    // Calculate statistics
    const totalVideos = playlist.videos.length;
    const totalDuration = playlist.videos.reduce((sum, video) => sum + (video.duration || 0), 0);
    const totalViews = playlist.videos.reduce((sum, video) => sum + (video.views || 0), 0);
    const totalLikes = playlist.videos.reduce((sum, video) => sum + (video.likesCount || 0), 0);

    const stats = {
      totalVideos,
      totalDuration,
      totalViews,
      totalLikes,
      averageViews: totalVideos > 0 ? Math.round(totalViews / totalVideos) : 0,
      averageLikes: totalVideos > 0 ? Math.round(totalLikes / totalVideos) : 0
    };

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error("Get Playlist Stats Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// ✅ CHECK IF VIDEO IS IN PLAYLIST
export const checkVideoInPlaylist = async (req, res) => {
  try {
    const { playlistId, videoId } = req.params;

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found"
      });
    }

    const isInPlaylist = playlist.videos.includes(videoId);

    res.status(200).json({
      success: true,
      data: {
        isInPlaylist,
        playlistId,
        videoId
      }
    });

  } catch (error) {
    console.error("Check Video in Playlist Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export default {
  createPlaylist,
  getUserPlaylists,
  getPlaylist,
  updatePlaylist,
  deletePlaylist,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  reorderPlaylistVideos,
  getPublicPlaylists,
  searchPlaylists,
  duplicatePlaylist,
  getPlaylistStats,
  checkVideoInPlaylist
};
