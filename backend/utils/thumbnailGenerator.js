import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegStatic);

const unlinkAsync = promisify(fs.unlink);

/**
 * Generate thumbnail from video file
 * @param {string} videoPath - Path to the video file
 * @param {string} outputDir - Directory to save the thumbnail
 * @param {number} time - Time in seconds to capture thumbnail (default: 5 seconds)
 * @param {number} width - Thumbnail width (default: 320)
 * @param {number} height - Thumbnail height (default: 180)
 * @returns {Promise<string>} - Path to the generated thumbnail
 */
export const generateThumbnail = async (
  videoPath, 
  outputDir, 
  time = 5, 
  width = 320, 
  height = 180
) => {
  return new Promise((resolve, reject) => {
    // Create unique filename
    const timestamp = Date.now();
    const thumbnailName = `thumbnail_${timestamp}.jpg`;
    const thumbnailPath = path.join(outputDir, thumbnailName);

    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    ffmpeg(videoPath)
      .screenshots({
        timestamps: [time],
        filename: thumbnailName,
        folder: outputDir,
        size: `${width}x${height}`
      })
      .on('end', () => {
        console.log(`✅ Thumbnail generated: ${thumbnailPath}`);
        resolve(thumbnailPath);
      })
      .on('error', (err) => {
        console.error('❌ Thumbnail generation error:', err);
        reject(err);
      });
  });
};

/**
 * Generate multiple thumbnails at different timestamps
 * @param {string} videoPath - Path to the video file
 * @param {string} outputDir - Directory to save thumbnails
 * @param {number[]} timestamps - Array of timestamps in seconds
 * @param {number} width - Thumbnail width
 * @param {number} height - Thumbnail height
 * @returns {Promise<string[]>} - Array of thumbnail paths
 */
export const generateMultipleThumbnails = async (
  videoPath,
  outputDir,
  timestamps = [5, 15, 30],
  width = 320,
  height = 180
) => {
  return new Promise((resolve, reject) => {
    const timestamp = Date.now();
    const thumbnailNames = timestamps.map((_, index) => `thumbnail_${timestamp}_${index}.jpg`);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    ffmpeg(videoPath)
      .screenshots({
        timestamps: timestamps,
        filename: thumbnailNames,
        folder: outputDir,
        size: `${width}x${height}`
      })
      .on('end', () => {
        const thumbnailPaths = thumbnailNames.map(name => path.join(outputDir, name));
        console.log(`✅ Generated ${thumbnailPaths.length} thumbnails`);
        resolve(thumbnailPaths);
      })
      .on('error', (err) => {
        console.error('❌ Multiple thumbnails generation error:', err);
        reject(err);
      });
  });
};

/**
 * Get video duration and generate thumbnail at 20% of duration
 * @param {string} videoPath - Path to the video file
 * @param {string} outputDir - Directory to save the thumbnail
 * @returns {Promise<{thumbnailPath: string, duration: number}>}
 */
export const generateSmartThumbnail = async (videoPath, outputDir) => {
  return new Promise((resolve, reject) => {
    // First get video duration
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        console.error('❌ Error getting video metadata:', err);
        reject(err);
        return;
      }

      const duration = metadata.format.duration;
      const thumbnailTime = Math.max(5, Math.floor(duration * 0.2)); // 20% of duration, minimum 5 seconds

      console.log(`📹 Video duration: ${duration}s, generating thumbnail at ${thumbnailTime}s`);

      generateThumbnail(videoPath, outputDir, thumbnailTime, 320, 180)
        .then(thumbnailPath => {
          resolve({ thumbnailPath, duration });
        })
        .catch(reject);
    });
  });
};

/**
 * Clean up thumbnail files
 * @param {string} thumbnailPath - Path to the thumbnail file
 */
export const cleanupThumbnail = async (thumbnailPath) => {
  try {
    if (fs.existsSync(thumbnailPath)) {
      await unlinkAsync(thumbnailPath);
      console.log(`🗑️ Cleaned up thumbnail: ${thumbnailPath}`);
    }
  } catch (error) {
    console.error('⚠️ Failed to cleanup thumbnail:', error.message);
  }
};

export default {
  generateThumbnail,
  generateMultipleThumbnails,
  generateSmartThumbnail,
  cleanupThumbnail
}; 