import express from "express";
import { registerUser, loginUser, getMe } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminLogin } from "../controllers/adminController.js";

const router = express.Router();

router.post("/register", registerUser);

// FIXED LOGIN ROUTE
router.post("/login", loginUser);

// GET MY PROFILE
router.get("/me", protect, getMe);

// ADMIN LOGIN
router.post("/admin/login", adminLogin);

export default router;
