import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { addRecentView, getRecentViews } from "../controllers/recentController.js";

const router = express.Router();

router.post("/:listingId", protect, addRecentView);
router.get("/", protect, getRecentViews);

export default router;
