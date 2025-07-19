import express from "express";
import userController from "../controller/user.controller.js";

const router = express.Router();
// const userController = require("../controller/user.controller");

router.get("/all", userController.getAllUsers);
// ✅ Get user by ID

router.get("/:id", userController.getUserById);

export default router;