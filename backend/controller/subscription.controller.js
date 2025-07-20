import Subscription from "../model/subscription.model.js";
import User from "../model/user.model.js";

// Channel Subscription Functions (using User model's followers/following)

// ✅ CREATE SUBSCRIPTION
export const createSubscription = async (req, res) => {
  try {
    const { 
      userId, 
      plan, 
      billingCycle, 
      paymentProvider, 
      paymentMethodId,
      discountCode,
      trialDays = 0
    } = req.body;

    // Validation
    if (!userId || !plan || !billingCycle || !paymentProvider) {
      return res.status(400).json({
        success: false,
        message: "userId, plan, billingCycle, and paymentProvider are required"
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check if user already has an active subscription
    const existingSubscription = await Subscription.findOne({
      user: userId,
      status: { $in: ['active', 'trial'] },
      isActive: true,
      isDeleted: false
    });

    if (existingSubscription) {
      return res.status(400).json({
        success: false,
        message: "User already has an active subscription"
      });
    }

    // Define plan details based on plan type
    const planDetails = getPlanDetails(plan, billingCycle);
    
    // Calculate dates
    const startDate = new Date();
    const endDate = new Date();
    const trialEndDate = trialDays > 0 ? new Date(startDate.getTime() + trialDays * 24 * 60 * 60 * 1000) : null;
    
    if (billingCycle === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    // Apply discount if provided
    let finalAmount = planDetails.price;
    let discount = { code: null, percentage: 0, amount: 0 };
    
    if (discountCode) {
      const discountResult = await applyDiscount(discountCode, planDetails.price);
      if (discountResult) {
        finalAmount = discountResult.finalAmount;
        discount = discountResult.discount;
      }
    }

    // Create subscription
    const subscription = await Subscription.create({
      user: userId,
      plan,
      planDetails: {
        ...planDetails,
        price: finalAmount
      },
      payment: {
        provider: paymentProvider,
        paymentMethodId,
        amount: finalAmount,
        currency: planDetails.currency,
        status: trialDays > 0 ? 'pending' : 'active'
      },
      status: trialDays > 0 ? 'trial' : 'active',
      startDate,
      endDate,
      billingCycle,
      trialStartDate: trialDays > 0 ? startDate : null,
      trialEndDate,
      discount
    });

    await subscription.populate('user', 'username email');

    res.status(201).json({
      success: true,
      message: "Subscription created successfully",
      data: subscription
    });

  } catch (error) {
    console.error("Create Subscription Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// ✅ GET USER'S SUBSCRIPTION
export const getUserSubscription = async (req, res) => {
  try {
    const { userId } = req.params;

    const subscription = await Subscription.findOne({
      user: userId,
      isActive: true,
      isDeleted: false
    }).populate('user', 'username email');

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "No subscription found for this user"
      });
    }

    res.status(200).json({
      success: true,
      data: subscription
    });

  } catch (error) {
    console.error("Get User Subscription Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// ✅ GET ALL SUBSCRIPTIONS (ADMIN)
export const getAllSubscriptions = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, plan } = req.query;

    // Build query
    const query = { isDeleted: false };
    if (status) query.status = status;
    if (plan) query.plan = plan;

    // Pagination
    const skip = (page - 1) * limit;

    // Get subscriptions
    const subscriptions = await Subscription.find(query)
      .populate('user', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const totalSubscriptions = await Subscription.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        subscriptions,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalSubscriptions / limit),
          totalSubscriptions,
          hasNextPage: skip + subscriptions.length < totalSubscriptions,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error("Get All Subscriptions Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// ✅ UPDATE SUBSCRIPTION
export const updateSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { plan, billingCycle, autoRenew, cancelAtPeriodEnd } = req.body;

    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found"
      });
    }

    // Update fields
    const updateData = {};
    if (plan !== undefined) {
      updateData.plan = plan;
      updateData.planDetails = getPlanDetails(plan, subscription.billingCycle);
    }
    if (billingCycle !== undefined) updateData.billingCycle = billingCycle;
    if (autoRenew !== undefined) updateData.autoRenew = autoRenew;
    if (cancelAtPeriodEnd !== undefined) updateData.cancelAtPeriodEnd = cancelAtPeriodEnd;

    const updatedSubscription = await Subscription.findByIdAndUpdate(
      subscriptionId,
      updateData,
      { new: true, runValidators: true }
    ).populate('user', 'username email');

    res.status(200).json({
      success: true,
      message: "Subscription updated successfully",
      data: updatedSubscription
    });

  } catch (error) {
    console.error("Update Subscription Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// ✅ CANCEL SUBSCRIPTION
export const cancelSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { userId, cancelAtPeriodEnd = true } = req.body;

    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found"
      });
    }

    // Check ownership
    if (subscription.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only cancel your own subscription"
      });
    }

    if (cancelAtPeriodEnd) {
      // Cancel at period end
      await Subscription.findByIdAndUpdate(subscriptionId, {
        cancelAtPeriodEnd: true,
        cancelledAt: new Date()
      });
    } else {
      // Cancel immediately
      await Subscription.findByIdAndUpdate(subscriptionId, {
        status: 'cancelled',
        cancelledAt: new Date(),
        endDate: new Date()
      });
    }

    res.status(200).json({
      success: true,
      message: cancelAtPeriodEnd 
        ? "Subscription will be cancelled at the end of the billing period"
        : "Subscription cancelled immediately"
    });

  } catch (error) {
    console.error("Cancel Subscription Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// ✅ RENEW SUBSCRIPTION
export const renewSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { paymentMethodId } = req.body;

    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found"
      });
    }

    // Calculate new dates
    const newStartDate = new Date();
    const newEndDate = new Date();
    
    if (subscription.billingCycle === 'monthly') {
      newEndDate.setMonth(newEndDate.getMonth() + 1);
    } else {
      newEndDate.setFullYear(newEndDate.getFullYear() + 1);
    }

    // Update subscription
    await Subscription.findByIdAndUpdate(subscriptionId, {
      status: 'active',
      startDate: newStartDate,
      endDate: newEndDate,
      cancelAtPeriodEnd: false,
      cancelledAt: null,
      'payment.paymentMethodId': paymentMethodId,
      'payment.lastPaymentDate': new Date(),
      'payment.nextBillingDate': newEndDate
    });

    res.status(200).json({
      success: true,
      message: "Subscription renewed successfully"
    });

  } catch (error) {
    console.error("Renew Subscription Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// ✅ UPGRADE/DOWNGRADE SUBSCRIPTION
export const changeSubscriptionPlan = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { userId, newPlan, billingCycle, immediate = false } = req.body;

    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found"
      });
    }

    // Check ownership
    if (subscription.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only modify your own subscription"
      });
    }

    const newPlanDetails = getPlanDetails(newPlan, billingCycle || subscription.billingCycle);

    if (immediate) {
      // Immediate plan change
      await Subscription.findByIdAndUpdate(subscriptionId, {
        plan: newPlan,
        planDetails: newPlanDetails,
        billingCycle: billingCycle || subscription.billingCycle
      });
    } else {
      // Plan change at next billing cycle
      await Subscription.findByIdAndUpdate(subscriptionId, {
        'changes': {
          $push: {
            date: new Date(),
            fromPlan: subscription.plan,
            toPlan: newPlan,
            reason: 'Plan change requested',
            initiatedBy: 'user'
          }
        }
      });
    }

    res.status(200).json({
      success: true,
      message: immediate 
        ? "Subscription plan changed immediately"
        : "Subscription plan will change at next billing cycle"
    });

  } catch (error) {
    console.error("Change Subscription Plan Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// ✅ GET SUBSCRIPTION USAGE
export const getSubscriptionUsage = async (req, res) => {
  try {
    const { subscriptionId } = req.params;

    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found"
      });
    }

    const usage = {
      videos: {
        used: subscription.usage.videosUploaded,
        limit: subscription.planDetails.maxVideos,
        remaining: subscription.planDetails.maxVideos - subscription.usage.videosUploaded
      },
      storage: {
        used: subscription.usage.storageUsed,
        limit: subscription.planDetails.maxStorage,
        remaining: subscription.planDetails.maxStorage - subscription.usage.storageUsed
      },
      playlists: {
        used: subscription.usage.playlistsCreated,
        limit: subscription.planDetails.maxPlaylists,
        remaining: subscription.planDetails.maxPlaylists - subscription.usage.playlistsCreated
      },
      downloads: {
        used: subscription.usage.downloadsUsed,
        limit: subscription.planDetails.downloadEnabled ? -1 : 0, // -1 for unlimited
        remaining: subscription.planDetails.downloadEnabled ? -1 : 0
      }
    };

    res.status(200).json({
      success: true,
      data: usage
    });

  } catch (error) {
    console.error("Get Subscription Usage Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// ✅ UPDATE SUBSCRIPTION USAGE
export const updateSubscriptionUsage = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { type, amount = 1 } = req.body; // type: videos, storage, playlists, downloads

    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found"
      });
    }

    const updateData = {};
    switch (type) {
      case 'videos':
        updateData['usage.videosUploaded'] = subscription.usage.videosUploaded + amount;
        break;
      case 'storage':
        updateData['usage.storageUsed'] = subscription.usage.storageUsed + amount;
        break;
      case 'playlists':
        updateData['usage.playlistsCreated'] = subscription.usage.playlistsCreated + amount;
        break;
      case 'downloads':
        updateData['usage.downloadsUsed'] = subscription.usage.downloadsUsed + amount;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: "Invalid usage type"
        });
    }

    await Subscription.findByIdAndUpdate(subscriptionId, updateData);

    res.status(200).json({
      success: true,
      message: "Usage updated successfully"
    });

  } catch (error) {
    console.error("Update Subscription Usage Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// ✅ GET PAYMENT HISTORY
export const getPaymentHistory = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found"
      });
    }

    const paymentHistory = subscription.paymentHistory;
    const totalPayments = paymentHistory.length;
    const skip = (page - 1) * limit;
    const paginatedHistory = paymentHistory.slice(skip, skip + parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        payments: paginatedHistory,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalPayments / limit),
          totalPayments,
          hasNextPage: skip + paginatedHistory.length < totalPayments,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error("Get Payment History Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// ✅ ADD PAYMENT RECORD
export const addPaymentRecord = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { amount, currency, status, invoiceId, paymentMethod, description } = req.body;

    const paymentRecord = {
      date: new Date(),
      amount,
      currency: currency || 'USD',
      status,
      invoiceId,
      paymentMethod,
      description
    };

    await Subscription.findByIdAndUpdate(subscriptionId, {
      $push: { paymentHistory: paymentRecord },
      'payment.lastPaymentDate': new Date()
    });

    res.status(200).json({
      success: true,
      message: "Payment record added successfully"
    });

  } catch (error) {
    console.error("Add Payment Record Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// ✅ GET EXPIRING SUBSCRIPTIONS
export const getExpiringSubscriptions = async (req, res) => {
  try {
    const { days = 7 } = req.query;

    const expiringSubscriptions = await Subscription.getExpiringSubscriptions(parseInt(days));

    res.status(200).json({
      success: true,
      data: expiringSubscriptions
    });

  } catch (error) {
    console.error("Get Expiring Subscriptions Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// ✅ GET SUBSCRIPTION STATISTICS
export const getSubscriptionStats = async (req, res) => {
  try {
    const stats = await Subscription.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: null,
          totalSubscriptions: { $sum: 1 },
          activeSubscriptions: {
            $sum: { $cond: [{ $in: ['$status', ['active', 'trial']] }, 1, 0] }
          },
          totalRevenue: { $sum: '$planDetails.price' },
          averageRevenue: { $avg: '$planDetails.price' }
        }
      }
    ]);

    const planStats = await Subscription.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: '$plan',
          count: { $sum: 1 },
          revenue: { $sum: '$planDetails.price' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overall: stats[0] || {
          totalSubscriptions: 0,
          activeSubscriptions: 0,
          totalRevenue: 0,
          averageRevenue: 0
        },
        byPlan: planStats
      }
    });

  } catch (error) {
    console.error("Get Subscription Stats Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// ✅ VALIDATE SUBSCRIPTION ACCESS
export const validateSubscriptionAccess = async (req, res) => {
  try {
    const { userId, feature } = req.body;

    const subscription = await Subscription.findOne({
      user: userId,
      status: { $in: ['active', 'trial'] },
      isActive: true,
      isDeleted: false
    });

    if (!subscription) {
      return res.status(200).json({
        success: true,
        data: { hasAccess: false, reason: 'No active subscription' }
      });
    }

    let hasAccess = false;
    let reason = '';

    switch (feature) {
      case 'upload_video':
        hasAccess = subscription.canUploadVideo();
        reason = hasAccess ? 'Can upload video' : 'Video upload limit reached';
        break;
      case 'create_playlist':
        hasAccess = subscription.canCreatePlaylist();
        reason = hasAccess ? 'Can create playlist' : 'Playlist limit reached';
        break;
      case 'download':
        hasAccess = subscription.canDownload();
        reason = hasAccess ? 'Can download' : 'Downloads not available';
        break;
      case 'hd_quality':
        hasAccess = subscription.hasHDQuality();
        reason = hasAccess ? 'HD quality available' : 'HD quality not available';
        break;
      case 'ad_free':
        hasAccess = subscription.isAdFree();
        reason = hasAccess ? 'Ad-free experience' : 'Ads will be shown';
        break;
      default:
        hasAccess = false;
        reason = 'Invalid feature';
    }

    res.status(200).json({
      success: true,
      data: { hasAccess, reason, subscription: subscription.plan }
    });

  } catch (error) {
    console.error("Validate Subscription Access Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Helper function to get plan details
function getPlanDetails(plan, billingCycle) {
  const plans = {
    basic: {
      name: 'Basic Plan',
      price: billingCycle === 'yearly' ? 9999 : 999, // $99.99 yearly or $9.99 monthly
      currency: 'USD',
      interval: billingCycle,
      maxVideos: 10,
      maxStorage: 1024, // 1GB
      maxPlaylists: 5,
      adFree: false,
      hdQuality: false,
      downloadEnabled: false,
      prioritySupport: false
    },
    premium: {
      name: 'Premium Plan',
      price: billingCycle === 'yearly' ? 19999 : 1999, // $199.99 yearly or $19.99 monthly
      currency: 'USD',
      interval: billingCycle,
      maxVideos: 100,
      maxStorage: 10240, // 10GB
      maxPlaylists: 50,
      adFree: true,
      hdQuality: true,
      downloadEnabled: true,
      prioritySupport: true
    },
    pro: {
      name: 'Pro Plan',
      price: billingCycle === 'yearly' ? 39999 : 3999, // $399.99 yearly or $39.99 monthly
      currency: 'USD',
      interval: billingCycle,
      maxVideos: 500,
      maxStorage: 51200, // 50GB
      maxPlaylists: 200,
      adFree: true,
      hdQuality: true,
      downloadEnabled: true,
      prioritySupport: true
    },
    enterprise: {
      name: 'Enterprise Plan',
      price: billingCycle === 'yearly' ? 99999 : 9999, // $999.99 yearly or $99.99 monthly
      currency: 'USD',
      interval: billingCycle,
      maxVideos: -1, // Unlimited
      maxStorage: 512000, // 500GB
      maxPlaylists: -1, // Unlimited
      adFree: true,
      hdQuality: true,
      downloadEnabled: true,
      prioritySupport: true
    }
  };

  return plans[plan] || plans.basic;
}

// Helper function to apply discount
async function applyDiscount(code, originalPrice) {
  // This would typically query a discount codes collection
  // For now, return null (no discount applied)
  return null;
}

// ✅ CHANNEL SUBSCRIPTION FUNCTIONS (YouTube-like)

// Subscribe to a channel
export const subscribeToChannel = async (req, res) => {
  try {
    const { userId, channelId } = req.body;

    // Validation
    if (!userId || !channelId) {
      return res.status(400).json({
        success: false,
        message: "userId and channelId are required"
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check if channel exists
    const channel = await User.findById(channelId);
    if (!channel) {
      return res.status(404).json({
        success: false,
        message: "Channel not found"
      });
    }

    // Check if already subscribed
    if (user.following.includes(channelId)) {
      return res.status(400).json({
        success: false,
        message: "Already subscribed to this channel"
      });
    }

    // Add to following (user subscribes to channel)
    user.following.push(channelId);
    await user.save();

    // Add to followers (channel gains subscriber)
    channel.followers.push(userId);
    await channel.save();

    res.status(200).json({
      success: true,
      message: "Successfully subscribed to channel",
      data: {
        subscribed: true,
        subscriberCount: channel.followers.length
      }
    });

  } catch (error) {
    console.error("Subscribe to Channel Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Unsubscribe from a channel
export const unsubscribeFromChannel = async (req, res) => {
  try {
    const { userId, channelId } = req.body;

    // Validation
    if (!userId || !channelId) {
      return res.status(400).json({
        success: false,
        message: "userId and channelId are required"
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check if channel exists
    const channel = await User.findById(channelId);
    if (!channel) {
      return res.status(404).json({
        success: false,
        message: "Channel not found"
      });
    }

    // Check if subscribed
    if (!user.following.includes(channelId)) {
      return res.status(400).json({
        success: false,
        message: "Not subscribed to this channel"
      });
    }

    // Remove from following
    user.following = user.following.filter(id => id.toString() !== channelId);
    await user.save();

    // Remove from followers
    channel.followers = channel.followers.filter(id => id.toString() !== userId);
    await channel.save();

    res.status(200).json({
      success: true,
      message: "Successfully unsubscribed from channel",
      data: {
        subscribed: false,
        subscriberCount: channel.followers.length
      }
    });

  } catch (error) {
    console.error("Unsubscribe from Channel Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get channel subscribers count
export const getChannelSubscribers = async (req, res) => {
  try {
    const { channelId } = req.params;

    const channel = await User.findById(channelId);
    if (!channel) {
      return res.status(404).json({
        success: false,
        message: "Channel not found"
      });
    }

    res.status(200).json({
      success: true,
      data: {
        subscriberCount: channel.followers.length,
        subscribers: channel.followers
      }
    });

  } catch (error) {
    console.error("Get Channel Subscribers Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get user's subscribed channels
export const getUserSubscriptions = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).populate('following', 'username fullname profileimage followers');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      data: {
        subscribedChannels: user.following,
        subscriptionCount: user.following.length
      }
    });

  } catch (error) {
    console.error("Get User Subscriptions Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Check if user is subscribed to a channel
export const checkChannelSubscription = async (req, res) => {
  try {
    const { userId, channelId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const isSubscribed = user.following.includes(channelId);

    res.status(200).json({
      success: true,
      data: {
        subscribed: isSubscribed
      }
    });

  } catch (error) {
    console.error("Check Channel Subscription Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export default {
  createSubscription,
  getUserSubscription,
  getAllSubscriptions,
  updateSubscription,
  cancelSubscription,
  renewSubscription,
  changeSubscriptionPlan,
  getSubscriptionUsage,
  updateSubscriptionUsage,
  getPaymentHistory,
  addPaymentRecord,
  getExpiringSubscriptions,
  getSubscriptionStats,
  validateSubscriptionAccess,
  subscribeToChannel,
  unsubscribeFromChannel,
  getChannelSubscribers,
  getUserSubscriptions,
  checkChannelSubscription
};
