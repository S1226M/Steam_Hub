import express from "express";
import {
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
  // Channel subscription functions
  subscribeToChannel,
  unsubscribeFromChannel,
  getChannelSubscribers,
  getUserSubscriptions,
  checkChannelSubscription
} from "../controller/subscription.controller.js";

const router = express.Router();

// ✅ CHANNEL SUBSCRIPTIONS (YouTube-like)
// POST /api/subscriptions/channel/subscribe
router.post("/channel/subscribe", subscribeToChannel);

// POST /api/subscriptions/channel/unsubscribe
router.post("/channel/unsubscribe", unsubscribeFromChannel);

// GET /api/subscriptions/channel/:channelId/subscribers
router.get("/channel/:channelId/subscribers", getChannelSubscribers);

// GET /api/subscriptions/user/:userId/channels
router.get("/user/:userId/channels", getUserSubscriptions);

// GET /api/subscriptions/channel/:channelId/check/:userId
router.get("/channel/:channelId/check/:userId", checkChannelSubscription);

// ✅ PREMIUM SUBSCRIPTIONS (Netflix-like)
// POST /api/subscriptions
router.post("/", createSubscription);

// ✅ GET USER'S SUBSCRIPTION
// GET /api/subscriptions/user/:userId
router.get("/user/:userId", getUserSubscription);

// ✅ GET ALL SUBSCRIPTIONS (ADMIN)
// GET /api/subscriptions?page=1&limit=10&status=active&plan=premium
router.get("/", getAllSubscriptions);

// ✅ GET EXPIRING SUBSCRIPTIONS
// GET /api/subscriptions/expiring?days=7
router.get("/expiring", getExpiringSubscriptions);

// ✅ GET SUBSCRIPTION STATISTICS
// GET /api/subscriptions/stats
router.get("/stats", getSubscriptionStats);

// ✅ VALIDATE SUBSCRIPTION ACCESS
// POST /api/subscriptions/validate
router.post("/validate", validateSubscriptionAccess);

// ✅ GET SINGLE SUBSCRIPTION
// GET /api/subscriptions/:subscriptionId
router.get("/:subscriptionId", getUserSubscription);

// ✅ UPDATE SUBSCRIPTION
// PUT /api/subscriptions/:subscriptionId
router.put("/:subscriptionId", updateSubscription);

// ✅ CANCEL SUBSCRIPTION
// DELETE /api/subscriptions/:subscriptionId
router.delete("/:subscriptionId", cancelSubscription);

// ✅ RENEW SUBSCRIPTION
// POST /api/subscriptions/:subscriptionId/renew
router.post("/:subscriptionId/renew", renewSubscription);

// ✅ CHANGE SUBSCRIPTION PLAN
// PUT /api/subscriptions/:subscriptionId/plan
router.put("/:subscriptionId/plan", changeSubscriptionPlan);

// ✅ GET SUBSCRIPTION USAGE
// GET /api/subscriptions/:subscriptionId/usage
router.get("/:subscriptionId/usage", getSubscriptionUsage);

// ✅ UPDATE SUBSCRIPTION USAGE
// POST /api/subscriptions/:subscriptionId/usage
router.post("/:subscriptionId/usage", updateSubscriptionUsage);

// ✅ GET PAYMENT HISTORY
// GET /api/subscriptions/:subscriptionId/payments?page=1&limit=10
router.get("/:subscriptionId/payments", getPaymentHistory);

// ✅ ADD PAYMENT RECORD
// POST /api/subscriptions/:subscriptionId/payments
router.post("/:subscriptionId/payments", addPaymentRecord);

export default router;
