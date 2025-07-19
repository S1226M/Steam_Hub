import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
  // User reference
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },

  // Subscription plan details
  plan: {
    type: String,
    enum: ['basic', 'premium', 'pro', 'enterprise'],
    required: true,
    default: 'basic'
  },

  // Plan features and limits
  planDetails: {
    name: { type: String, required: true },
    price: { type: Number, required: true }, // Price in cents
    currency: { type: String, default: 'USD' },
    interval: { type: String, enum: ['monthly', 'yearly'], required: true },
    features: [{
      name: { type: String, required: true },
      description: { type: String },
      limit: { type: Number }, // -1 for unlimited
      current: { type: Number, default: 0 }
    }],
    maxVideos: { type: Number, default: 10 },
    maxStorage: { type: Number, default: 1024 }, // in MB
    maxPlaylists: { type: Number, default: 5 },
    adFree: { type: Boolean, default: false },
    hdQuality: { type: Boolean, default: false },
    downloadEnabled: { type: Boolean, default: false },
    prioritySupport: { type: Boolean, default: false }
  },

  // Payment information
  payment: {
    provider: { type: String, enum: ['stripe', 'paypal', 'razorpay'], required: true },
    paymentMethodId: { type: String },
    customerId: { type: String },
    subscriptionId: { type: String }, // External subscription ID
    invoiceId: { type: String },
    amount: { type: Number, required: true }, // Amount in cents
    currency: { type: String, default: 'USD' },
    status: { 
      type: String, 
      enum: ['pending', 'active', 'cancelled', 'expired', 'failed', 'refunded'],
      default: 'pending'
    },
    lastPaymentDate: { type: Date },
    nextBillingDate: { type: Date },
    trialEndDate: { type: Date }
  },

  // Subscription status and dates
  status: {
    type: String,
    enum: ['active', 'inactive', 'cancelled', 'expired', 'trial', 'past_due'],
    default: 'inactive'
  },

  // Subscription periods
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  cancelledAt: { type: Date },
  trialStartDate: { type: Date },
  trialEndDate: { type: Date },

  // Billing cycle
  billingCycle: {
    type: String,
    enum: ['monthly', 'yearly'],
    required: true
  },

  // Auto-renewal settings
  autoRenew: { type: Boolean, default: true },
  cancelAtPeriodEnd: { type: Boolean, default: false },

  // Usage tracking
  usage: {
    videosUploaded: { type: Number, default: 0 },
    storageUsed: { type: Number, default: 0 }, // in MB
    playlistsCreated: { type: Number, default: 0 },
    downloadsUsed: { type: Number, default: 0 }
  },

  // Discount and promotions
  discount: {
    code: { type: String },
    percentage: { type: Number, default: 0 },
    amount: { type: Number, default: 0 }, // Fixed amount discount in cents
    validUntil: { type: Date }
  },

  // Payment history
  paymentHistory: [{
    date: { type: Date, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    status: { type: String, required: true },
    invoiceId: { type: String },
    paymentMethod: { type: String },
    description: { type: String }
  }],

  // Subscription changes history
  changes: [{
    date: { type: Date, required: true },
    fromPlan: { type: String },
    toPlan: { type: String },
    reason: { type: String },
    initiatedBy: { type: String, enum: ['user', 'admin', 'system'] }
  }],

  // Metadata
  metadata: {
    source: { type: String, default: 'web' }, // web, mobile, api
    referrer: { type: String },
    campaign: { type: String },
    notes: { type: String }
  },

  // Admin fields
  isActive: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Indexes for better query performance
subscriptionSchema.index({ user: 1, status: 1 });
subscriptionSchema.index({ 'payment.subscriptionId': 1 });
subscriptionSchema.index({ 'payment.customerId': 1 });
subscriptionSchema.index({ endDate: 1 });
subscriptionSchema.index({ status: 1, endDate: 1 });

// Virtual for subscription duration
subscriptionSchema.virtual('duration').get(function() {
  if (this.startDate && this.endDate) {
    return Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24));
  }
  return 0;
});

// Virtual for days remaining
subscriptionSchema.virtual('daysRemaining').get(function() {
  if (this.endDate) {
    const remaining = Math.ceil((this.endDate - new Date()) / (1000 * 60 * 60 * 24));
    return remaining > 0 ? remaining : 0;
  }
  return 0;
});

// Virtual for is expired
subscriptionSchema.virtual('isExpired').get(function() {
  return this.endDate && new Date() > this.endDate;
});

// Virtual for is in trial
subscriptionSchema.virtual('isInTrial').get(function() {
  return this.trialEndDate && new Date() < this.trialEndDate;
});

// Virtual for formatted price
subscriptionSchema.virtual('formattedPrice').get(function() {
  const price = this.planDetails.price / 100; // Convert cents to dollars
  return `$${price.toFixed(2)}`;
});

// Ensure virtuals are serialized
subscriptionSchema.set('toJSON', { virtuals: true });
subscriptionSchema.set('toObject', { virtuals: true });

// Pre-save middleware to update user subscription status
subscriptionSchema.pre('save', async function(next) {
  if (this.isModified('status') || this.isNew) {
    try {
      const User = mongoose.model('User');
      await User.findByIdAndUpdate(this.user, {
        subscription: this.plan,
        isActive: this.status === 'active' || this.status === 'trial'
      });
    } catch (error) {
      console.error('Error updating user subscription status:', error);
    }
  }
  next();
});

// Static method to get active subscriptions
subscriptionSchema.statics.getActiveSubscriptions = function() {
  return this.find({
    status: { $in: ['active', 'trial'] },
    endDate: { $gt: new Date() },
    isActive: true,
    isDeleted: false
  }).populate('user', 'username email');
};

// Static method to get expiring subscriptions
subscriptionSchema.statics.getExpiringSubscriptions = function(days = 7) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  
  return this.find({
    status: { $in: ['active', 'trial'] },
    endDate: { $lte: date, $gt: new Date() },
    isActive: true,
    isDeleted: false
  }).populate('user', 'username email');
};

// Instance method to check if user can upload video
subscriptionSchema.methods.canUploadVideo = function() {
  if (this.status !== 'active' && this.status !== 'trial') return false;
  return this.usage.videosUploaded < this.planDetails.maxVideos;
};

// Instance method to check if user can use storage
subscriptionSchema.methods.canUseStorage = function(sizeInMB) {
  if (this.status !== 'active' && this.status !== 'trial') return false;
  return (this.usage.storageUsed + sizeInMB) <= this.planDetails.maxStorage;
};

// Instance method to check if user can create playlist
subscriptionSchema.methods.canCreatePlaylist = function() {
  if (this.status !== 'active' && this.status !== 'trial') return false;
  return this.usage.playlistsCreated < this.planDetails.maxPlaylists;
};

// Instance method to check if user can download
subscriptionSchema.methods.canDownload = function() {
  if (this.status !== 'active' && this.status !== 'trial') return false;
  return this.planDetails.downloadEnabled;
};

// Instance method to check if user has HD quality
subscriptionSchema.methods.hasHDQuality = function() {
  if (this.status !== 'active' && this.status !== 'trial') return false;
  return this.planDetails.hdQuality;
};

// Instance method to check if user has ad-free experience
subscriptionSchema.methods.isAdFree = function() {
  if (this.status !== 'active' && this.status !== 'trial') return false;
  return this.planDetails.adFree;
};

const Subscription = mongoose.model("Subscription", subscriptionSchema);
export default Subscription;
