import mongoose from "mongoose";

const downloadSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  video: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Video",
    required: true
  },
  downloadedAt: {
    type: Date,
    default: Date.now
  },
  downloadStatus: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending"
  },
  filePath: {
    type: String,
    trim: true
  },
  fileSize: {
    type: Number, // Size in bytes
    default: 0
  },
  quality: {
    type: String,
    enum: ["360p", "480p", "720p", "1080p"],
    default: "720p"
  },
  platform: {
    type: String,
    enum: ["web", "mobile", "tablet"],
    default: "web"
  },
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
downloadSchema.index({ user: 1, downloadedAt: -1 });
downloadSchema.index({ video: 1, downloadedAt: -1 });
downloadSchema.index({ user: 1, video: 1 }, { unique: true }); // One download per user per video

// Virtual for formatted date
downloadSchema.virtual('formattedDate').get(function() {
  return this.downloadedAt.toLocaleDateString();
});

// Virtual for formatted file size
downloadSchema.virtual('formattedFileSize').get(function() {
  if (this.fileSize === 0) return "Unknown";
  
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(this.fileSize) / Math.log(1024));
  return Math.round(this.fileSize / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
});

// Ensure virtuals are serialized
downloadSchema.set('toJSON', { virtuals: true });
downloadSchema.set('toObject', { virtuals: true });

const Download = mongoose.model("Download", downloadSchema);
export default Download; 