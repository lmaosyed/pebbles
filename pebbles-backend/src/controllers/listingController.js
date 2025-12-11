import Listing from "../models/Listing.js";
import cloudinary from "../utils/cloudinary.js";
import geocodeAddress from "../utils/geocode.js";

// ===================================================================
// CLOUDINARY STREAM HELPER
// ===================================================================
const uploadToCloudinary = (file, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (err, result) => {
        if (err) reject(err);
        else resolve(result.secure_url);
      }
    );
    stream.end(file.buffer);
  });
};

// ===================================================================
// CREATE LISTING
// ===================================================================
export const createListing = async (req, res) => {
  try {
    const { title, description, price, category,condition, address } = req.body;

    // 1) UPLOAD IMAGES
    let images = [];
    if (req.files && req.files.length > 0) {
      for (let file of req.files) {
        const url = await uploadToCloudinary(file, "pebbles/listings");
        images.push(url);
      }
    }

    // 2) GEOCODE ADDRESS
    let location = {
  type: "Point",
  coordinates: [0, 0],
  placeName: ""
};

if (address) {
  const geo = await geocodeAddress(address);
  if (geo) {
    location = {
      type: "Point",
      coordinates: [geo.lng, geo.lat],
      placeName: geo.formattedAddress,
    };
  }
}


    // 3) CREATE LISTING
    const listing = await Listing.create({
      title,
      description,
      price,
      category,
      condition,
      images,
      location,
      seller: req.user._id,
    });

    res.status(201).json(listing);
  } catch (error) {
  console.error("CREATE LISTING ERROR:", error);
  res.status(500).json({ message: error.message, full: error });
}
  
};

// ===================================================================
// GET LISTINGS (Search + Filters + Location + Radius)
// ===================================================================
export const getListings = async (req, res) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      page = 1,
      limit = 10,
      address,
      lat,
      lng,
      radius = 15,  // Default 15 KM
      sort,
    } = req.query;

    let baseQuery = { status: { $ne: "deleted" } };
    // Filter: show only listings posted by logged-in user
    if (req.user) {
  baseQuery.seller = { $ne: req.user._id };
}



    // TEXT SEARCH
    if (search) {
      baseQuery.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { "location.placeName": { $regex: search, $options: "i" } },
      ];
    }
        // FILTER: My own listings
    if (req.query.mine === "true" && req.user) {
      baseQuery.seller = req.user._id;
      
    }

    // CATEGORY
    if (category) baseQuery.category = category;

    // PRICE FILTER
    if (minPrice || maxPrice) {
      baseQuery.price = {};
      if (minPrice) baseQuery.price.$gte = Number(minPrice);
      if (maxPrice) baseQuery.price.$lte = Number(maxPrice);
    }

    // GEO SEARCH
    let geoQuery = baseQuery;
    let finalLat = lat;
    let finalLng = lng;

    // Convert city name → lat/lng
    if (address && (!lat || !lng)) {
      const geo = await geocodeAddress(address);
      if (geo) {
        finalLat = geo.lat;
        finalLng = geo.lng;
      }
    }

    // If coordinates available → apply radius search
    if (finalLat && finalLng) {
      geoQuery = {
        ...baseQuery,
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [Number(finalLng), Number(finalLat)],
            },
            $maxDistance: Number(radius) * 1000,
          },
        },
      };
    }

    // SORTING
    let sortOption = { createdAt: -1 }; // default newest
    if (sort === "price_low") sortOption = { price: 1 };
    if (sort === "price_high") sortOption = { price: -1 };

    // PAGINATION
    const skip = (page - 1) * limit;

    const listings = await Listing.find(geoQuery)
      .populate("seller", "_id fullName email")
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    const total = await Listing.countDocuments(geoQuery);

    res.status(200).json({
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      listings,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

// ===================================================================
// GET SINGLE LISTING
// ===================================================================
import Recent from "../models/Recent.js"; // ADD THIS IMPORT AT TOP

export const getListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate(
      "seller",
      "fullName email profileImage"
    );

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    // ============================
    // UPDATE RECENTLY VIEWED
    // ============================
    if (req.user) {
      await Recent.findOneAndUpdate(
        { user: req.user._id, listing: req.params.id },
        {},
        { upsert: true, new: true }
      );
    }

    res.status(200).json(listing);

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching listing" });
  }
};

// ===================================================================
// EDIT LISTING
// ===================================================================
export const editListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) return res.status(404).json({ message: "Listing not found" });
    if (listing.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    let updatedData = req.body;

    // NEW IMAGES
    if (req.files && req.files.length > 0) {
      const newUrls = [];
      for (let file of req.files) {
        const url = await uploadToCloudinary(file, "pebbles/listings");
        newUrls.push(url);
      }
      updatedData.images = [...listing.images, ...newUrls];
    }

    // GEOCODE UPDATED ADDRESS
    if (req.body.address) {
      const geo = await geocodeAddress(req.body.address);
      if (geo) {
        updatedData.location = {
          type: "Point",
          coordinates: [geo.lng, geo.lat],
          placeName: geo.formattedAddress,
        };
      }
    }

    const updated = await Listing.findByIdAndUpdate(req.params.id, updatedData, {
      new: true,
    });

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: "Failed to update listing" });
  }
};

// ===================================================================
// HARD DELETE (not used often)
// ===================================================================
export const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) return res.status(404).json({ message: "Listing not found" });
    if (listing.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await listing.deleteOne();

    res.status(200).json({ message: "Listing deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete listing" });
  }
};

// ===================================================================
// SOFT DELETE
// ===================================================================
export const softDeleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) return res.status(404).json({ message: "Listing not found" });
    if (listing.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    listing.status = "deleted";
    await listing.save();

    res.json({ message: "Listing soft deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getNearbyListings = async (req, res) => {
  try {
    // requires req.user to have location
    const user = req.user;

    if (!user || !user.location || !user.location.coordinates) {
      return res.status(200).json({ listings: [] });
    }

    const [lng, lat] = user.location.coordinates;

    const listings = await Listing.find({
      status: { $ne: "deleted" },
      seller: { $ne: user._id },
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat],
          },
          $maxDistance: 15000, // 15 KM
        },
      },
    }).limit(20);

    res.status(200).json({ listings });

  } catch (error) {
    console.log("NEARBY ERROR:", error);
    res.status(500).json({ message: "Failed to load nearby listings" });
  }
};

// ===================================================================
// MARK AS SOLD
// ===================================================================
export const markAsSold = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) return res.status(404).json({ message: "Listing not found" });
    if (listing.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    listing.status = "sold";
    await listing.save();

    res.json({ message: "Listing marked as sold" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
