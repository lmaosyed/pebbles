import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  addToWishlist,
  removeFromWishlist,
  getMyWishlist,
  isWishlisted
} from "../controllers/wishlistController.js";

const router = express.Router();

router.post("/add/:listingId", protect, addToWishlist);
router.post("/remove/:listingId", protect, removeFromWishlist);
router.get("/mine", protect, getMyWishlist);
router.get("/check/:listingId", protect, isWishlisted);

export default router;
