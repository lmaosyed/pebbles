import Report from "../models/Report.js";
import Listing from "../models/Listing.js";

export const reportListing = async (req, res) => {
  try {
    const { listingId, reason } = req.body;

    const listing = await Listing.findById(listingId);
    if (!listing)
      return res.status(404).json({ message: "Listing not found" });

    // Prevent reporting own listing
    if (listing.seller.toString() === req.user._id.toString()) {
      return res.status(400).json({
        message: "You cannot report your own listing",
      });
    }

    const report = await Report.create({
      listing: listingId,
      reporter: req.user._id,
      reason,
    });

    res.status(201).json({ message: "Report submitted", report });
  } catch (err) {
    res.status(500).json({ message: "Failed to submit report" });
  }
};

export const getMyReports = async (req, res) => {
  try {
    const reports = await Report.find({ reporter: req.user._id })
      .populate("listing")
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch reports" });
  }
};
