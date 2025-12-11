import express from "express";
import { getMe, updateProfile } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import  upload  from "../middleware/upload.js";
//import { updateProfileImage } from "../controllers/userController.js";

const router = express.Router();

router.get("/me", protect, getMe);
router.patch("/me", protect, upload.single("profileImage"), updateProfile);
// Upload profile picture

export default router;

