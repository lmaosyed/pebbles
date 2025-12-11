import Recent from "../models/Recent.js";

export const addRecentView = async (req, res) => {
  try {
    const { listingId } = req.params;

    if (!listingId)
      return res.status(400).json({ message: "listingId required" });

    // adds or updates timestamp
    await Recent.findOneAndUpdate(
      { user: req.user._id, listing: listingId },
      { updatedAt: new Date() },
      { upsert: true }
    );

    res.json({ message: "Recent updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getRecentViews = async (req, res) => {
  try {
    const items = await Recent.find({ user: req.user._id })
      .populate("listing")
      .sort({ updatedAt: -1 })
      .limit(20);

    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
