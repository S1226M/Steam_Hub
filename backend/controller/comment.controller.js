import Comment from "../model/comment.model.js";
import Video from "../model/video.model.js";

// ✅ CREATE COMMENT
export const createComment = async (req, res) => {
  try {
    const { videoId, userId, content, parentCommentId } = req.body;

    // Validation
    if (!videoId || !userId || !content) {
      return res.status(400).json({ 
        success: false, 
        message: "videoId, userId, and content are required" 
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

    // Check if parent comment exists (for replies)
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        return res.status(404).json({ 
          success: false, 
          message: "Parent comment not found" 
        });
      }
    }

    // Create comment
    const comment = await Comment.create({
      user: userId,
      video: videoId,
      content: content.trim(),
      parentComment: parentCommentId || null
    });

    // Populate user info
    await comment.populate('user', 'username email avatar');

    res.status(201).json({
      success: true,
      message: "Comment created successfully",
      data: comment
    });

  } catch (error) {
    console.error("Create Comment Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

// ✅ GET ALL COMMENTS FOR A VIDEO
export const getVideoComments = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { page = 1, limit = 10, sort = 'newest' } = req.query;

    // Validation
    if (!videoId) {
      return res.status(400).json({ 
        success: false, 
        message: "Video ID is required" 
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

    // Build query
    const query = { 
      video: videoId, 
      isDeleted: false,
      parentComment: null // Only top-level comments
    };

    // Build sort options
    let sortOptions = {};
    switch (sort) {
      case 'oldest':
        sortOptions = { createdAt: 1 };
        break;
      case 'mostLiked':
        sortOptions = { 'likes.length': -1, createdAt: -1 };
        break;
      default: // newest
        sortOptions = { createdAt: -1 };
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Get comments with pagination
    const comments = await Comment.find(query)
      .populate('user', 'username email avatar')
      .populate('replies')
      .populate('likes', 'username')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const totalComments = await Comment.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        comments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalComments / limit),
          totalComments,
          hasNextPage: skip + comments.length < totalComments,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error("Get Video Comments Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

// ✅ GET SINGLE COMMENT
export const getComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId)
      .populate('user', 'username email avatar')
      .populate('replies')
      .populate('likes', 'username')
      .populate('parentComment');

    if (!comment || comment.isDeleted) {
      return res.status(404).json({ 
        success: false, 
        message: "Comment not found" 
      });
    }

    res.status(200).json({
      success: true,
      data: comment
    });

  } catch (error) {
    console.error("Get Comment Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

// ✅ UPDATE COMMENT
export const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { userId, content } = req.body;

    // Validation
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Content is required" 
      });
    }

    // Find comment
    const comment = await Comment.findById(commentId);
    if (!comment || comment.isDeleted) {
      return res.status(404).json({ 
        success: false, 
        message: "Comment not found" 
      });
    }

    // Check ownership
    if (comment.user.toString() !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: "You can only edit your own comments" 
      });
    }

    // Update comment
    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { content: content.trim() },
      { new: true, runValidators: true }
    ).populate('user', 'username email avatar');

    res.status(200).json({
      success: true,
      message: "Comment updated successfully",
      data: updatedComment
    });

  } catch (error) {
    console.error("Update Comment Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

// ✅ DELETE COMMENT (SOFT DELETE)
export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { userId } = req.body;

    // Find comment
    const comment = await Comment.findById(commentId);
    if (!comment || comment.isDeleted) {
      return res.status(404).json({ 
        success: false, 
        message: "Comment not found" 
      });
    }

    // Check ownership
    if (comment.user.toString() !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: "You can only delete your own comments" 
      });
    }

    // Soft delete
    await Comment.findByIdAndUpdate(commentId, { isDeleted: true });

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully"
    });

  } catch (error) {
    console.error("Delete Comment Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

// ✅ HARD DELETE COMMENT (ADMIN ONLY)
export const hardDeleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { adminUserId } = req.body;

    // TODO: Add admin validation here
    // if (!isAdmin(adminUserId)) {
    //   return res.status(403).json({ message: "Admin access required" });
    // }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ 
        success: false, 
        message: "Comment not found" 
      });
    }

    // Delete all replies first
    await Comment.deleteMany({ parentComment: commentId });
    
    // Delete the comment
    await Comment.findByIdAndDelete(commentId);

    res.status(200).json({
      success: true,
      message: "Comment permanently deleted"
    });

  } catch (error) {
    console.error("Hard Delete Comment Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

// ✅ LIKE/UNLIKE COMMENT
export const toggleCommentLike = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { userId } = req.body;

    // Find comment
    const comment = await Comment.findById(commentId);
    if (!comment || comment.isDeleted) {
      return res.status(404).json({ 
        success: false, 
        message: "Comment not found" 
      });
    }

    // Check if user already liked
    const isLiked = comment.likes.includes(userId);

    if (isLiked) {
      // Unlike
      await Comment.findByIdAndUpdate(
        commentId,
        { $pull: { likes: userId } }
      );
      
      res.status(200).json({
        success: true,
        message: "Comment unliked",
        liked: false
      });
    } else {
      // Like
      await Comment.findByIdAndUpdate(
        commentId,
        { $addToSet: { likes: userId } }
      );
      
      res.status(200).json({
        success: true,
        message: "Comment liked",
        liked: true
      });
    }

  } catch (error) {
    console.error("Toggle Comment Like Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

// ✅ GET COMMENT REPLIES
export const getCommentReplies = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Check if parent comment exists
    const parentComment = await Comment.findById(commentId);
    if (!parentComment || parentComment.isDeleted) {
      return res.status(404).json({ 
        success: false, 
        message: "Parent comment not found" 
      });
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Get replies
    const replies = await Comment.find({
      parentComment: commentId,
      isDeleted: false
    })
      .populate('user', 'username email avatar')
      .populate('likes', 'username')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const totalReplies = await Comment.countDocuments({
      parentComment: commentId,
      isDeleted: false
    });

    res.status(200).json({
      success: true,
      data: {
        replies,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalReplies / limit),
          totalReplies,
          hasNextPage: skip + replies.length < totalReplies,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error("Get Comment Replies Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

// ✅ GET USER'S COMMENTS
export const getUserComments = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Pagination
    const skip = (page - 1) * limit;

    // Get user's comments
    const comments = await Comment.find({
      user: userId,
      isDeleted: false
    })
      .populate('video', 'title thumbnail')
      .populate('likes', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const totalComments = await Comment.countDocuments({
      user: userId,
      isDeleted: false
    });

    res.status(200).json({
      success: true,
      data: {
        comments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalComments / limit),
          totalComments,
          hasNextPage: skip + comments.length < totalComments,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error("Get User Comments Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

// ✅ SEARCH COMMENTS
export const searchComments = async (req, res) => {
  try {
    const { q, videoId, userId } = req.query;
    const { page = 1, limit = 10 } = req.query;

    // Build search query
    const searchQuery = { isDeleted: false };
    
    if (q) {
      searchQuery.content = { $regex: q, $options: 'i' };
    }
    
    if (videoId) {
      searchQuery.video = videoId;
    }
    
    if (userId) {
      searchQuery.user = userId;
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Search comments
    const comments = await Comment.find(searchQuery)
      .populate('user', 'username email avatar')
      .populate('video', 'title thumbnail')
      .populate('likes', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const totalComments = await Comment.countDocuments(searchQuery);

    res.status(200).json({
      success: true,
      data: {
        comments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalComments / limit),
          totalComments,
          hasNextPage: skip + comments.length < totalComments,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error("Search Comments Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

// ✅ GET COMMENT STATISTICS
export const getCommentStats = async (req, res) => {
  try {
    const { videoId } = req.params;

    const stats = await Comment.aggregate([
      {
        $match: {
          video: new mongoose.Types.ObjectId(videoId),
          isDeleted: false
        }
      },
      {
        $group: {
          _id: null,
          totalComments: { $sum: 1 },
          totalLikes: { $sum: { $size: "$likes" } },
          avgLikesPerComment: { $avg: { $size: "$likes" } }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: stats[0] || {
        totalComments: 0,
        totalLikes: 0,
        avgLikesPerComment: 0
      }
    });

  } catch (error) {
    console.error("Get Comment Stats Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

// ✅ RESTORE DELETED COMMENT (ADMIN ONLY)
export const restoreComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { adminUserId } = req.body;

    // TODO: Add admin validation here
    // if (!isAdmin(adminUserId)) {
    //   return res.status(403).json({ message: "Admin access required" });
    // }

    const comment = await Comment.findByIdAndUpdate(
      commentId,
      { isDeleted: false },
      { new: true }
    ).populate('user', 'username email avatar');

    if (!comment) {
      return res.status(404).json({ 
        success: false, 
        message: "Comment not found" 
      });
    }

    res.status(200).json({
      success: true,
      message: "Comment restored successfully",
      data: comment
    });

  } catch (error) {
    console.error("Restore Comment Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

export default {
  createComment,
  getVideoComments,
  getComment,
  updateComment,
  deleteComment,
  hardDeleteComment,
  toggleCommentLike,
  getCommentReplies,
  getUserComments,
  searchComments,
  getCommentStats,
  restoreComment
};
