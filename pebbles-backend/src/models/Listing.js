import mongoose from "mongoose";

const listingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },

    images: [{ type: String }],

    category: { type: String },
    condition: {
  type: String,
  enum: ["New", "Like New", "Used", "Fair"],
  default: "Used"
},

    // GeoJSON location
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point"
      },
      coordinates: {
            type: [Number], // [lng, lat]
            default: [0, 0],
      },
      placeName: { type: String, default: "" }
    },

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    status: {
      type: String,
      enum: ["active", "sold", "deleted"],
      default: "active"
    }
  },
  { timestamps: true }
);

// IMPORTANT: 2dsphere index
listingSchema.index({ location: "2dsphere" });

export default mongoose.model("Listing", listingSchema);
