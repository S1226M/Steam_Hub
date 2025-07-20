import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Video from '../model/video.model.js';
import User from '../model/user.model.js';
import Like from '../model/like.model.js';
import Comment from '../model/comment.model.js';
import Playlist from '../model/playlist.model.js';
import Subscription from '../model/subscription.model.js';
import WatchVideoLog from '../model/watchvideolog.model.js';

dotenv.config();

const clearDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/streamhub');
    console.log('Connected to MongoDB');

    // Clear all collections
    console.log('Clearing all collections...');
    
    await Video.deleteMany({});
    console.log('✅ Cleared videos collection');
    
    await Like.deleteMany({});
    console.log('✅ Cleared likes collection');
    
    await Comment.deleteMany({});
    console.log('✅ Cleared comments collection');
    
    await Playlist.deleteMany({});
    console.log('✅ Cleared playlists collection');
    
    await Subscription.deleteMany({});
    console.log('✅ Cleared subscriptions collection');
    
    await WatchVideoLog.deleteMany({});
    console.log('✅ Cleared watch video logs collection');

    // Keep admin users but clear regular users
    const adminUsers = await User.find({ role: 'admin' });
    await User.deleteMany({ role: { $ne: 'admin' } });
    console.log(`✅ Cleared regular users (kept ${adminUsers.length} admin users)`);

    console.log('\n🎉 Database cleared successfully!');
    console.log('All demo content has been removed.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    process.exit(1);
  }
};

clearDatabase(); 