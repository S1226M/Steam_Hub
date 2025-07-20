import express from "express";
import User from "../model/user.model.js";

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

// Get user statistics
const getUserStats = async (req, res) => {
    try {
        const userId = req.user._id;
        
        // Get user data to calculate followers count
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        // Get user's video count, likes, comments, etc.
        const stats = {
            totalVideos: 0,
            totalLikes: 0,
            totalComments: 0,
            totalViews: 0,
            subscribers: user.followers ? user.followers.length : 0
        };

        // You can add more statistics here based on your models
        res.status(200).json({ stats });
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching user stats',
            error: error.message
        });
    }
};

export default {
    getAllUsers,
    getUserById,
    getUserStats
}