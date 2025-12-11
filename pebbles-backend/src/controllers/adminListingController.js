import Listing from "../models/Listing.js";
import AdminLog from "../models/AdminLog.js";

export const getAllListings = async (req, res) => {
  try {
    const listings = await Listing.find()
      .populate("seller", "fullName email")
      .sort({ createdAt: -1 });

    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch listings" });
  }
};

export const adminDeleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.listingId);
    if (!listing) return res.status(404).json({ message: "Not found" });

    await listing.deleteOne();

    await AdminLog.create({
      admin: req.user._id,
      action: "delete_listing",
      details: `Listing ${listing._id} permanently deleted`,
    });

    res.json({ message: "Listing permanently deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
};

export const adminSoftDelete = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.listingId);
    if (!listing) return res.status(404).json({ message: "Not found" });

    listing.status = "deleted";
    await listing.save();

    await AdminLog.create({
      admin: req.user._id,
      action: "soft_delete_listing",
      details: `Listing ${listing._id} soft deleted`,
    });

    res.json({ message: "Listing soft deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const adminRestoreListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.listingId);
    if (!listing) return res.status(404).json({ message: "Not found" });

    listing.status = "active";
    await listing.save();

    await AdminLog.create({
      admin: req.user._id,
      action: "restore_listing",
      details: `Listing ${listing._id} restored`,
    });

    res.json({ message: "Listing restored" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
