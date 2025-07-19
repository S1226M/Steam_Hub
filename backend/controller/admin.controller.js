import Admin from "../model/admin.model.js";
import User from "../model/user.model.js";
import Video from "../model/video.model.js";
import Comment from "../model/comment.model.js";
import Subscription from "../model/subscription.model.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// ✅ CREATE ADMIN
export const createAdmin = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      fullName,
      role = 'admin',
      department = 'general',
      permissions = {},
      createdBy
    } = req.body;

    // Validation
    if (!username || !email || !password || !fullName) {
      return res.status(400).json({
        success: false,
        message: "Username, email, password, and fullName are required"
      });
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({
      $or: [{ email }, { username }]
    });

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: "Admin with this email or username already exists"
      });
    }

    // Create admin
    const admin = await Admin.create({
      username,
      email,
      password,
      fullName,
      role,
      department,
      permissions,
      metadata: { createdBy }
    });

    // Remove sensitive data
    const adminResponse = admin.toObject();
    delete adminResponse.password;
    delete adminResponse.twoFactorSecret;
    delete adminResponse.backupCodes;

    res.status(201).json({
      success: true,
      message: "Admin created successfully",
      data: adminResponse
    });

  } catch (error) {
    console.error("Create Admin Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// ✅ ADMIN LOGIN
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    // Find admin
    const admin = await Admin.findOne({ email, isDeleted: false });
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // Check if admin can login
    if (!admin.canLogin) {
      return res.status(401).json({
        success: false,
        message: "Account is locked or inactive"
      });
    }

    // Check password
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      await admin.incLoginAttempts();
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // Reset login attempts on successful login
    await admin.resetLoginAttempts();

    // Update last login
    await Admin.findByIdAndUpdate(admin._id, {
      lastLogin: new Date(),
      lastLoginIP: req.ip
    });

    // Log activity
    await admin.logActivity(
      'login',
      'Admin logged in successfully',
      'admin',
      admin._id,
      req.ip,
      req.get('User-Agent')
    );

    // Remove sensitive data
    const adminResponse = admin.toObject();
    delete adminResponse.password;
    delete adminResponse.twoFactorSecret;
    delete adminResponse.backupCodes;

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: adminResponse
    });

  } catch (error) {
    console.error("Admin Login Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// ✅ GET ALL ADMINS
export const getAllAdmins = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, department, status } = req.query;

    // Build query
    const query = { isDeleted: false };
    if (role) query.role = role;
    if (department) query.department = department;
    if (status) query.status = status;

    // Pagination
    const skip = (page - 1) * limit;

    // Get admins
    const admins = await Admin.find(query)
      .select('-password -twoFactorSecret -backupCodes')
      .populate('metadata.createdBy', 'username fullName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const totalAdmins = await Admin.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        admins,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalAdmins / limit),
          totalAdmins,
          hasNextPage: skip + admins.length < totalAdmins,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error("Get All Admins Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// ✅ GET SINGLE ADMIN
export const getAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;

    const admin = await Admin.findById(adminId)
      .select('-password -twoFactorSecret -backupCodes')
      .populate('metadata.createdBy', 'username fullName');

    if (!admin || admin.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Admin not found"
      });
    }

    res.status(200).json({
      success: true,
      data: admin
    });

  } catch (error) {
    console.error("Get Admin Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// ✅ UPDATE ADMIN
export const updateAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;
    const {
      username,
      email,
      fullName,
      role,
      department,
      permissions,
      status,
      preferences,
      contact
    } = req.body;

    const admin = await Admin.findById(adminId);
    if (!admin || admin.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Admin not found"
      });
    }

    // Check if email/username already exists
    if (email && email !== admin.email) {
      const existingAdmin = await Admin.findOne({ email, _id: { $ne: adminId } });
      if (existingAdmin) {
        return res.status(400).json({
          success: false,
          message: "Email already exists"
        });
      }
    }

    if (username && username !== admin.username) {
      const existingAdmin = await Admin.findOne({ username, _id: { $ne: adminId } });
      if (existingAdmin) {
        return res.status(400).json({
          success: false,
          message: "Username already exists"
        });
      }
    }

    // Update fields
    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (fullName) updateData.fullName = fullName;
    if (role) updateData.role = role;
    if (department) updateData.department = department;
    if (permissions) updateData.permissions = permissions;
    if (status) updateData.status = status;
    if (preferences) updateData.preferences = preferences;
    if (contact) updateData.contact = contact;

    const updatedAdmin = await Admin.findByIdAndUpdate(
      adminId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -twoFactorSecret -backupCodes');

    res.status(200).json({
      success: true,
      message: "Admin updated successfully",
      data: updatedAdmin
    });

  } catch (error) {
    console.error("Update Admin Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// ✅ DELETE ADMIN (SOFT DELETE)
export const deleteAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;
    const { deletedBy } = req.body;

    const admin = await Admin.findById(adminId);
    if (!admin || admin.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Admin not found"
      });
    }

    // Prevent deleting super admin
    if (admin.role === 'super_admin') {
      return res.status(403).json({
        success: false,
        message: "Cannot delete super admin"
      });
    }

    // Soft delete
    await Admin.findByIdAndUpdate(adminId, {
      isDeleted: true,
      isActive: false,
      status: 'inactive'
    });

    res.status(200).json({
      success: true,
      message: "Admin deleted successfully"
    });

  } catch (error) {
    console.error("Delete Admin Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// ✅ CHANGE ADMIN PASSWORD
export const changePassword = async (req, res) => {
  try {
    const { adminId } = req.params;
    const { currentPassword, newPassword } = req.body;

    const admin = await Admin.findById(adminId);
    if (!admin || admin.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Admin not found"
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await admin.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect"
      });
    }

    // Update password
    admin.password = newPassword;
    await admin.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully"
    });

  } catch (error) {
    console.error("Change Password Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// ✅ RESET ADMIN PASSWORD
export const resetPassword = async (req, res) => {
  try {
    const { adminId } = req.params;
    const { newPassword, resetBy } = req.body;

    const admin = await Admin.findById(adminId);
    if (!admin || admin.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Admin not found"
      });
    }

    // Update password
    admin.password = newPassword;
    await admin.save();

    // Log activity
    await admin.logActivity(
      'password_reset',
      `Password reset by ${resetBy}`,
      'admin',
      admin._id,
      req.ip,
      req.get('User-Agent')
    );

    res.status(200).json({
      success: true,
      message: "Password reset successfully"
    });

  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// ✅ UNLOCK ADMIN ACCOUNT
export const unlockAccount = async (req, res) => {
  try {
    const { adminId } = req.params;
    const { unlockedBy } = req.body;

    const admin = await Admin.findById(adminId);
    if (!admin || admin.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Admin not found"
      });
    }

    // Unlock account
    await Admin.findByIdAndUpdate(adminId, {
      loginAttempts: 0,
      lockUntil: null,
      status: 'active'
    });

    // Log activity
    await admin.logActivity(
      'account_unlocked',
      `Account unlocked by ${unlockedBy}`,
      'admin',
      admin._id,
      req.ip,
      req.get('User-Agent')
    );

    res.status(200).json({
      success: true,
      message: "Account unlocked successfully"
    });

  } catch (error) {
    console.error("Unlock Account Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// ✅ GET ADMIN ACTIVITY LOG
export const getActivityLog = async (req, res) => {
  try {
    const { adminId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const admin = await Admin.findById(adminId);
    if (!admin || admin.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Admin not found"
      });
    }

    const activityLog = admin.activityLog;
    const totalActivities = activityLog.length;
    const skip = (page - 1) * limit;
    const paginatedActivities = activityLog.slice(skip, skip + parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        activities: paginatedActivities,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalActivities / limit),
          totalActivities,
          hasNextPage: skip + paginatedActivities.length < totalActivities,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error("Get Activity Log Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// ✅ GET ADMIN STATISTICS
export const getAdminStats = async (req, res) => {
  try {
    const stats = await Admin.getStats();

    res.status(200).json({
      success: true,
      data: stats[0] || {
        totalAdmins: 0,
        activeAdmins: 0,
        superAdmins: 0,
        admins: 0,
        moderators: 0,
        support: 0
      }
    });

  } catch (error) {
    console.error("Get Admin Stats Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// ✅ GET ADMINS BY ROLE
export const getAdminsByRole = async (req, res) => {
  try {
    const { role } = req.params;

    const admins = await Admin.getByRole(role)
      .select('-password -twoFactorSecret -backupCodes');

    res.status(200).json({
      success: true,
      data: admins
    });

  } catch (error) {
    console.error("Get Admins By Role Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// ✅ GET ADMINS BY DEPARTMENT
export const getAdminsByDepartment = async (req, res) => {
  try {
    const { department } = req.params;

    const admins = await Admin.getByDepartment(department);

    res.status(200).json({
      success: true,
      data: admins
    });

  } catch (error) {
    console.error("Get Admins By Department Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// ✅ UPDATE ADMIN PREFERENCES
export const updatePreferences = async (req, res) => {
  try {
    const { adminId } = req.params;
    const { preferences } = req.body;

    const admin = await Admin.findById(adminId);
    if (!admin || admin.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Admin not found"
      });
    }

    const updatedAdmin = await Admin.findByIdAndUpdate(
      adminId,
      { preferences },
      { new: true, runValidators: true }
    ).select('-password -twoFactorSecret -backupCodes');

    res.status(200).json({
      success: true,
      message: "Preferences updated successfully",
      data: updatedAdmin
    });

  } catch (error) {
    console.error("Update Preferences Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// ✅ VALIDATE ADMIN PERMISSIONS
export const validatePermissions = async (req, res) => {
  try {
    const { adminId } = req.params;
    const { permissions } = req.body;

    const admin = await Admin.findById(adminId);
    if (!admin || admin.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Admin not found"
      });
    }

    const permissionResults = {};
    permissions.forEach(permission => {
      permissionResults[permission] = admin.hasPermission(permission);
    });

    res.status(200).json({
      success: true,
      data: {
        adminId: admin._id,
        role: admin.role,
        permissions: permissionResults
      }
    });

  } catch (error) {
    console.error("Validate Permissions Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// ✅ GET SYSTEM OVERVIEW (DASHBOARD DATA)
export const getSystemOverview = async (req, res) => {
  try {
    // Get counts from different collections
    const userCount = await User.countDocuments({ isDeleted: false });
    const videoCount = await Video.countDocuments({ isDeleted: false });
    const commentCount = await Comment.countDocuments({ isDeleted: false });
    const subscriptionCount = await Subscription.countDocuments({ 
      status: { $in: ['active', 'trial'] },
      isDeleted: false 
    });

    // Get admin stats
    const adminStats = await Admin.getStats();

    // Get recent activities (last 10 admin activities)
    const recentActivities = await Admin.aggregate([
      { $match: { isDeleted: false } },
      { $unwind: '$activityLog' },
      { $sort: { 'activityLog.timestamp': -1 } },
      { $limit: 10 },
      {
        $project: {
          adminName: '$fullName',
          action: '$activityLog.action',
          description: '$activityLog.description',
          timestamp: '$activityLog.timestamp'
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        counts: {
          users: userCount,
          videos: videoCount,
          comments: commentCount,
          activeSubscriptions: subscriptionCount
        },
        adminStats: adminStats[0] || {},
        recentActivities
      }
    });

  } catch (error) {
    console.error("Get System Overview Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// ✅ SEARCH ADMINS
export const searchAdmins = async (req, res) => {
  try {
    const { q, role, department, status } = req.query;
    const { page = 1, limit = 10 } = req.query;

    // Build search query
    const searchQuery = { isDeleted: false };
    
    if (q) {
      searchQuery.$or = [
        { username: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { fullName: { $regex: q, $options: 'i' } }
      ];
    }
    
    if (role) searchQuery.role = role;
    if (department) searchQuery.department = department;
    if (status) searchQuery.status = status;

    // Pagination
    const skip = (page - 1) * limit;

    // Search admins
    const admins = await Admin.find(searchQuery)
      .select('-password -twoFactorSecret -backupCodes')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const totalAdmins = await Admin.countDocuments(searchQuery);

    res.status(200).json({
      success: true,
      data: {
        admins,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalAdmins / limit),
          totalAdmins,
          hasNextPage: skip + admins.length < totalAdmins,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error("Search Admins Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export default {
  createAdmin,
  adminLogin,
  getAllAdmins,
  getAdmin,
  updateAdmin,
  deleteAdmin,
  changePassword,
  resetPassword,
  unlockAccount,
  getActivityLog,
  getAdminStats,
  getAdminsByRole,
  getAdminsByDepartment,
  updatePreferences,
  validatePermissions,
  getSystemOverview,
  searchAdmins
}; 