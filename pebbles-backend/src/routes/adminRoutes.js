import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

import {
  adminLogin,
  adminStats,
  getReports,
  resolveReport,
  rejectReport,
  deleteListingFromReport,
  getLogs
} from "../controllers/adminController.js";


import {
  getAllUsers,
  banUser,
  unbanUser,
  deleteUser
} from "../controllers/adminUserController.js";


import {
  getAllListings,
  adminDeleteListing,
  adminSoftDelete,
  adminRestoreListing
} from "../controllers/adminListingController.js";

const router = express.Router();

/* ------------------------
    ADMIN LOGIN (NO AUTH)
-------------------------*/
router.post("/login", adminLogin);

/* ------------------------
   ALL ROUTES BELOW NEED ADMIN
-------------------------*/
router.use(protect, adminOnly);

/* -------- USERS ---------- */
router.get("/users", getAllUsers);
router.put("/users/ban/:userId", banUser);
router.put("/users/unban/:userId", unbanUser);

/* -------- LISTINGS ---------- */
router.get("/listings", getAllListings);
router.delete("/listings/:listingId", adminDeleteListing);
router.put("/listings/:listingId/soft", adminSoftDelete);
router.put("/listings/:listingId/restore", adminRestoreListing);

/* -------- REPORTS ---------- */
router.get("/reports", getReports);
router.put("/reports/:reportId/resolve", resolveReport);
router.put("/reports/:reportId/reject", rejectReport);
router.delete("/reports/:reportId/listing", deleteListingFromReport);
router.delete("/users/:userId", deleteUser);

/* -------- STATS ---------- */
router.get("/stats", adminStats);

/* -------- LOGS ---------- */
router.get("/logs", getLogs);

export default router;
