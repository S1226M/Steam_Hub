import express from "express";
import User from "../model/user.model.js";
import cloudinary from "../config/cloudnary.js";
import fs from "fs";

// Fetch all users (Admin)
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.send(users);
    } catch (error) {
        res.status(500).json({ message: "Error fetching users", error: error.message });
    }
};

const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password"); // exclude password
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ data: user });
    } catch (error) {
        res.status(500).json({ message: "Error fetching user", error: error.message });
    }
};

// Update user profile
const updateProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: "User not found" 
            });
        }

        // Check if user is updating their own profile
        if (req.user._id.toString() !== userId) {
            return res.status(403).json({ 
                success: false,
                message: "You can only update your own profile" 
            });
        }

        const updateData = {};

        // Handle text fields
        if (req.body.fullname) updateData.fullname = req.body.fullname;
        if (req.body.username) updateData.username = req.body.username;
        if (req.body.email) updateData.email = req.body.email;
        if (req.body.bio) updateData.bio = req.body.bio;

        // Handle profile image upload
        if (req.file) {
            try {
                // Upload to Cloudinary
                const result = await cloudinary.uploader.upload(req.file.path, {
                    folder: "profile-images",
                    transformation: [
                        { width: 200, height: 200, crop: "fill" }
                    ]
                });

                updateData.profileimage = result.secure_url;

                // Clean up temp file
                try {
                    fs.unlinkSync(req.file.path);
                } catch (cleanupError) {
                    console.log("⚠️ Failed to cleanup profile image file:", cleanupError.message);
                }

                console.log("✅ Profile image uploaded to Cloudinary:", result.public_id);
            } catch (uploadError) {
                console.error("❌ Profile image upload failed:", uploadError.message);
                return res.status(500).json({ 
                    success: false,
                    message: "Failed to upload profile image" 
                });
            }
        }

        // Update user
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        ).select("-password");

        console.log("✅ Profile updated successfully:", updatedUser._id);

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: updatedUser
        });

    } catch (error) {
        console.error("❌ Profile update error:", error);
        res.status(500).json({ 
            success: false,
            message: "Failed to update profile",
            error: error.message 
        });
    }
};

export default {
    getAllUsers,
    getUserById,
    updateProfile
}