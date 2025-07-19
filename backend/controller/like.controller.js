import { Like } from "../models/Like.js";
import { Video } from "../models/Video.js";



export const toggleVideoLike = async (req, res) => {
  try {
    const { videoId } = req.params;
    const userId = req.user._id;

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
    const userId = req.user._id;

    const likes = await Like.find({ likeBy: userId }).populate("video");
    const videos = likes.map(l => l.video);

    res.status(200).json({ likedVideos: videos });
  } catch (err) {
    console.error("Get Liked Videos Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};
