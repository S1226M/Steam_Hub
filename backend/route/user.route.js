import express from "express";
import userController from "../controller/user.controller.js";

const router = express.Router();
// const userController = require("../controller/user.controller");

router.get("/all", userController.getAllUsers);

export default router;