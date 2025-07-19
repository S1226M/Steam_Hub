// admin schema

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const adminSchema = new mongoose.Schema({
  // Basic Information
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: [3, "Username must be at least 3 characters"],
    maxlength: [30, "Username cannot exceed 30 characters"]
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"]
  },
  password: {
    type: String,
    required: true,
    minlength: [6, "Password must be at least 6 characters"]
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, "Full name cannot exceed 100 characters"]
  },
  avatar: {
    type: String,
    default: null
  },

  // Admin Role and Permissions
  role: {
    type: String,
    enum: ['super_admin', 'admin', 'moderator', 'support'],
    default: 'admin',
    required: true
  },
  permissions: {
    // User Management
    canManageUsers: { type: Boolean, default: false },
    canDeleteUsers: { type: Boolean, default: false },
    canBlockUsers: { type: Boolean, default: false },
    canViewUserData: { type: Boolean, default: false },
    
    // Content Management
    canManageVideos: { type: Boolean, default: false },
    canDeleteVideos: { type: Boolean, default: false },
    canApproveVideos: { type: Boolean, default: false },
    canManageComments: { type: Boolean, default: false },
    canDeleteComments: { type: Boolean, default: false },
    canManagePlaylists: { type: Boolean, default: false },
    
    // Subscription Management
    canManageSubscriptions: { type: Boolean, default: false },
    canViewPaymentHistory: { type: Boolean, default: false },
    canRefundPayments: { type: Boolean, default: false },
    canManagePlans: { type: Boolean, default: false },
    
    // System Management
    canViewAnalytics: { type: Boolean, default: false },
    canManageSettings: { type: Boolean, default: false },
    canViewLogs: { type: Boolean, default: false },
    canManageAdmins: { type: Boolean, default: false },
    
    // Content Moderation
    canModerateContent: { type: Boolean, default: false },
    canFlagContent: { type: Boolean, default: false },
    canReviewReports: { type: Boolean, default: false },
    
    // Financial Management
    canViewRevenue: { type: Boolean, default: false },
    canManageDiscounts: { type: Boolean, default: false },
    canViewFinancialReports: { type: Boolean, default: false }
  },

  // Admin Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'pending'],
    default: 'pending'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  },

  // Security and Access
  lastLogin: {
    type: Date,
    default: null
  },
  lastLoginIP: {
    type: String,
    default: null
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date,
    default: null
  },
  passwordChangedAt: {
    type: Date,
    default: null
  },
  passwordResetToken: {
    type: String,
    default: null
  },
  passwordResetExpires: {
    type: Date,
    default: null
  },

  // Two-Factor Authentication
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: {
    type: String,
    default: null
  },
  backupCodes: [{
    code: { type: String },
    used: { type: Boolean, default: false },
    usedAt: { type: Date }
  }],

  // Admin Activity Tracking
  activityLog: [{
    action: { type: String, required: true },
    description: { type: String },
    targetType: { type: String }, // user, video, comment, etc.
    targetId: { type: mongoose.Schema.Types.ObjectId },
    ipAddress: { type: String },
    userAgent: { type: String },
    timestamp: { type: Date, default: Date.now }
  }],

  // Admin Preferences
  preferences: {
    language: { type: String, default: 'en' },
    timezone: { type: String, default: 'UTC' },
    theme: { type: String, enum: ['light', 'dark'], default: 'light' },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    },
    dashboard: {
      defaultView: { type: String, default: 'overview' },
      widgets: [{ type: String }]
    }
  },

  // Department and Assignment
  department: {
    type: String,
    enum: ['general', 'content', 'support', 'finance', 'technical', 'marketing'],
    default: 'general'
  },
  assignedRegions: [{
    type: String
  }],
  workingHours: {
    start: { type: String, default: '09:00' },
    end: { type: String, default: '17:00' },
    timezone: { type: String, default: 'UTC' }
  },

  // Performance Metrics
  performance: {
    totalActions: { type: Number, default: 0 },
    successfulActions: { type: Number, default: 0 },
    averageResponseTime: { type: Number, default: 0 }, // in milliseconds
    lastPerformanceReview: { type: Date },
    rating: { type: Number, min: 1, max: 5, default: 0 }
  },

  // Contact Information
  contact: {
    phone: { type: String },
    emergencyContact: {
      name: { type: String },
      phone: { type: String },
      relationship: { type: String }
    },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      country: { type: String },
      zipCode: { type: String }
    }
  },

  // Metadata
  metadata: {
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    notes: { type: String },
    tags: [{ type: String }]
  }
}, {
  timestamps: true
});

// Indexes for better query performance
adminSchema.index({ email: 1 });
adminSchema.index({ username: 1 });
adminSchema.index({ role: 1 });
adminSchema.index({ status: 1 });
adminSchema.index({ department: 1 });
adminSchema.index({ 'permissions.canManageUsers': 1 });
adminSchema.index({ createdAt: -1 });

// Virtual for full name
adminSchema.virtual('displayName').get(function() {
  return this.fullName || this.username;
});

// Virtual for is locked
adminSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Virtual for can login
adminSchema.virtual('canLogin').get(function() {
  return this.isActive && !this.isDeleted && !this.isLocked && this.status === 'active';
});

// Ensure virtuals are serialized
adminSchema.set('toJSON', { virtuals: true });
adminSchema.set('toObject', { virtuals: true });

// Pre-save middleware to hash password
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    this.passwordChangedAt = Date.now() - 1000; // 1 second ago
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to update password reset fields
adminSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();
  
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Instance method to compare password
adminSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to check if password was changed after token was issued
adminSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Instance method to increment login attempts
adminSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

// Instance method to reset login attempts
adminSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Instance method to check permission
adminSchema.methods.hasPermission = function(permission) {
  if (this.role === 'super_admin') return true;
  return this.permissions[permission] === true;
};

// Instance method to check multiple permissions
adminSchema.methods.hasAnyPermission = function(permissions) {
  if (this.role === 'super_admin') return true;
  return permissions.some(permission => this.permissions[permission] === true);
};

// Instance method to check all permissions
adminSchema.methods.hasAllPermissions = function(permissions) {
  if (this.role === 'super_admin') return true;
  return permissions.every(permission => this.permissions[permission] === true);
};

// Instance method to log activity
adminSchema.methods.logActivity = function(action, description, targetType, targetId, ipAddress, userAgent) {
  const activity = {
    action,
    description,
    targetType,
    targetId,
    ipAddress,
    userAgent,
    timestamp: new Date()
  };
  
  this.activityLog.push(activity);
  
  // Keep only last 100 activities
  if (this.activityLog.length > 100) {
    this.activityLog = this.activityLog.slice(-100);
  }
  
  return this.save();
};

// Static method to get admins by role
adminSchema.statics.getByRole = function(role) {
  return this.find({ role, isActive: true, isDeleted: false });
};

// Static method to get active admins
adminSchema.statics.getActiveAdmins = function() {
  return this.find({ 
    isActive: true, 
    isDeleted: false, 
    status: 'active' 
  }).select('-password -twoFactorSecret -backupCodes');
};

// Static method to get admin statistics
adminSchema.statics.getStats = function() {
  return this.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: null,
        totalAdmins: { $sum: 1 },
        activeAdmins: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
        superAdmins: { $sum: { $cond: [{ $eq: ['$role', 'super_admin'] }, 1, 0] } },
        admins: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } },
        moderators: { $sum: { $cond: [{ $eq: ['$role', 'moderator'] }, 1, 0] } },
        support: { $sum: { $cond: [{ $eq: ['$role', 'support'] }, 1, 0] } }
      }
    }
  ]);
};

// Static method to get admins by department
adminSchema.statics.getByDepartment = function(department) {
  return this.find({ 
    department, 
    isActive: true, 
    isDeleted: false 
  }).select('-password -twoFactorSecret -backupCodes');
};

const Admin = mongoose.model("Admin", adminSchema);
export default Admin;
