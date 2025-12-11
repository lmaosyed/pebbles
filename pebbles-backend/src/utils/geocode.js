import NodeGeocoder from "node-geocoder";

const options = {
  provider: "openstreetmap",
  timeout: 5000
};

const geocoder = NodeGeocoder(options);

export default async function geocodeAddress(address) {
  try {
    const result = await geocoder.geocode(address);

    if (!result || result.length === 0) {
      console.log("No geocode result for:", address);
      return null;
    }

    return {
      lat: result[0].latitude,
      lng: result[0].longitude,
      formattedAddress: result[0].formattedAddress || address
    };
  } catch (error) {
    console.log("Geocode error:", error.message);
    return null;
  }
}
