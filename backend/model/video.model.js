import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String },
  videoUrl:    { type: String, required: true },
  thumbnail:   { type: String, required: true },
  duration:    { type: Number },
  owner:       { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  views:       { type: Number, default: 0 },
  likesCount:  { type: Number, default: 0 },
  isPublic:    { type: Boolean, default: true },
  isPremium:   { type: Boolean, default: false },
  category:    { 
    type: String,
    enum: ["Education", "Music", "Technology", "Entertainment", "Lifestyle", "General"],
    default: "General"
  },
  public_id:   { type: String, required: true }
}, { timestamps: true });

const Video = mongoose.model("Video", videoSchema);
export default Video;
