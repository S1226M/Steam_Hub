import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./db/connection"
import userRoutes from "./route/user.route"; // adjust if you have more

dotenv.config();

const app = express();
app.use(express.json());

// Connect MongoDB
connectDB();

// Routes
app.use("/api/users", userRoutes);

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
