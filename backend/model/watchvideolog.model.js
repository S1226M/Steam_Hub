import mongoose from "mongoose";

const watchVideoLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  videoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Video",
    required: true,
    index: true
  },
  watchedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  watchDuration: {
    type: Number,
    default: 0 // Duration watched in seconds
  },
  completed: {
    type: Boolean,
    default: false // Whether the user watched the full video
  },
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  }
}, { 
  timestamps: true 
});

// Compound index to ensure one log per user per video per day
watchVideoLogSchema.index({ userId: 1, videoId: 1, watchedAt: 1 }, { unique: false });

// Index for querying user's watch history
watchVideoLogSchema.index({ userId: 1, watchedAt: -1 });

// Index for querying video's view statistics
watchVideoLogSchema.index({ videoId: 1, watchedAt: -1 });

const WatchVideoLog = mongoose.model("WatchVideoLog", watchVideoLogSchema);
export default WatchVideoLog;
