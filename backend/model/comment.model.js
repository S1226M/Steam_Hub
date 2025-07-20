import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
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
  content: { 
    type: String, 
    required: true,
    trim: true
  },
  parentComment: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Comment",
    default: null
  },
  replies: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Comment" 
  }],
  likes: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  }],
  isDeleted: { 
    type: Boolean, 
    default: false 
  }
}, { 
  timestamps: true 
});

const Comment = mongoose.model("Comment", commentSchema);
export default Comment;
