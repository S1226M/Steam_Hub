import Like from "../model/like.model.js";
import Video from "../model/video.model.js"; // ✅ Correct default import

export const toggleVideoLike = async (req, res) => {
  try {
    // Extract videoId from request parameters and userId from request body
    const { videoId } = req.params;
    const { userId } = req.body;
    
    // Check if userId is provided
    if (!userId) {
      return res.status(400).json({ message: "userId is required in request body" });
    }

    // Check if the video exists
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    // Check if user already liked the video
    const existingLike = await Like.findOne({ video: videoId, likeBy: userId });

    if (existingLike) {
      // Unlike
      await Like.deleteOne({ _id: existingLike._id });

      // Decrease likesCount on video
      await Video.findByIdAndUpdate(videoId, { $inc: { likesCount: -1 } });

      return res.status(200).json({ message: "Video unliked" });
    } else {
      // Like
      await Like.create({ video: videoId, likeBy: userId });

      // Increase likesCount on video
      await Video.findByIdAndUpdate(videoId, { $inc: { likesCount: 1 } });

      return res.status(201).json({ message: "Video liked" });
    }

  } catch (err) {
    console.error("Error toggling like:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getLikedVideos = async (req, res) => {
  try {
    // Get userId from query parameters
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ message: "userId is required as query parameter" });
    }

    const likes = await Like.find({ likeBy: userId }).populate("video");
    const videos = likes.map(l => l.video);

    res.status(200).json({ likedVideos: videos });
  } catch (err) {
    console.error("Get Liked Videos Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

export default {
    toggleVideoLike,
    getLikedVideos
}