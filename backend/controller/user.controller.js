const User = require('../models/user.model');

// Fetch all users (Admin)
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json({ message: "All users fetched", data: users });
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