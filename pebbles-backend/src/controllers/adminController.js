import User from "../models/User.js";
import Report from "../models/Report.js";
import Listing from "../models/Listing.js";
import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import AdminLog from "../models/AdminLog.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// ===============================
// ADMIN LOGIN
// ===============================
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await User.findOne({ email });

    if (!admin || admin.role !== "admin")
      return res.status(403).json({ message: "Not an admin" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    return res.json({
      message: "Admin logged in",
      token,
      admin: {
        id: admin._id,
        fullName: admin.fullName,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ===============================
// GET ALL REPORTS
// ===============================
export const getReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("listing")
      .populate("reporter", "fullName email")
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch reports" });
  }
};

// ===============================
// RESOLVE REPORT
// ===============================
export const resolveReport = async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(
      req.params.reportId,
      { status: "resolved" },
      { new: true }
    );

    await AdminLog.create({
      admin: req.user._id,
      action: "resolve_report",
      details: `Report ${report._id} resolved`,
    });

    res.json({ message: "Report resolved", report });
  } catch (err) {
    res.status(500).json({ message: "Failed to resolve report" });
  }
};

// ===============================
// REJECT REPORT
// ===============================
export const rejectReport = async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(
      req.params.reportId,
      { status: "rejected" },
      { new: true }
    );

    await AdminLog.create({
      admin: req.user._id,
      action: "reject_report",
      details: `Report ${report._id} rejected`,
    });

    res.json({ message: "Report rejected", report });
  } catch (err) {
    res.status(500).json({ message: "Failed to reject report" });
  }
};

// ===============================
// DELETE LISTING FROM REPORT
// ===============================
export const deleteListingFromReport = async (req, res) => {
  try {
    await Listing.findByIdAndDelete(req.params.reportId);

    await AdminLog.create({
      admin: req.user._id,
      action: "delete_listing_report",
      details: `Listing deleted via report.`,
    });

    res.json({ message: "Listing deleted due to report" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete listing" });
  }
};

// ===============================
// ADMIN STATS (FULL DASHBOARD)
// ===============================
export const adminStats = async (req, res) => {
  try {
    const stats = {
      users: await User.countDocuments(),
      listings: await Listing.countDocuments(),
      activeListings: await Listing.countDocuments({ status: "active" }),
      soldListings: await Listing.countDocuments({ status: "sold" }),
      chats: await Chat.countDocuments(),
      messages: await Message.countDocuments(),
      reports: await Report.countDocuments(),
      reportsResolved: await Report.countDocuments({ status: "resolved" }),
      reportsPending: await Report.countDocuments({ status: "pending" }),
      recentUsers: await User.find().sort({ createdAt: -1 }).limit(6),
      recentListings: await Listing.find().sort({ createdAt: -1 }).limit(6)
    };

    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch stats" });
  }
};

// ===============================
// ADMIN LOGS
// ===============================
export const getLogs = async (req, res) => {
  const logs = await AdminLog.find()
    .sort({ createdAt: -1 })
    .limit(200)
    .populate("admin", "fullName email");

  res.json(logs);
};
