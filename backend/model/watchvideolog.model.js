import mongoose from "mongoose";

const watchVideoLogSchema = new mongoose.Schema({
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
  watchedAt: {
    type: Date,
    default: Date.now
  },
  watchDuration: {
    type: Number, // Duration watched in seconds
    default: 0
  },
  completed: {
    type: Boolean,
    default: false
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
watchVideoLogSchema.index({ user: 1, watchedAt: -1 });
watchVideoLogSchema.index({ video: 1, watchedAt: -1 });
watchVideoLogSchema.index({ user: 1, video: 1 }, { unique: true }); // One log per user per video

// Virtual for formatted date
watchVideoLogSchema.virtual('formattedDate').get(function() {
  return this.watchedAt.toLocaleDateString();
});

// Ensure virtuals are serialized
watchVideoLogSchema.set('toJSON', { virtuals: true });
watchVideoLogSchema.set('toObject', { virtuals: true });

const WatchVideoLog = mongoose.model("WatchVideoLog", watchVideoLogSchema);
export default WatchVideoLog;
