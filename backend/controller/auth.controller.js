import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../model/user.model.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

// User registration
export const signup = async (req, res) => {
    try {
        const { fullname, username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return res.status(400).json({
                message: existingUser.email === email 
                    ? 'Email already registered' 
                    : 'Username already taken'
            });
        }

        // Hash password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create new user
        const newUser = new User({
            fullname,
            username,
            email,
            password: hashedPassword
        });

        await newUser.save();

        // Generate token
        const token = generateToken(newUser._id);

        // Return user data (without password) and token
        const userResponse = {
            _id: newUser._id,
            fullname: newUser.fullname,
            username: newUser.username,
            email: newUser.email,
            profileimage: newUser.profileimage,
            roles: newUser.roles,
            subscription: newUser.subscription,
            isActive: newUser.isActive
        };

        res.status(201).json({
            message: 'User registered successfully',
            user: userResponse,
            token
        });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
            message: 'Error creating user',
            error: error.message
        });
    }
};

// User login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({
                message: 'Account is deactivated'
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }

        // Generate token
        const token = generateToken(user._id);

        // Return user data (without password) and token
        const userResponse = {
            _id: user._id,
            fullname: user.fullname,
            username: user.username,
            email: user.email,
            profileimage: user.profileimage,
            roles: user.roles,
            subscription: user.subscription,
            isActive: user.isActive
        };

        res.status(200).json({
            message: 'Login successful',
            user: userResponse,
            token
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            message: 'Error during login',
            error: error.message
        });
    }
};

// Get current user profile
export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.status(200).json({
            user
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            message: 'Error fetching profile',
            error: error.message
        });
    }
};

// Update user profile
export const updateProfile = async (req, res) => {
    try {
        const { fullname, username, email, profileimage } = req.body;
        const updateData = {};

        if (fullname) updateData.fullname = fullname;
        if (username) updateData.username = username;
        if (email) updateData.email = email;
        if (profileimage) updateData.profileimage = profileimage;

        // Check if username or email already exists (excluding current user)
        if (username || email) {
            const existingUser = await User.findOne({
                $or: [
                    ...(email ? [{ email }] : []),
                    ...(username ? [{ username }] : [])
                ],
                _id: { $ne: req.user._id }
            });

            if (existingUser) {
                return res.status(400).json({
                    message: existingUser.email === email 
                        ? 'Email already registered' 
                        : 'Username already taken'
                });
            }
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        res.status(200).json({
            message: 'Profile updated successfully',
            user: updatedUser
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            message: 'Error updating profile',
            error: error.message
        });
    }
};

// Change password
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Get user with password
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                message: 'Current password is incorrect'
            });
        }

        // Hash new password
        const saltRounds = 12;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

        // Update password
        user.password = hashedNewPassword;
        await user.save();

        res.status(200).json({
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            message: 'Error changing password',
            error: error.message
        });
    }
}; 