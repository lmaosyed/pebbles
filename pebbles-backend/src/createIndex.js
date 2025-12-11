import mongoose from "mongoose";
import Listing from "./models/Listing.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env correctly
dotenv.config({ path: path.join(__dirname, "..", ".env") });

async function run() {
  try {
    console.log("MONGO URI:", process.env.MONGO_URI);

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");

    await Listing.collection.createIndex({ location: "2dsphere" });

    console.log("2dsphere index created!");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

run();
