import mongoose from "mongoose";

const liveStreamSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    streamKey: {
      type: String,
      required: true,
      unique: true,
    },
    streamUrl: {
      type: String,
      required: true,
    },
    hlsUrl: {
      type: String,
      default: null,
    },
    dashUrl: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["created", "live", "ended", "stopped"],
      default: "created",
    },
    type: {
      type: String,
      enum: ["rtmp", "webrtc"],
      default: "rtmp",
    },
    roomId: {
      type: String,
      default: null,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    viewerCount: {
      type: Number,
      default: 0,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    endedAt: {
      type: Date,
      default: null,
    },
    duration: {
      type: Number, // in seconds
      default: 0,
    },
    recordingUrl: {
      type: String,
      default: null,
    },
    thumbnail: {
      type: String,
      default: null,
    },
    tags: [{
      type: String,
      trim: true,
    }],
    category: {
      type: String,
      default: "general",
    },
    settings: {
      quality: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "medium",
      },
      maxViewers: {
        type: Number,
        default: 100,
      },
      chatEnabled: {
        type: Boolean,
        default: true,
      },
      recordingEnabled: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
liveStreamSchema.index({ userId: 1, createdAt: -1 });
liveStreamSchema.index({ status: 1, type: 1 });
liveStreamSchema.index({ roomId: 1 });

// Virtual for stream duration
liveStreamSchema.virtual('durationInMinutes').get(function() {
  if (this.startedAt && this.endedAt) {
    return Math.round((this.endedAt - this.startedAt) / 1000 / 60);
  }
  return 0;
});

// Method to update viewer count
liveStreamSchema.methods.updateViewerCount = function(count) {
  this.viewerCount = count;
  return this.save();
};

// Method to start stream
liveStreamSchema.methods.startStream = function() {
  this.status = "live";
  this.startedAt = new Date();
  return this.save();
};

// Method to stop stream
liveStreamSchema.methods.stopStream = function() {
  this.status = "ended";
  this.endedAt = new Date();
  if (this.startedAt) {
    this.duration = Math.round((this.endedAt - this.startedAt) / 1000);
  }
  return this.save();
};

const LiveStream = mongoose.model("LiveStream", liveStreamSchema);

export default LiveStream; 