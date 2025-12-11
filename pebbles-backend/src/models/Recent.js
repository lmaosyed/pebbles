import mongoose from "mongoose";

const recentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true
    }
  },
  { timestamps: true }
);

// prevent duplicates
recentSchema.index({ user: 1, listing: 1 }, { unique: true });

export default mongoose.model("Recent", recentSchema);
