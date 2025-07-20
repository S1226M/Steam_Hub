import LiveStream from "../model/livestream.model.js";
import { v4 as uuidv4 } from 'uuid';

// Create a new WebRTC live stream room
export const createWebRTCLiveStream = async (req, res) => {
  try {
    const { title, description, isPrivate = false } = req.body;
    const userId = req.user._id;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    // Generate unique room ID
    const roomId = uuidv4();
    
    // Create live stream record
    const liveStream = new LiveStream({
      userId: userId,
      title: title,
      description: description,
      streamKey: roomId, // Use roomId as stream key for WebRTC
      streamUrl: `webrtc://${roomId}`, // WebRTC protocol
      hlsUrl: null, // Not applicable for WebRTC
      dashUrl: null, // Not applicable for WebRTC
      status: "created",
      type: "webrtc", // Mark as WebRTC stream
      isPrivate: isPrivate,
      roomId: roomId
    });

    await liveStream.save();

    res.status(201).json({
      success: true,
      message: "WebRTC live stream room created successfully",
      data: {
        roomId: roomId,
        streamId: liveStream._id,
        title: title,
        description: description,
        isPrivate: isPrivate,
        streamUrl: `webrtc://${roomId}`,
        type: "webrtc"
      },
    });
  } catch (error) {
    console.error("Create WebRTC live stream error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create WebRTC live stream",
      error: error.message,
    });
  }
};

// Get all WebRTC live streams
export const getWebRTCLiveStreams = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = "all" } = req.query;
    
    const query = { type: "webrtc" };
    if (status !== "all") {
      query.status = status;
    }

    const liveStreams = await LiveStream.find(query)
      .populate("userId", "username email avatar")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await LiveStream.countDocuments(query);

    res.status(200).json({
      success: true,
      data: liveStreams,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalStreams: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error("Get WebRTC live streams error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get WebRTC live streams",
      error: error.message,
    });
  }
};

// Get user's WebRTC live streams
export const getUserWebRTCLiveStreams = async (req, res) => {
  try {
    const { userId } = req.params;
    const authenticatedUserId = req.user._id;

    // Users can only get their own streams unless they're an admin
    if (userId !== authenticatedUserId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only view your own streams",
      });
    }

    const liveStreams = await LiveStream.find({ 
      userId: userId, 
      type: "webrtc" 
    })
      .sort({ createdAt: -1 })
      .populate("userId", "username email avatar");

    res.status(200).json({
      success: true,
      data: liveStreams,
    });
  } catch (error) {
    console.error("Get user WebRTC live streams error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get user WebRTC live streams",
      error: error.message,
    });
  }
};

// Get a specific WebRTC live stream
export const getWebRTCLiveStream = async (req, res) => {
  try {
    const { streamId } = req.params;

    const liveStream = await LiveStream.findOne({
      _id: streamId,
      type: "webrtc"
    }).populate("userId", "username email avatar");

    if (!liveStream) {
      return res.status(404).json({
        success: false,
        message: "WebRTC live stream not found",
      });
    }

    res.status(200).json({
      success: true,
      data: liveStream,
    });
  } catch (error) {
    console.error("Get WebRTC live stream error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get WebRTC live stream",
      error: error.message,
    });
  }
};

// Start a WebRTC live stream
export const startWebRTCLiveStream = async (req, res) => {
  try {
    const { streamId } = req.params;
    const userId = req.user._id;

    const liveStream = await LiveStream.findOne({
      _id: streamId,
      type: "webrtc"
    });

    if (!liveStream) {
      return res.status(404).json({
        success: false,
        message: "WebRTC live stream not found",
      });
    }

    // Check if user owns this stream
    if (liveStream.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only start your own streams",
      });
    }

    // Update stream status
    liveStream.status = "live";
    liveStream.startedAt = new Date();
    await liveStream.save();

    res.status(200).json({
      success: true,
      message: "WebRTC live stream started successfully",
      data: {
        roomId: liveStream.roomId,
        streamId: liveStream._id,
        status: liveStream.status
      },
    });
  } catch (error) {
    console.error("Start WebRTC live stream error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to start WebRTC live stream",
      error: error.message,
    });
  }
};

// Stop a WebRTC live stream
export const stopWebRTCLiveStream = async (req, res) => {
  try {
    const { streamId } = req.params;
    const userId = req.user._id;

    const liveStream = await LiveStream.findOne({
      _id: streamId,
      type: "webrtc"
    });

    if (!liveStream) {
      return res.status(404).json({
        success: false,
        message: "WebRTC live stream not found",
      });
    }

    // Check if user owns this stream
    if (liveStream.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only stop your own streams",
      });
    }

    // Update stream status
    liveStream.status = "ended";
    liveStream.endedAt = new Date();
    await liveStream.save();

    res.status(200).json({
      success: true,
      message: "WebRTC live stream stopped successfully",
      data: liveStream,
    });
  } catch (error) {
    console.error("Stop WebRTC live stream error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to stop WebRTC live stream",
      error: error.message,
    });
  }
};

// Delete a WebRTC live stream
export const deleteWebRTCLiveStream = async (req, res) => {
  try {
    const { streamId } = req.params;
    const userId = req.user._id;

    const liveStream = await LiveStream.findOne({
      _id: streamId,
      type: "webrtc"
    });

    if (!liveStream) {
      return res.status(404).json({
        success: false,
        message: "WebRTC live stream not found",
      });
    }

    // Check if user owns this stream
    if (liveStream.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own streams",
      });
    }

    // Delete from database
    await LiveStream.findByIdAndDelete(streamId);

    res.status(200).json({
      success: true,
      message: "WebRTC live stream deleted successfully",
    });
  } catch (error) {
    console.error("Delete WebRTC live stream error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete WebRTC live stream",
      error: error.message,
    });
  }
};

// Get active WebRTC live streams
export const getActiveWebRTCLiveStreams = async (req, res) => {
  try {
    const liveStreams = await LiveStream.find({
      status: "live",
      type: "webrtc"
    })
      .populate("userId", "username email avatar")
      .sort({ startedAt: -1 });

    res.status(200).json({
      success: true,
      data: liveStreams || [],
    });
  } catch (error) {
    console.error("Get active WebRTC live streams error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get active WebRTC live streams",
      error: error.message,
    });
  }
}; 