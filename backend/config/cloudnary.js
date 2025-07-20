// backend/config/cloudinary.js
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config(); // Load from .env

// Check if Cloudinary credentials are available
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.warn("⚠️ Cloudinary credentials not found in environment variables.");
  console.warn("Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file");
  console.warn("For now, using default configuration (this may not work for uploads)");
}

cloudinary.config({
  cloud_name: cloudName || 'demo',
  api_key: apiKey || 'demo',
  api_secret: apiSecret || 'demo',
  secure: true,
});

export default cloudinary;
