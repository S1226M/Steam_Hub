import express from "express";
import {
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
} from "../controller/admin.controller.js";

const router = express.Router();

// ✅ CREATE ADMIN
// POST /api/admins
router.post("/", createAdmin);

// ✅ ADMIN LOGIN
// POST /api/admins/login
router.post("/login", adminLogin);

// ✅ GET ADMIN STATISTICS
// GET /api/admins/stats
router.get("/stats", getAdminStats);

// ✅ GET SYSTEM OVERVIEW (DASHBOARD)
// GET /api/admins/dashboard/overview
router.get("/dashboard/overview", getSystemOverview);

// ✅ GET ADMINS BY ROLE
// GET /api/admins/role/:role
router.get("/role/:role", getAdminsByRole);

// ✅ GET ADMINS BY DEPARTMENT
// GET /api/admins/department/:department
router.get("/department/:department", getAdminsByDepartment);

// ✅ SEARCH ADMINS
// GET /api/admins/search?q=search_term&role=admin&department=content&status=active&page=1&limit=10
router.get("/search", searchAdmins);

// ✅ GET ALL ADMINS
// GET /api/admins?page=1&limit=10&role=admin&department=content&status=active
router.get("/", getAllAdmins);

// ✅ GET SINGLE ADMIN
// GET /api/admins/:adminId
router.get("/:adminId", getAdmin);

// ✅ UPDATE ADMIN
// PUT /api/admins/:adminId
router.put("/:adminId", updateAdmin);

// ✅ DELETE ADMIN (SOFT DELETE)
// DELETE /api/admins/:adminId
router.delete("/:adminId", deleteAdmin);

// ✅ CHANGE ADMIN PASSWORD
// PUT /api/admins/:adminId/password
router.put("/:adminId/password", changePassword);

// ✅ RESET ADMIN PASSWORD
// PUT /api/admins/:adminId/reset-password
router.put("/:adminId/reset-password", resetPassword);

// ✅ UNLOCK ADMIN ACCOUNT
// PUT /api/admins/:adminId/unlock
router.put("/:adminId/unlock", unlockAccount);

// ✅ GET ADMIN ACTIVITY LOG
// GET /api/admins/:adminId/activities?page=1&limit=20
router.get("/:adminId/activities", getActivityLog);

// ✅ UPDATE ADMIN PREFERENCES
// PUT /api/admins/:adminId/preferences
router.put("/:adminId/preferences", updatePreferences);

// ✅ VALIDATE ADMIN PERMISSIONS
// POST /api/admins/:adminId/validate-permissions
router.post("/:adminId/validate-permissions", validatePermissions);

export default router;
