import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true,
    minlength: [1, "Playlist name cannot be empty"],
    maxlength: [100, "Playlist name cannot exceed 100 characters"]
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, "Description cannot exceed 500 characters"],
    default: ""
  },
  videos: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Video" 
  }],
  isPublic: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true 
});

// Indexes for better query performance
playlistSchema.index({ user: 1, name: 1 }, { unique: true }); // One playlist per name per user
playlistSchema.index({ user: 1, updatedAt: -1 });
playlistSchema.index({ isPublic: 1, updatedAt: -1 });

// Virtual for video count
playlistSchema.virtual('videoCount').get(function() {
  return this.videos.length;
});

// Ensure virtuals are serialized
playlistSchema.set('toJSON', { virtuals: true });
playlistSchema.set('toObject', { virtuals: true });

const Playlist = mongoose.model("Playlist", playlistSchema);
export default Playlist;
