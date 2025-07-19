import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Video from '../model/video.model.js';
import User from '../model/user.model.js';

dotenv.config();

const sampleVideos = [
  {
    title: "Amazing Tech Review: Latest Smartphone 2024",
    description: "In this comprehensive review, we take a deep dive into the latest smartphone technology. From camera performance to battery life, we cover everything you need to know about this amazing device.",
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    thumbnail: "https://picsum.photos/320/180?random=1",
    duration: 754, // 12:34 in seconds
    views: 2100000,
    likesCount: 45000,
    isPublic: true,
    isPremium: false,
    category: "Technology",
    public_id: "sample_video_1"
  },
  {
    title: "Cooking Masterclass: Italian Pasta Secrets",
    description: "Learn the authentic Italian pasta cooking techniques from a master chef. Discover the secrets to perfect al dente pasta and delicious homemade sauces.",
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4",
    thumbnail: "https://picsum.photos/320/180?random=2",
    duration: 1125, // 18:45 in seconds
    views: 890000,
    likesCount: 23000,
    isPublic: true,
    isPremium: true,
    category: "Lifestyle",
    public_id: "sample_video_2"
  },
  {
    title: "Epic Gaming Moments: Battle Royale Highlights",
    description: "Watch the most incredible gaming moments from our latest battle royale session. Amazing plays, clutch victories, and epic fails that will keep you entertained!",
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4",
    thumbnail: "https://picsum.photos/320/180?random=3",
    duration: 1512, // 25:12 in seconds
    views: 5200000,
    likesCount: 125000,
    isPublic: true,
    isPremium: false,
    category: "Entertainment",
    public_id: "sample_video_3"
  },
  {
    title: "Travel Vlog: Exploring Hidden Beaches in Bali",
    description: "Join us on an incredible journey to discover the hidden beaches of Bali. From pristine white sand to crystal clear waters, this is paradise on earth.",
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    thumbnail: "https://picsum.photos/320/180?random=4",
    duration: 1938, // 32:18 in seconds
    views: 1400000,
    likesCount: 67000,
    isPublic: true,
    isPremium: false,
    category: "Lifestyle",
    public_id: "sample_video_4"
  },
  {
    title: "Workout Routine: Full Body HIIT Training",
    description: "Get ready for an intense full-body HIIT workout that will burn calories and build strength. Perfect for beginners and advanced fitness enthusiasts alike.",
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4",
    thumbnail: "https://picsum.photos/320/180?random=5",
    duration: 1713, // 28:33 in seconds
    views: 756000,
    likesCount: 34000,
    isPublic: true,
    isPremium: false,
    category: "Lifestyle",
    public_id: "sample_video_5"
  },
  {
    title: "Comedy Skit: Office Life is Crazy!",
    description: "A hilarious take on the daily struggles of office life. From coffee machine disasters to awkward elevator encounters, we've all been there!",
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4",
    thumbnail: "https://picsum.photos/320/180?random=6",
    duration: 525, // 8:45 in seconds
    views: 3800000,
    likesCount: 89000,
    isPublic: true,
    isPremium: false,
    category: "Entertainment",
    public_id: "sample_video_6"
  },
  {
    title: "Learn JavaScript: Complete Beginner's Guide",
    description: "Master JavaScript from scratch with this comprehensive tutorial. Perfect for beginners who want to start their programming journey.",
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    thumbnail: "https://picsum.photos/320/180?random=7",
    duration: 2400, // 40:00 in seconds
    views: 1200000,
    likesCount: 56000,
    isPublic: true,
    isPremium: false,
    category: "Education",
    public_id: "sample_video_7"
  },
  {
    title: "Top 10 Rock Songs of 2024",
    description: "Discover the best rock music of 2024 with our curated playlist. From classic rock to modern alternative, these songs will rock your world!",
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4",
    thumbnail: "https://picsum.photos/320/180?random=8",
    duration: 1800, // 30:00 in seconds
    views: 950000,
    likesCount: 42000,
    isPublic: true,
    isPremium: false,
    category: "Music",
    public_id: "sample_video_8"
  }
];

const seedVideos = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/streamhub');
    console.log('Connected to MongoDB');

    // Clear existing videos
    await Video.deleteMany({});
    console.log('Cleared existing videos');

    // Get a user to assign as owner (or create one if none exists)
    let user = await User.findOne();
    if (!user) {
      console.log('No users found, creating a sample user...');
      user = await User.create({
        fullname: 'Sample Creator',
        username: 'samplecreator',
        email: 'creator@example.com',
        password: 'password123'
      });
    }

    // Add owner to each video
    const videosWithOwner = sampleVideos.map(video => ({
      ...video,
      owner: user._id
    }));

    // Insert sample videos
    const insertedVideos = await Video.insertMany(videosWithOwner);
    console.log(`✅ Successfully seeded ${insertedVideos.length} videos`);

    // Display the created videos
    insertedVideos.forEach(video => {
      console.log(`- ${video.title} (ID: ${video._id})`);
    });

    console.log('\n🎉 Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedVideos(); 