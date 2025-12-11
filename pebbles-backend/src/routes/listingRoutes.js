import express from "express";
import {
  createListing,
  getListings,
  getListing,
  editListing,
  deleteListing,
  softDeleteListing,
  markAsSold
} from "../controllers/listingController.js";

import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";
import { getNearbyListings } from "../controllers/listingController.js";


const router = express.Router();

router.get("/nearby", protect, getNearbyListings);

router.patch("/:id/soft-delete", protect, softDeleteListing);
router.patch("/:id/mark-sold", protect, markAsSold);
router.post("/", protect, upload.array("images", 6), createListing);

router.get("/:id", getListing);
router.get("/",protect, getListings);
router.patch("/:id", protect, upload.array("images", 6), editListing);
router.delete("/:id", protect, deleteListing);

export default router;
