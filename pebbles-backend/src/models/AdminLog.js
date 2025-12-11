import mongoose from "mongoose";

const AdminLogSchema = new mongoose.Schema({
  admin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  action: String,
  details: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("AdminLog", AdminLogSchema);
