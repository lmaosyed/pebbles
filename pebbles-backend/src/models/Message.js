// src/models/Message.js
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", required: true },
  from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  to: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, default: "" },
  image:{ type: String, default: "" },
  attachments: [{ type: String }], // cloudinary URLs if any
  read: { type: Boolean, default: false }
}, { timestamps: true });

// index to speed up chat read
messageSchema.index({ chat: 1, createdAt: -1 });

export default mongoose.model("Message", messageSchema);
