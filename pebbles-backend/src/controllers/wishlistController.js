import Wishlist from "../models/Wishlist.js";
import Listing from "../models/Listing.js";

// ===============================
// ADD TO WISHLIST
// ===============================
export const addToWishlist = async (req, res) => {
  try {
    const listingId = req.params.listingId;

    const exists = await Wishlist.findOne({
      user: req.user._id,
      listing: listingId
    });

    if (exists) {
      return res.status(400).json({ message: "Already saved" });
    }

    const item = await Wishlist.create({
      user: req.user._id,
      listing: listingId
    });

    res.status(201).json({ message: "Saved", item });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// REMOVE FROM WISHLIST
// ===============================
export const removeFromWishlist = async (req, res) => {
  try {
    await Wishlist.findOneAndDelete({
      user: req.user._id,
      listing: req.params.listingId
    });

    res.json({ message: "Removed" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// CHECK IF SAVED
// ===============================
export const isWishlisted = async (req, res) => {
  try {
    const exists = await Wishlist.findOne({
      user: req.user._id,
      listing: req.params.listingId
    });

    res.json({ saved: !!exists });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// GET MY WISHLIST
// ===============================
export const getMyWishlist = async (req, res) => {
  try {
    const items = await Wishlist.find({ user: req.user._id })
      .populate("listing")
      .sort({ createdAt: -1 });

    res.json(items);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
