import User from "../models/User.js";
import bcrypt from "bcryptjs";

// CONSTANT default profile picture
const DEFAULT_PFP = "/defaultpfp.png";


// ====================================================================
// GET CURRENT USER
// ====================================================================
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    // Always force default PFP
    const userData = {
      ...user.toObject(),
      profileImage: DEFAULT_PFP
    };

    res.json(userData);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ====================================================================
// REMOVE PROFILE IMAGE UPLOAD (DISABLED COMPLETELY)
// ====================================================================
export const updateProfileImage = async (_req, res) => {
  return res.status(400).json({
    message: "Profile pictures are disabled. Default image is always used."
  });
};


// ====================================================================
// UPDATE PROFILE (NAME + PHONE + PASSWORD)
// ====================================================================
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { fullName, phone, currentPassword, newPassword } = req.body;

    // Update name & phone
    if (fullName) user.fullName = fullName;
    if (phone) user.phone = phone;

    // Update password (optional)
    if (currentPassword && newPassword) {
      const match = await bcrypt.compare(currentPassword, user.password);
      if (!match)
        return res.status(400).json({ message: "Current password incorrect" });

      user.password = await bcrypt.hash(newPassword, 10);
    }

    // REMOVE profile image override (we don't allow custom images)
    user.profileImage = DEFAULT_PFP;

    await user.save();

    res.json({
      message: "Profile updated",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        profileImage: DEFAULT_PFP
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
