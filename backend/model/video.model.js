const videoSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String },
  videoUrl:    { type: String, required: true },
  thumbnail:   { type: String, required: true },
  duration:    { type: Number },
  owner:       { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  views:       { type: Number, default: 0 },
  isPublic:    { type: Boolean, default: true },
  isPremium:   { type: Boolean, default: false },
  category:    { type: String, enum: ["Education", "Music", "Technology", "Entertainment", "Lifestyle", "General"], default: "General" }
}, { timestamps: true });

export const Video = mongoose.model("Video", videoSchema);
