// models/Like.js 
// One like per user per video


import mongoose from "mongoose";

const likeSchema = new mongoose.Schema({
  video:      { type: mongoose.Schema.Types.ObjectId, ref: "Video", required: true },
  likeBy:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

likeSchema.index({ likeBy: 1, video: 1 }, { unique: true }); // One like per user per video

const Like = mongoose.model("Like", likeSchema);
export default Like;
