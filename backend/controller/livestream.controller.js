import LiveStream from "../model/livestream.model.js";

// Create a new live stream
export const createLiveStream = async (req, res) => {
  try {
    const { title, description } = req.body;
    const userId = req.user._id; // Get user ID from authenticated user

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    // Create live stream with NodeMediaServer
    const streamKey = `stream-${Date.now()}-${userId}`;
    const streamName = streamKey;
    
    // NodeMediaServer configuration
    const rtmpUrl = `rtmp://localhost:1935/live/${streamKey}`;
    const hlsUrl = `http://localhost:8000/live/${streamKey}.m3u8`;
    const dashUrl = `http://localhost:8000/live/${streamKey}/index.mpd`;
    
    console.log(`🎥 Created stream: ${streamKey}`);
    console.log(`📡 RTMP URL: ${rtmpUrl}`);
    console.log(`📺 HLS URL: ${hlsUrl}`);
    console.log(`📱 DASH URL: ${dashUrl}`);

    // Save stream details to database
    const liveStream = new LiveStream({
      userId: userId,
      title: title,
      description: description,
      streamKey: streamKey,
      streamUrl: rtmpUrl,
      hlsUrl: hlsUrl,
      dashUrl: dashUrl,
      status: "created",
    });

    await liveStream.save();

    res.status(201).json({
      success: true,
      message: "Live stream created successfully",
      data: {
        streamKey: streamKey,
        streamUrl: rtmpUrl,
        hlsUrl: hlsUrl,
        dashUrl: dashUrl,
        streamId: liveStream._id,
        title: title,
        description: description,
      },
    });
  } catch (error) {
    console.error("Create live stream error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create live stream",
      error: error.message,
    });
  }
};

// Get all live streams for a user
export const getUserLiveStreams = async (req, res) => {
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

    const liveStreams = await LiveStream.find({ userId: userId })
      .sort({ createdAt: -1 })
      .populate("userId", "username email");

    res.status(200).json({
      success: true,
      data: liveStreams,
    });
  } catch (error) {
    console.error("Get user live streams error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get live streams",
      error: error.message,
    });
  }
};

// Get a specific live stream
export const getLiveStream = async (req, res) => {
  try {
    const { streamId } = req.params;

    const liveStream = await LiveStream.findById(streamId)
      .populate("userId", "username email");

    if (!liveStream) {
      return res.status(404).json({
        success: false,
        message: "Live stream not found",
      });
    }

    res.status(200).json({
      success: true,
      data: liveStream,
    });
  } catch (error) {
    console.error("Get live stream error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get live stream",
      error: error.message,
    });
  }
};

// Stop a live stream
export const stopLiveStream = async (req, res) => {
  try {
    const { streamId } = req.params;
    const userId = req.user._id;

    const liveStream = await LiveStream.findById(streamId);

    if (!liveStream) {
      return res.status(404).json({
        success: false,
        message: "Live stream not found",
      });
    }

    // Check if user owns this stream
    if (liveStream.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only stop your own streams",
      });
    }

    // Stop stream on Cloudinary
    try {
      await cloudinary.api.stop_stream({
        stream_key: liveStream.streamKey,
      });
    } catch (cloudinaryError) {
      console.log("⚠️ Cloudinary stop stream error (demo mode):", cloudinaryError.message);
      // Continue with database update even if Cloudinary fails
    }

    // Update stream status in database
    liveStream.status = "stopped";
    liveStream.endedAt = new Date();
    await liveStream.save();

    res.status(200).json({
      success: true,
      message: "Live stream stopped successfully",
      data: liveStream,
    });
  } catch (error) {
    console.error("Stop live stream error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to stop live stream",
      error: error.message,
    });
  }
};

// Delete a live stream
export const deleteLiveStream = async (req, res) => {
  try {
    const { streamId } = req.params;
    const userId = req.user._id;

    const liveStream = await LiveStream.findById(streamId);

    if (!liveStream) {
      return res.status(404).json({
        success: false,
        message: "Live stream not found",
      });
    }

    // Check if user owns this stream
    if (liveStream.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own streams",
      });
    }

    // Delete stream from Cloudinary if it exists
    try {
      await cloudinary.api.delete_stream({
        stream_key: liveStream.streamKey,
      });
    } catch (cloudinaryError) {
      console.log("⚠️ Cloudinary delete stream error (demo mode):", cloudinaryError.message);
      // Continue with database deletion even if Cloudinary fails
    }

    // Delete from database
    await LiveStream.findByIdAndDelete(streamId);

    res.status(200).json({
      success: true,
      message: "Live stream deleted successfully",
    });
  } catch (error) {
    console.error("Delete live stream error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete live stream",
      error: error.message,
    });
  }
};

// Webhook for stream notifications
export const streamWebhook = async (req, res) => {
  try {
    const { notification_type, stream_key, status } = req.body;

    console.log("Stream webhook received:", { notification_type, stream_key, status });

    // Find stream by stream key
    const liveStream = await LiveStream.findOne({ streamKey: stream_key });

    if (liveStream) {
      switch (notification_type) {
        case "stream_started":
          liveStream.status = "live";
          liveStream.startedAt = new Date();
          break;
        case "stream_ended":
          liveStream.status = "ended";
          liveStream.endedAt = new Date();
          break;
        case "stream_error":
          liveStream.status = "error";
          break;
      }

      await liveStream.save();
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Stream webhook error:", error);
    res.status(500).json({ success: false });
  }
};

// Webhook for recording notifications
export const recordingWebhook = async (req, res) => {
  try {
    const { notification_type, stream_key, recording_url } = req.body;

    console.log("Recording webhook received:", { notification_type, stream_key, recording_url });

    // Find stream by stream key
    const liveStream = await LiveStream.findOne({ streamKey: stream_key });

    if (liveStream && notification_type === "recording_ready") {
      liveStream.recordingUrl = recording_url;
      liveStream.recordingReadyAt = new Date();
      await liveStream.save();
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Recording webhook error:", error);
    res.status(500).json({ success: false });
  }
};

// Get all active live streams
export const getActiveLiveStreams = async (req, res) => {
  try {
    const activeStreams = await LiveStream.find({ status: "live" })
      .populate("userId", "username email")
      .sort({ startedAt: -1 });

    res.status(200).json({
      success: true,
      data: activeStreams,
    });
  } catch (error) {
    console.error("Get active live streams error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get active live streams",
      error: error.message,
    });
  }
}; 