import User from "../models/User.js";
import AdminLog from "../models/AdminLog.js";

/* ============================================
   GET ALL USERS
============================================ */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

/* ============================================
   BAN USER
============================================ */
export const banUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { isBanned: true },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    await AdminLog.create({
      admin: req.user._id,
      action: "ban_user",
      details: `User ${user._id} banned`,
    });

    res.json({ message: "User banned", user });
  } catch (err) {
    res.status(500).json({ message: "Failed to ban user" });
  }
};

/* ============================================
   UNBAN USER
============================================ */
export const unbanUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { isBanned: false },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    await AdminLog.create({
      admin: req.user._id,
      action: "unban_user",
      details: `User ${user._id} unbanned`,
    });

    res.json({ message: "User unbanned", user });
  } catch (err) {
    res.status(500).json({ message: "Failed to unban user" });
  }
};

/* ============================================
   HARD DELETE USER
============================================ */
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    await User.findByIdAndDelete(req.params.userId);

    await AdminLog.create({
      admin: req.user._id,
      action: "delete_user",
      details: `User ${req.params.userId} permanently deleted`,
    });

    res.json({ message: "User permanently deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete user" });
  }
};
