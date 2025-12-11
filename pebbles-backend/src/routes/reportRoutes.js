import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  reportListing,
  getMyReports
} from "../controllers/reportController.js";

const router = express.Router();

router.post("/", protect, reportListing);
router.get("/mine", protect, getMyReports);

export default router;
