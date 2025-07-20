import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Video from '../model/video.model.js';
import User from '../model/user.model.js';

dotenv.config();

const checkDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/streamhub');
    console.log('Connected to MongoDB');

    const videoCount = await Video.countDocuments();
    const userCount = await User.countDocuments();
    
    console.log(`📊 Database Status:`);
    console.log(`   Videos: ${videoCount}`);
    console.log(`   Users: ${userCount}`);
    
    if (videoCount > 0) {
      const videos = await Video.find().limit(3);
      console.log('\n📺 Sample videos:');
      videos.forEach(video => {
        console.log(`   - ${video.title}`);
      });
    }
    
    if (userCount > 0) {
      const users = await User.find().limit(3);
      console.log('\n👥 Sample users:');
      users.forEach(user => {
        console.log(`   - ${user.fullname} (${user.role || 'user'})`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking database:', error);
    process.exit(1);
  }
};

checkDatabase(); 