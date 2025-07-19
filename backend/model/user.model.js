import mongoose, { Schema } from "mongoose";


const userSchema = new mongoose.Schema({
    fullname: { type: String, required: true },
    username: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    profileimage: { type: String, default: "url" },
    roles: { type: [String], enum: ['user', 'admin'], default: ['user'] },
    subscription: { type: String, enum: ['free', 'premium'], default: 'free' },
    isActive: { type: Boolean, default: true },
    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
}, { timestamps: true });
