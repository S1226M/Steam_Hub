import { Like } from "../model/like.model.js";
import Video from "../model/video.model.js"; // ✅ Correct default import

export const toggleVideoLike = async (req, res) => {
  try {
    // Extract videoId from request parameters and userId from request body
    const { videoId } = req.params;
    const { userId } = req.body;
    
    // Check if userId is provided
    if (!userId) {
      return res.status(400).json({ 
        success: false,
        message: "userId is required in request body" 
      });
    }

    // Check if the video exists
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ 
        success: false,
        message: "Video not found" 
      });
    }

    // Check if user already liked the video
    const existingLike = await Like.findOne({ video: videoId, likeBy: userId });

    if (existingLike) {
      // Unlike
      await Like.deleteOne({ _id: existingLike._id });

      // Decrease likesCount on video
      await Video.findByIdAndUpdate(videoId, { $inc: { likesCount: -1 } });

      return res.status(200).json({ 
        success: true,
        message: "Video unliked",
        isLiked: false
      });
    } else {
      // Like - use try-catch to handle potential duplicate key errors
      try {
        await Like.create({ video: videoId, likeBy: userId });

        // Increase likesCount on video
        await Video.findByIdAndUpdate(videoId, { $inc: { likesCount: 1 } });

        return res.status(201).json({ 
          success: true,
          message: "Video liked",
          isLiked: true
        });
      } catch (createError) {
        // Handle duplicate key error (race condition)
        if (createError.code === 11000) {
          return res.status(409).json({ 
            success: false,
            message: "Video already liked by this user",
            isLiked: true
          });
        }
        throw createError;
      }
    }

  } catch (err) {
    console.error("Error toggling like:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
};

export const getLikedVideos = async (req, res) => {
  try {
    // Get userId from query parameters
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false,
        message: "userId is required as query parameter" 
      });
    }

    const likes = await Like.find({ likeBy: userId })
      .populate({
        path: "video",
        populate: {
          path: "owner",
          select: "fullname username profileimage"
        }
      });
    
    const videos = likes.map(l => l.video).filter(video => video); // Filter out null videos

    res.status(200).json({ 
      success: true,
      likedVideos: videos,
      count: videos.length
    });
  } catch (err) {
    console.error("Get Liked Videos Error:", err);
    res.status(500).json({ 
      success: false,
      message: "Server Error" 
    });
  }
};

export default {
    toggleVideoLike,
    getLikedVideos
}