import cloudinary from "../config/cloudnary.js";
import fs from "fs";

export const uploadVideo = async (req, res) => {
  try {
    const filePath = req.file.path;

    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "video",
      folder: "videos",
      eager: [
        {
          streaming_profile: "auto", // Cloudinary will create HLS renditions
          format: "m3u8",
        },
      ],
      eager_async: false,
    });

    fs.unlinkSync(filePath); // clean up temp file

    res.json({
      message: "🎥 HLS video uploaded",
      public_id: result.public_id,
      hls_url: result.eager?.[0]?.secure_url, // .m3u8 URL
      original_url: result.secure_url,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const deleteVideo = async (req, res) => {
  try {
    const { public_id } = req.params;
    const result = await cloudinary.uploader.destroy(public_id, {
      resource_type: "video",
    });

    res.json({ message: "🗑️ Video deleted", result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
