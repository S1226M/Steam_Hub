import express from "express";
import {
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
} from "../controller/comment.controller.js";

const router = express.Router();

// ✅ CREATE COMMENT
// POST /api/comments
router.post("/", createComment);

// ✅ GET ALL COMMENTS FOR A VIDEO
// GET /api/comments/video/:videoId?page=1&limit=10&sort=newest
router.get("/video/:videoId", getVideoComments);

// ✅ GET SINGLE COMMENT
// GET /api/comments/:commentId
router.get("/:commentId", getComment);

// ✅ UPDATE COMMENT
// PUT /api/comments/:commentId
router.put("/:commentId", updateComment);

// ✅ DELETE COMMENT (SOFT DELETE)
// DELETE /api/comments/:commentId
router.delete("/:commentId", deleteComment);

// ✅ HARD DELETE COMMENT (ADMIN ONLY)
// DELETE /api/comments/:commentId/hard
router.delete("/:commentId/hard", hardDeleteComment);

// ✅ LIKE/UNLIKE COMMENT
// POST /api/comments/:commentId/like
router.post("/:commentId/like", toggleCommentLike);

// ✅ GET COMMENT REPLIES
// GET /api/comments/:commentId/replies?page=1&limit=10
router.get("/:commentId/replies", getCommentReplies);

// ✅ GET USER'S COMMENTS
// GET /api/comments/user/:userId?page=1&limit=10
router.get("/user/:userId", getUserComments);

// ✅ SEARCH COMMENTS
// GET /api/comments/search?q=search_term&videoId=video_id&userId=user_id&page=1&limit=10
router.get("/search", searchComments);

// ✅ GET COMMENT STATISTICS
// GET /api/comments/stats/:videoId
router.get("/stats/:videoId", getCommentStats);

// ✅ RESTORE DELETED COMMENT (ADMIN ONLY)
// POST /api/comments/:commentId/restore
router.post("/:commentId/restore", restoreComment);

export default router;
